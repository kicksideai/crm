local policy = require("policy")
local constraints = require("constraints")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local validation = require("validation")
local uuid = require("uuid")

type Map = { [string]: unknown }

local function map(value: unknown): Map
    return type(value) == "table" and value :: Map or {}
end

local function schema(crm_id: string): string
    local db = assert(sql.get(types.db_id()))
    local dialect = db:type() :: string
    local _, err = storage.ensure(db, dialect, crm_id, {
        version = "policy-test-v1",
        objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } },
        attributes = {
            { id = "name", object_type = "entity", attr = "name", data_type = "text", config = {} },
            { id = "owner", object_type = "entity", attr = "owner", data_type = "text", config = { policy = { human_protected = true } } },
            { id = "summary", object_type = "entity", attr = "summary", data_type = "text", config = { policy = { review_required = true } } },
            { id = "status", object_type = "entity", attr = "status", data_type = "text" },
        },
    })
    db:release()
    test.is_nil(err)
    return crm_id
end

local function define_tests()
    test.describe("CRM write policy", function()
        test.it("accepts authenticated interactive writes without adding field metadata", function()
            local crm_id = schema(tostring(uuid.v7()))
            local commands = { {
                type = types.EVENTS.RECORD_CREATED,
                body = { object_type = "entity", record_id = "entity:1", values = { name = "Primary Record" } },
            } }
            local accepted, outcomes, err = policy.enforce(crm_id, commands, { actor_id = "user:ada" })
            test.is_nil(err)
            test.eq(#(accepted :: {unknown}), 1)
            test.eq(map((outcomes :: {unknown})[1]).outcome, "applied")
        end)

        test.it("classifies machine writes from the trusted execution context", function()
            local crm_id = schema(tostring(uuid.v7()))
            local command = {
                type = types.EVENTS.RECORD_CREATED,
                body = { object_type = "entity", record_id = "entity:2", values = { name = "Secondary Record" } },
            }
            local accepted, _, err = policy.enforce(crm_id, { command }, { actor_context = { run_id = "run:1" } })
            test.is_nil(err)
            test.eq(#(accepted :: {unknown}), 1)
        end)

        test.it("rejects protected machine fields without writing review or outcome state", function()
            local crm_id = schema(tostring(uuid.v7()))
            local db = assert(sql.get(types.db_id()))
            local _, seed_err = storage.upsert(db, crm_id, "entity", {
                record_id = "entity:3",
                values = { owner = "Primary Owner", summary = "Initial" },
            })
            db:release()
            test.is_nil(seed_err)

            local protected, _, protected_err = policy.enforce(crm_id, { {
                type = types.EVENTS.RECORD_UPDATED,
                body = { object_type = "entity", record_id = "entity:3", set = { owner = "Bot" } },
            } }, { actor_context = { run_id = "run:2" } })
            test.is_nil(protected)
            test.is_true(tostring(protected_err):find("human%-protected") ~= nil)

            local reviewed, _, review_err = policy.enforce(crm_id, { {
                type = types.EVENTS.RECORD_UPDATED,
                body = { object_type = "entity", record_id = "entity:3", set = { summary = "Proposal" } },
            } }, { actor_context = { run_id = "run:2" } })
            test.is_nil(reviewed)
            test.is_true(tostring(review_err):find("requires human review", 1, true) ~= nil)

            db = assert(sql.get(types.db_id()))
            local record, read_err = storage.get(db, crm_id, "entity", "entity:3")
            db:release()
            test.is_nil(read_err)
            local values = map(map(record).values)
            test.eq(values.owner, "Primary Owner")
            test.eq(values.summary, "Initial")
        end)

        test.it("rejects an AI field event before append when its value is missing or invalid", function()
            local crm_id = schema(tostring(uuid.v7()))
            local db = assert(sql.get(types.db_id()))
            local _, seed_err = storage.upsert(db, crm_id, "entity", {
                record_id = "entity:ai",
                values = { name = "Primary Record" },
            })
            db:release()
            test.is_nil(seed_err)

            local body = { object_type = "entity", record_id = "entity:ai", attr = "name" }
            test.eq(constraints.check(types.EVENTS.AI_ATTRIBUTE_FILLED, body), "ai attribute fill value required")
            local valid, missing_err = validation.validate_commands(crm_id, { {
                type = types.EVENTS.AI_ATTRIBUTE_FILLED,
                body = body,
            } })
            test.is_nil(valid)
            test.eq(tostring(missing_err), "ai attribute fill value required")
            test.is_true(errors.is(missing_err, errors.INVALID))

            body.value = { invalid = true }
            valid, missing_err = validation.validate_commands(crm_id, { {
                type = types.EVENTS.AI_ATTRIBUTE_FILLED,
                body = body,
            } })
            test.is_nil(valid)
            test.is_true(tostring(missing_err):find("must be text", 1, true) ~= nil, tostring(missing_err))
        end)

        test.it("accepts only a boolean merge override with a canonical reviewer", function()
            local body = {
                left_id = "entity:left",
                right_id = "entity:right",
                object_type = "entity",
                decision = "merged",
                resolution_id = "resolution:override",
                winner_id = "entity:left",
                loser_id = "entity:right",
                override = "true",
                reason = "reviewed evidence changed",
                prior_decision_ref = "decision:prior",
            }
            test.eq(constraints.check(types.EVENTS.MERGE_DECIDED, body), "merge override must be a boolean")
            body.override = true
            test.eq(constraints.check(types.EVENTS.MERGE_DECIDED, body), "merge override reviewer_actor required")
            body.reviewer_actor = "user:reviewer"
            test.is_nil(constraints.check(types.EVENTS.MERGE_DECIDED, body))
        end)

        test.it("admits only the closed edge and reference-kind vocabularies", function()
            local function reference(from_ref: string, edge_type: string, to_ref: string): { [string]: unknown }
                return { from_ref = from_ref, edge_type = edge_type, to_ref = to_ref }
            end
            local deal_ref = types.record_ref("deal:one")

            test.is_nil(constraints.check(types.EVENTS.REFERENCE_LINKED,
                reference(deal_ref, "transcript", "kbdoc:client-kb:doc-1")))
            test.is_nil(constraints.check(types.EVENTS.REFERENCE_UNLINKED,
                reference(types.activity_ref("act:one"), "recording", "url:https://rec.example/a")))

            test.eq(constraints.check(types.EVENTS.REFERENCE_LINKED,
                reference(deal_ref, "deal_ctx", "kb:client-kb")), "unknown edge_type: deal_ctx")
            test.eq(constraints.check(types.EVENTS.REFERENCE_LINKED,
                reference(deal_ref, "knowledge", "kbdocs:x")), "unknown to_ref kind: kbdocs")
            test.eq(constraints.check(types.EVENTS.REFERENCE_LINKED,
                reference("noscheme", "knowledge", "kb:client-kb")), "from_ref must be kind:id")
            test.eq(constraints.check(types.EVENTS.REFERENCE_LINKED,
                reference("crm:", "knowledge", "kb:client-kb")), "from_ref must be kind:id")
            test.eq(constraints.check(types.EVENTS.REFERENCE_LINKED,
                reference(deal_ref, "knowledge", "")), "to_ref required")

            local attrs = reference(deal_ref, "knowledge", "kb:client-kb")
            attrs.attrs = "not-an-object"
            test.eq(constraints.check(types.EVENTS.REFERENCE_LINKED, attrs), "attrs must be an object")
            attrs.attrs = { minutes = 30 }
            attrs.active = "true"
            test.eq(constraints.check(types.EVENTS.REFERENCE_LINKED, attrs), "active must be a boolean")
        end)

    end)
end

return { run = test.run_cases(define_tests) }
