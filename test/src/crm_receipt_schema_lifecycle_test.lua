local funcs = require("funcs")
local sql = require("sql")
local registry = require("registry")
local json = require("json")
local test = require("test")
local f = require("fixture")
local schema = require("receipt_schema")
local types = require("types")
local runner = require("runner")
local write_counter = require("write_counter")
local isolated = require("isolated")

type Map = { [string]: any }
local CREATOR = "kickside.crm.migrations:01_storage_catalog"
local TABLE = "kickside_crm_sink_receipt"

local function migrate(direction: string): Map
    local raw, err = funcs.new():call(CREATOR, { database_id = "app:receipt_schema_db", direction = direction, id = CREATOR })
    test.is_nil(err)
    local result = raw :: Map
    test.eq(result.status, "complete", json.encode(result))
    return result
end

local function exec(db: sql.DB, statement: string)
    local _, err = db:execute(statement)
    test.is_nil(err)
end

local function request(crm_id: string, key: string): Map
    return f.request(crm_id, key, { kind = "record", object_type = "entity", record_id = "entity:" .. key, values = { name = key } })
end

local function define()
    test.describe("CRM receipt schema lifecycle", function()
        test.before_all(function()
            local result = runner.setup(types.db_id()):run()
            test.eq(result.status, "complete", json.encode(result))
            local db = assert(sql.get(types.db_id())) :: sql.DB
            write_counter.install(db)
            db:release()
        end)
        test.it("uses the active backend in the isolated receipt database", function()
            local active = assert(sql.get(types.db_id())) :: sql.DB
            local active_type = active:type()
            active:release()
            local isolated = assert(sql.get("app:receipt_schema_db")) :: sql.DB
            local isolated_type = isolated:type()
            isolated:release()
            test.eq(isolated_type, active_type)
        end)

        test.it("creates the receipt contract and recreates it with stopped isolated writers", function()
            migrate("up")
            local db = assert(sql.get("app:receipt_schema_db")) :: sql.DB
            schema.assert_schema(db, true)
            exec(db, [[INSERT INTO kickside_crm_sink_receipt VALUES ('sentinel', 'origin', 'upsert', 'key', 'hash', 'created', '{}', '2026-10-05T00:00:00Z')]])
            local identity = schema.query(db, db:type() == sql.type.POSTGRES
                and "SELECT 'kickside_crm_sink_receipt'::regclass::oid AS id"
                or "SELECT rootpage AS id FROM sqlite_master WHERE name = 'kickside_crm_sink_receipt'")[1].id
            db:release()
            local second = migrate("up")
            test.eq(second.skipped, 1)
            db = assert(sql.get("app:receipt_schema_db")) :: sql.DB
            test.eq(#schema.query(db, "SELECT * FROM kickside_crm_sink_receipt WHERE crm_id = 'sentinel'"), 1)
            local after = schema.query(db, db:type() == sql.type.POSTGRES
                and "SELECT 'kickside_crm_sink_receipt'::regclass::oid AS id"
                or "SELECT rootpage AS id FROM sqlite_master WHERE name = 'kickside_crm_sink_receipt'")[1].id
            test.eq(after, identity)
            db:release()
            migrate("down")
            db = assert(sql.get("app:receipt_schema_db")) :: sql.DB
            local absent = schema.query(db, db:type() == sql.type.POSTGRES
                and "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'kickside_crm_sink_receipt'"
                or "SELECT name FROM sqlite_master WHERE name = 'kickside_crm_sink_receipt'")
            test.eq(#absent, 0)
            db:release()
            migrate("up")
            db = assert(sql.get("app:receipt_schema_db")) :: sql.DB
            schema.assert_schema(db, true)
            test.eq(#schema.query(db, "SELECT * FROM kickside_crm_sink_receipt"), 0)
            db:release()
            local entries, err = registry.find({ [".kind"] = "function.lua", ["meta.type"] = "migration" })
            test.is_nil(err)
            for _, entry in ipairs(entries or {}) do
                test.is_true(tostring(entry.id) ~= "kickside.crm.migrations:04_sink_receipt_operation")
            end
        end)

        test.it("normal boot preserves receipt rows and schema identity", function()
            f.assert_receipt_schema()
            local crm_id, execute = f.crm()
            local req = request(crm_id, "boot")
            local first = f.call_sink(execute, req)
            test.eq(first.success, true, f.error_text(first))
            local result = runner.setup(types.db_id()):run()
            test.eq(result.status, "complete", json.encode(result))
            test.eq(result.migrations_applied, 0)
            test.eq(#f.receipt_rows(crm_id, "boot"), 1)
            local replayed = f.call_sink(execute, req)
            test.eq(replayed.success, true, f.error_text(replayed))
            test.eq(replayed.dest_ref.record_id, first.dest_ref.record_id)
            f.assert_receipt_mutations(crm_id, 1, 0, 0)
            test.eq(f.event_count(crm_id), 1)
        end)

        test.it("delivers and replays without reading or changing an inert old lease row", function()
            f.assert_receipt_schema()
            f.exec("CREATE TABLE kickside_crm_sink_writer_lease (writer_id TEXT PRIMARY KEY, expires_at TEXT NOT NULL)")
            f.exec("INSERT INTO kickside_crm_sink_writer_lease VALUES ($1, $2)", { "kickside.crm.sink:crm_write", "2000-01-01T00:00:00Z" })
            local crm_id, execute = f.crm()
            local req = request(crm_id, "inert")
            local shared = assert(sql.get("app:shared_fixture_db")) :: sql.DB
            local leaked = schema.query(shared, shared:type() == sql.type.POSTGRES
                and "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'kickside_crm_sink_writer_lease'"
                or "SELECT name FROM sqlite_master WHERE name = 'kickside_crm_sink_writer_lease'")
            shared:release()
            test.eq(#leaked, 0, "schema fault fixtures never mutate shared storage")
            local first = f.call_sink(execute, req)
            local replayed = f.call_sink(execute, req)
            local rows = f.query("SELECT writer_id, expires_at FROM kickside_crm_sink_writer_lease")
            f.exec("DROP TABLE kickside_crm_sink_writer_lease")
            test.eq(first.success, true, f.error_text(first))
            test.eq(replayed.success, true, f.error_text(replayed))
            test.eq(#rows, 1)
            test.eq(rows[1].writer_id, "kickside.crm.sink:crm_write")
            test.eq(rows[1].expires_at, "2000-01-01T00:00:00Z")
            test.eq(replayed.dest_ref.record_id, first.dest_ref.record_id)
            f.assert_receipt_mutations(crm_id, 1, 0, 0)
            test.eq(f.event_count(crm_id), 1)
        end)

        test.it("exposes missing receipt storage before acknowledging a delivery", function()
            local crm_id, execute = f.crm()
            f.exec("ALTER TABLE kickside_crm_sink_receipt RENAME TO crm_test_receipt_stopped")
            local refused = f.call_sink(execute, request(crm_id, "missing-storage"))
            f.exec("ALTER TABLE crm_test_receipt_stopped RENAME TO kickside_crm_sink_receipt")
            test.eq(refused.success, false)
            test.eq(refused.error.code, "provider_unavailable")
            test.is_true(f.error_text(refused):find("kickside_crm_sink_receipt", 1, true) ~= nil)
            test.eq(f.event_count(crm_id), 0)
        end)

        test.it("returns a receipt insert error after the durable effect and recovers after repair", function()
            local crm_id, execute = f.crm()
            local req = request(crm_id, "insert-fault")
            local db = assert(sql.get(types.db_id())) :: sql.DB
            if db:type() == sql.type.POSTGRES then
                exec(db, [[CREATE FUNCTION crm_test_receipt_fault() RETURNS trigger LANGUAGE plpgsql AS
                    'BEGIN RAISE EXCEPTION ''receipt insert fault''; END']])
                exec(db, "CREATE TRIGGER crm_test_receipt_fault BEFORE INSERT ON " .. TABLE .. " FOR EACH ROW EXECUTE FUNCTION crm_test_receipt_fault()")
            else
                exec(db, "CREATE TRIGGER crm_test_receipt_fault BEFORE INSERT ON " .. TABLE .. " BEGIN SELECT RAISE(ABORT, 'receipt insert fault'); END")
            end
            db:release()
            local failed = f.call_sink(execute, req)
            db = assert(sql.get(types.db_id())) :: sql.DB
            exec(db, db:type() == sql.type.POSTGRES and "DROP TRIGGER crm_test_receipt_fault ON " .. TABLE or "DROP TRIGGER crm_test_receipt_fault")
            if db:type() == sql.type.POSTGRES then exec(db, "DROP FUNCTION crm_test_receipt_fault()") end
            db:release()
            test.eq(failed.success, false)
            test.eq(failed.error.code, "provider_error")
            test.is_true(f.error_text(failed):find("receipt insert fault", 1, true) ~= nil)
            test.eq(f.event_count(crm_id), 1)
            test.eq(#f.receipt_rows(crm_id, "insert-fault"), 0)
            local recovered = f.call_sink(execute, req)
            test.eq(recovered.success, true, f.error_text(recovered))
            test.eq(recovered.result, "created")
            test.eq(recovered.dest_ref.record_id, "entity:insert-fault")
            test.eq(f.event_count(crm_id), 1)
            f.assert_receipt_mutations(crm_id, 1, 0, 0)
        end)
    end)
end
local function run(args)
    return isolated.run({ args = args, target = "app:crm_receipt_schema_lifecycle_cases",
        database = "app:db", isolated = "app:schema_fault_db" })
end

return { run = run, cases = test.run_cases(define) }
