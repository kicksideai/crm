local funcs = require("funcs")
local json = require("json")
local sql = require("sql")
local test = require("test")
local repository = require("repository")
local isolated = require("isolated")

type Map = { [string]: any }
local DB = "app:receipt_schema_db"
local CREATOR = "kickside.crm.migrations:01_storage_catalog"
local REPAIR = "kickside.crm.migrations:08_alias_create_identity"

local function migrate(id: string, direction: string?): Map
    local raw, err = funcs.new():call(id, { database_id = DB, direction = direction or "up", id = id })
    test.is_nil(err)
    test.eq((raw :: Map).status, "complete", json.encode(raw))
    return raw :: Map
end

local function execute(db: sql.DB, statement: string, args: { any }?)
    local _, err = db:execute(statement, args or {})
    test.is_nil(err)
end

local function rows(db: sql.DB, statement: string): { Map }
    local found, err = db:query(statement)
    test.is_nil(err)
    return found :: { Map }
end

local function define()
    test.describe("CRM alias migration from the published storage schema", function()
        test.it("releases only proven orphaned legacy collisions and preserves durable intent", function()
            migrate(CREATOR)
            local db = assert(sql.get(DB)) :: sql.DB
            -- Event bodies and reservation rows use the previous release's shapes.
            execute(db, "CREATE TABLE kickside_event (thread_id " .. (db:type() == sql.type.POSTGRES and "UUID" or "TEXT")
                .. " NOT NULL, seq INTEGER NOT NULL, type TEXT NOT NULL, body "
                .. (db:type() == sql.type.POSTGRES and "JSONB" or "TEXT")
                .. " NOT NULL, external_source TEXT, external_id TEXT, external_version TEXT, PRIMARY KEY (thread_id, seq))")
            for index, key in ipairs({ "orphan", "reused", "landing", "live", "assigned", "fresh", "committed", "queued", "backlog" }) do
                execute(db, [[INSERT INTO kickside_crm_alias_reservation
                    (crm_id, object_scope, alias_type, alias_hash, record_id, state, reserved_at)
                    VALUES ('00000000-0000-4000-8000-000000000001', 'entity', 'email', $1, $2, $3, '2000-01-01T00:00:00Z')]],
                    { key, key == "reused" and "old:reused" or "new:" .. key, key == "committed" and "committed" or "pending" })
                if key ~= "fresh" then
                    execute(db, [[INSERT INTO kickside_event VALUES ('00000000-0000-4000-8000-000000000001', $1, 'kickside.crm.events:record.created', $2,
                        'kickside.crm.resolve', $3, '1')]],
                        { index * 2 - 1, json.encode({ record_id = "old:" .. key, object_type = "entity" }), "entity:email:" .. key })
                    execute(db, [[INSERT INTO kickside_event VALUES ('00000000-0000-4000-8000-000000000001', $1, 'kickside.crm.events:record.deleted', $2, NULL, NULL, NULL)]],
                        { index * 2, json.encode({ record_id = "old:" .. key, object_type = "entity" }) })
                end
            end
            local id_type = db:type() == sql.type.POSTGRES and "UUID" or "TEXT"
            execute(db, "CREATE TABLE kickside_projection (id " .. id_type .. " PRIMARY KEY, thread_id " .. id_type
                .. " NOT NULL, kind TEXT NOT NULL, projection_key TEXT NOT NULL)")
            execute(db, "CREATE TABLE kickside_projection_cursor (projection_id " .. id_type
                .. " NOT NULL, cursor_key TEXT NOT NULL, last_seq INTEGER NOT NULL)")
            execute(db, [[INSERT INTO kickside_projection VALUES ('00000000-0000-4000-8000-000000000002',
                '00000000-0000-4000-8000-000000000001', 'kickside.crm:read_model', 'default')]])
            execute(db, [[INSERT INTO kickside_projection_cursor VALUES ('00000000-0000-4000-8000-000000000002', 'default', 16)]])
            execute(db, [[INSERT INTO kickside_event VALUES ('00000000-0000-4000-8000-000000000001', 22, 'kickside.crm.events:record.created', $1, 'other', 'queued', '1')]],
                { json.encode({ record_id = "new:queued", object_type = "entity" }) })
            execute(db, [[INSERT INTO kickside_event VALUES ('00000000-0000-4000-8000-000000000001', 23, 'kickside.crm.events:record.deleted', $1, NULL, NULL, NULL)]],
                { json.encode({ record_id = "new:queued", object_type = "entity" }) })
            execute(db, [[INSERT INTO kickside_event VALUES ('00000000-0000-4000-8000-000000000001', 21, 'kickside.crm.events:record.created', $1, 'other', 'landing', '1')]],
                { json.encode({ record_id = "new:landing", object_type = "entity" }) })
            execute(db, [[INSERT INTO kickside_crm_record_locator VALUES ('00000000-0000-4000-8000-000000000001', 'new:live', 'entity', 'date', 'date')]])
            execute(db, [[INSERT INTO kickside_crm_alias
                (crm_id, object_scope, alias_type, alias_hash, record_id, updated_at)
                VALUES ('00000000-0000-4000-8000-000000000001', 'entity', 'email', 'assigned', 'new:assigned', 'date')]])
            db:release()
            migrate(REPAIR)
            db = assert(sql.get(DB)) :: sql.DB
            local remaining = rows(db, "SELECT alias_hash, state, reserved_at, create_id FROM kickside_crm_alias_reservation ORDER BY alias_hash")
            local expected = { "assigned", "backlog", "committed", "fresh", "landing", "live", "queued" }
            test.eq(#remaining, #expected)
            for index, name in ipairs(expected) do test.eq(remaining[index].alias_hash, name) end
            for _, row in ipairs(remaining) do
                test.eq(row.reserved_at, "2000-01-01T00:00:00Z")
                test.is_nil(row.create_id)
            end
            local event_count = #rows(db, "SELECT * FROM kickside_event")
            db:release()
            local repeated = migrate(REPAIR)
            test.eq(repeated.skipped, 1)
            -- Re-execution after an interrupted migration is idempotent too.
            db = assert(sql.get(DB)) :: sql.DB
            execute(db, "DELETE FROM _migrations WHERE id = $1", { REPAIR })
            db:release()
            migrate(REPAIR)
            db = assert(sql.get(DB)) :: sql.DB
            local after = rows(db, "SELECT alias_hash, state, reserved_at, create_id FROM kickside_crm_alias_reservation ORDER BY alias_hash")
            test.eq(#after, #remaining)
            for index, row in ipairs(remaining) do
                test.eq(after[index].alias_hash, row.alias_hash)
                test.eq(after[index].state, row.state)
                test.eq(after[index].reserved_at, row.reserved_at)
                test.eq(after[index].create_id, row.create_id)
            end
            test.eq(#rows(db, "SELECT * FROM kickside_event"), event_count)
            execute(db, "DROP TABLE kickside_projection_cursor")
            execute(db, "DROP TABLE kickside_projection")
            execute(db, "DROP TABLE kickside_event")
            db:release()
            migrate(CREATOR, "down")
        end)
    end)
end

local function run(args)
    local db = assert(sql.get(DB)) :: sql.DB
    local _, err = repository.init_tracking_table(db)
    db:release()
    test.is_nil(err)
    return isolated.run({ args = args, target = "app:crm_alias_migration_cases",
        database = DB, isolated = "app:schema_fault_db" })
end

return { run = run, cases = test.run_cases(define) }
