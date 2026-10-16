-- CRM owns its sink receipt cleanup. The core retention tick invokes this callback
-- once per sweep; a receipt older than the configured window is removed, the same
-- age bound the engine applies to its own delivery evidence.
local registry = require("registry")
local sql = require("sql")
local types = require("types")
local sink_receipts = require("sink_receipts")

local M = {}

local CONFIG = "kickside.crm.sink:receipt_retention_config"
local PAGE = 500

local function failure(message: string): any
    return { success = false, error = errors.new({ message = message, kind = errors.INTERNAL, retryable = true }) }
end

local function window_days(): (integer?, string?)
    local entry, err = registry.get(CONFIG)
    if err or type(entry) ~= "table" then return nil, "sink receipt retention config unavailable: " .. tostring(err) end
    local meta = type(entry.meta) == "table" and entry.meta or {}
    local days = tonumber(meta.retention_days)
    if not days or days < 1 or days ~= math.floor(days) then
        return nil, "sink receipt retention_days must be a positive integer, got " .. tostring(meta.retention_days)
    end
    return math.floor(days), nil
end

function M.run(): any
    local days, config_err = window_days()
    if config_err or not days then return failure(tostring(config_err)) end
    local cutoff = tostring(os.date("!%Y-%m-%dT%H:%M:%SZ", os.time() - days * 86400))
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then return failure("crm database unavailable: " .. tostring(db_err)) end
    local deleted, prune_err = sink_receipts.prune(db, cutoff, PAGE)
    db:release()
    if prune_err or deleted == nil then return failure("sink receipt retention failed: " .. tostring(prune_err)) end
    return { success = true, deleted = deleted }
end

return M
