-- Shared harness for the CRM writable sink suites: a provisioned CRM, a machine
-- executor that calls the sink the way a sync does, and typed views of its answers
-- and of the receipt rows it keeps.
local actors = require("actors")
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")
local receipt_schema = require("receipt_schema")
local write_counter = require("write_counter")

type Map = { [string]: unknown }
type List = { unknown }
type Executor = {
    call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?),
    async: (self: Executor, target: string, input: Map) -> (any?, unknown?),
}
type ThreadService = { ensure_thread: (self: ThreadService, input: Map) -> (unknown?, unknown?) }
type ScopedThreads = { open: (self: ScopedThreads) -> (ThreadService?, unknown?) }
type ActorThreads = { with_scope: (self: ActorThreads, value: security.Scope) -> ScopedThreads }
type ThreadDefinition = { with_actor: (self: ThreadDefinition, value: security.Actor) -> ActorThreads }
type SinkError = { code: string, message: string, retriable: unknown, scope: unknown, dependency_key: unknown }
type DestinationRef = { crm_id: string, object_type: string, record_id: string }
type SinkResult = {
    success: boolean,
    result: string,
    replayed: unknown,
    dest_ref: DestinationRef,
    error: SinkError,
    dependencies_available: unknown,
}
type KeyPage = { keys: List, next_cursor: unknown, has_more: boolean }

local M = {}

M.SINK = "kickside.crm.sink:crm_write"
M.LIST_KEYS = "kickside.crm.sink:crm_list_keys"
-- The writing origin a sync names on every write: its automation id.
M.ORIGIN = "kickside.sync:fixture"

function M.map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

function M.list(value: unknown): List
    return type(value) == "table" and (value :: List) or {}
end

function M.destination_ref(value: unknown): DestinationRef
    local ref = M.map(value)
    return {
        crm_id = tostring(ref.crm_id),
        object_type = tostring(ref.object_type),
        record_id = tostring(ref.record_id),
    }
end

local function sink_error(value: unknown): SinkError
    local failure = M.map(value)
    return {
        code = tostring(failure.code),
        message = tostring(failure.message),
        retriable = failure.retriable,
        scope = failure.scope,
        dependency_key = failure.dependency_key,
    }
end

function M.sink_result(value: unknown): SinkResult
    local result = M.map(value)
    return {
        success = result.success == true,
        result = tostring(result.result),
        replayed = result.replayed,
        dest_ref = M.destination_ref(result.dest_ref),
        error = sink_error(result.error),
        dependencies_available = result.dependencies_available,
    }
end

function M.error_text(result: SinkResult): string
    return result.error.code .. ": " .. result.error.message
end

function M.actor(id: string): security.Actor
    return actors.make(id)
end

function M.scope(): security.Scope
    local rule = assert(security.policy("app:user"))
    return assert(security.new_scope({ rule })) :: security.Scope
end

-- A real machine stamp, not an invented one: the dataflow function node writes
-- runtime_type = "dataflow_function" onto every node execution context, and the
-- automation engine leaves a context that already carries one alone. A sink
-- delivered through a dataflow therefore reaches the writer under exactly this
-- value, so it is the one the suite classifies under.
function M.machine_execute(active_actor: security.Actor, active_scope: security.Scope): Executor
    return funcs.new():with_actor(active_actor):with_scope(active_scope):with_context({
        runtime_type = "dataflow_function",
        dataflow_id = "crm-sink-contract",
        run_id = "crm-sink-contract-run",
    }) :: Executor
end

function M.provision(crm_id: string, active_actor: security.Actor, active_scope: security.Scope)
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
    local _, schema_err = storage.ensure(db, dialect, crm_id, {
        version = "sink-test-v1",
        objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } },
        attributes = {
            { id = "name", object_type = "entity", attr = "name", data_type = "text", config = { required = true } },
            { id = "note", object_type = "entity", attr = "note", data_type = "text", config = {} },
            { id = "status", object_type = "entity", attr = "status", data_type = "text", config = { default = "new" } },
            { id = "owner", object_type = "entity", attr = "owner", data_type = "text", config = { policy = { human_protected = true } } },
            { id = "related", object_type = "entity", attr = "related", data_type = "relation",
                config = { cardinality = "many", target = { kind = "record", object_type = "entity" } } },
            { id = "tags", object_type = "entity", attr = "tags", data_type = "multi_select",
                config = { choices = { "alpha", "beta", "gamma" } } },
        },
        pipelines = { {
            collection_id = "entities", object_type = "entity", label = "Entities",
            stages = { { stage_id = "new", label = "New" }, { stage_id = "done", label = "Done" } },
        } },
    })
    db:release()
    test.is_nil(schema_err)
end

-- One provisioned CRM and the executor a sync delivers to it with.
function M.crm(): (string, Executor)
    local crm_id = uuid.v7()
    local active_actor, active_scope = M.actor(uuid.v4()), M.scope()
    M.provision(crm_id, active_actor, active_scope)
    return crm_id, M.machine_execute(active_actor, active_scope)
end

function M.query(statement: string, params: { unknown }?): { Map }
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local rows, err = db:query(statement, params or {})
    db:release()
    test.is_nil(err)
    local typed: { Map } = {}
    for _, row in ipairs(M.list(rows)) do typed[#typed + 1] = M.map(row) end
    return typed
end

function M.exec(statement: string, params: { unknown }?)
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local _, err = db:execute(statement, params or {})
    db:release()
    test.is_nil(err)
end

function M.event_count(crm_id: string): number
    local rows = M.query("SELECT COUNT(*) AS count FROM kickside_event WHERE thread_id = $1", { crm_id })
    return tonumber(rows[1].count) or 0
end

-- The receipt rows one source item left behind, in key order, so a test can state
-- exactly which effects the CRM recorded for it.
function M.receipt_rows(crm_id: string, key: string): { Map }
    return M.query([[SELECT origin, sink_op, outcome, payload_hash, completed_at
        FROM kickside_crm_sink_receipt WHERE crm_id = $1 AND idempotency_key = $2
        ORDER BY origin, sink_op]], { crm_id, key })
end

function M.receipt_identities(crm_id: string, key: string): string
    local parts: { string } = {}
    for _, row in ipairs(M.receipt_rows(crm_id, key)) do
        parts[#parts + 1] = tostring(row.origin) .. "/" .. tostring(row.sink_op)
    end
    return table.concat(parts, ",")
end

function M.assert_receipt_schema(db: sql.DB?)
    local owned = db == nil
    local handle = db or (assert(sql.get(types.db_id())) :: sql.DB)
    receipt_schema.assert_schema(handle, true)
    if owned then handle:release() end
end

function M.assert_receipt_mutations(crm_id: string, inserts: number, updates: number, deletes: number)
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local counts = write_counter.counts(db, crm_id)
    db:release()
    test.eq(counts.INSERT, inserts)
    test.eq(counts.UPDATE, updates)
    test.eq(counts.DELETE, deletes)
end

function M.request(crm_id: string, key: string, input: Map, operation: string?, dest_ref: Map?): Map
    return {
        config = { crm_id = crm_id },
        origin = M.ORIGIN,
        idempotency_key = key,
        sink_op = operation or "upsert",
        input = input,
        dest_ref = dest_ref,
    }
end

function M.from_origin(origin: string, input: Map): Map
    input.origin = origin
    return input
end

function M.call_sink(execute: Executor, input: Map): SinkResult
    local result, err = execute:call(M.SINK, input)
    test.is_nil(err)
    return M.sink_result(result)
end

function M.call_list_keys(execute: Executor, input: Map): KeyPage
    local result, err = execute:call(M.LIST_KEYS, input)
    test.is_nil(err)
    local page = M.map(result)
    test.eq(page.success, true, tostring(M.map(page.error).message))
    return { keys = M.list(page.keys), next_cursor = page.next_cursor, has_more = page.has_more == true }
end

function M.key_ids(page: KeyPage): { string }
    local ids: { string } = {}
    for _, raw in ipairs(page.keys) do ids[#ids + 1] = tostring(M.map(raw).item_key) end
    table.sort(ids)
    return ids
end

return M
