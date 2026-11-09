-- CRM owns its receipt and echo-fact windows. Core schedules the next expiry
-- and continues full pages through its existing retention service.
local registry = require("registry")
local sql = require("sql")
local types = require("types")
local sink_receipts = require("sink_receipts")
local write_origin = require("write_origin")
local time = require("time")

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

local function deadline(completed: string?, days: number): (integer?, string?)
    if not completed then return nil, nil end
    local parsed, err = time.parse(time.RFC3339, completed)
    if err or not parsed then return nil, "invalid completion timestamp: " .. tostring(err) end
    -- Expiry is strictly before the second-resolution cutoff used by lookup.
    return math.floor(parsed:unix_nano() / 1000000) + math.floor(days * 86400000) + 1000, nil
end

function M.run(): any
    local days, config_err = window_days()
    if config_err or not days then return failure(tostring(config_err)) end
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then return failure("crm database unavailable: " .. tostring(db_err)) end
    local now = os.time()
    local deleted, needs_continue, deadline_ms = 0, false, nil
    for _, owner in ipairs({
        { days = days :: integer, prune = sink_receipts.prune, next_completed_at = sink_receipts.next_completed_at },
        { days = write_origin.retention_days(), prune = write_origin.prune, next_completed_at = write_origin.next_completed_at },
    }) do
        local cutoff = tostring(os.date("!%Y-%m-%dT%H:%M:%SZ", now - owner.days * 86400))
        local removed, prune_err = owner.prune(db, cutoff, PAGE)
        if prune_err or removed == nil then
            db:release()
            return failure("CRM retention failed: " .. tostring(prune_err))
        end
        deleted = deleted + removed
        needs_continue = needs_continue or removed == PAGE
        local completed, read_err = owner.next_completed_at(db, cutoff)
        if read_err then db:release(); return failure("CRM retention deadline failed: " .. read_err) end
        local due, date_err = deadline(completed, owner.days)
        if date_err then db:release(); return failure(date_err) end
        if due then deadline_ms = deadline_ms == nil and due or math.min(deadline_ms, due) end
    end
    db:release()
    return { success = true, deleted = deleted,
        needs_continue = needs_continue, deadline_ms = deadline_ms }
end

return M
