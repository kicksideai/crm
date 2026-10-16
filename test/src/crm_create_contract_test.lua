local actors = require("actors")
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type Map = { [string]: unknown }
type Executor = { call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?) }
type ThreadsDefinition = {
    with_actor: (self: ThreadsDefinition, actor: security.Actor) -> ThreadsDefinition,
    with_scope: (self: ThreadsDefinition, scope: security.Scope) -> ThreadsDefinition,
    open: (self: ThreadsDefinition) -> (ThreadsClient?, unknown?),
}
type ThreadsClient = {
    delete: (self: ThreadsClient, input: Map) -> (unknown?, unknown?),
}
type Created = { component_id: string, title: string, revision: unknown, replayed: boolean }
type Bootstrap = {
    crm_id: string,
    workspace_label: string,
    can_write: boolean,
    objects: { unknown },
    attributes: { unknown },
    pipelines: { unknown },
    views: { unknown },
}

local CREATE_PROBE = "app:create_probe"

local function map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function created(value: unknown): Created
    local result = map(value)
    return {
        component_id = tostring(result.component_id),
        title = tostring(result.title),
        revision = result.revision,
        replayed = result.replayed == true,
    }
end

local function bootstrap(value: unknown): Bootstrap
    local result = map(value)
    return {
        crm_id = tostring(result.crm_id),
        workspace_label = tostring(result.workspace_label),
        can_write = result.can_write == true,
        objects = type(result.objects) == "table" and (result.objects :: { unknown }) or {},
        attributes = type(result.attributes) == "table" and (result.attributes :: { unknown }) or {},
        pipelines = type(result.pipelines) == "table" and (result.pipelines :: { unknown }) or {},
        views = type(result.views) == "table" and (result.views :: { unknown }) or {},
    }
end

local function actor(id: string): security.Actor
    return actors.make(id)
end

local function scope(): security.Scope
    local rule = assert(security.policy("app:user"))
    return assert(security.new_scope({ rule })) :: security.Scope
end

local function create_as(execute: Executor, key: string, title: unknown, parent_id: unknown): (unknown?, unknown?)
    return execute:call(CREATE_PROBE, {
        idempotency_key = key,
        title = title,
        parent_id = parent_id,
    })
end

local function bootstrap_as(execute: Executor, crm_id: string): (unknown?, unknown?)
    return execute:call(CREATE_PROBE, { bootstrap_crm_id = crm_id })
end

local function define_tests()
    test.describe("CRM bootstrap before creation", function()
        test.it("returns a successful not-provisioned state for an actor with no CRM", function()
            local execute = funcs.new():with_actor(actor(uuid.v4())):with_scope(scope()) :: Executor
            local result, err = execute:call(CREATE_PROBE, { resolve_bootstrap = true })
            test.is_nil(err)
            local response = map(result)
            test.is_nil(response.crm_id)
            test.eq(response.status, 200)
            local body = map(response.body)
            test.eq(body.success, true)
            test.eq(body.provisioned, false)
            test.eq(body.can_create, true)
            test.is_nil(body.error)
        end)
    end)
    test.describe("CRM creation idempotency", function()
        test.it("removes a created CRM through the threads contract", function()
            local active_actor = actor(uuid.v4())
            local active_scope = scope()
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor
            local result, create_err = create_as(execute, "create:" .. uuid.v4(), "Disposable CRM", nil)
            test.is_nil(create_err)
            test.not_nil(result)
            local workspace = created(result)

            local definition = assert(contract.get(types.THREADS)) :: ThreadsDefinition
            local threads = assert(definition:with_actor(active_actor):with_scope(active_scope):open())
            local deleted, delete_err = threads:delete({ thread_id = workspace.component_id })
            test.is_nil(delete_err)
            test.not_nil(deleted)
            test.eq(map(deleted).deleted, true)
        end)

        test.it("replays the same normalized title and parent for the same actor and key", function()
            local active_actor = actor(uuid.v4())
            local execute = funcs.new():with_actor(active_actor):with_scope(scope()) :: Executor
            local key = "create:" .. uuid.v4()

            local parent_result, parent_err = create_as(execute, key .. ":parent", "Parent CRM", nil)
            test.is_nil(parent_err)
            test.not_nil(parent_result)
            local parent = created(parent_result)

            local first_result, first_err = create_as(execute, key, "  Sales CRM  ", "  " .. parent.component_id .. "  ")
            test.is_nil(first_err)
            test.not_nil(first_result)
            local first = created(first_result)
            test.eq(first.title, "Sales CRM")
            test.eq(first.replayed, false)

            local payload_result, payload_err = bootstrap_as(execute, first.component_id)
            test.is_nil(payload_err)
            local payload = bootstrap(payload_result)
            test.eq(payload.crm_id, first.component_id)
            test.eq(payload.workspace_label, "Sales CRM")
            test.eq(payload.can_write, true)
            test.is_table(payload.objects)
            test.is_table(payload.attributes)
            test.is_table(payload.pipelines)
            test.is_table(payload.views)

            local replay_result, replay_err = create_as(execute, key, "Sales CRM", parent.component_id)
            test.is_nil(replay_err)
            test.not_nil(replay_result)
            local replay = created(replay_result)
            test.eq(replay.component_id, first.component_id)
            test.eq(replay.title, "Sales CRM")
            test.eq(replay.revision, first.revision)
            test.eq(replay.replayed, true)
        end)

        test.it("rejects a different normalized title for the same actor and key", function()
            local active_actor = actor(uuid.v4())
            local execute = funcs.new():with_actor(active_actor):with_scope(scope()) :: Executor
            local key = "create:" .. uuid.v4()

            local first_result, first_err = create_as(execute, key, "Primary CRM", nil)
            test.is_nil(first_err)
            test.not_nil(first_result)
            local first = created(first_result)

            local conflict, conflict_err = create_as(execute, key, "Different CRM", nil)
            test.is_nil(conflict)
            test.is_true(tostring(conflict_err):find(
                "idempotency key was already used with a different request", 1, true
            ) ~= nil)
        end)

        test.it("rejects a different normalized parent for the same actor and key", function()
            local active_actor = actor(uuid.v4())
            local execute = funcs.new():with_actor(active_actor):with_scope(scope()) :: Executor
            local key = "create:" .. uuid.v4()

            local first_parent_result, first_parent_err = create_as(execute, key .. ":parent:1", "Parent One", nil)
            local second_parent_result, second_parent_err = create_as(execute, key .. ":parent:2", "Parent Two", nil)
            test.is_nil(first_parent_err)
            test.is_nil(second_parent_err)
            test.not_nil(first_parent_result)
            test.not_nil(second_parent_result)
            local first_parent = created(first_parent_result)
            local second_parent = created(second_parent_result)

            local first_result, first_err = create_as(execute, key, "Primary CRM", first_parent.component_id)
            test.is_nil(first_err)
            test.not_nil(first_result)
            local first = created(first_result)

            local conflict, conflict_err = create_as(execute, key, "Primary CRM", second_parent.component_id)
            test.is_nil(conflict)
            test.is_true(tostring(conflict_err):find(
                "idempotency key was already used with a different request", 1, true
            ) ~= nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
