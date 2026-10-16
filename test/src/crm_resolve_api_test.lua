local test = require("test")
local fixture = require("fixture")
local handler = require("handler")

local function define_tests()
    test.describe("CRM resolve HTTP errors", function()
        for _, row in ipairs({
            { errors.INVALID, 400, "match.alias_value is required" },
            { errors.NOT_FOUND, 404, "CRM record was not found" },
            { errors.CONFLICT, 409, "alias reservation conflicts" },
            { errors.INTERNAL, 500, "CRM projection failed" },
        }) do
            test.it("maps " .. row[1] .. " resolver errors", function()
                fixture.reset({ object_type = "contact", match = { alias_type = "email", alias_value = "a@example.test" } },
                    errors.new({ kind = row[1], message = row[3] }))
                handler.resolve()
                local response = fixture.result()
                test.eq(response.status, row[2])
                test.eq(response.body.success, false)
                test.eq(response.body.error, row[3])
            end)
        end
    end)
end

return { run = test.run_cases(define_tests) }
