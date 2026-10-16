local actors = require("actors")
local contract = require("contract")
local funcs = require("funcs")
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

local PROBE = "app:writer_probe"

local function map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function list(value: unknown): List
    return type(value) == "table" and (value :: List) or {}
end

local function error_text(value: unknown): string
    local details = map(value)
    return tostring(details.message or value)
end

local function actor(id: string): security.Actor
    return actors.make(id)
end

local function scope(): security.Scope
    local rule = assert(security.policy("app:user"))
    return assert(security.new_scope({ rule })) :: security.Scope
end

local function declaration(): Map
    return {
        version = "writer-preflight-v1",
        objects = {
            { id = "entity", type = "entity", label = "Entity", plural = "Entities" },
            { id = "other", type = "other", label = "Other", plural = "Others" },
        },
        attributes = {
            { id = "name", object_type = "entity", attr = "name", data_type = "text", config = {} },
            { id = "email", object_type = "entity", attr = "email", data_type = "email", config = { unique = true } },
            { id = "other-name", object_type = "other", attr = "name", data_type = "text", config = {} },
            { id = "related", object_type = "entity", attr = "related", data_type = "relation",
                config = { cardinality = "many", target = { kind = "record", object_type = "entity" } } },
            { id = "workspace", object_type = "entity", attr = "workspace", data_type = "relation",
                config = { cardinality = "one", target = { kind = "component", class = "crm" } } },
            { id = "owner", object_type = "entity", attr = "owner", data_type = "relation",
                config = { cardinality = "one", target = { kind = "principal", kinds = { "user" } } } },
        },
        pipelines = { {
            collection_id = "entities", object_type = "entity", label = "Entities",
            stages = { { stage_id = "new", label = "New" }, { stage_id = "done", label = "Done" } },
        } },
        views = {}, policies = {}, merge_config = {},
    }
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
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local dialect = db:type() :: string
    local _, schema_err = storage.ensure(db, dialect, crm_id, declaration())
    db:release()
    test.is_nil(schema_err)
end

local function count_events(crm_id: string): number
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local rows, err = db:query("SELECT COUNT(*) AS count FROM kickside_event WHERE thread_id = $1", { crm_id })
    db:release()
    test.is_nil(err)
    return tonumber(map(list(rows)[1]).count) or 0
end

local function call(execute: Executor, crm_id: string, commands: List): Map
    local result, err = execute:call(PROBE, { crm_id = crm_id, commands = commands })
    test.is_nil(err)
    return map(result)
end

local function catch_up(execute: Executor, crm_id: string)
    local result, err = execute:call(PROBE, { crm_id = crm_id, catch_up = true })
    test.is_nil(err)
    test.eq(map(result).ok, true)
end

local function created(id: string, object_type: string?, values: Map?): Map
    local fields = values or {}
    if fields.name == nil then fields.name = id end
    return { type = types.EVENTS.RECORD_CREATED,
        body = { record_id = id, object_type = object_type or "entity", values = fields } }
end

local function event_external_sources(crm_id: string): List
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local rows, err = db:query("SELECT external_source FROM kickside_event WHERE thread_id = $1", { crm_id })
    db:release()
    test.is_nil(err)
    return list(rows)
end

local function define_tests()
    test.describe("CRM writer preflight", function()
        test.it("uses sequential batch existence and rejects duplicate creates before append", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor

            local duplicate = call(execute, crm_id, { created("entity:duplicate"), created("entity:duplicate") })
            test.eq(duplicate.ok, false)
            test.is_true(error_text(duplicate.error):find("record already exists", 1, true) ~= nil)
            test.eq(count_events(crm_id), 0)

            local accepted = call(execute, crm_id, {
                created("entity:source"), created("entity:target"),
                { type = types.EVENTS.RELATION_LINKED, body = {
                    object_type = "entity", record_id = "entity:source", attr = "related",
                    reference = { kind = "record", type = "entity", id = "entity:target" },
                } },
            })
            test.eq(accepted.ok, true)
            test.eq(count_events(crm_id), 3)
        end)

        test.it("rejects duplicate unique values within one unprojected command batch", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor

            local rejected = call(execute, crm_id, {
                created("entity:unique-one", nil, { email = "shared@example.test" }),
                created("entity:unique-two", nil, { email = "shared@example.test" }),
            })
            test.eq(rejected.ok, false)
            test.is_true(error_text(rejected.error):find("must be unique", 1, true) ~= nil)
            test.eq(count_events(crm_id), 0)
        end)

        test.it("delete_activity refuses an empty identity and appends an addressed one", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor

            local refused, refused_err = execute:call(PROBE, { crm_id = crm_id, delete_activity = true, identity = {} })
            test.is_nil(refused_err)
            test.eq(map(refused).ok, false)
            test.is_true(error_text(map(refused).error):find("activity_id, external_id, or correlation_key", 1, true) ~= nil)
            test.eq(count_events(crm_id), 0)

            local deleted, deleted_err = execute:call(PROBE, {
                crm_id = crm_id, delete_activity = true,
                identity = { external_id = "hubspot:meetings:1" },
            })
            test.is_nil(deleted_err)
            test.eq(map(deleted).ok, true)
            test.eq(count_events(crm_id), 1)
        end)

        test.it("rejects projector-failable relation, membership, activity, and merge events before append", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor
            test.eq(call(execute, crm_id, {
                created("entity:one"), created("entity:two"), created("other:one", "other"),
            }).ok, true)
            catch_up(execute, crm_id)
            local baseline = count_events(crm_id)

            local cases: { { command: Map, message: string } } = {
                { command = { type = types.EVENTS.RELATION_LINKED, body = {
                    object_type = "entity", record_id = "entity:one", attr = "related",
                    reference = { kind = "record", type = "entity", id = "entity:missing" },
                } }, message = "related entity not found" },
                { command = { type = types.EVENTS.MEMBERSHIP_SET, body = {
                    collection_id = "entities", record_id = "entity:one", stage_id = "missing",
                } }, message = "unknown CRM collection stage" },
                { command = { type = types.EVENTS.MEMBERSHIP_SET, body = {
                    collection_id = "entities", record_id = "other:one", stage_id = "new",
                } }, message = "collection record object type mismatch" },
                { command = { type = types.EVENTS.ACTIVITY_LOGGED, body = {
                    activity_id = "activity:one", record_id = "entity:one", activity_type = "meeting",
                    participant_record_id = "entity:missing",
                } }, message = "activity participant not found" },
                { command = { type = types.EVENTS.MERGE_SUGGESTED, body = {
                    left_id = "entity:one", right_id = "entity:missing", object_type = "entity",
                } }, message = "right merge record not found" },
                { command = { type = types.EVENTS.RELATION_LINKED, body = {
                    object_type = "entity", record_id = "entity:one", attr = "owner",
                    reference = { kind = "principal", type = "group", id = "group:unapproved" },
                } }, message = "principal kind is not allowed" },
            }
            for _, case in ipairs(cases) do
                local rejected = call(execute, crm_id, { case.command })
                test.eq(rejected.ok, false)
                test.is_true(error_text(rejected.error):find(case.message, 1, true) ~= nil, error_text(rejected.error))
                test.eq(count_events(crm_id), baseline)
            end
        end)

        test.it("validates component links but permits typed unlink from a missing external target", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor
            local registered, register_err = execute:call(PROBE, {
                register_target = true, impl_id = types.CRM_IMPL, class = "crm",
            })
            test.is_nil(register_err)
            local registered_result = map(registered)
            test.eq(registered_result.ok, true, error_text(registered_result.error))
            local target = map(registered_result.result)
            test.eq(target.success, true)
            local target_id = tostring(target.component_id)
            test.eq(call(execute, crm_id, { created("entity:one") }).ok, true)
            catch_up(execute, crm_id)

            local linked = call(execute, crm_id, { { type = types.EVENTS.RELATION_LINKED, body = {
                object_type = "entity", record_id = "entity:one", attr = "workspace",
                reference = { kind = "component", type = "crm", id = target_id },
            } } })
            test.eq(linked.ok, true, error_text(linked.error))
            local after_link = count_events(crm_id)

            local missing = call(execute, crm_id, { { type = types.EVENTS.RELATION_LINKED, body = {
                object_type = "entity", record_id = "entity:one", attr = "workspace",
                reference = { kind = "component", type = "crm", id = "component:missing" },
            } } })
            test.eq(missing.ok, false)
            test.eq(count_events(crm_id), after_link)

            local unlinked = call(execute, crm_id, { { type = types.EVENTS.RELATION_UNLINKED, body = {
                object_type = "entity", record_id = "entity:one", attr = "workspace",
                reference = { kind = "component", type = "crm", id = "component:missing" },
            } } })
            test.eq(unlinked.ok, true, error_text(unlinked.error))
            test.eq(count_events(crm_id), after_link + 1)
        end)

        test.it("stamps merge resolution and override reviewer from the authenticated actor", function()
            local crm_id = uuid.v7()
            local actor_id = uuid.v4()
            local active_actor, active_scope = actor(actor_id), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor
            test.eq(call(execute, crm_id, { created("entity:left"), created("entity:right") }).ok, true)
            catch_up(execute, crm_id)

            local blocked = call(execute, crm_id, { { type = types.EVENTS.MERGE_DECIDED, body = {
                resolution_id = "resolution:block", left_id = "entity:left", right_id = "entity:right",
                object_type = "entity", decision = "do_not_merge", resolved_by = "spoofed",
            } } })
            test.eq(blocked.ok, true, error_text(blocked.error))
            catch_up(execute, crm_id)

            local db = assert(sql.get(types.db_id())) :: sql.DB
            local rows, query_err = db:query([[SELECT resolved_by, resolved_at, updated_at
                FROM kickside_crm_merge_decision
                WHERE crm_id = $1 AND left_id = $2 AND right_id = $3]],
                { crm_id, "entity:left", "entity:right" })
            db:release()
            test.is_nil(query_err)
            local first = map(list(rows)[1])
            test.eq(first.resolved_by, actor_id)
            local prior_ref = "merge_decision:entity:left:entity:right:do_not_merge:"
                .. tostring(first.resolved_at or first.updated_at or "")

            local override = call(execute, crm_id, { { type = types.EVENTS.MERGE_DECIDED, body = {
                resolution_id = "resolution:merge", left_id = "entity:left", right_id = "entity:right",
                object_type = "entity", decision = "merged", winner_id = "entity:left", loser_id = "entity:right",
                resolved_by = "spoofed", override = true, reviewer_actor = "spoofed",
                reason = "new verified evidence", prior_decision_ref = prior_ref,
            } } })
            test.eq(override.ok, true, error_text(override.error))
            catch_up(execute, crm_id)

            db = assert(sql.get(types.db_id())) :: sql.DB
            rows, query_err = db:query([[SELECT resolved_by, override_reviewed_by
                FROM kickside_crm_merge_decision
                WHERE crm_id = $1 AND left_id = $2 AND right_id = $3]],
                { crm_id, "entity:left", "entity:right" })
            db:release()
            test.is_nil(query_err)
            first = map(list(rows)[1])
            test.eq(first.resolved_by, actor_id)
            test.eq(first.override_reviewed_by, actor_id)
        end)
    end)

    test.describe("CRM durable write protocol", function()
        -- The sink delivers under the automation runtime: the automation engine
        -- stamps runtime_type = "automation" onto every writable port's open
        -- context. A machine classification that omits it strips the external
        -- identity off exactly the path the durable write protocol guards, so a
        -- delivery whose events committed without a receipt re-appends on retry.
        test.it("retains the automation delivery's external identity and short-circuits its durable replay", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope)
                :with_context({ runtime_type = "automation", run_id = "crm-sink-automation-run" }) :: Executor

            local command = created("entity:automation")
            command.external = { external_source = "kickside.crm.sink",
                external_id = "automation:item:durable-1", external_version = "1" }

            local first = call(execute, crm_id, { command })
            test.eq(first.ok, true, error_text(first.error))
            test.eq(count_events(crm_id), 1)
            test.eq(map(event_external_sources(crm_id)[1]).external_source, "kickside.crm.sink")
            catch_up(execute, crm_id)

            local replay = call(execute, crm_id, { command })
            test.eq(replay.ok, true, error_text(replay.error))
            local summary = map(replay.result)
            test.eq(tonumber(summary.inserted), 0)
            test.eq(tonumber(summary.duplicates), 1)
            test.eq(count_events(crm_id), 1)
        end)

        test.it("strips the external identity an interactive caller carries", function()
            local crm_id = uuid.v7()
            local active_actor, active_scope = actor(uuid.v4()), scope()
            provision(crm_id, active_actor, active_scope)
            local execute = funcs.new():with_actor(active_actor):with_scope(active_scope) :: Executor

            local command = created("entity:manual")
            command.external = { external_source = "kickside.crm.sink",
                external_id = "automation:item:manual-1", external_version = "1" }

            local appended = call(execute, crm_id, { command })
            test.eq(appended.ok, true, error_text(appended.error))
            test.eq(count_events(crm_id), 1)
            test.eq(map(event_external_sources(crm_id)[1]).external_source, nil)
            catch_up(execute, crm_id)

            local replay = call(execute, crm_id, { command })
            test.eq(replay.ok, false)
            test.is_true(error_text(replay.error):find("record already exists", 1, true) ~= nil)
            test.eq(count_events(crm_id), 1)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
