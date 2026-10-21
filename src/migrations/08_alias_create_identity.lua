local migration_api = require("migration")
local sql = require("sql")

type Row = { name: string? }

local function upgrade(db: sql.Transaction, postgres: boolean)
    local columns, err = db:query(postgres
        and "SELECT attname AS name FROM pg_attribute WHERE attrelid = to_regclass('kickside_crm_alias_reservation') AND attnum > 0 AND NOT attisdropped"
        or "PRAGMA table_info(kickside_crm_alias_reservation)")
    if err then error(tostring(err)) end
    local has_create_id = false
    for _, row in ipairs(columns :: { Row }) do
        if row.name == "create_id" then has_create_id = true end
    end
    if not has_create_id then
        local _, alter_err = db:execute("ALTER TABLE kickside_crm_alias_reservation ADD COLUMN create_id TEXT")
        if alter_err then error(tostring(alter_err)) end
    end

    local created_record = postgres and "c.body->>'record_id'" or "json_extract(c.body, '$.record_id')"
    local external_record = postgres and "e.body->>'record_id'" or "json_extract(e.body, '$.record_id')"
    local deleted_record = postgres and "d.body->>'record_id'" or "json_extract(d.body, '$.record_id')"
    -- Only a projected deletion retires durable create intent. Queued deletes
    -- still need their claims while earlier events materialize. Age is not evidence.
    local _, repair_err = db:execute([[
        WITH projected_deletion AS (
            SELECT d.thread_id, d.seq, ]] .. deleted_record .. [[ AS record_id
            FROM kickside_event d
            JOIN kickside_projection p ON p.thread_id = d.thread_id
                AND p.kind = 'kickside.crm:read_model' AND p.projection_key = 'default'
            JOIN kickside_projection_cursor checkpoint ON checkpoint.projection_id = p.id
                AND checkpoint.cursor_key = 'default' AND checkpoint.last_seq >= d.seq
            WHERE d.type = 'kickside.crm.events:record.deleted'
        )
        DELETE FROM kickside_crm_alias_reservation AS r
        WHERE r.state = 'pending' AND r.create_id IS NULL
          AND NOT EXISTS (SELECT 1 FROM kickside_crm_record_locator l
              WHERE l.crm_id = r.crm_id AND l.record_id = r.record_id)
          AND NOT EXISTS (SELECT 1 FROM kickside_crm_alias a
              WHERE a.crm_id = r.crm_id AND a.object_scope = r.object_scope
                AND a.alias_type = r.alias_type AND a.alias_hash = r.alias_hash)
          AND EXISTS (SELECT 1 FROM kickside_event e
              JOIN projected_deletion retired ON retired.thread_id = e.thread_id AND retired.seq > e.seq
                  AND retired.record_id = ]] .. external_record .. [[
              WHERE CAST(e.thread_id AS TEXT) = r.crm_id AND e.type = 'kickside.crm.events:record.created'
                AND e.external_source = 'kickside.crm.resolve' AND e.external_version = '1'
                AND e.external_id = r.object_scope || ':' || r.alias_type || ':' || r.alias_hash)
          AND NOT EXISTS (SELECT 1 FROM kickside_event c
              WHERE CAST(c.thread_id AS TEXT) = r.crm_id AND c.type = 'kickside.crm.events:record.created'
                AND ]] .. created_record .. [[ = r.record_id
                AND NOT EXISTS (SELECT 1 FROM projected_deletion retired
                    WHERE retired.thread_id = c.thread_id AND retired.seq > c.seq
                      AND retired.record_id = r.record_id))
    ]])
    if repair_err then error(tostring(repair_err)) end
end

return migration_api.define(function()
    migration("08 alias create identity", function()
        database("postgres", function() up(function(db) upgrade(db, true) end) end)
        database("sqlite", function() up(function(db) upgrade(db, false) end) end)
    end)
end)
