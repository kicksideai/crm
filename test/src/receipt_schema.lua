local sql = require("sql")
local test = require("test")

local M = {}
type Row = { [string]: any }

function M.query(db: sql.DB, statement: string, params: { any }?): { Row }
    local rows, err = db:query(statement, params or {})
    test.is_nil(err)
    return rows :: { Row }
end

function M.assert_schema(db: sql.DB, fresh: boolean)
    local pg = db:type() == sql.type.POSTGRES
    local columns = M.query(db, pg and [[SELECT column_name AS name, is_nullable AS nullable, data_type AS declared_type
        FROM information_schema.columns WHERE table_schema = current_schema()
        AND table_name = 'kickside_crm_sink_receipt' ORDER BY ordinal_position]]
        or "PRAGMA table_info(kickside_crm_sink_receipt)")
    local expected = { "crm_id", "origin", "sink_op", "idempotency_key", "payload_hash", "outcome", "dest_ref", "completed_at" }
    test.eq(#columns, #expected)
    for i, name in ipairs(expected) do
        test.eq(columns[i].name, name)
        test.eq(string.lower(tostring(pg and columns[i].declared_type or columns[i].type)), "text")
        if pg then test.eq(columns[i].nullable, name == "dest_ref" and "YES" or "NO")
        else test.eq(tonumber(columns[i].notnull), name == "dest_ref" and 0 or 1) end
    end
    if pg then
        local key = M.query(db, [[SELECT a.attname AS name FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
            WHERE c.conrelid = 'kickside_crm_sink_receipt'::regclass AND c.contype = 'p'
            ORDER BY array_position(c.conkey, a.attnum)]])
        test.eq(#key, 4)
        for i = 1, 4 do test.eq(key[i].name, expected[i]) end
    else
        for i, column in ipairs(columns) do test.eq(tonumber(column.pk), i <= 4 and i or 0) end
    end
    local index_columns = {
        idx_kickside_crm_sink_receipt_scan = { "crm_id", "origin", "idempotency_key", "sink_op" },
        idx_kickside_crm_sink_receipt_retention = { "completed_at", "crm_id", "origin", "sink_op", "idempotency_key" },
    }
    for name, names in pairs(index_columns) do
        if pg then
            local rows = M.query(db, [[SELECT a.attname AS name FROM pg_index i
                JOIN pg_class c ON c.oid = i.indexrelid
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                WHERE c.relname = $1 AND i.indrelid = 'kickside_crm_sink_receipt'::regclass
                ORDER BY array_position(i.indkey, a.attnum)]], { name })
            test.eq(#rows, #names)
            for i, column in ipairs(names) do test.eq(rows[i].name, column) end
        else
            local rows = M.query(db, "PRAGMA index_info(" .. name .. ")")
            test.eq(#rows, #names)
            for i, column in ipairs(names) do test.eq(rows[i].name, column) end
        end
    end
    if fresh then
        local leases = M.query(db, pg and [[SELECT table_name FROM information_schema.tables
            WHERE table_schema = current_schema() AND table_name = 'kickside_crm_sink_writer_lease']]
            or "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'kickside_crm_sink_writer_lease'")
        test.eq(#leases, 0, "fresh storage omits the retired writer lease")
    end
end

return M
