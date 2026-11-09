-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local time = require("time")
local funcs = require("funcs")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local types = require("types")
local retention_runner = require("retention_runner")
local storage = require("storage")
local receipts = require("receipts")
local origins = require("origins")
local fixture = require("fixture")

type Row = { [string]: any }
local RECEIPTS = "kickside_crm_sink_receipt"
local ORIGINS = "kickside_crm_write_origin"
local RETENTION = "kickside.crm.sink:receipt_retention"

local function exec(db: sql.DB, statement: string, params: { any }?)
    local _, err = db:execute(statement, params or {})
    test.is_nil(err, tostring(err))
end

local function query(db: sql.DB, statement: string, params: { any }?): { Row }
    local rows, err = db:query(statement, params or {})
    test.is_nil(err, tostring(err))
    return rows :: { Row }
end

local function stamp(seconds: number): string
    return time.now():utc():add(seconds * time.SECOND):format(time.RFC3339)
end

local function seed(db: sql.DB, table_name: string, id: string, count: integer, completed: string)
    local prefix = "WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i < $1) "
    if table_name == RECEIPTS then
        exec(db, prefix .. "INSERT INTO " .. RECEIPTS .. [[
            (crm_id, origin, sink_op, idempotency_key, payload_hash, outcome, completed_at)
            SELECT $2, 'origin', 'upsert', CAST(i AS TEXT), 'hash', 'created', $3 FROM n]], { count, id, completed })
    elseif table_name == ORIGINS then
        exec(db, prefix .. "INSERT INTO " .. ORIGINS .. [[
            (crm_id, provider, connection_id, object_type, target_ref, attr, value_hash, write_ref, completed_at)
            SELECT $2, 'provider', 'connection', 'entity', CAST(i AS TEXT), 'name', 'hash', 'write', $3 FROM n]],
            { count, id, completed })
    else
        exec(db, prefix .. "INSERT INTO kickside_crm_conditional_outcome (crm_id, external_source, external_id, outcomes, updated_at)"
            .. " SELECT $2, 'source', CAST(i AS TEXT), '{}', $3 FROM n", { count, id, completed })
    end
end

local function count(db: sql.DB, table_name: string, id: string): number
    return tonumber(query(db, "SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE crm_id = $1", { id })[1].n) :: number
end

local function callback(): Row
    local result, err = funcs.call(RETENTION, {})
    test.is_nil(err, tostring(err))
    test.eq(result.success, true, tostring(result.error))
    return result :: Row
end

local function define()
    test.describe("CRM retention", function()
        test.it("notifies the idle sweeper after a sink receipt commits", function()
            local crm_id, execute = fixture.crm()
            local mailbox = process.listen("kickside.core.retention.changed")
            local registered, register_err = process.registry.register("kickside.core.retention.service:sweeper_process", nil, process.registry.CONSISTENT)
            test.is_nil(register_err); test.is_true(registered)
            local ok, failure = pcall(function()
                local result = fixture.call_sink(execute, fixture.request(crm_id, "retention:wake", {
                    kind = "record", object_type = "entity", record_id = "entity:wake", values = { name = "Wake" } }))
                test.eq(result.success, true, fixture.error_text(result))
                local saw_receipt = false
                local timeout = time.after("5s")
                while not saw_receipt do
                    local selected = channel.select({ mailbox:case_receive(), timeout:case_receive() })
                    if selected.channel ~= mailbox then break end
                    if selected.value.kind == "crm_receipt_committed" then
                        saw_receipt = true
                        test.eq(#fixture.receipt_rows(crm_id, "retention:wake"), 1)
                    end
                end
                test.is_true(saw_receipt, "the receipt commits after the event's retention hint")
            end)
            process.registry.unregister("kickside.core.retention.service:sweeper_process", process.registry.CONSISTENT)
            process.unlisten(mailbox)
            if not ok then error(failure) end
        end)

        test.it("drains a multi-page backlog through the Core continuation chain and preserves live rows", function()
            local db = assert(sql.get(types.db_id())) :: sql.DB
            local expired, live = tostring(uuid.v7()), tostring(uuid.v7())
            local oldest = stamp(-86400)
            for _, table_name in ipairs({ RECEIPTS, ORIGINS }) do
                seed(db, table_name, expired, 1201, stamp(-31 * 86400))
                seed(db, table_name, live, 3, oldest)
            end
            local mailbox = process.listen("kickside.core.retention.changed")
            local pass, err = retention_runner.on_wake(db, tostring(process.pid()), { kind = "crm_retention_test" })
            test.is_nil(err, tostring(err))
            test.is_true(pass.stats.needs_continue, "a full receipt page requests continuation")
            test.eq(count(db, RECEIPTS, expired), 701, "one pass removes one bounded receipt page")
            test.eq(count(db, ORIGINS, expired), 701, "one pass removes one bounded origin page")
            local passes = 1
            while pass.stats.needs_continue and passes < 10 do
                local selected = channel.select({ mailbox:case_receive(), time.after("5s"):case_receive() })
                test.eq(selected.channel, mailbox, "Core loses the owner continuation")
                pass, err = retention_runner.on_wake(db, tostring(process.pid()), selected.value)
                test.is_nil(err, tostring(err))
                passes = passes + 1
            end
            process.unlisten(mailbox)
            test.eq(passes, 3)
            for _, table_name in ipairs({ RECEIPTS, ORIGINS }) do
                test.eq(count(db, table_name, expired), 0)
                test.eq(count(db, table_name, live), 3)
                exec(db, "DELETE FROM " .. table_name .. " WHERE crm_id = $1", { live })
            end
            local expected = math.floor(assert(time.parse(time.RFC3339, oldest)):unix_nano() / 1000000) + 30 * 86400000 + 1000
            test.eq(pass.deadline_ms, expected)
            db:release()
        end)

        test.it("physically expires origins using the same configured window as echo lookup", function()
            local db = assert(sql.get(types.db_id())) :: sql.DB
            local id = tostring(uuid.v7())
            seed(db, ORIGINS, id, 1, stamp(-31 * 86400))
            local before, err = origins.lookup(id, "provider", "connection", "entity", "1", "name")
            test.is_nil(err); test.eq(before.found, false)
            callback()
            test.eq(count(db, ORIGINS, id), 0)
            db:release()
        end)

        test.it("keeps refreshed keys and the exact cutoff while draining a simulated continuous stream", function()
            local db = assert(sql.get(types.db_id())) :: sql.DB
            for _, table_name in ipairs({ RECEIPTS, ORIGINS }) do
                local id = tostring(uuid.v7())
                for tick = 1, 12 do
                    local completed = tostring(os.date("!%Y-%m-%dT%H:%M:%SZ", 1700000000 + tick * 86400))
                    local cutoff = tostring(os.date("!%Y-%m-%dT%H:%M:%SZ", 1700000000 + (tick - 3) * 86400))
                    seed(db, table_name, id .. ":" .. tick, 601, completed)
                    local prune = table_name == RECEIPTS and receipts.prune or origins.prune
                    local deleted, err = prune(db, cutoff, 500)
                    test.is_nil(err)
                    while deleted == 500 do deleted, err = prune(db, cutoff, 500); test.is_nil(err) end
                    local rows = query(db, "SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE crm_id LIKE $1", { id .. ":%" })
                    test.eq(tonumber(rows[1].n), math.min(tick, 4) * 601, "size equals arrival rate times the inclusive window")
                end
                exec(db, "DELETE FROM " .. table_name .. " WHERE crm_id LIKE $1", { id .. ":%" })
                seed(db, table_name, id, 2, "2000-01-01T00:00:00Z")
                local key = table_name == RECEIPTS and "idempotency_key" or "target_ref"
                exec(db, "UPDATE " .. table_name .. " SET completed_at = '2030-01-01T00:00:00Z' WHERE crm_id = $1 AND " .. key .. " = '1'", { id })
                local prune = table_name == RECEIPTS and receipts.prune or origins.prune
                local deleted, err = prune(db, "2000-01-01T00:00:00Z", 500)
                test.is_nil(err); test.eq(deleted, 0, "the cutoff itself survives")
                deleted, err = prune(db, "2020-01-01T00:00:00Z", 500)
                test.is_nil(err); test.eq(deleted, 1)
                test.eq(count(db, table_name, id), 1, "the refreshed key survives")
                exec(db, "DELETE FROM " .. table_name .. " WHERE crm_id = $1", { id })
            end
            db:release()
        end)

        test.it("drains conditional outcomes left by earlier CRM teardown without expiring live evidence", function()
            local db = assert(sql.get(types.db_id())) :: sql.DB
            local id = tostring(uuid.v7())
            exec(db, [[WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i < 1201)
                INSERT INTO kickside_crm_conditional_outcome (crm_id, external_source, external_id, outcomes, updated_at)
                SELECT $1, 'source', CAST(i AS TEXT), '{}', '2000-01-01T00:00:00Z' FROM n]], { id })
            local answer = callback()
            test.is_true(answer.needs_continue)
            test.eq(count(db, "kickside_crm_conditional_outcome", id), 701)
            local passes = 1
            while answer.needs_continue and passes < 10 do answer = callback(); passes = passes + 1 end
            test.eq(passes, 3)
            test.eq(count(db, "kickside_crm_conditional_outcome", id), 0)
            db:release()
        end)

        test.it("removes conditional outcomes with their CRM while preserving another owner's replay evidence", function()
            local db = assert(sql.get(types.db_id())) :: sql.DB
            local id, other = tostring(uuid.v7()), tostring(uuid.v7())
            for _, owner in ipairs({ id, other }) do
                local _, schema_err = storage.ensure(db, db:type() == sql.type.POSTGRES and "postgres" or "sqlite", owner, {
                    version = "retention-test", objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } }, attributes = {} })
                test.is_nil(schema_err, tostring(schema_err))
                exec(db, [[INSERT INTO kickside_crm_conditional_outcome
                    (crm_id, external_source, external_id, outcomes, updated_at) VALUES ($1, 'source', 'event', '{}', '2000-01-01T00:00:00Z')]], { owner })
            end
            callback()
            test.eq(count(db, "kickside_crm_conditional_outcome", id), 1, "live replay evidence has no expiry contract")
            local destroyed, err = storage.destroy_crm(db, id)
            test.is_nil(err, tostring(err)); test.eq(destroyed, true)
            test.eq(count(db, "kickside_crm_conditional_outcome", id), 0)
            test.eq(count(db, "kickside_crm_conditional_outcome", other), 1)
            exec(db, "DELETE FROM kickside_crm_conditional_outcome WHERE crm_id = $1", { other })
            db:release()
        end)
    end)
end

local function migrate(id: string)
    local result, err = funcs.call(id, { database_id = "app:receipt_schema_db", direction = "up", id = id })
    test.is_nil(err, tostring(err))
    test.eq(result.status, "complete")
    return result
end

local function define_scale()
    test.describe("CRM indexed retention scale and upgrade", function()
        local db = assert(sql.get("app:receipt_schema_db")) :: sql.DB
        local ids: { [string]: string } = {}
        local protected_id = "retained-owner"
        test.before_all(function()
            migrate("kickside.crm.migrations:01_storage_catalog")
            migrate("kickside.crm.migrations:02_activity_reference")
            migrate("kickside.crm.migrations:06_conditional_outcome")
            migrate("kickside.crm.migrations:07_pending_relation")
            for _, table_name in ipairs({ ORIGINS, RECEIPTS, "kickside_crm_conditional_outcome" }) do
                ids[table_name] = "retired-owner:" .. tostring(uuid.v7())
                seed(db, table_name, ids[table_name], 100000, "2000-01-01T00:00:00Z")
            end
            local _, err = storage.ensure(db, db:type() == sql.type.POSTGRES and "postgres" or "sqlite", protected_id, {
                version = "retention-scale", objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } }, attributes = {} })
            test.is_nil(err, tostring(err))
            seed(db, "kickside_crm_conditional_outcome", protected_id, 100000, "2000-01-01T00:00:00Z")
        end)
        test.after_all(function()
            local destroyed, err = storage.destroy_crm(db, protected_id)
            test.is_nil(err, tostring(err)); test.eq(destroyed, true)
            db:release()
        end)
        test.it("upgrades existing facts in place with the expiry index", function()
            migrate("kickside.crm.migrations:09_write_origin_retention")
            test.eq(count(db, ORIGINS, ids[ORIGINS]), 100000, "the forward migration preserves existing facts")
        end)
        test.it("keeps the forward migration idempotent", function()
            local result = migrate("kickside.crm.migrations:09_write_origin_retention")
            test.eq(result.skipped, 1)
            test.eq(count(db, ORIGINS, ids[ORIGINS]), 100000)
        end)
        for _, table_name in ipairs({ ORIGINS, RECEIPTS, "kickside_crm_conditional_outcome" }) do
            test.it("drains 100000 rows in 200 bounded transactions from " .. table_name, function()
                local total, batches = 0, 0
                while true do
                    local deleted, err
                    if table_name == "kickside_crm_conditional_outcome" then
                        deleted, err = storage.prune_orphaned_conditional_outcomes(db, 500)
                    else
                        local prune = table_name == RECEIPTS and receipts.prune or origins.prune
                        deleted, err = prune(db, "2020-01-01T00:00:00Z", 500)
                    end
                    test.is_nil(err, tostring(err))
                    test.is_true(deleted <= 500)
                    total = total + deleted
                    if deleted > 0 then batches = batches + 1 end
                    if deleted < 500 then break end
                end
                test.eq(total, 100000); test.eq(batches, 200)
                test.eq(count(db, table_name, ids[table_name]), 0)
                test.eq(count(db, "kickside_crm_conditional_outcome", protected_id), 100000)
            end)
        end
    end)
end

return { run = test.run_cases(define), scale = test.run_cases(define_scale) }
