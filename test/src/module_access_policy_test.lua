local test = require("test")
local registry = require("registry")
local security = require("security")

local function define_tests()
    test.describe("CRM module access", function()
        test.it("admits exactly the listed endpoint identities", function()
            local policy_id = "kickside.crm.security:crm_endpoint_access"
            local declaration, declaration_err = registry.get(policy_id)
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            test.is_nil(declaration.data.policy.conditions)
            local expected = {
                ["kickside.crm.api:bootstrap.endpoint"] = true,
                ["kickside.crm.api:get.endpoint"] = true,
                ["kickside.crm.api:panels.endpoint"] = true,
                ["kickside.crm.api:apply.endpoint"] = true,
                ["kickside.crm.api:schema.get.endpoint"] = true,
                ["kickside.crm.api:export_config.endpoint"] = true,
                ["kickside.crm.api:query.endpoint"] = true,
                ["kickside.crm.api:resolve.endpoint"] = true,
            }
            local listed = {}
            for _, id in ipairs(declaration.data.policy.resources) do
                test.is_true(expected[id] == true, id)
                test.is_nil(listed[id], id)
                listed[id] = true
                local entry, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
            end
            for id in pairs(expected) do test.is_true(listed[id] == true, id) end
            local policy, policy_err = security.policy(policy_id)
            test.is_nil(policy_err)
            local actor = security.new_actor("listed-endpoint-member", {})
            local endpoints, find_err = registry.find({[".kind"] = "http.endpoint"})
            test.is_nil(find_err)
            for _, entry in ipairs(endpoints) do
                local id = tostring(entry.id)
                test.eq(policy:evaluate(actor, "access", id), expected[id] and "allow" or "undefined", id)
            end
            for id in pairs(expected) do
                test.eq(policy:evaluate(actor, "access", id .. ".unlisted"), "undefined", id)
            end
        end)
        test.it("declares the compatible platform Members default", function()
            local requirement, err = registry.get("kickside.crm.security:user_security_scope")
            test.is_nil(err)
            test.not_nil(requirement)
            test.eq(requirement.meta.value_kind, "security.scope")
            test.eq(requirement.data.default, "kickside.security.groups:members")
        end)
        test.it("composes endpoints, discovery and tools without another module", function()
            local selected = "kickside.crm.security:module_access"
            local entry, entry_err = registry.get(selected)
            test.is_nil(entry_err)
            test.not_nil(entry)
            test.eq(entry.meta.title, "CRM")
            test.eq(entry.meta.surface, "kickside.crm")
            test.eq(entry.meta.intent, "module_access")
            test.is_true(entry.meta.private ~= true)
            local policies, seen = {}, {}
            local function include(id)
                if seen[id] then return end
                seen[id] = true
                local policy, policy_err = security.policy(id)
                test.is_nil(policy_err, id)
                test.not_nil(policy, id)
                policies[#policies + 1] = policy
                local declaration, declaration_err = registry.get(id)
                test.is_nil(declaration_err, id)
                if id ~= selected then test.is_true(declaration.meta.private == true, id) end
                for _, companion in ipairs(declaration.meta.includes or {}) do include(companion) end
            end
            include(selected)
            local scope, scope_err = security.new_scope(policies)
            test.is_nil(scope_err)
            local actor = security.new_actor("crm-member", {})
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
            local endpoints, find_err = registry.find({ [".kind"] = "http.endpoint" })
            test.is_nil(find_err)
            local count = 0
            for _, endpoint in ipairs(endpoints) do
                local id = tostring(endpoint.id)
                if id:match("^kickside%.crm%.") then
                    local expected = expected_endpoints[id] and "allow" or "undefined"
                    test.eq(scope:evaluate(actor, "access", id), expected, id)
                    count = count + 1
                end
            end
            test.is_true(count > 0)
            for _, id in ipairs({ "kickside.crm.surface:nav_item", "kickside.crm.surface:surface_view",
                "kickside.crm.traits:list_records" }) do
                local resource, resource_err = registry.get(id)
                test.is_nil(resource_err, id)
                test.not_nil(resource, id)
                test.eq(scope:evaluate(actor, "registry.get", id), "allow", id)
            end
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.crm.traits:list_records"), "allow")
            test.eq(scope:evaluate(actor, "access", "kickside.crm.api:future.endpoint"), "undefined")
            for _, id in ipairs({ "kickside.users.api:me.endpoint", "kickside.crm_extension.api:list.endpoint" }) do
                for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                    test.eq(scope:evaluate(actor, action, id), "undefined", id .. " " .. action)
                end
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
