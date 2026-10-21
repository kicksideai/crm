local actors = require("actors")
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
    end)
end

return { run = test.run_cases(define) }
