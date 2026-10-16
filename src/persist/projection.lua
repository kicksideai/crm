-- CRM read-model projection worker. The core runner invokes it (input_mode
-- prefetch_events) with each new batch of crm.* events on the workspace CRM thread;
-- it folds them into the normalized tables (materializer) and returns the advanced
-- last_seq. Projection success covers exactly the SQL transaction and checkpoint;
-- it has no post-commit component side effect that could report failure after the
-- read model was already committed. A bounded batch materializer, so func:// is
-- correct; no enrichment/sync/action work runs here.
local materializer = require("materializer")
local sql = require("sql")

local M = {}
type UnknownMap = { [string]: unknown }
type Executor = sql.DB | sql.Transaction

local function trim(v: unknown): string
    return tostring(v or ""):match("^%s*(.-)%s*$") or ""
end

local function crm_id_from(input: unknown): string
    if type(input) ~= "table" then return "" end
    return trim((input :: UnknownMap).thread_id)
end

local function fold_in_transaction(db: sql.DB, crm_id: string, events: {unknown}): (UnknownMap?, error?)
    local tx, tx_err = db:begin()
    if tx_err then return nil, errors.wrap(tx_err, "failed to begin crm projection transaction") end

    local err = materializer.project_events(tx, crm_id, events)
    local counters = nil
    if not err then counters, err = materializer.counters(tx, crm_id) end
    if err then
        tx:rollback()
        return nil, err
    end

    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        return nil, errors.wrap(commit_err, "failed to commit crm projection transaction")
    end
    if counters == nil then return {}, nil end
    if type(counters) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM materializer returned invalid counters" }) end
    return counters :: UnknownMap, nil
end

function M.run(value: unknown): (UnknownMap?, error?)
    local input: UnknownMap = type(value) == "table" and (value :: UnknownMap) or {}
    local crm_id = crm_id_from(input)
    if crm_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm projection input missing thread_id" }) end

    local db, db_err = materializer.open_db()
    if not db then return nil, db_err end

    local counters, err = fold_in_transaction(
        db, crm_id, type(input.events) == "table" and input.events :: {unknown} or {})
    db:release()
    if err then return nil, err end

    local range: UnknownMap =
        type(input.range) == "table" and (input.range :: UnknownMap) or {}
    local last_seq = tonumber(range.to_seq) or nil
    local result: UnknownMap = {
        body = {
            materialized = "crm_tables",
            counters = counters or {},
            last_seq = last_seq,
        },
        last_seq = last_seq,
    }
    return result, nil
end

return M
