-- Counts row writes on the CRM sink receipt table per CRM, so a suite measures one
-- delivery's bookkeeping while other suites write concurrently. Installed once at
-- harness setup, before any suite writes.
local sql = require("sql")

local M = {}

local TABLE = "kickside_crm_sink_receipt"

local function exec(db: sql.DB, statement: string): ()
    local _, err = db:execute(statement)
    if err then error("write counter: " .. tostring(err), 0) end
end

function M.install(db: sql.DB): ()
    exec(db, "CREATE TABLE crm_test_write_count (crm_id TEXT NOT NULL, k TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (crm_id, k))")
    if db:type() == sql.type.POSTGRES then
        for _, side in ipairs({ "NEW", "OLD" }) do
            exec(db, "CREATE FUNCTION crm_test_count_" .. string.lower(side) .. "() RETURNS trigger LANGUAGE plpgsql AS"
                .. " 'BEGIN INSERT INTO crm_test_write_count (crm_id, k, n) VALUES (" .. side .. ".crm_id,"
                .. " TG_TABLE_NAME || chr(58) || TG_OP, 1) ON CONFLICT (crm_id, k)"
                .. " DO UPDATE SET n = crm_test_write_count.n + 1; RETURN NULL; END'")
        end
        exec(db, "CREATE TRIGGER crm_test_count_write AFTER INSERT OR UPDATE ON " .. TABLE
            .. " FOR EACH ROW EXECUTE FUNCTION crm_test_count_new()")
        exec(db, "CREATE TRIGGER crm_test_count_delete AFTER DELETE ON " .. TABLE
            .. " FOR EACH ROW EXECUTE FUNCTION crm_test_count_old()")
        return
    end
    for _, op in ipairs({ "INSERT", "UPDATE", "DELETE" }) do
        local row = op == "DELETE" and "OLD" or "NEW"
        local k = "'" .. TABLE .. ":" .. op .. "'"
        exec(db, "CREATE TRIGGER crm_test_count_" .. string.lower(op) .. " AFTER " .. op .. " ON " .. TABLE
            .. " BEGIN INSERT OR IGNORE INTO crm_test_write_count (crm_id, k, n) VALUES (" .. row .. ".crm_id, " .. k .. ", 0);"
            .. " UPDATE crm_test_write_count SET n = n + 1 WHERE crm_id = " .. row .. ".crm_id AND k = " .. k .. "; END")
    end
end

-- writes(db, crm_id) -> total receipt row writes for the CRM and their breakdown.
function M.writes(db: sql.DB, crm_id: string): (number, string)
    local rows, err = db:query("SELECT k, n FROM crm_test_write_count WHERE crm_id = $1 ORDER BY k", { crm_id })
    if err then error("write counter: " .. tostring(err), 0) end
    local total, parts = 0, {}
    for _, row in ipairs(rows or {}) do
        total = total + (tonumber(row.n) or 0)
        parts[#parts + 1] = tostring(row.k) .. "=" .. tostring(row.n)
    end
    return total, table.concat(parts, " ")
end

function M.counts(db: sql.DB, crm_id: string): { [string]: number }
    local rows, err = db:query("SELECT k, n FROM crm_test_write_count WHERE crm_id = $1", { crm_id })
    if err then error("write counter: " .. tostring(err), 0) end
    local counts: { [string]: number } = { INSERT = 0, UPDATE = 0, DELETE = 0 }
    for _, row in ipairs(rows or {}) do
        local op = tostring(row.k):match(":([^:]+)$")
        if op then counts[op] = assert(tonumber(row.n)) end
    end
    return counts
end

return M
