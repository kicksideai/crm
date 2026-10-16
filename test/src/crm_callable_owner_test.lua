-- SPDX-License-Identifier: MIT
local registry = require("registry")
local test = require("test")

local function define_tests()
    test.describe("CRM callable implementation ownership", function()
        for _, case in ipairs({
            { "kickside.crm.api:schema.get", "kickside.crm.api:schema_implementation", "get" },
            { "kickside.crm.api:schema.apply", "kickside.crm.api:schema_implementation", "apply" },
            { "kickside.crm.resolution:resolve", "kickside.crm.resolution:resolve_lib", "resolve_entry" },
            { "kickside.crm.resolution:block_resolve", "kickside.crm.resolution:resolve_lib", "resolve_block" },
            { "kickside.crm.resolution:merge_arm", "kickside.crm.resolution:merge_arm_lib", "arm_block" },
            { "kickside.crm.resolution:merge_on_resolve", "kickside.crm.resolution:merge_arm_lib", "merge_on_resolve" },
            { "kickside.crm.resolution:validate_merge_resolution", "kickside.crm.resolution:merge_arm_lib", "validate_merge_resolution" },
            { "kickside.crm.sink:crm_write", "kickside.crm.sink:crm_sink_implementation", "write" },
            { "kickside.crm.sink:crm_list_keys", "kickside.crm.sink:crm_sink_implementation", "list_keys" },
            { "kickside.crm.traits:list_records", "kickside.crm.traits:crm_tool", "list_records" },
            { "kickside.crm.traits:get_record", "kickside.crm.traits:crm_tool", "get_record" },
            { "kickside.crm.traits:get_board", "kickside.crm.traits:crm_tool", "get_board" },
            { "kickside.crm.traits:get_timeline", "kickside.crm.traits:crm_tool", "get_timeline" },
            { "kickside.crm.traits:schema.get", "kickside.crm.traits:crm_tool", "get_schema" },
            { "kickside.crm.traits:schema.apply", "kickside.crm.traits:crm_tool", "apply_schema" },
            { "kickside.crm.traits:resolve_record", "kickside.crm.traits:crm_tool", "resolve_record" },
            { "kickside.crm.traits:create_record", "kickside.crm.traits:crm_tool", "create_record" },
            { "kickside.crm.traits:update_record", "kickside.crm.traits:crm_tool", "update_record" },
            { "kickside.crm.traits:set_membership", "kickside.crm.traits:crm_tool", "set_membership" },
            { "kickside.crm.traits:log_activity", "kickside.crm.traits:crm_tool", "log_activity" },
            { "kickside.crm.traits:delete_activity", "kickside.crm.traits:crm_tool", "delete_activity" },
            { "kickside.crm.traits:link_reference", "kickside.crm.traits:crm_tool", "link_reference" },
            { "kickside.crm.traits:unlink_reference", "kickside.crm.traits:crm_tool", "unlink_reference" },
        }) do
            test.it("binds " .. case[1] .. " directly to its implementation", function()
                local entry = assert(registry.get(case[1]))
                local owner = assert(registry.get(case[2]))
                test.eq(entry.kind, "function.lua")
                test.eq(entry.data.method, case[3])
                test.eq(entry.data.source, owner.data.source)
                test.is_nil(entry.data.imports.implementation)
                for name, id in pairs(owner.data.imports) do
                    test.eq(entry.data.imports[name], id)
                end
            end)
        end
    end)
end

return { run = test.run_cases(define_tests) }
