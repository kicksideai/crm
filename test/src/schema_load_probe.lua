-- Test-only actor-scoped adapter: runs one CRM write batch or read request with the
-- storage facade instrumented and answers how many schema loads it made.
local counter = require("counter")
local read_model = require("read_model")
local storage = require("storage")
local writer = require("writer")

local M = {}

type Map = { [string]: unknown }
type Result = { ok: boolean, error: unknown?, loads: number }

counter.instrument(storage)

function M.run(value: unknown): Result
    local input: Map = type(value) == "table" and value :: Map or {}
    local crm_id = tostring(input.crm_id or "")
    counter.reset()
    local ok, err
    if input.read == "record" then
        local record, read_err = read_model.internal_get_record(crm_id, tostring(input.record_id or ""))
        ok, err = record ~= nil and read_err == nil, read_err
    elseif input.read == "list" then
        local page, read_err = read_model.internal_list_records(crm_id, tostring(input.object_type or ""), {})
        ok, err = page ~= nil and read_err == nil, read_err
    else
        local appended, append_err = writer.append(crm_id, input.commands)
        ok, err = appended == true, append_err
    end
    return { ok = ok, error = err and tostring(err) or nil, loads = counter.count() }
end

return M
