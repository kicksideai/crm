local actors = require("actors")
local fixture = require("fixture")
local funcs = require("funcs")
local security = require("security")
local test = require("test")
local uuid = require("uuid")

type Map = { [string]: any }

local function define()
    test.describe("CRM suggestion output", function()
        test.it("passes the advertised suggestion fields from Resolve Block to merge review", function()
            local scope = assert(security.new_scope({ assert(security.policy("app:user")) }))
            local execute = funcs.new():with_actor(actors.make(uuid.v4())):with_scope(scope)
            local created, create_err = execute:call("app:create_probe", {
                idempotency_key = "suggestion:" .. uuid.v4(), title = "Suggestion contract CRM",
            })
            test.is_nil(create_err)
            local result, err = execute:call("app:crm_suggestion_probe", {
                crm_id = (created :: Map).component_id,
            })
            test.is_nil(err)
            local output = (result :: Map).output
            test.is_false(output.created)
            test.eq(#output.merge_suggestions, 1)
            local suggestion = output.merge_suggestions[1]
            test.eq(suggestion.confidence, 1.0)
            test.eq(suggestion.confidence, suggestion.score.confidence)
            test.eq(suggestion.reason, suggestion.score.reason)
            test.eq(suggestion.reason, "same_name")
            test.not_nil(suggestion.evidence)
            test.eq(suggestion.evidence_hash, suggestion.score.evidence_hash)
            local metadata = (result :: Map).preview.metadata
            test.eq(metadata.confidence, suggestion.confidence)
            test.eq(metadata.reason, suggestion.reason)
            test.eq(metadata.evidence_hash, suggestion.evidence_hash)
            test.not_nil(metadata.evidence)
        end)

        test.it("finds matching phones despite an unrelated imported phone without digits", function()
            local crm_id, execute = fixture.crm({
                version = "phone-review",
                objects = { { id = "person", type = "person", label = "Person", plural = "People" } },
                attributes = {
                    { id = "person-email", object_type = "person", attr = "email",
                        data_type = "email", config = { alias = "email" } },
                    { id = "person-phone", object_type = "person", attr = "phone",
                        data_type = "phone", config = {} },
                },
                merge_config = { objects = { person = {
                    thresholds = { ignore_below = 0, review_at = 0 },
                    patterns = { { kind = "value_exact", attr = "phone", normalizer = "phone",
                        weight = 1, reason = "same_phone" } },
                } } },
            })
            for name, phone in pairs({ a = "unknown", b = "+1 212 555 0101", c = "+12125550101" }) do
                local id = "person:" .. name
                local delivery = fixture.request(crm_id, id, {
                    kind = "record", record_id = id, object_type = "person",
                    values = { email = name .. "@example.test", phone = phone },
                })
                test.eq(fixture.call_sink(execute, delivery).result, "created")
            end

            local result, err = execute:call("kickside.crm.resolution:resolve", {
                crm_id = crm_id, object_type = "person",
                match = { alias_type = "email", alias_value = "b@example.test" },
                values = { phone = "+1 (212) 555-0101" },
            })
            test.is_nil(err)
            local suggestions = (result :: Map).merge_suggestions
            test.eq(#suggestions, 1)
            test.eq(suggestions[1].left_id, "person:b")
            test.eq(suggestions[1].right_id, "person:c")
            test.eq(suggestions[1].reason, "same_phone")
            local rows = fixture.query([[SELECT left_id, right_id, decision
                FROM kickside_crm_merge_decision WHERE crm_id = $1]], { crm_id })
            test.eq(#rows, 1)
            test.eq(rows[1].left_id, "person:b")
            test.eq(rows[1].right_id, "person:c")
            test.eq(rows[1].decision, "pending")
        end)
    end)
end

return { run = test.run_cases(define) }
