local test = require("test")
local writer = require("writer")

type Map = { [string]: unknown }

-- A stub threads client that returns one preconfigured catch-up terminal, so the
-- writer's dead-letter surfacing is exercised without a live projection worker.
local function stub_client(result: unknown): any
    return {
        catch_up_projection = function(_self: any, _request: Map): (unknown?, unknown?)
            return result, nil
        end,
    }
end

local function define_tests()
    test.describe("CRM writer catch-up surfacing", function()
        -- A drain projection that dead-letters records the real failure on its
        -- cursor's last_error, which the catch-up engine returns un-buried on the
        -- terminal's `error` field. The surfaced write error must carry that cause,
        -- not only reason=max_attempts, so the automation state names why it stopped.
        test.it("surfaces a dead-lettered drain cursor's real cause, not only max_attempts", function()
            local cause = "projection dead-lettered after max attempts: sink apply rejected record entity:42: value too long"
            local client = stub_client({
                last_seq = 95635,
                reason = "max_attempts",
                dead = true,
                ticks = 1,
                error = cause,
            })

            local result, err = writer._catch_up_for_test(client, "crm-thread", 98456)
            test.is_nil(result)
            test.is_true(err ~= nil)
            local message = tostring(err)
            test.is_true(message:find(cause, 1, true) ~= nil, message)
            test.is_true(message:find("dead-lettered at last_seq=95635", 1, true) ~= nil, message)
            test.is_true(message:find("(required 98456)", 1, true) ~= nil, message)
        end)

        test.it("names an empty dead-letter cause explicitly instead of an opaque reason", function()
            local client = stub_client({
                last_seq = 10,
                reason = "max_attempts",
                dead = true,
                ticks = 1,
                error = "",
            })

            local result, err = writer._catch_up_for_test(client, "crm-thread", 20)
            test.is_nil(result)
            local message = tostring(err)
            test.is_true(message:find("dead-lettered with no recorded cause", 1, true) ~= nil, message)
        end)

        -- A non-dead-letter stall keeps the diagnostic form: no cursor cause exists
        -- to name, so the required-sequence diagnostics stand on their own.
        test.it("keeps the required-sequence diagnostics for a non-dead-letter stall", function()
            local client = stub_client({
                last_seq = 5,
                reason = "generation_mismatch",
                ticks = 3,
            })

            local result, err = writer._catch_up_for_test(client, "crm-thread", 9)
            test.is_nil(result)
            local message = tostring(err)
            test.is_true(message:find("did not reach the required sequence", 1, true) ~= nil, message)
            test.is_true(message:find("reason=generation_mismatch", 1, true) ~= nil, message)
        end)

        -- A caller with a deadline (a sync round's work deadline) waits on the
        -- projection only until then; the wait is the threads contract's.
        test.it("bounds the projection wait by the caller's deadline", function()
            local seen: Map? = nil
            local client = {
                catch_up_projection = function(_self: any, request: Map): (unknown?, unknown?)
                    seen = request
                    return nil, "projection catch-up reached the caller's deadline before the cursor reached the thread head"
                end,
            }
            local result, err = writer._catch_up_for_test(client, "crm-thread", 9, "2026-10-04T00:12:08Z")
            test.is_nil(result)
            test.not_nil(seen)
            test.eq((seen :: Map).deadline, "2026-10-04T00:12:08Z")
            test.eq((seen :: Map).min_seq, 9)
            test.is_true(tostring(err):find("caller's deadline", 1, true) ~= nil, tostring(err))
        end)

        test.it("names no deadline when the caller has none", function()
            local seen: Map? = nil
            local client = {
                catch_up_projection = function(_self: any, request: Map): (unknown?, unknown?)
                    seen = request
                    return { last_seq = 9, ticks = 1 }, nil
                end,
            }
            local result, err = writer._catch_up_for_test(client, "crm-thread", 9)
            test.is_nil(err)
            test.not_nil(result)
            test.is_nil((seen :: Map).deadline)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
