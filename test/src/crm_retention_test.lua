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
local json = require("json")
local logger = require("logger")

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
        test.before_all(function() assert(funcs.call("app:wait_for_boot", {})) end)
        test.it("schedules existing receipts through Core without a receipt write notification", function()
            local crm_id, execute = fixture.crm()
            local request = fixture.request(crm_id, "retention:wake", {
                kind = "record", object_type = "entity", record_id = "entity:wake", values = { name = "Wake" } })
            local first = fixture.call_sink(execute, request)
            test.eq(first.success, true, fixture.error_text(first))
            -- Reproduce the durable state after the event commits but before its receipt does.
            fixture.exec("DELETE FROM kickside_crm_sink_receipt WHERE crm_id = $1", { crm_id })
            local event_count = fixture.event_count(crm_id)
            local mailbox = process.listen("kickside.core.retention.changed")
            local registered, register_err = process.registry.register("kickside.core.retention.service:sweeper_process", nil, process.registry.CONSISTENT)
            test.is_nil(register_err); test.is_true(registered)
            local ok, failure = pcall(function()
                local result = fixture.call_sink(execute, request)
                test.eq(result.success, true, fixture.error_text(result))
                test.eq(fixture.event_count(crm_id), event_count, "replay commits the missing receipt without a new append")
                local idle = time.after("5s")
                local selected = channel.select({ mailbox:case_receive(), idle:case_receive() })
                test.eq(selected.channel, idle, "receipt replay adds no retention call to the committed write")
                test.eq(#fixture.receipt_rows(crm_id, "retention:wake"), 1)
                local report = callback()
                test.eq(report.deleted, 0)
                test.eq(report.needs_continue, false)
                local handle = assert(sql.get(types.db_id())) :: sql.DB
                local after, after_err = retention_runner.on_wake(handle, tostring(process.pid()), { kind = "deadline_test" })
                handle:release()
                test.is_nil(after_err, tostring(after_err))
                local completed = tostring(fixture.receipt_rows(crm_id, "retention:wake")[1].completed_at)
                local expected = math.floor(assert(time.parse(time.RFC3339, completed)):unix_nano() / 1000000) + 30 * 86400000 + 1000
                test.eq(report.deadline_ms, expected)
                test.eq(after.deadline_ms, expected)
            end)
            process.registry.unregister("kickside.core.retention.service:sweeper_process", process.registry.CONSISTENT)
            process.unlisten(mailbox)
            fixture.exec("DELETE FROM kickside_crm_sink_receipt WHERE crm_id = $1", { crm_id })
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

        test.it("seeks the first unexpired completion while an expired backlog remains", function()
            local db = assert(sql.get(types.db_id())) :: sql.DB
            local cutoff, live = "2020-01-01T00:00:00Z", "2020-01-02T00:00:00Z"
            for _, table_name in ipairs({ RECEIPTS, ORIGINS }) do
                local id = tostring(uuid.v7())
                seed(db, table_name, id, 601, "2000-01-01T00:00:00Z")
                seed(db, table_name, id .. ":live", 1, live)
                local next_completed = table_name == RECEIPTS and receipts.next_completed_at or origins.next_completed_at
                local completed, err = next_completed(db, cutoff)
                test.is_nil(err); test.eq(completed, live, "deadline reads skip expired rows")
                exec(db, "DELETE FROM " .. table_name .. " WHERE crm_id = $1 OR crm_id = $2", { id, id .. ":live" })
            end
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

local function planned(db: sql.DB): sql.DB
    local pg = db:type() == sql.type.POSTGRES
    local function check(executor: any, statement: string, params: { any }?)
        local rows = query(executor, (pg and "EXPLAIN (FORMAT JSON) " or "EXPLAIN QUERY PLAN ") .. statement, params)
        logger:info("CRM retention query plan", { statement = statement, plan = json.encode(rows) })
        if pg then
            local plan = assert(json.decode(tostring(rows[1]["QUERY PLAN"])))
            local function visit(node: any)
                if node["Relation Name"] then
                    test.is_true(node["Node Type"] ~= "Seq Scan", "unbounded relation scan: " .. statement)
                end
                for _, child in ipairs(node.Plans or {}) do visit(child) end
            end
            visit(plan[1].Plan)
        else
            for _, row in ipairs(rows) do
                local detail = tostring(row.detail)
                test.is_nil(detail:match("SCAN kickside_crm_"), detail)
                if statement:match("^DELETE") and detail:match("^SEARCH kickside_crm_write_origin")
                    and not detail:find("_retention", 1, true) then
                    test.is_true(detail:find("attr=?", 1, true) ~= nil, "origin delete must seek the full key: " .. detail)
                end
                if statement:match("^DELETE") and detail:find("sqlite_autoindex", 1, true) then
                    test.is_true(detail:find("idempotency_key=?", 1, true) ~= nil
                        or detail:find("attr=?", 1, true) ~= nil, "delete must seek the full primary key: " .. detail)
                end
            end
        end
    end
    local function observed(executor: any): any
        return {
            query = function(_, statement: string, params: { any }?)
                check(executor, statement, params)
                return executor:query(statement, params)
            end,
            execute = function(_, statement: string, params: { any }?)
                check(executor, statement, params)
                return executor:execute(statement, params)
            end,
            begin = function(_)
                local tx, err = executor:begin()
                if err then return nil, err end
                local out = observed(tx)
                out.commit = function(_) return tx:commit() end
                out.rollback = function(_) return tx:rollback() end
                return out, nil
            end,
        }
    end
    return observed(db) :: sql.DB
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
            for _, table_name in ipairs({ ORIGINS, RECEIPTS }) do
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
        for _, table_name in ipairs({ ORIGINS, RECEIPTS }) do
            test.it("drains 100000 rows in 200 bounded transactions from " .. table_name, function()
                local total, batches = 0, 0
                while true do
                    local deleted, err
                    local prune = table_name == RECEIPTS and receipts.prune or origins.prune
                    deleted, err = prune(db, "2020-01-01T00:00:00Z", 500)
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
        test.it("bounds prune and future-deadline queries by index seeks", function()
            local probe_id = "plan-owner:" .. tostring(uuid.v7())
            for _, table_name in ipairs({ RECEIPTS, ORIGINS }) do
                seed(db, table_name, probe_id, 100000, "2000-01-01T00:00:00Z")
                local key = table_name == RECEIPTS and "idempotency_key" or "target_ref"
                exec(db, "UPDATE " .. table_name .. " SET crm_id = crm_id || ':' || CAST(CAST(" .. key
                    .. " AS INTEGER) % 1000 AS TEXT) WHERE crm_id = $1", { probe_id })
            end
            exec(db, "ANALYZE")
            local observed = planned(db)
            for _, owner in ipairs({
                { name = RECEIPTS, prune = receipts.prune, next_completed = receipts.next_completed_at },
                { name = ORIGINS, prune = origins.prune, next_completed = origins.next_completed_at },
            }) do
                local removed, prune_err = owner.prune(observed, "2020-01-01T00:00:00Z", 500)
                test.is_nil(prune_err); test.eq(removed, 500)
                local completed, err = owner.next_completed(observed, "2020-01-01T00:00:00Z")
                test.is_nil(err); test.is_nil(completed)
                exec(db, "DELETE FROM " .. owner.name .. " WHERE crm_id LIKE $1", { probe_id .. ":%" })
            end
        end)
    end)
end

local function define_outcome_migration()
    test.describe("CRM conditional outcome upgrade", function()
        local db = assert(sql.get("app:receipt_schema_db")) :: sql.DB
        local prefix = "upgrade:" .. tostring(uuid.v7()) .. ":"
        local repair = "kickside.crm.migrations:10_orphan_conditional_outcomes"
        local function assert_preserved()
            test.eq(tonumber(query(db, "SELECT COUNT(*) AS n FROM kickside_crm_conditional_outcome")[1].n), 99000)
            test.eq(tonumber(query(db, [[SELECT COUNT(*) AS n FROM kickside_crm_conditional_outcome
                WHERE outcomes = '{"name":"applied"}' AND updated_at = '2000-01-01T00:00:00Z']])[1].n), 99000,
                "all live replay payloads and timestamps survive unchanged")
            test.eq(count(db, "kickside_crm_conditional_outcome", prefix .. "retired"), 0)
        end
        test.before_all(function()
            migrate("kickside.crm.migrations:01_storage_catalog")
            migrate("kickside.crm.migrations:06_conditional_outcome")
            exec(db, [[WITH RECURSIVE n(i) AS (SELECT 0 UNION ALL SELECT i+1 FROM n WHERE i<999)
                INSERT INTO kickside_crm_schema_revision (crm_id, revision, source_hash, dialect, applied_at)
                SELECT $1 || CAST(i AS TEXT), 'revision', 'hash', $2, '2000-01-01T00:00:00Z' FROM n]],
                { prefix, db:type() == sql.type.POSTGRES and "postgres" or "sqlite" })
            exec(db, [[WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i<99000)
                INSERT INTO kickside_crm_conditional_outcome (crm_id, external_source, external_id, outcomes, updated_at)
                SELECT $1 || CAST(i%1000 AS TEXT), 'source', CAST(i AS TEXT), '{"name":"applied"}',
                    '2000-01-01T00:00:00Z' FROM n]], { prefix })
            seed(db, "kickside_crm_conditional_outcome", prefix .. "retired", 1000, "2000-01-01T00:00:00Z")
            test.eq(tonumber(query(db, "SELECT COUNT(*) AS n FROM kickside_crm_conditional_outcome")[1].n), 100000)
        end)
        test.after_all(function()
            for _, table_name in ipairs({ "kickside_crm_conditional_outcome", "kickside_crm_schema_revision" }) do
                exec(db, "DELETE FROM " .. table_name .. " WHERE crm_id LIKE $1", { prefix .. "%" })
            end
            db:release()
        end)
        test.it("removes orphan outcomes from a 100000-row published schema and preserves live evidence", function()
            local started = time.now()
            migrate(repair)
            logger:info("CRM outcome migration over 100000 mixed rows", {
                elapsed_ms = math.floor((time.now():unix_nano() - started:unix_nano()) / 1000000) })
            assert_preserved()
        end)
        test.it("repeats the upgrade without changing live evidence", function()
            local repeated = migrate(repair)
            test.eq(repeated.skipped, 1)
            assert_preserved()
            -- Re-executing the statement after interruption also preserves live rows.
            exec(db, "DELETE FROM _migrations WHERE id = $1", { repair })
            migrate(repair)
            assert_preserved()
        end)
        test.it("removes 100000 orphan outcomes in one forward migration", function()
            exec(db, "DELETE FROM kickside_crm_schema_revision WHERE crm_id LIKE $1", { prefix .. "%" })
            seed(db, "kickside_crm_conditional_outcome", prefix .. "retired", 1000, "2000-01-01T00:00:00Z")
            exec(db, "DELETE FROM _migrations WHERE id = $1", { repair })
            local started = time.now()
            migrate(repair)
            logger:info("CRM outcome migration deletes 100000 orphan rows", {
                elapsed_ms = math.floor((time.now():unix_nano() - started:unix_nano()) / 1000000) })
            test.eq(tonumber(query(db, "SELECT COUNT(*) AS n FROM kickside_crm_conditional_outcome")[1].n), 0)
        end)
    end)
end

local function run(args)
    return require("isolated").run({ args = args, target = "app:crm_retention_cases",
        database = "app:db", isolated = "app:schema_fault_db" })
end

return { run = run, cases = test.run_cases(define), scale = test.run_cases(define_scale), outcome_migration = test.run_cases(define_outcome_migration) }
