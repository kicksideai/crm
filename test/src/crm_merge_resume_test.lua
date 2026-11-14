-- SPDX-License-Identifier: MIT
local test = require("test")
local merge_arm = require("merge_arm")
local fixture = require("fixture")
local identity = require("identity")

local function define_tests()
    test.describe("CRM merge review resume", function()
        test.it("names its own arm and preserves the resolution actor and scope", function()
            fixture.reset()
            local result, err = merge_arm.merge_on_resolve({
                action = "skipped",
                item = { item_type = "crm_merge_review", metadata = {
                    crm_id = "crm-1", object_type = "entity", left_id = "entity:left", right_id = "entity:right",
                    dataflow_id = "flow-1", signal_id = "signal-1", arm_id = "foreign:arm",
                } },
            })
            test.is_nil(err)
            test.eq(result.ok, true)
            local calls = fixture.recorded()
            test.eq(#calls, 1)
            test.eq(calls[1].target, "kickside.blocks:resume")
            test.eq(calls[1].args.dataflow_id, "flow-1")
            test.eq(calls[1].args.signal_id, "signal-1")
            test.eq(calls[1].args.arm_id, "kickside.crm.resolution:merge_arm")
            test.eq(calls[1].args.payload.decision, "skipped")
            test.eq(calls[1].args.payload.note, "Reviewed")
            test.eq(calls[1].actor, identity.actor())
            test.eq(calls[1].scope, identity.scope())
        end)
    end)
end
return { run = test.run_cases(define_tests) }
