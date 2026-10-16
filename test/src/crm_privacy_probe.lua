-- Test-only actor-scoped adapter over the public CRM reader and typed writer.
-- The test invokes this function through funcs:call under each principal so the
-- production security.actor()/security.scope() frame is the one being checked.
local crm = require("crm")
local writer = require("writer")

local M = {}

type Map = { [string]: unknown }

local function input(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

function M.run(value: unknown): Map
    local args = input(value)
    local op = tostring(args.op or "")
    local crm_id = tostring(args.crm_id or "")
    if op == "get" then
        local record, err = crm.get_record(crm_id, tostring(args.record_id or ""))
        return { value = record, error = err }
    end
    if op == "list" then
        local page, err = crm.list_records(crm_id, tostring(args.object_type or "entity"), {
            limit = tonumber(args.limit) or 50, offset = 0,
        })
        return { value = page, error = err }
    end
    if op == "update" then
        local ok, err = writer.update_record(crm_id, tostring(args.record_id or ""),
            tostring(args.object_type or "entity"), args.set or {}, {})
        return { value = ok, error = err }
    end
    return { error = "unknown CRM privacy probe operation" }
end

return M
