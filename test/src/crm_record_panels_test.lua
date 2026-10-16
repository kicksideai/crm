local test = require("test")
local record_panels = require("record_panels")

local function entry(meta)
    return { meta = meta }
end

local function define_tests()
    test.describe("CRM record-panel discovery", function()
        test.it("filters object-specific declarations, includes global ones, and orders panels", function()
            local panels = record_panels.from_entries({
                entry({ type = "crm.record_panel", tag = "wc-later", title = "Later", object_types = { "opportunity" }, order = 200 }),
                entry({ type = "crm.record_panel", tag = "wc-global", title = "Global" }),
                entry({ type = "crm.record_panel", tag = "wc-first", title = "First", object_types = { "opportunity" }, order = 10 }),
                -- This is the mutation-proof filter case: including every declaration
                -- would incorrectly expose the contact panel on an opportunity record.
                entry({ type = "crm.record_panel", tag = "wc-contact", title = "Contact", object_types = { "contact" }, order = 1 }),
            }, "opportunity")
            test.eq(#panels, 3)
            test.eq(panels[1].tag, "wc-first")
            test.eq(panels[1].order, 10)
            test.eq(panels[2].tag, "wc-global")
            test.eq(panels[2].order, 100)
            test.eq(panels[3].tag, "wc-later")
        end)

        test.it("returns an empty list for an empty record-panel catalog", function()
            test.eq(#record_panels.from_entries({}, "opportunity"), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
