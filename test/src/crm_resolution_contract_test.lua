local consts = require("consts")
local normalize = require("normalize")
local suggest = require("suggest")
local test = require("test")

type Score = { confidence: unknown, reason: unknown }
type Route = { action: unknown }

local function define_tests()
    test.describe("CRM resolution contracts", function()
        test.it("normalizes only the declared alias vocabulary", function()
            local email, email_err = normalize.normalize("email", " Record+Sales@Example.TEST ")
            test.is_nil(email_err)
            test.eq(email, "record+sales@example.test")
            local domain, domain_err = normalize.normalize("domain", "https://www.App.Example.test/path?q=1")
            test.is_nil(domain_err)
            test.eq(domain, "app.example.test")
            local unknown, unknown_err = normalize.normalize("identity", "ada")
            test.is_nil(unknown)
            test.not_nil(unknown_err)
        end)

        test.it("normalizes every alias type a schema may declare", function()
            local samples = { email = "ada@example.test", domain = "example.test", phone = "+1 555 0100",
                linkedin = "https://linkedin.com/in/ada" }
            for _, kind in ipairs(consts.ALIAS_TYPES) do
                local value, err = normalize.normalize(kind, samples[kind])
                test.is_nil(err, kind)
                test.not_nil(value, kind)
            end
            local external, external_err = normalize.normalize("external:hubspot", "42")
            test.is_nil(external_err)
            test.eq(external, "42")
            test.is_true(consts.is_alias_type("external:hubspot"))
            test.is_false(consts.is_alias_type("website"))
        end)

        test.it("scores declared patterns and never auto-merges", function()
            local merge_config = {
                objects = {
                    contact = {
                        thresholds = { ignore_below = 0.50, review_at = 0.50 },
                        patterns = { {
                            kind = "value_exact",
                            attr = "work_email",
                            normalizer = "email",
                            weight = 1.0,
                            reason = "work_email_exact",
                        } },
                    },
                },
            }
            local score, score_err = suggest.score_values("contact",
                { work_email = "Record@One.example.test" },
                { work_email = "record@one.example.test" },
                merge_config)
            test.is_nil(score_err)
            test.eq((score :: Score).confidence, 1.0)
            test.eq((score :: Score).reason, "work_email_exact")
            local route, route_err = suggest.route("contact", 1.0, merge_config)
            test.is_nil(route_err)
            test.eq((route :: Route).action, "review")
        end)

        test.it("rejects legacy threshold names", function()
            local route, err = suggest.route("contact", 1.0, {
                objects = { contact = { thresholds = { review_threshold = 0.5, ignore_threshold = 0.5 } } },
            })
            test.is_nil(route)
            test.not_nil(err)
        end)

        test.it("hashes evidence canonically", function()
            local first = suggest.evidence_hash({ b = { 2, 3 }, a = "one" })
            local second = suggest.evidence_hash({ a = "one", b = { 2, 3 } })
            test.eq(first, second)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
