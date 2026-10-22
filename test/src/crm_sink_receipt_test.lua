-- The sink's bookkeeping: one committed receipt per delivered effect and nothing
-- else, a writing origin on every request, and receipts removed by age.
local channel = require("channel")
local funcs = require("funcs")
local json = require("json")
local sql = require("sql")
local test = require("test")
local time = require("time")
local types = require("types")
local f = require("fixture")
local write_counter = require("write_counter")

type Map = { [string]: unknown }

local RETENTION = "kickside.crm.sink:receipt_retention"

local function utc_after(seconds: number): string
    return time.now():utc():add(seconds * time.SECOND):format(time.RFC3339)
end

local function receipt_writes(crm_id: string): (number, string)
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local total, detail = write_counter.writes(db, crm_id)
    db:release()
    return total, detail
end

-- The delivery the CRM's single sink event recorded with its effect.
local function event_delivery(crm_id: string): Map
    local rows = f.query("SELECT body FROM kickside_event WHERE thread_id = $1 AND external_source = $2",
        { crm_id, "kickside.crm.sink" })
    test.eq(#rows, 1)
    local body = rows[1].body
    if type(body) == "string" then body = json.decode(body :: string) end
    return f.map(f.map(body).delivery)
end

local function entity(record_id: string, values: Map): Map
    return { kind = "record", object_type = "entity", record_id = record_id, values = values }
end

local function define()
    test.describe("CRM sink receipts", function()
        test.it("commits one receipt per delivered effect and none for a refused append", function()
            local crm_id, execute = f.crm()
            local created = f.call_sink(execute, f.request(crm_id, "one:source", entity("entity:one", { name = "One" })))
            test.eq(created.success, true, f.error_text(created))
            local rows = f.receipt_rows(crm_id, "one:source")
            test.eq(#rows, 1)
            test.eq(rows[1].origin, f.ORIGIN)
            test.eq(rows[1].outcome, "created")
            test.not_nil(rows[1].completed_at)

            local blocked = f.call_sink(execute, f.request(crm_id, "one:link", {
                kind = "relation", object_type = "entity", record_id = "entity:one", attr = "related",
                reference = { kind = "record", type = "entity", id = "entity:absent" },
            }))
            test.eq(blocked.error.code, "dependency_missing")
            test.eq(#f.receipt_rows(crm_id, "one:link"), 0, "a refused append leaves no receipt behind")
        end)

        test.it("recovers the crash window from the durable event without a second effect", function()
            local crm_id, execute = f.crm()
            local req = f.request(crm_id, "window:1", entity("entity:window", { name = "Window" }))
            local first = f.call_sink(execute, req)
            test.eq(first.success, true, f.error_text(first))
            test.eq(f.event_count(crm_id), 1)
            -- The effect committed and the process stopped before its receipt.
            f.exec("DELETE FROM kickside_crm_sink_receipt WHERE crm_id = $1", { crm_id })

            local replayed = f.call_sink(execute, req)
            test.eq(replayed.success, true, f.error_text(replayed))
            -- The record exists now, so the incoming request alone would read as an
            -- update; the answer is the one the durable event recorded.
            test.eq(replayed.result, "created", "the replay answers the effect the durable event recorded")
            test.eq(replayed.dest_ref.record_id, "entity:window")
            test.eq(f.event_count(crm_id), 1, "the replay appends no second event")
            local rows = f.receipt_rows(crm_id, "window:1")
            test.eq(#rows, 1, "the replay commits the receipt")
            test.eq(rows[1].outcome, "created")
            test.eq(event_delivery(crm_id).payload_hash, rows[1].payload_hash,
                "the event carries the digest the receipt binds")

            local changed = f.call_sink(execute, f.request(crm_id, "window:1", entity("entity:window", { name = "Other" })))
            test.eq(changed.success, false)
            test.eq(changed.error.code, "idempotency_conflict")
            test.eq(f.event_count(crm_id), 1)
        end)

        test.it("refuses a changed payload while only the durable event records the effect", function()
            local crm_id, execute = f.crm()
            local first = f.call_sink(execute, f.request(crm_id, "window:2", entity("entity:window-2", { name = "Window" })))
            test.eq(first.success, true, f.error_text(first))
            f.exec("DELETE FROM kickside_crm_sink_receipt WHERE crm_id = $1", { crm_id })

            local changed = f.call_sink(execute, f.request(crm_id, "window:2", entity("entity:window-2", { name = "Other" })))
            test.eq(changed.success, false)
            test.eq(changed.error.code, "idempotency_conflict")
            test.eq(changed.error.retriable, false)
            test.eq(f.event_count(crm_id), 1, "a divergent payload applies nothing")
            test.eq(#f.receipt_rows(crm_id, "window:2"), 0, "no receipt binds the divergent payload")
        end)

        test.it("refuses a changed target while only the durable event records the effect", function()
            local crm_id, execute = f.crm()
            local first = f.call_sink(execute, f.request(crm_id, "window:3", entity("entity:window-3", { name = "Window" })))
            test.eq(first.success, true, f.error_text(first))
            f.exec("DELETE FROM kickside_crm_sink_receipt WHERE crm_id = $1", { crm_id })

            local moved = f.call_sink(execute, f.request(crm_id, "window:3", entity("entity:elsewhere", { name = "Window" })))
            test.eq(moved.success, false)
            test.eq(moved.error.code, "idempotency_conflict")
            test.eq(f.event_count(crm_id), 1, "a divergent target applies nothing")
            test.eq(#f.receipt_rows(crm_id, "window:3"), 0, "no receipt binds the divergent target")
        end)

        test.it("applies exactly one of two concurrent divergent payloads under one key", function()
            local crm_id, execute = f.crm()
            local pending: { any } = {}
            for _, name in ipairs({ "First", "Second" }) do
                local cmd, err = execute:async(f.SINK, f.request(crm_id, "race:1", entity("entity:race", { name = name })))
                test.is_nil(err)
                pending[#pending + 1] = cmd
            end
            local applied, refused = 0, 0
            for _, cmd in ipairs(pending) do
                local selected = channel.select({ cmd:response():case_receive(), time.after("60s"):case_receive() })
                test.is_true(selected.value ~= nil, "a concurrent delivery did not answer")
                local payload, err = cmd:result()
                test.is_nil(err)
                local result = f.sink_result(payload:data())
                if result.success then applied = applied + 1 end
                if not result.success and result.error.code == "idempotency_conflict" then refused = refused + 1 end
            end
            test.eq(applied, 1, "exactly one payload takes effect")
            test.eq(refused, 1, "the other is refused as a conflict")
            test.eq(f.event_count(crm_id), 1)
            local rows = f.receipt_rows(crm_id, "race:1")
            test.eq(#rows, 1)
            test.eq(rows[1].payload_hash, event_delivery(crm_id).payload_hash, "the receipt binds the applied payload")
        end)

        test.it("refuses a write or a key listing that names no origin", function()
            local crm_id, execute = f.crm()
            local req = f.request(crm_id, "anonymous:1", entity("entity:anonymous", { name = "Anonymous" }))
            req.origin = nil
            local refused = f.call_sink(execute, req)
            test.eq(refused.success, false)
            test.eq(refused.error.code, "invalid_request")
            test.eq(refused.error.retriable, false)
            test.eq(f.event_count(crm_id), 0)

            local listed, list_err = execute:call(f.LIST_KEYS, { config = { crm_id = crm_id } })
            test.is_nil(list_err)
            local page = f.map(listed)
            test.eq(page.success, false)
            test.eq(f.map(page.error).code, "invalid_request")
        end)

        test.it("bounds bookkeeping to one receipt mutation per new delivery", function()
            local crm_id, execute = f.crm()
            f.assert_receipt_schema()
            local requests: { Map } = {}
            for index = 1, 6 do
                local req = f.request(crm_id, "budget:" .. index,
                    entity("entity:budget-" .. index, { name = "Budget " .. index }))
                requests[#requests + 1] = req
                local wrote = f.call_sink(execute, req)
                test.eq(wrote.success, true, f.error_text(wrote))
                test.eq(wrote.result, "created")
            end
            f.assert_receipt_mutations(crm_id, 6, 0, 0)
            test.eq(f.event_count(crm_id), 6)
            for _, req in ipairs(requests) do
                local replayed = f.call_sink(execute, req)
                test.eq(replayed.success, true, f.error_text(replayed))
                test.eq(replayed.result, "created")
            end
            f.assert_receipt_mutations(crm_id, 6, 0, 0)
            test.eq(f.event_count(crm_id), 6)
        end)

        test.it("writes one bookkeeping row for a new record and one for a change", function()
            local crm_id, execute = f.crm()
            local req = f.request(crm_id, "measure:new", entity("entity:measure", { name = "New" }))
            local created = f.call_sink(execute, req)
            test.eq(created.success, true, f.error_text(created))
            test.eq(created.result, "created")
            test.eq(created.dest_ref.record_id, "entity:measure")
            local receipt_new, receipt_new_detail = receipt_writes(crm_id)
            test.eq(receipt_new, 1, receipt_new_detail)
            f.assert_receipt_mutations(crm_id, 1, 0, 0)
            local replayed = f.call_sink(execute, req)
            test.eq(replayed.success, true, f.error_text(replayed))
            test.eq(replayed.result, "created")
            test.eq(replayed.dest_ref.record_id, created.dest_ref.record_id)
            f.assert_receipt_mutations(crm_id, 1, 0, 0)
            test.eq(f.event_count(crm_id), 1)

            local change_req = f.request(crm_id, "measure:change",
                entity("entity:measure", { name = "Changed" }), "upsert",
                { crm_id = crm_id, object_type = "entity", record_id = "entity:measure" })
            local changed = f.call_sink(execute, change_req)
            test.eq(changed.success, true, f.error_text(changed))
            test.eq(changed.result, "updated")
            test.eq(changed.dest_ref.record_id, created.dest_ref.record_id)
            local receipt_total, receipt_total_detail = receipt_writes(crm_id)
            test.eq(receipt_total - receipt_new, 1, receipt_total_detail)
            f.assert_receipt_mutations(crm_id, 2, 0, 0)
            local change_replay = f.call_sink(execute, change_req)
            test.eq(change_replay.success, true, f.error_text(change_replay))
            test.eq(change_replay.result, "updated")
            test.eq(change_replay.dest_ref.record_id, changed.dest_ref.record_id)
            f.assert_receipt_mutations(crm_id, 2, 0, 0)
            test.eq(f.event_count(crm_id), 2)
        end)

        test.it("deletes receipts older than the retention window and keeps newer ones", function()
            local crm_id, execute = f.crm()
            for _, key in ipairs({ "aged:old", "aged:new" }) do
                local wrote = f.call_sink(execute, f.request(crm_id, key, entity("entity:" .. key, { name = key })))
                test.eq(wrote.success, true, f.error_text(wrote))
            end
            f.exec("UPDATE kickside_crm_sink_receipt SET completed_at = $1 WHERE crm_id = $2 AND idempotency_key = $3",
                { utc_after(-31 * 86400), crm_id, "aged:old" })
            local result, call_err = funcs.new():call(RETENTION, {})
            test.is_nil(call_err)
            local answer = f.map(result)
            test.eq(answer.success, true, tostring(answer.error))
            test.is_true((tonumber(answer.deleted) or 0) >= 1)
            test.eq(#f.receipt_rows(crm_id, "aged:old"), 0)
            test.eq(#f.receipt_rows(crm_id, "aged:new"), 1)
        end)
    end)
end

return { run = test.run_cases(define) }
