-- Runs the shell's own discovery under whatever actor and scope the caller
-- carries: a registry find by announced meta type, and a direct read of one
-- entry. A test body carries no actor, so both are dispatched here.
local registry = require("registry")

local M = {}

type Map = { [string]: unknown }

local function map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

function M.run(value: unknown): Map
    local input = map(value)
    local entry_id = tostring(input.entry_id or "")
    if entry_id ~= "" then
        local entry, err = registry.get(entry_id)
        if err then return { ok = false, error = tostring(err) } end
        return { ok = true, entry_id = tostring(map(entry).id or "") }
    end

    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = tostring(input.meta_type or ""),
    })
    if err then return { ok = false, error = tostring(err) } end
    local ids: { string } = {}
    for _, raw in ipairs(type(entries) == "table" and (entries :: { unknown }) or {}) do
        ids[#ids + 1] = tostring(map(raw).id or "")
    end
    return { ok = true, ids = ids }
end

return M
