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

local function define_receipts()
    test.describe("CRM writable sink receipts", function()
        for _, corrupt in ipairs({ "{", "null", "false", '"scalar"', "[]", '[{"record_id":"entity:1"}]' }) do
            for _, operation in ipairs({ "replay", "listing" }) do
                test.it("refuses corrupt receipt references on " .. operation .. ": " .. corrupt, function()
                    local crm_id, execute = f.crm()
                    local req = request(crm_id, "record:corrupt", {
                        kind = "record", object_type = "entity", record_id = "entity:corrupt", values = { name = "Record" },
                    })
                    test.eq(call_sink(execute, req).success, true)
                    local db = assert(sql.get(types.db_id()))
                    local _, update_err = db:execute("UPDATE kickside_crm_sink_receipt SET dest_ref=$1 WHERE crm_id=$2", { corrupt, crm_id })
                    db:release()
                    test.is_nil(update_err)
                    local result
                    if operation == "replay" then
                        local replayed, replay_err = execute:call(SINK, req)
                        test.is_nil(replay_err)
                        result = map(replayed)
                    else
                        local listed, list_err = execute:call(LIST_KEYS, { config = { crm_id = crm_id }, origin = f.ORIGIN })
                        test.is_nil(list_err)
                        result = map(listed)
                    end
                    test.eq(result.success, false)
                    test.eq(map(result.error).code, "provider_error")
                    local _, decode_err = json.decode(corrupt)
                    test.eq(map(result.error).message, decode_err and tostring(decode_err) or "sink receipt dest_ref must be a JSON object")
                    test.is_nil(result.dest_ref)
                    test.is_nil(result.keys)
                    test.eq(event_count(crm_id), 1)
                end)
            end
        end
        test.it("replays the complete delivery response for a named map slot", function()
            local crm_id, execute = f.crm()
            local req = request(crm_id, "record:response", {
                kind = "record", object_type = "entity", record_id = "entity:response", values = { name = "Response" },
            })
            req.map_slot = "records"
            local first, first_err = execute:call(SINK, req)
            test.is_nil(first_err)
            test.eq(map(first).success, true)
            local replayed, replay_err = execute:call(SINK, req)
            test.is_nil(replay_err)
            test.eq(map(replayed).success, true)
            test.eq(map(map(map(map(replayed).dest_refs).records).dest_ref).record_id, map(map(first).dest_ref).record_id)
            test.eq(#list(map(first).dependencies_available), 1)
            test.eq(list(map(replayed).dependencies_available)[1], list(map(first).dependencies_available)[1])
            test.eq(event_count(crm_id), 1)
        end)
        test.it("replays the same key and payload with the original outcome", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local req = request(crm_id, "record:1", {
                kind = "record", object_type = "entity", record_id = "entity:1", values = { name = "Primary Record" },
            })
            local first = call_sink(execute, req)
            local second = call_sink(execute, req)
            test.eq(first.success, true)
            test.eq(first.result, "created")
            test.is_nil(first.replayed)
            test.eq(second.success, true)
            test.eq(second.result, "created")
            test.is_nil(second.replayed)
            test.eq(second.dest_ref.record_id, first.dest_ref.record_id)
            test.eq(event_count(crm_id), 1)

            local keys, keys_err = execute:call(LIST_KEYS, { config = { crm_id = crm_id }, origin = f.ORIGIN })
            test.is_nil(keys_err)
            local key_result = map(keys)
            test.eq(key_result.success, true)
            local first_key = map(list(key_result.keys)[1])
            test.eq(first_key.item_key, "record:1")
            test.eq(destination_ref(first_key.dest_ref).record_id, "entity:1")
        end)
        test.it("uses dest_ref as the exact create-or-update authority", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)

            local missing_required = call_sink(execute, request(crm_id, "record:authority:invalid", {
                kind = "record", object_type = "entity", record_id = "entity:authority", values = { note = "missing name" },
            }))
            test.eq(missing_required.success, false)
            test.eq(missing_required.error.code, "invalid_request")

            local created = call_sink(execute, request(crm_id, "record:authority:create", {
                kind = "record", object_type = "entity", record_id = "entity:authority", values = { name = "Authority" },
            }))
            test.eq(created.success, true, error_text(created))
            test.eq(created.result, "created")

            local updated = call_sink(execute, request(crm_id, "record:authority:update", {
                kind = "record", object_type = "entity", record_id = "entity:authority", values = { note = "patched" },
            }, nil, {
                crm_id = created.dest_ref.crm_id,
                object_type = created.dest_ref.object_type,
                record_id = created.dest_ref.record_id,
            }))
            test.eq(updated.success, true, error_text(updated))
            test.eq(updated.result, "updated")

            local db = assert(sql.get(types.db_id())) :: sql.DB
            local row, row_err = storage.get(db, crm_id, "entity", "entity:authority")
            db:release()
            test.is_nil(row_err)
            local values = map(map(row).values)
            test.eq(values.name, "Authority")
            test.eq(values.status, "new")

            -- A re-identified delivery (no dest_ref) converges on the existing record:
            -- upsert resolves create-vs-update by the record itself, not delivery history.
            local duplicate_create = call_sink(execute, request(crm_id, "record:authority:duplicate", {
                kind = "record", object_type = "entity", record_id = "entity:authority", values = { name = "Duplicate" },
            }))
            test.eq(duplicate_create.success, true, error_text(duplicate_create))
            test.eq(duplicate_create.result, "updated")

            local mismatched = call_sink(execute, request(crm_id, "record:authority:mismatch", {
                kind = "record", object_type = "entity", record_id = "entity:authority", values = { note = "wrong ref" },
            }, nil, { crm_id = crm_id, object_type = "entity", record_id = "entity:other" }))
            test.eq(mismatched.success, false)
            test.eq(mismatched.error.code, "invalid_request")

            local missing_update = call_sink(execute, request(crm_id, "record:authority:missing", {
                kind = "record", object_type = "entity", record_id = "entity:missing", values = { note = "missing" },
            }, nil, { crm_id = crm_id, object_type = "entity", record_id = "entity:missing" }))
            test.eq(missing_update.success, false)
        end)
        test.it("rejects a different payload under the same idempotency key", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local base: Map = {
                kind = "record", object_type = "entity", record_id = "entity:2", values = { name = "Primary Record" },
            }
            local first = call_sink(execute, request(crm_id, "record:2", base))
            test.eq(first.success, true)
            base.values = { name = "Secondary Record" }
            local conflict = call_sink(execute, request(crm_id, "record:2", base))
            test.eq(conflict.success, false)
            test.eq(conflict.error.code, "idempotency_conflict")
            test.eq(conflict.error.retriable, false)
            test.eq(event_count(crm_id), 1)
        end)
        test.it("emits exact set and unset updates and typed relation operations", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local db = assert(sql.get(types.db_id())) :: sql.DB
            local _, source_err = storage.upsert(db, crm_id, "entity", { record_id = "entity:3", values = { name = "Before" } })
            local _, target_err = storage.upsert(db, crm_id, "entity", { record_id = "entity:4", values = { name = "Target" } })
            db:release()
            test.is_nil(source_err)
            test.is_nil(target_err)
            local execute = machine_execute(active_actor, active_scope)

            local updated = call_sink(execute, request(crm_id, "record:3:update", {
                kind = "record", object_type = "entity", record_id = "entity:3",
                set = { name = "After" }, unset = { "note" },
            }, "update"))
            test.eq(updated.success, true, error_text(updated))
            test.eq(updated.result, "updated")

            local linked = call_sink(execute, request(crm_id, "record:3:link", {
                kind = "relation", object_type = "entity", record_id = "entity:3", attr = "related",
                reference = { kind = "record", type = "entity", id = "entity:4" },
            }))
            test.eq(linked.success, true, error_text(linked))
            test.eq(linked.dest_ref.object_type, "entity")
            test.eq(event_count(crm_id), 2)
        end)
        test.it("keeps canonical provenance on the durable event and rejects unknown provenance fields", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)

            local created = call_sink(execute, request(crm_id, "record:prov:1", {
                kind = "record", object_type = "entity", record_id = "entity:prov", values = { name = "Sourced" },
                provenance = { source_type = "hubspot", source_id = "hs-77", source_event_id = "hs-77-v3" },
            }))
            test.eq(created.success, true, error_text(created))
            local db = assert(sql.get(types.db_id())) :: sql.DB
            local rows, err = db:query("SELECT body FROM kickside_event WHERE thread_id = $1 ORDER BY seq DESC LIMIT 1", { crm_id })
            db:release()
            test.is_nil(err)
            local body = map(rows[1]).body
            local decoded = type(body) == "string" and map(json.decode(body :: string)) or map(body)
            test.eq(map(decoded.provenance).source_type, "hubspot")
            test.eq(map(decoded.provenance).source_id, "hs-77")

            local bogus = call_sink(execute, request(crm_id, "record:prov:2", {
                kind = "record", object_type = "entity", record_id = "entity:prov2", values = { name = "Sourced" },
                provenance = { source_type = "hubspot", source_id = "hs-78", origin_url = "x" },
            }))
            test.eq(bogus.success, false)
            test.eq(bogus.error.code, "invalid_request")
            test.is_true(bogus.error.message:find("provenance", 1, true) ~= nil, bogus.error.message)
        end)
    end)
end

local function define_references()
    test.describe("CRM writable sink references", function()
        test.it("classifies a relation to a missing record as a dependency and announces records as they land", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)

            local created = call_sink(execute, request(crm_id, "record:dep:source", {
                kind = "record", object_type = "entity", record_id = "entity:dep-source", values = { name = "Source" },
            }))
            test.eq(created.success, true, error_text(created))
            local announced = list(created.dependencies_available)
            test.eq(announced[1], "crm:" .. crm_id .. ":record:entity:dep-source")

            local blocked = call_sink(execute, request(crm_id, "record:dep:link", {
                kind = "relation", object_type = "entity", record_id = "entity:dep-source", attr = "related",
                reference = { kind = "record", type = "entity", id = "entity:dep-target" },
            }))
            test.eq(blocked.success, false)
            test.eq(blocked.error.code, "dependency_missing")
            test.eq(blocked.error.retriable, true)
            test.eq(blocked.error.dependency_key, "crm:" .. crm_id .. ":record:entity:dep-target")
            test.eq(event_count(crm_id), 1, "a dependency-blocked write appends nothing")
        end)
        test.it("classifies a membership of a missing record as a dependency that lands with the record", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local stage = {
                kind = "membership", collection_id = "entities", record_id = "entity:dep-member", stage_id = "new",
            }

            local blocked = call_sink(execute, request(crm_id, "stage:dep:member", stage))
            test.eq(blocked.success, false)
            test.eq(blocked.error.code, "dependency_missing")
            test.eq(blocked.error.retriable, true)
            test.eq(blocked.error.scope, "item")
            test.eq(blocked.error.dependency_key, "crm:" .. crm_id .. ":record:entity:dep-member")
            test.eq(event_count(crm_id), 0, "a dependency-blocked membership appends nothing")

            local landed = call_sink(execute, request(crm_id, "record:dep:member", {
                kind = "record", object_type = "entity", record_id = "entity:dep-member", values = { name = "Member" },
            }))
            test.eq(landed.success, true, error_text(landed))
            test.eq(list(landed.dependencies_available)[1], blocked.error.dependency_key)

            local redelivered = call_sink(execute, request(crm_id, "stage:dep:member", stage))
            test.eq(redelivered.success, true, error_text(redelivered))
            test.eq(redelivered.result, "updated")
            test.eq(event_count(crm_id), 2)
        end)
        test.it("rejects legacy aliases and protected machine writes", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local legacy = call_sink(execute, request(crm_id, "legacy:1", {
                kind = "record", object_type = "entity", record_id = "entity:5", changed = { name = "Legacy" },
            }, "update"))
            test.eq(legacy.success, false)
            test.is_true(legacy.error.message:find("unknown input field", 1, true) ~= nil)

            local protected = call_sink(execute, request(crm_id, "protected:1", {
                kind = "record", object_type = "entity", record_id = "entity:5", values = { owner = "Bot" },
            }))
            test.eq(protected.success, false)
            test.eq(protected.error.code, "invalid_request")
            test.is_true(protected.error.message:find("human%-protected") ~= nil)
            test.eq(event_count(crm_id), 0)
        end)
        test.it("writes and soft-deletes a generalized reference edge", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)

            local linked = call_sink(execute, request(crm_id, "ref:1", {
                kind = "reference", from_ref = "crm:deal:deal:1", edge_type = "transcript",
                to_ref = "kbdoc:client-kb:doc-1", attrs = { minutes = 30 },
            }))
            test.eq(linked.success, true, error_text(linked))
            test.eq(linked.result, "created")
            test.eq(event_count(crm_id), 1)

            local db = assert(sql.get(types.db_id())) :: sql.DB
            local rows, rows_err = db:query([[SELECT edge_type, active FROM kickside_crm_ref
                WHERE crm_id = $1 AND from_ref = $2 AND to_ref = $3]],
                { crm_id, "crm:deal:deal:1", "kbdoc:client-kb:doc-1" })
            db:release()
            test.is_nil(rows_err)
            test.eq(#list(rows), 1)
            test.eq(map(list(rows)[1]).edge_type, "transcript")

            local unlinked, unlink_err = execute:call(SINK, request(crm_id, "ref:1:delete", {
                kind = "reference", from_ref = "crm:deal:deal:1", edge_type = "transcript",
                to_ref = "kbdoc:client-kb:doc-1",
            }, "delete"))
            test.is_nil(unlink_err)
            local unlinked_result = sink_result(unlinked)
            test.eq(unlinked_result.success, true, error_text(unlinked_result))
            test.eq(unlinked_result.result, "deleted")

            db = assert(sql.get(types.db_id())) :: sql.DB
            local after, after_err = db:query([[SELECT active FROM kickside_crm_ref
                WHERE crm_id = $1 AND from_ref = $2 AND to_ref = $3]],
                { crm_id, "crm:deal:deal:1", "kbdoc:client-kb:doc-1" })
            db:release()
            test.is_nil(after_err)
            local active_value = map(list(after)[1]).active
            test.is_true(active_value == false or active_value == 0)
        end)
        test.it("rejects an unknown field on a reference write", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local bogus = call_sink(execute, request(crm_id, "ref:bogus", {
                kind = "reference", from_ref = "crm:deal:deal:1", edge_type = "transcript",
                to_ref = "kbdoc:client-kb:doc-1", note = "unsupported",
            }))
            test.eq(bogus.success, false)
            test.eq(bogus.error.code, "invalid_request")
            test.is_true(bogus.error.message:find("unknown input field", 1, true) ~= nil)
            test.eq(event_count(crm_id), 0)
        end)
        test.it("keeps two writers distinct under one source item key", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)

            -- Both syncs read the same HubSpot deal, so the engine hands both the
            -- same item identity; only the effect they write differs.
            local key = "hubspot:deals:501"
            local records = call_sink(execute, from_origin("kickside.sync:opportunities",
                request(crm_id, key, {
                    kind = "record", object_type = "entity", record_id = "entity:deal-501",
                    values = { name = "Deal 501" },
                })))
            test.eq(records.success, true, error_text(records))
            test.eq(records.result, "created")

            local edges = call_sink(execute, from_origin("kickside.sync:opportunity_stages",
                request(crm_id, key, {
                    kind = "reference", from_ref = "crm:entity:entity:deal-501",
                    edge_type = "company_context", to_ref = "crm:entity:entity:company-501",
                })))
            test.eq(edges.success, true, error_text(edges))
            test.eq(edges.result, "created")
            test.eq(event_count(crm_id), 2)

            -- Two writers can also produce the same KIND of effect from one source
            -- item, so the event identity a delivery mints must separate them too.
            local sibling = call_sink(execute, from_origin("kickside.sync:opportunity_owners",
                request(crm_id, key, {
                    kind = "record", object_type = "entity", record_id = "entity:owner-501",
                    values = { name = "Owner 501" },
                })))
            test.eq(sibling.success, true, error_text(sibling))
            test.eq(sibling.result, "created")
            test.eq(sibling.dest_ref.record_id, "entity:owner-501")
            test.eq(event_count(crm_id), 3)

            -- Each writer still gets divergence protection within its own origin.
            local diverged = call_sink(execute, from_origin("kickside.sync:opportunities",
                request(crm_id, key, {
                    kind = "record", object_type = "entity", record_id = "entity:deal-501",
                    values = { name = "Renamed" },
                })))
            test.eq(diverged.success, false)
            test.eq(diverged.error.code, "idempotency_conflict")
            test.eq(event_count(crm_id), 3)
        end)
        test.it("scopes the reconcile key listing to the asking origin", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)

            local wrote = call_sink(execute, from_origin("kickside.sync:people",
                request(crm_id, "hubspot:contacts:1", {
                    kind = "record", object_type = "entity", record_id = "entity:person-1",
                    values = { name = "Person One" },
                })))
            test.eq(wrote.success, true, error_text(wrote))
            local other = call_sink(execute, from_origin("kickside.sync:companies",
                request(crm_id, "hubspot:companies:1", {
                    kind = "record", object_type = "entity", record_id = "entity:company-1",
                    values = { name = "Company One" },
                })))
            test.eq(other.success, true, error_text(other))

            -- Reconcile deletes every listed key absent from ITS source. An
            -- unscoped listing therefore hands one sync the other's records.
            local people = call_list_keys(execute, { config = { crm_id = crm_id }, origin = "kickside.sync:people" })
            test.eq(table.concat(key_ids(people), ","), "hubspot:contacts:1")
            local companies = call_list_keys(execute, { config = { crm_id = crm_id }, origin = "kickside.sync:companies" })
            test.eq(table.concat(key_ids(companies), ","), "hubspot:companies:1")
            local unowned = call_list_keys(execute, { config = { crm_id = crm_id }, origin = "kickside.sync:other" })
            test.eq(#unowned.keys, 0)
        end)
        test.it("pages the reconcile key listing and reports the last page exactly", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = machine_execute(active_actor, active_scope)
            local origin = "kickside.sync:paged"

            for index = 1, 5 do
                local wrote = call_sink(execute, from_origin(origin, request(crm_id, "hubspot:contacts:" .. index, {
                    kind = "record", object_type = "entity", record_id = "entity:paged-" .. index,
                    values = { name = "Paged " .. index },
                })))
                test.eq(wrote.success, true, error_text(wrote))
            end

            local collected: { string } = {}
            local cursor: unknown = nil
            local pages = 0
            local more = true
            while more do
                local page = call_list_keys(execute, { config = { crm_id = crm_id }, origin = origin, cursor = cursor, limit = 2 })
                -- The engine rejects a page without a next_cursor outright, on
                -- every page including the last.
                test.is_true(page.next_cursor ~= nil, "page is missing next_cursor")
                for _, id in ipairs(key_ids(page)) do collected[#collected + 1] = id end
                cursor = page.next_cursor
                more = page.has_more
                pages = pages + 1
                test.is_true(pages <= 5, "key listing never reported the last page")
            end
            test.eq(pages, 3)
            table.sort(collected)
            test.eq(table.concat(collected, ","),
                "hubspot:contacts:1,hubspot:contacts:2,hubspot:contacts:3,hubspot:contacts:4,hubspot:contacts:5")
        end)
    end)
end

return {
    run_receipts = test.run_cases(define_receipts),
    run_references = test.run_cases(define_references),
}
