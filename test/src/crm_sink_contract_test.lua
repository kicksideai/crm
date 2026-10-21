local json = require("json")
local registry = require("registry")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")
local f = require("fixture")

type Map = { [string]: unknown }

local SINK, LIST_KEYS = f.SINK, f.LIST_KEYS
local map, list, destination_ref = f.map, f.list, f.destination_ref
local error_text, actor, scope, sink_result = f.error_text, f.actor, f.scope, f.sink_result
local machine_execute, provision, event_count = f.machine_execute, f.provision, f.event_count
local receipt_rows, receipt_identities = f.receipt_rows, f.receipt_identities
local request, from_origin, call_sink = f.request, f.from_origin, f.call_sink
local call_list_keys, key_ids = f.call_list_keys, f.key_ids

local function define_reconciliation()
    test.describe("CRM writable sink reconciliation", function()
        test.it("converges a delete for a record the CRM never held", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)

            -- The source archived an item the CRM never received. The destination
            -- already holds no such record, so the delete has converged.
            local absent = call_sink(execute, from_origin("kickside.sync:people",
                request(crm_id, "hubspot:contacts:archived", {
                    kind = "record", object_type = "entity", record_id = "entity:never-existed",
                }, "delete")))
            test.eq(absent.success, true, error_text(absent))
            test.eq(absent.result, "noop")
            test.eq(event_count(crm_id), 0)

            -- Convergence is not a licence to swallow a malformed delivery: a
            -- delete that never names its object type still reports why.
            local malformed = call_sink(execute, from_origin("kickside.sync:people",
                request(crm_id, "hubspot:contacts:malformed", {
                    kind = "record", record_id = "entity:never-existed",
                }, "delete")))
            test.eq(malformed.success, false)
            test.eq(malformed.error.code, "invalid_request")

            -- A converged delete applied nothing, so it is not a destination key:
            -- reconcile must not see it and try to delete it again.
            local listed = call_list_keys(execute, { config = { crm_id = crm_id }, origin = "kickside.sync:people" })
            test.eq(#listed.keys, 0)

            -- A delete the CRM really applies still reports deleted, and drops out
            -- of the listing because the destination no longer holds the record.
            local created = call_sink(execute, from_origin("kickside.sync:people",
                request(crm_id, "hubspot:contacts:live", {
                    kind = "record", object_type = "entity", record_id = "entity:live",
                    values = { name = "Live" },
                })))
            test.eq(created.success, true, error_text(created))
            local removed = call_sink(execute, from_origin("kickside.sync:people",
                request(crm_id, "hubspot:contacts:live:archived", {
                    kind = "record", object_type = "entity", record_id = "entity:live",
                }, "delete")))
            test.eq(removed.success, true, error_text(removed))
            test.eq(removed.result, "deleted")
            test.eq(event_count(crm_id), 2)
        end)
        test.it("deletes what a sync wrote, addressed by the receipt's dest_ref", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local origin = "kickside.sync:companies"
            local function held(record_id: string): boolean
                local db = sql.get(types.db_id()) :: sql.DB
                local found, locate_err = storage.locate(db, crm_id, record_id)
                db:release()
                test.is_nil(locate_err)
                return found ~= nil
            end

            local created = call_sink(execute, from_origin(origin, request(crm_id, "hubspot:companies:7", {
                kind = "record", object_type = "entity", record_id = "entity:7", values = { name = "Seven" },
            })))
            test.eq(created.success, true, error_text(created))
            local written = map(created.dest_ref)
            test.is_true(held("entity:7"))
            -- The raw answer: the typed view reads every dest_ref as a record's.
            local logged, logged_err = execute:call(SINK, from_origin(origin, request(crm_id, "hubspot:meetings:7", {
                kind = "activity", activity_id = "hubspot:meetings:7", record_id = "entity:7",
                activity_type = "meeting", occurred_at = "2026-08-24T10:00:00Z", source = "hubspot",
            })))
            test.is_nil(logged_err)
            test.eq(map(logged).success, true, error_text(sink_result(logged)))
            local activity_ref = map(map(logged).dest_ref)
            test.eq(activity_ref.activity_id, "hubspot:meetings:7")

            -- A sync delete carries no transform output: the destination is the
            -- one the upsert's receipt names.
            local activity_removed = call_sink(execute, from_origin(origin,
                request(crm_id, "hubspot:meetings:7:archived", {}, "delete", activity_ref)))
            test.eq(activity_removed.success, true, error_text(activity_removed))
            test.eq(activity_removed.result, "deleted")

            local removed = call_sink(execute, from_origin(origin,
                request(crm_id, "hubspot:companies:7:archived", {}, "delete", written)))
            test.eq(removed.success, true, error_text(removed))
            test.eq(removed.result, "deleted")
            test.is_false(held("entity:7"))

            -- Without a dest_ref or a kind, a delete names nothing to remove.
            local unnamed = call_sink(execute, from_origin(origin,
                request(crm_id, "hubspot:companies:8:archived", {}, "delete")))
            test.eq(unnamed.success, false)
            test.eq(unnamed.error.code, "invalid_request")

            -- A dest_ref written into another CRM is not this CRM's record.
            local foreign = call_sink(execute, from_origin(origin, request(crm_id, "hubspot:companies:9:archived", {},
                "delete", { crm_id = uuid.v7(), object_type = "entity", record_id = "entity:9" })))
            test.eq(foreign.success, false)
            test.eq(foreign.error.code, "invalid_request")
        end)
        test.it("keeps an upsert and a delete of one source item apart", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local origin = "kickside.sync:people"
            local key = "hubspot:contacts:9"
            local upsert: Map = {
                kind = "record", object_type = "entity", record_id = "entity:9", values = { name = "Nine" },
            }

            local created = call_sink(execute, from_origin(origin, request(crm_id, key, upsert)))
            test.eq(created.success, true, error_text(created))
            test.eq(created.result, "created")

            -- The source archives the item it just sent. One key, one origin, two
            -- operations: the delete is its own effect, not a divergent replay of
            -- the upsert.
            local removed = call_sink(execute, from_origin(origin, request(crm_id, key, {
                kind = "record", object_type = "entity", record_id = "entity:9",
            }, "delete")))
            test.eq(removed.success, true, error_text(removed))
            test.eq(removed.result, "deleted")
            test.eq(event_count(crm_id), 2)
            test.eq(receipt_identities(crm_id, key), origin .. "/delete," .. origin .. "/upsert")

            -- Each operation still replays against its own receipt.
            local replayed = call_sink(execute, from_origin(origin, request(crm_id, key, upsert)))
            test.eq(replayed.success, true, error_text(replayed))
            test.eq(replayed.result, "created")
            test.eq(event_count(crm_id), 2)
        end)
        test.it("pages the reconcile key listing across two effects on one item key", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local origin = "kickside.sync:paged-ops"
            local shared_key = "hubspot:contacts:shared"

            local created = call_sink(execute, from_origin(origin, request(crm_id, shared_key, {
                kind = "record", object_type = "entity", record_id = "entity:shared", values = { name = "Shared" },
            })))
            test.eq(created.success, true, error_text(created))
            local patched = call_sink(execute, from_origin(origin, request(crm_id, shared_key, {
                kind = "record", object_type = "entity", record_id = "entity:shared", set = { note = "patched" },
            }, "update")))
            test.eq(patched.success, true, error_text(patched))
            local other = call_sink(execute, from_origin(origin, request(crm_id, "hubspot:contacts:solo", {
                kind = "record", object_type = "entity", record_id = "entity:solo", values = { name = "Solo" },
            })))
            test.eq(other.success, true, error_text(other))

            -- The page boundary falls inside the group of receipts sharing one item
            -- key, and the listing pages by the whole receipt key, so no effect is
            -- skipped between pages.
            local collected: { string } = {}
            local cursor: unknown = nil
            local more = true
            local pages = 0
            while more do
                local page = call_list_keys(execute, { config = { crm_id = crm_id }, origin = origin, cursor = cursor, limit = 1 })
                for _, id in ipairs(key_ids(page)) do collected[#collected + 1] = id end
                cursor = page.next_cursor
                more = page.has_more
                pages = pages + 1
                test.is_true(pages <= 4, "key listing never reported the last page")
            end
            table.sort(collected)
            test.eq(table.concat(collected, ","),
                "hubspot:contacts:shared,hubspot:contacts:shared,hubspot:contacts:solo")
        end)
    end)
end

local function define_conditional()
    test.describe("CRM writable sink conditional", function()
        test.it("delivers against the boot-owned receipt schema without a writer lease", function()
            f.assert_receipt_schema()
            local crm_id, execute = f.crm()
            local req = from_origin("kickside.sync:schema", request(crm_id, "schema:1", {
                kind = "record", object_type = "entity", record_id = "entity:schema", values = { name = "Schema" },
            }))
            local wrote = call_sink(execute, req)
            test.eq(wrote.success, true, error_text(wrote))
            test.eq(wrote.result, "created")
            test.eq(event_count(crm_id), 1)
            local receipts = receipt_rows(crm_id, "schema:1")
            test.eq(#receipts, 1)
            test.eq(receipts[1].origin, "kickside.sync:schema")
            test.eq(receipts[1].sink_op, "upsert")
            local events = f.query("SELECT body FROM kickside_event WHERE thread_id = $1 AND external_source = $2", { crm_id, "kickside.crm.sink" })
            test.eq(#events, 1)
            local body = events[1].body
            if type(body) == "string" then body = json.decode(body :: string) end
            test.eq(receipts[1].payload_hash, map(map(body).delivery).payload_hash)
            test.eq(receipts[1].outcome, "created")
            f.assert_receipt_mutations(crm_id, 1, 0, 0)
            local replayed = call_sink(execute, req)
            test.eq(replayed.success, true, error_text(replayed))
            test.eq(replayed.dest_ref.record_id, wrote.dest_ref.record_id)
            test.eq(event_count(crm_id), 1)
            f.assert_receipt_mutations(crm_id, 1, 0, 0)
        end)
        test.it("applies two operations that fold to one event type from one item key", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local origin = "kickside.sync:folded"
            local key = "hubspot:contacts:folded"

            local seed = call_sink(execute, from_origin(origin, request(crm_id, "hubspot:contacts:seed", {
                kind = "record", object_type = "entity", record_id = "entity:folded", values = { name = "Seed" },
            })))
            test.eq(seed.success, true, error_text(seed))

            -- The update and the upsert of an existing record are both a record
            -- update, so the identity each stamps on its event carries the operation
            -- as well: without it the second delivery folds into the first, commits a
            -- receipt, and applies nothing.
            local patched = call_sink(execute, from_origin(origin, request(crm_id, key, {
                kind = "record", object_type = "entity", record_id = "entity:folded", set = { note = "patched" },
            }, "update")))
            test.eq(patched.success, true, error_text(patched))

            local upserted = call_sink(execute, from_origin(origin, request(crm_id, key, {
                kind = "record", object_type = "entity", record_id = "entity:folded", values = { name = "Upserted" },
            })))
            test.eq(upserted.success, true, error_text(upserted))
            test.eq(upserted.result, "updated")
            test.eq(event_count(crm_id), 3)

            local db = assert(sql.get(types.db_id())) :: sql.DB
            local record, record_err = storage.get(db, crm_id, "entity", "entity:folded")
            db:release()
            test.is_nil(record_err)
            local values = map(map(record).values)
            test.eq(values.name, "Upserted")
            test.eq(values.note, "patched")
        end)
        test.it("publishes the exact writable ABI and CRM picker contract", function()
            local port = assert(registry.get("kickside.crm.sink:crm_records"))
            local declaration = map(map(port).data)
            local binding = map(map(assert(registry.get(tostring(declaration.binding)))).meta)
            test.eq(binding.delivery, "at_least_once")
            test.eq(binding.input_shape, "record")
            local crm_id = map(map(declaration.config_schema).crm_id)
            test.eq(crm_id.type, "string")
            test.eq(crm_id.picker, "wc-component-picker")
            test.eq(crm_id.class, "crm")

            local input = map(assert(json.decode(tostring(declaration.input_schema))))
            test.eq(map(map(input.properties).from_stage_id).type, "string")
            test.eq(table.concat(list(map(map(input.properties).kind).enum), ","), "record,activity,relation,reference,membership")
            test.eq(map(map(input.properties).from_ref).type, "string")
            local output = map(assert(json.decode(tostring(declaration.output_schema))))
            test.is_nil(map(output.properties).replayed)
            test.eq(table.concat(list(map(map(output.properties).result).enum), ","), "created,updated,deleted,noop")
            local data_error = map(map(map(output["$defs"]).DataError).properties)
            test.eq(table.concat(list(map(data_error.scope).enum), ","), "item,flow,connection,provider")
            local codes = {}
            for _, code in ipairs(list(map(data_error.code).enum)) do codes[tostring(code)] = true end
            test.eq(codes.conflict, true)
            test.eq(codes.idempotency_conflict, true)
        end)
        test.it("a conditional update writes only where the destination is empty", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local created = call_sink(execute, request(crm_id, "record:cond", {
                kind = "record", object_type = "entity", record_id = "entity:cond",
                values = { name = "Primary Record" },
            }))
            test.eq(created.success, true, error_text(created))

            local filled = call_sink(execute, request(crm_id, "record:cond:fill", {
                kind = "record", object_type = "entity", record_id = "entity:cond",
                set_if_absent = { name = "Renamed", note = "from the second call" },
            }, "update"))
            test.eq(filled.success, true, error_text(filled))

            local db = assert(sql.get(types.db_id())) :: sql.DB
            local record, record_err = storage.get(db, crm_id, "entity", "entity:cond")
            test.is_nil(record_err)
            local values = map(map(record).values)
            test.eq(values.name, "Primary Record")
            test.eq(values.note, "from the second call")

            -- The fold's per-attribute decision is durable, keyed by the
            -- delivering event's identity, so a replay answers identically.
            local rows, rows_err = db:query(
                "SELECT external_id, outcomes FROM kickside_crm_conditional_outcome WHERE crm_id = $1", { crm_id })
            db:release()
            test.is_nil(rows_err)
            test.eq(#list(rows), 1)
            local outcome_row = map(list(rows)[1])
            test.is_true(tostring(outcome_row.external_id):find("record:cond:fill", 1, true) ~= nil)
            local outcomes = map(assert(json.decode(tostring(outcome_row.outcomes))))
            test.eq(outcomes.name, "kept_existing")
            test.eq(outcomes.note, "written")
        end)
        test.it("append_unique unions a multi value without duplicates", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local created = call_sink(execute, request(crm_id, "record:tags", {
                kind = "record", object_type = "entity", record_id = "entity:tags",
                values = { name = "Tagged", tags = { "alpha", "beta" } },
            }))
            test.eq(created.success, true, error_text(created))

            local appended = call_sink(execute, request(crm_id, "record:tags:more", {
                kind = "record", object_type = "entity", record_id = "entity:tags",
                append_unique = { tags = { "beta", "gamma" } },
            }, "update"))
            test.eq(appended.success, true, error_text(appended))

            local db = assert(sql.get(types.db_id())) :: sql.DB
            local record, record_err = storage.get(db, crm_id, "entity", "entity:tags")
            db:release()
            test.is_nil(record_err)
            local tags = list(map(map(record).values).tags)
            table.sort(tags :: { string })
            test.eq(table.concat(tags :: { string }, ","), "alpha,beta,gamma")
        end)
        test.it("an activity delete converges by external identity", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local host = call_sink(execute, request(crm_id, "record:host", {
                kind = "record", object_type = "entity", record_id = "entity:host", values = { name = "Host" },
            }))
            test.eq(host.success, true, error_text(host))

            -- A delete for an identity this CRM never held is already converged:
            -- no receipt, no event, the redelivery re-derives the same answer.
            local unheld = call_sink(execute, request(crm_id, "hubspot:meetings:404:delete", {
                kind = "activity", external_id = "hubspot:meeting:404",
            }, "delete"))
            test.eq(unheld.success, true, error_text(unheld))
            test.eq(unheld.result, "noop")

            local logged = call_sink(execute, request(crm_id, "hubspot:meetings:9", {
                kind = "activity", activity_id = "hubspot:meetings:9", record_id = "entity:host",
                activity_type = "meeting", occurred_at = "2026-08-24T10:00:00Z",
                source = "hubspot", external_id = "hubspot:meeting:9",
            }))
            test.eq(logged.success, true, error_text(logged))

            local removed = call_sink(execute, request(crm_id, "hubspot:meetings:9:delete", {
                kind = "activity", external_id = "hubspot:meeting:9",
            }, "delete"))
            test.eq(removed.success, true, error_text(removed))
            test.eq(removed.result, "deleted")

            local again = call_sink(execute, request(crm_id, "hubspot:meetings:9:delete:2", {
                kind = "activity", external_id = "hubspot:meeting:9",
            }, "delete"))
            test.eq(again.success, true, error_text(again))
            test.eq(again.result, "noop")
        end)
    end)
end

return {
    run_reconciliation = test.run_cases(define_reconciliation),
    run_conditional = test.run_cases(define_conditional),
}
