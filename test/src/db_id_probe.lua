-- Resolves the CRM database under whatever actor and scope the caller carries.
-- A test body carries none, so the resolution is dispatched here through
-- funcs.new():with_actor():with_scope() -- which is the only way to run it as a
-- person rather than as the harness.
local types = require("types")

local M = {}

function M.run(_value: unknown): { [string]: unknown }
    local ok, result = pcall(function(): string return types.db_id() end)
    if not ok then return { ok = false, error = tostring(result) } end
    return { ok = true, db_id = result }
end

return M
