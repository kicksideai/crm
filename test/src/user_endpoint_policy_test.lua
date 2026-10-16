local test = require("test")
local registry = require("registry")
local security = require("security")
local function define_tests()
    test.describe("Canonical member endpoint declarations", function()
        test.it("preserves the published endpoint policy with current member admission", function()
            local retained = "kickside.crm.security:crm_endpoint_access"
            local policy, err = security.policy(retained)
            test.is_nil(err)
            test.not_nil(policy)
            local bundle, bundle_err = registry.get("kickside.crm.security:module_access")
            test.is_nil(bundle_err)
            local public, public_err = security.policy("kickside.crm.security:module_access")
            test.is_nil(public_err)
            test.eq(public:evaluate(security.new_actor("bundle-member", {}), "access",
                "kickside.crm.api:future.endpoint"), "undefined")
            local included = false
            for _, id in ipairs(bundle.meta.includes) do
                if id == retained then included = true end
            end
            test.is_true(included)
            local requirement, requirement_err = registry.get("kickside.crm.security:user_security_scope")
            test.is_nil(requirement_err)
            local targeted = false
            for _, target in ipairs(requirement.data.targets) do
                if target.entry == retained and target.path == ".groups +=" then targeted = true end
            end
            test.is_true(targeted)
            local actor = security.new_actor("retained-policy-member", {})
            local expected_endpoints = {
                ["kickside.crm.api:bootstrap.endpoint"] = true,
                ["kickside.crm.api:get.endpoint"] = true,
                ["kickside.crm.api:panels.endpoint"] = true,
                ["kickside.crm.api:apply.endpoint"] = true,
                ["kickside.crm.api:schema.get.endpoint"] = true,
                ["kickside.crm.api:export_config.endpoint"] = true,
                ["kickside.crm.api:query.endpoint"] = true,
                ["kickside.crm.api:resolve.endpoint"] = true,
            }
            local endpoints, find_err = registry.find({[".kind"] = "http.endpoint"})
            test.is_nil(find_err)
            local count = 0
            for _, endpoint in ipairs(endpoints) do
                local id = tostring(endpoint.id)
                if id:match("^kickside%.crm%.") then
                    local expected = expected_endpoints[id] and "allow" or "undefined"
                    test.eq(policy:evaluate(actor, "access", id), expected, id)
                    test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
                    count = count + 1
                end
            end
            test.is_true(count > 0)
            test.eq(policy:evaluate(actor, "access", "kickside.crm.api:future.endpoint"), "undefined")
            test.eq(policy:evaluate(actor, "access", "kickside.crm_extension.api:future.endpoint"), "undefined")
            test.eq(policy:evaluate(actor, "access", "kickside.users.api:me.endpoint"), "undefined")
        end)
        test.it("loads the module policy and each member endpoint without aliases", function()
            local policy, err = security.policy("kickside.crm.security:crm_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local baseline, baseline_err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(baseline_err)
            test.not_nil(baseline)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.crm.api:apply.endpoint",
                "kickside.crm.api:bootstrap.endpoint",
                "kickside.crm.api:export_config.endpoint",
                "kickside.crm.api:get.endpoint",
                "kickside.crm.api:panels.endpoint",
                "kickside.crm.api:query.endpoint",
                "kickside.crm.api:resolve.endpoint",
                "kickside.crm.api:schema.get.endpoint",
            }) do
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
                test.eq(policy:evaluate(actor, "access", id, nil), "allow", id)
                test.eq(policy:evaluate(actor, "funcs.call", id, nil), "undefined", id)
                test.eq(baseline:evaluate(actor, "access", id, nil), "undefined", id)
                local unmarked = id .. ".unlisted"
                local legacy = registry.get(unmarked)
                test.is_nil(legacy, unmarked)
                test.eq(policy:evaluate(actor, "access", unmarked, nil), "undefined", unmarked)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
