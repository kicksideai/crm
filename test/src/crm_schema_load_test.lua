-- The applied schema is loaded once per unit of work: once for a write batch,
-- once for a projection batch, once for a read request, whatever the number of
-- items the unit carries.
local actors = require("actors")
local contract = require("contract")
local counter = require("counter")
local funcs = require("funcs")
local materializer = require("materializer")
local security = require("security")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type Map = { [string]: unknown }
type List = { unknown }
type Executor = { call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?) }
type ThreadService = { ensure_thread: (self: ThreadService, input: Map) -> (unknown?, unknown?) }
type ScopedThreads = { open: (self: ScopedThreads) -> (ThreadService?, unknown?) }
type ActorThreads = { with_scope: (self: ActorThreads, value: security.Scope) -> ScopedThreads }
type ThreadDefinition = { with_actor: (self: ThreadDefinition, value: security.Actor) -> ActorThreads }

local PROBE = "app:schema_load_probe"
local ITEMS = 6

local function map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function declaration(): Map
    return {
        version = "schema-load-v1",
        objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } },
        attributes = {
            { id = "name", object_type = "entity", attr = "name", data_type = "text", config = {} },
            { id = "email", object_type = "entity", attr = "email", data_type = "email",
                config = { unique = true, alias = "email" } },
            { id = "related", object_type = "entity", attr = "related", data_type = "relation",
                config = { cardinality = "many", target = { kind = "record", object_type = "entity" } } },
        },
        pipelines = {}, views = {}, policies = {}, merge_config = {},
    }
end

local function apply_schema(crm_id: string)
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local _, err = storage.ensure(db, db:type() :: string, crm_id, declaration())
    db:release()
    test.is_nil(err)
end

local function provision(crm_id: string, active_actor: security.Actor, active_scope: security.Scope)
    local definition = assert(contract.get(types.THREADS)) :: ThreadDefinition
    local threads = assert(definition:with_actor(active_actor):with_scope(active_scope):open())
    local _, thread_err = threads:ensure_thread({
        component_id = crm_id,
        impl_id = types.CRM_IMPL,
        thread_class = types.THREAD_CLASS,
    })
    test.is_nil(thread_err)
    apply_schema(crm_id)
end

local function scope(): security.Scope
    local rule = assert(security.policy("app:user"))
    return assert(security.new_scope({ rule })) :: security.Scope
end

local function created(index: number): Map
    local id = "entity:" .. tostring(index)
    return { type = types.EVENTS.RECORD_CREATED, body = {
        record_id = id, object_type = "entity",
        values = { name = id, email = "entity" .. tostring(index) .. "@example.test" },
        occurred_at = "2026-11-01T00:00:00Z",
    } }
end

local function updated(index: number): Map
    return { type = types.EVENTS.RECORD_UPDATED, body = {
        record_id = "entity:" .. tostring(index), object_type = "entity",
        set = { name = "renamed " .. tostring(index) },
        occurred_at = "2026-11-01T00:00:01Z",
    } }
end

local function linked(index: number): Map
    return { type = types.EVENTS.RELATION_LINKED, body = {
        record_id = "entity:" .. tostring(index), object_type = "entity", attr = "related",
        reference = { kind = "record", type = "entity", id = "entity:1" },
        occurred_at = "2026-11-01T00:00:02Z",
    } }
end

local function call(execute: Executor, input: Map): Map
    local result, err = execute:call(PROBE, input)
    test.is_nil(err)
    local answer = map(result)
    test.is_nil(answer.error)
    test.eq(answer.ok, true)
    return answer
end

local function define_tests()
    test.describe("CRM schema loads", function()
        test.it("loads the schema once for a projection batch of many records", function()
            local crm_id = uuid.v7()
            apply_schema(crm_id)
            local events: List = {}
            for index = 1, ITEMS do events[#events + 1] = created(index) end
            for index = 1, ITEMS do events[#events + 1] = updated(index) end
            for index = 2, ITEMS do events[#events + 1] = linked(index) end

            local db = assert(sql.get(types.db_id())) :: sql.DB
            local tx = assert(db:begin())
            counter.reset()
            local err = materializer.project_events(counter.executor(tx), crm_id, events)
            local loads = counter.count()
            if err then tx:rollback() else assert(tx:commit()) end
            db:release()
            test.is_nil(err)
            test.eq(loads, 1)
        end)

        test.it("loads the schema once for a write batch and once per read request", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actors.make(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor

            local commands: List = {}
            for index = 1, ITEMS do commands[#commands + 1] = created(index) end
            test.eq(call(execute, { crm_id = crm_id, commands = commands }).loads, 1)

            local followups: List = {}
            for index = 1, ITEMS do followups[#followups + 1] = updated(index) end
            for index = 2, ITEMS do followups[#followups + 1] = linked(index) end
            test.eq(call(execute, { crm_id = crm_id, commands = followups }).loads, 1)

            test.eq(call(execute, { crm_id = crm_id, read = "record", record_id = "entity:2" }).loads, 1)
            test.eq(call(execute, { crm_id = crm_id, read = "list", object_type = "entity" }).loads, 1)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
