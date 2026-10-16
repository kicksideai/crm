-- The writable sink's committed receipts and age-based removal.
-- Every function answers (value, err).
--
-- A receipt is keyed by the writing origin and the delivered operation alongside
-- the key, because idempotency_key identifies the source item: two syncs reading
-- one source share it, and one source item carries both an upsert and the delete
-- that follows it. A receipt is written once, after its effect: the effect's
-- durable CRM event carries the same (origin, operation, key) as its unique
-- external identity, so a delivery that stopped between the two recovers from
-- the event and commits the receipt then.
local sql = require("sql")

local M = {}

type Executor = sql.DB | sql.Transaction
type Row = { [string]: unknown }
type Receipt = {
    origin: string,
    sink_op: string,
    idempotency_key: string,
    payload_hash: string,
    outcome: string,
    dest_ref: string,
    completed_at: string,
}
type Page = { rows: { Row }, next_cursor: string, has_more: boolean }

local COLUMNS = "origin, sink_op, idempotency_key, payload_hash, outcome, dest_ref, completed_at"

local function rows_of(value: unknown): { Row }
    return type(value) == "table" and (value :: { Row }) or {}
end

-- read(db, crm_id, origin, sink_op, key) -> the committed receipt, or nil.
function M.read(db: Executor, crm_id: string, origin: string, sink_op: string, key: string): (Row?, string?)
    local rows, err = db:query("SELECT " .. COLUMNS .. " FROM kickside_crm_sink_receipt"
        .. " WHERE crm_id = $1 AND origin = $2 AND sink_op = $3 AND idempotency_key = $4",
        { crm_id, origin, sink_op, key })
    if err then return nil, tostring(err) end
    return rows_of(rows)[1], nil
end

-- commit(db, crm_id, receipt) -> the stored receipt: this delivery's, or the one
-- a concurrent delivery of the same effect committed first. The caller compares
-- its payload hash.
function M.commit(db: Executor, crm_id: string, receipt: Receipt): (Row?, string?)
    local _, err = db:execute("INSERT INTO kickside_crm_sink_receipt (crm_id, " .. COLUMNS .. ")"
        .. " VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
        .. " ON CONFLICT (crm_id, origin, sink_op, idempotency_key) DO NOTHING",
        { crm_id, receipt.origin, receipt.sink_op, receipt.idempotency_key, receipt.payload_hash,
            receipt.outcome, receipt.dest_ref, receipt.completed_at })
    if err then return nil, tostring(err) end
    local stored, read_err = M.read(db, crm_id, receipt.origin, receipt.sink_op, receipt.idempotency_key)
    if read_err then return nil, read_err end
    if not stored then return nil, "sink receipt was not stored" end
    return stored, nil
end

-- Reconcile deletes every listed key its source no longer has, so the listing is
-- scoped to the asking origin and never leaks another sync's records. It pages by
-- keyset over (idempotency_key, sink_op): the total order the primary key provides
-- within one origin, stable while later pages are being read, so two effects on one
-- source item never hide each other across a page boundary. A receipt whose effect
-- was a delete is not a destination key and never appears.
local CURSOR_SEPARATOR = "\31"

local function cursor_bound(cursor: string): (string, string)
    local key, sink_op = cursor:match("^(.*)" .. CURSOR_SEPARATOR .. "(.-)$")
    if type(key) ~= "string" then return cursor, "" end
    return key :: string, tostring(sink_op)
end

function M.list(db: Executor, crm_id: string, origin: string, cursor: string, limit: integer): (Page?, string?)
    local after_key, after_op = cursor_bound(cursor)
    -- One row past the page decides has_more without a second count query.
    local rows, err = db:query("SELECT " .. COLUMNS .. [[ FROM kickside_crm_sink_receipt
        WHERE crm_id = $1 AND origin = $2 AND outcome <> 'deleted' AND (idempotency_key, sink_op) > ($3, $4)
        ORDER BY idempotency_key ASC, sink_op ASC LIMIT $5]],
        { crm_id, origin, after_key, after_op, limit + 1 })
    if err then return nil, tostring(err) end
    local page = rows_of(rows)
    local has_more = #page > limit
    if has_more then page[#page] = nil end
    local next_cursor = cursor
    if #page > 0 then
        local last = page[#page]
        next_cursor = tostring(last.idempotency_key) .. CURSOR_SEPARATOR .. tostring(last.sink_op)
    end
    return { rows = page, next_cursor = next_cursor, has_more = has_more }, nil
end

-- prune(db, cutoff, limit) -> the number of receipts completed before cutoff that
-- one bounded page removed, oldest first through the retention index.
function M.prune(db: Executor, cutoff: string, limit: integer): (integer?, string?)
    local rows, err = db:query([[SELECT crm_id, origin, sink_op, idempotency_key FROM kickside_crm_sink_receipt
        WHERE completed_at < $1 ORDER BY completed_at, crm_id, origin, sink_op, idempotency_key LIMIT $2]],
        { cutoff, limit })
    if err then return nil, tostring(err) end
    local deleted = 0
    for _, row in ipairs(rows_of(rows)) do
        local result, delete_err = db:execute([[DELETE FROM kickside_crm_sink_receipt
            WHERE crm_id = $1 AND origin = $2 AND sink_op = $3 AND idempotency_key = $4 AND completed_at < $5]],
            { row.crm_id, row.origin, row.sink_op, row.idempotency_key, cutoff })
        if delete_err then return nil, tostring(delete_err) end
        deleted = deleted + math.floor(tonumber(type(result) == "table" and (result :: Row).rows_affected or 0) or 0)
    end
    return deleted, nil
end

return M
