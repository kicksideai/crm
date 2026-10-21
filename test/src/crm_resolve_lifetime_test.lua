local actors = require("actors")
local aliases = require("aliases")
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type Map = { [string]: any }

local function setup(): (string, any)
    local crm_id = uuid.v7()
    local actor = actors.make(uuid.v4())
    local scope = assert(security.new_scope({ assert(security.policy("app:user")) }))
    local threads = assert(contract.get(types.THREADS)):with_actor(actor):with_scope(scope):open()
    local _, err = threads:ensure_thread({ component_id = crm_id, impl_id = types.CRM_IMPL, thread_class = types.THREAD_CLASS })
    test.is_nil(err)
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local _, schema_err = storage.ensure(db, db:type(), crm_id, {
        version = "resolve-v1",
        objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } },
        attributes = {
            { id = "name", object_type = "entity", attr = "name", data_type = "text", config = {} },
            { id = "email", object_type = "entity", attr = "email", data_type = "email", config = { alias = "email" } },
            { id = "status", object_type = "entity", attr = "status", data_type = "text", config = { default = "new" } },
        },
    })
    db:release()
    test.is_nil(schema_err)
    return crm_id, funcs.new():with_actor(actor):with_scope(scope):with_context({ runtime_type = "dataflow_function" })
end

local function query(statement: string, args: { any }): { Map }
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local rows, err = db:query(statement, args)
    db:release()
    test.is_nil(err)
    return rows :: { Map }
end

local function exec(statement: string, args: { any })
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local _, err = db:execute(statement, args)
    db:release()
    test.is_nil(err)
end

local function resolve(execute: any, crm_id: string, record_id: string, name: string?): (Map?, any)
    return execute:call("kickside.crm.resolution:resolve", {
        crm_id = crm_id, object_type = "entity", record_id = record_id,
        match = { alias_type = "email", alias_value = "identity@example.test" }, values = { name = name or "Input" },
    })
end

local function remove(execute: any, crm_id: string, record_id: string)
    local raw, err = execute:call("app:writer_probe", { crm_id = crm_id, commands = {
        { type = types.EVENTS.RECORD_DELETED, body = { record_id = record_id, object_type = "entity" } },
    } })
    test.is_nil(err)
    test.eq((raw :: Map).ok, true, tostring((raw :: Map).error))
end

local function define()
    test.describe("CRM resolve record lifetimes", function()
        for _, reused in ipairs({ false, true }) do
            test.it("recreates a deleted alias with " .. (reused and "the same" or "a new") .. " proposed record id", function()
                local crm_id, execute = setup()
                local first, err = resolve(execute, crm_id, "entity:first")
                test.is_nil(err)
                test.eq((first :: Map).created, true)
                remove(execute, crm_id, "entity:first")
                local next_id = reused and "entity:first" or "entity:second"
                local second, second_err = resolve(execute, crm_id, next_id)
                test.is_nil(second_err)
                test.eq((second :: Map).created, true)
                local db = assert(sql.get(types.db_id())) :: sql.DB
                local record, read_err = storage.get(db, crm_id, "entity", next_id)
                db:release()
                test.is_nil(read_err)
                test.not_nil(record, "resolve reports creation without a stored record")
                for key, value in pairs((record :: Map).values) do
                    test.eq((second :: Map).record.values[key], value)
                end
                local events = query("SELECT external_id FROM kickside_event WHERE thread_id = $1 AND type = $2 ORDER BY seq", { crm_id, types.EVENTS.RECORD_CREATED })
                test.eq(#events, 2)
                test.is_true(events[1].external_id ~= events[2].external_id)
                test.eq(query("SELECT state FROM kickside_crm_alias_reservation WHERE crm_id = $1", { crm_id })[1].state, "committed")
            end)
        end

        test.it("returns the projected create values including schema defaults", function()
            local crm_id, execute = setup()
            local result, err = resolve(execute, crm_id, "entity:defaults")
            test.is_nil(err)
            test.eq((result :: Map).record.values.status, "new")
        end)

        test.it("retries one pending claim idempotently and does not report a duplicate as created", function()
            local crm_id, execute = setup()
            local first, err = resolve(execute, crm_id, "entity:retry")
            test.is_nil(err)
            exec("UPDATE kickside_crm_alias_reservation SET state = 'pending' WHERE crm_id = $1", { crm_id })
            local retried, retry_err = resolve(execute, crm_id, "entity:other", "Changed")
            test.is_nil(retry_err)
            test.eq((retried :: Map).created, false)
            test.eq((retried :: Map).record.record_id, (first :: Map).record.record_id)
            test.eq((retried :: Map).record.object_type, (first :: Map).record.object_type)
            for key, value in pairs((first :: Map).record.values) do
                test.eq((retried :: Map).record.values[key], value)
            end
            test.eq(tonumber(query("SELECT COUNT(*) AS count FROM kickside_event WHERE thread_id = $1", { crm_id })[1].count), 1)
        end)

        test.it("preserves the external identity of a pending claim from an earlier release", function()
            local crm_id, execute = setup()
            local _, alias_hash, hash_err = aliases.normalized_key("email", "identity@example.test", crm_id)
            test.is_nil(hash_err)
            local raw, err = execute:call("app:writer_probe", { crm_id = crm_id, commands = { {
                type = types.EVENTS.RECORD_CREATED,
                body = { record_id = "entity:legacy", object_type = "entity", values = { name = "Input", email = "identity@example.test" } },
                external = { external_source = "kickside.crm.resolve", external_id = "entity:email:" .. tostring(alias_hash), external_version = "1" },
            } } })
            test.is_nil(err)
            test.eq((raw :: Map).ok, true, tostring((raw :: Map).error))
            exec("UPDATE kickside_crm_alias_reservation SET create_id = NULL, state = 'pending' WHERE crm_id = $1", { crm_id })
            local retried, retry_err = resolve(execute, crm_id, "entity:other", "Changed")
            test.is_nil(retry_err)
            test.eq((retried :: Map).created, false)
            test.eq((retried :: Map).record.record_id, "entity:legacy")
            test.eq((retried :: Map).record.values.name, "Input")
            test.eq(tonumber(query("SELECT COUNT(*) AS count FROM kickside_event WHERE thread_id = $1", { crm_id })[1].count), 1)
        end)

        test.it("refuses a duplicate create whose record no longer exists", function()
            local crm_id, execute = setup()
            local _, err = resolve(execute, crm_id, "entity:missing")
            test.is_nil(err)
            local claim = query("SELECT * FROM kickside_crm_alias_reservation WHERE crm_id = $1", { crm_id })[1]
            remove(execute, crm_id, "entity:missing")
            -- Restore the same durable claim to exercise a historical duplicate.
            exec([[INSERT INTO kickside_crm_alias_reservation
                (crm_id, object_scope, alias_type, alias_hash, record_id, state, reserved_at, create_id)
                VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)]],
                { claim.crm_id, claim.object_scope, claim.alias_type, claim.alias_hash, claim.record_id, claim.reserved_at, claim.create_id })
            local result, resolve_err = resolve(execute, crm_id, "entity:another")
            test.is_nil(result)
            test.not_nil(resolve_err)
            test.is_true(errors.is(resolve_err, errors.NOT_FOUND))
        end)
    end)
end

return { run = test.run_cases(define) }
