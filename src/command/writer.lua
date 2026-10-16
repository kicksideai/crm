-- The single CRM command path. Every mutation is a typed crm.* event appended to the
-- workspace CRM thread through the core threads contract -- no silent writes, no direct
-- table writes. Success waits for the projection worker to commit these events
-- to the read model, so subsequent commands can validate against that state.
-- Convenience builders keep event bodies uniform; append() is the one primitive.
local contract = require("contract")
local security = require("security")
local json = require("json")
local component = require("component")
local ctx = require("ctx")
local types = require("types")
local constraints = require("constraints")
local validation = require("validation")
local aliases = require("aliases")
local policy = require("policy")
local sql = require("sql")

local M = {}

type UnknownMap = { [string]: unknown }
type DynamicTable = { [string | number]: unknown }
type Executor = sql.DB | sql.Transaction
type Command = {
    type: unknown?,
    body: unknown?,
    external: unknown?,
    trace_context: unknown?,
}
type CatchUpResult = {
    last_seq: unknown?,
    required_seq: unknown?,
    event_count: unknown?,
    ticks: unknown?,
    max_ticks: unknown?,
    waited_ms: unknown?,
    reason: unknown?,
    dead: unknown?,
    error: unknown?,
}
type ExternalIdentity = {
    external_source: string,
    external_id: string,
    external_version: string?,
}
type MergeDecisionRow = {
    decision: unknown?,
    resolved_at: unknown?,
    updated_at: unknown?,
}
type AppendSummary = { [string]: unknown }
type ProjectionClient = {
    catch_up_projection: (self: any, request: UnknownMap) -> (unknown?, unknown?),
}

type ThreadsClient = {
    find: (self: ThreadsClient, request: UnknownMap) -> (unknown?, unknown?),
    catch_up_projection: (self: ThreadsClient, request: UnknownMap) -> (unknown?, unknown?),
    find_event_by_external: (self: ThreadsClient, request: UnknownMap) -> (unknown?, unknown?),
    append_events: (self: ThreadsClient, request: UnknownMap) -> (unknown?, unknown?),
}

local VALID = {}
for _, id in pairs(types.EVENTS) do VALID[id] = true end

-- The observation bound of a caller without its own deadline. A caller with
-- one (a sync round's work deadline) waits only until that deadline.
local CATCH_UP_TICKS = 1000

local function trim(v: unknown): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local function copy(value: unknown): unknown
    if type(value) ~= "table" then return value end
    local out: DynamicTable = {}
    for key, item in pairs(value :: DynamicTable) do out[key] = copy(item) end
    return out
end

local function open_threads(): (ThreadsClient?, error?)
    local def, err = contract.get(types.THREADS)
    if err then return nil, errors.wrap(err, "threads contract unavailable") end
    if not def then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "threads contract unavailable" }) end
    local client, oerr = def:with_actor(security.actor()):with_scope(security.scope()):open()
    if oerr then return nil, errors.wrap(oerr, "threads open failed") end
    if not client then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "threads open returned no client" }) end
    if type(client) ~= "table" and type(client) ~= "userdata" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "threads open returned an invalid client" })
    end
    return client :: ThreadsClient, nil
end

local function open_db(): (sql.DB?, error?)
    local db, err = sql.get(types.db_id())
    if err then return nil, err end
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "crm: app:db unavailable" }) end
    return db, nil
end

function M.thread_id_for(c: ThreadsClient, crm_id: string): (string?, error?)
    if trim(crm_id) == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id required" }) end
    local found, err = c:find({ thread_id = crm_id })
    if err then return nil, errors.wrap(err, "crm thread resolve failed") end
    if not found then return nil, errors.new({ kind = errors.NOT_FOUND, message = "crm thread not found: " .. crm_id }) end
    return crm_id
end

function M.require_access(crm_id: string, access: integer): (boolean?, error?)
    if trim(crm_id) == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id required" }) end
    local _, err = component.validate_access(crm_id, access)
    if err then return nil, errors.wrap(err, "crm access denied") end
    return true, nil
end

function M.require_write(crm_id: string): (boolean?, error?)
    return M.require_access(crm_id, component.ACCESS.WRITE)
end

-- The write path needs read-your-own-writes: the projection must have applied
-- THIS append's sequences before the receipt commits. That target is fixed the
-- moment the append returns and travels as min_seq, which the threads contract
-- holds itself to: it drives the cursor, waits out a dispatch a peer owns, and
-- reports the sequence it enforced as required_seq. The thread head keeps moving
-- under concurrent writers, so it is never a wait target here; a caller with no
-- append sequence lets the contract freeze the head it observed on entry.
local function required_of(result: unknown, min_seq: number?): number
    if min_seq then return min_seq end
    if type(result) ~= "table" then return 0 end
    return tonumber((result :: CatchUpResult).required_seq)
        or tonumber((result :: CatchUpResult).event_count) or 0
end

local function caught_up(result: unknown, min_seq: number?): boolean
    if type(result) ~= "table" then return false end
    local last_seq = tonumber((result :: CatchUpResult).last_seq) or 0
    return last_seq >= required_of(result, min_seq)
end

local function catch_up_error(result: unknown, min_seq: number?): error
    if type(result) ~= "table" then return errors.new({ kind = errors.INTERNAL, message = "projection catch-up returned no result" }) end
    local typed = result :: CatchUpResult
    local last_seq = tostring(typed.last_seq)
    local required = tostring(required_of(result, min_seq))
    local diagnostics = "last_seq=" .. last_seq
        .. " required_seq=" .. required
        .. " ticks=" .. tostring(typed.ticks)
        .. " waited_ms=" .. tostring((typed :: any).waited_ms)
        .. " reason=" .. tostring(typed.reason or "")
    -- A dead-lettered drain cursor carries its real failure on the terminal's
    -- `error` field: the projection cursor's un-buried last_error. Lead with that
    -- cause so the surfaced automation state names why the drain stopped instead
    -- of only reason=max_attempts; the structured diagnostics still travel behind
    -- it for callers that parse them.
    if typed.dead == true or trim(typed.reason) == "max_attempts" then
        local cause = trim(typed.error)
        if cause == "" then cause = "dead-lettered with no recorded cause" end
        return errors.new({ kind = errors.INTERNAL, message = "projection dead-lettered at last_seq=" .. last_seq
            .. " (required " .. required .. "): " .. cause
            .. " [" .. diagnostics .. "]" })
    end
    return errors.new({ kind = errors.UNAVAILABLE, retryable = true,
        message = "projection did not reach the required sequence: " .. diagnostics })
end

local function catch_up(c: ProjectionClient, tid: string, min_seq: number?, deadline: string?): (CatchUpResult?, error?)
    local result, cerr = c:catch_up_projection({
        thread_id = tid,
        kind = types.PROJECTION_KIND,
        max_ticks = CATCH_UP_TICKS,
        min_seq = min_seq,
        deadline = deadline,
    })
    if cerr then return nil, errors.wrap(cerr, "projection catch-up failed") end
    if caught_up(result, min_seq) then return result :: CatchUpResult, nil end
    return nil, catch_up_error(result, min_seq)
end

-- catch_up_read_model(crm_id, min_seq?, deadline?) waits for the read model to
-- apply min_seq, at most until the caller's RFC3339 deadline when it names one.
function M.catch_up_read_model(crm_id: string, min_seq: number?, deadline: string?): (CatchUpResult?, error?)
    local c, err = open_threads()
    if not c then return nil, err end
    local tid, terr = M.thread_id_for(c, crm_id)
    if not tid then return nil, terr end
    return catch_up(c, tid, min_seq, deadline)
end

function M._catch_up_for_test(c: ProjectionClient, tid: string, min_seq: number?, deadline: string?): (CatchUpResult?, error?)
    return catch_up(c, tid, min_seq, deadline)
end

local function actor_id_for_context(): string
    local actor = security.actor()
    if not actor then return "" end
    return trim(actor:id())
end

local function canonicalize_merge_actors(commands: { Command }): error?
    local actor_id = actor_id_for_context()
    for _, command in ipairs(commands) do
        if command.type == types.EVENTS.MERGE_DECIDED then
            local body: UnknownMap =
                type(command.body) == "table" and (command.body :: UnknownMap) or {}
            command.body = body
            if actor_id ~= "" then body.resolved_by = actor_id
            else body.resolved_by = nil end
            if body.override == true then
                if actor_id == "" then return errors.new({ kind = errors.INVALID, message = "merge override requires an authenticated reviewer" }) end
                body.reviewer_actor = actor_id
            else
                body.reviewer_actor = nil
            end
        end
    end
    return nil
end

local function validate_command_shapes(commands: { Command }): error?
    for index, command in ipairs(commands) do
        local etype = command.type
        if not VALID[etype] then return errors.new({ kind = errors.INVALID, message = "unknown crm event at [" .. tostring(index) .. "]: " .. tostring(etype) }) end
        local body: UnknownMap =
            type(command.body) == "table" and (command.body :: UnknownMap) or {}
        local err = constraints.check(etype :: string, body)
        if err then return errors.new({ kind = errors.INVALID, message = "command " .. tostring(index) .. ": " .. err }) end
    end
    return nil
end

-- Machine provenance: the runtimes whose callers may carry an external identity
-- and a trace context into the append. An interactive caller carries none of
-- these and loses both, so it cannot forge the durable write protocol's
-- idempotency triple.
--
-- Where each value is stamped:
--   automation         the automation engine, onto every writable port's open
--                      context, and only when that context carries no
--                      runtime_type already
--                      (main/platform/automation/src/engine/automation_engine.lua:3441).
--   dataflow_function  the dataflow function node, onto every node execution
--                      context (wippy/dataflow/src/node/func/node.lua:60). This
--                      is the stamp a sink delivered through a dataflow keeps:
--                      the automation engine will not overwrite one that is
--                      already set, so the delivery arrives here as
--                      "dataflow_function" and never as "automation".
--   agent              a detached agent run (kickside/estimation/src/detached.lua:148).
--   dataflow, workflow no engine stamps either today. They stay admitted because
--                      admitting a machine runtime that never arrives costs
--                      nothing, while omitting one that does strips the external
--                      identity off exactly the path the durable write protocol
--                      exists for.
local MACHINE_RUNTIMES: { [string]: boolean } = {
    agent = true, automation = true, dataflow = true, dataflow_function = true, workflow = true,
}

local function runtime_actor_context(): UnknownMap?
    local runtime_type = trim(ctx.get("runtime_type"))
    if not MACHINE_RUNTIMES[runtime_type] then return nil end
    return {
        runtime_type = runtime_type,
        dataflow_id = trim(ctx.get("dataflow_id")),
        workflow_id = trim(ctx.get("workflow_id")),
        run_id = trim(ctx.get("run_id")),
    }
end

local function external_for(cmd: Command): ExternalIdentity?
    local external = type(cmd.external) == "table" and (cmd.external :: UnknownMap) or nil
    if not external then return nil end
    local source = trim(external.external_source)
    local id = trim(external.external_id)
    if source == "" or id == "" then return nil end
    local version = trim(external.external_version)
    return {
        external_source = source,
        external_id = id,
        external_version = version ~= "" and version or nil,
    }
end

local function trace_for(cmd: Command): unknown?
    local trace = cmd.trace_context
    if type(trace) ~= "table" then return nil end
    return copy(trace) :: UnknownMap
end

-- External identity belongs to the durable write protocol. A retry may arrive after
-- the event committed but before its caller committed an outbox/receipt. In that
-- window current-state validation can legitimately fail (for example, create now
-- sees the record). Recognize only an exact, already-durable event batch here; new
-- commands continue through the complete state-dependent preflight below.
local function durable_external_batch(threads: ThreadsClient, crm_id: string,
    commands: { Command }): (AppendSummary?, error?)
    local max_seq, duplicates = 0, 0
    for _, command in ipairs(commands) do
        local external = external_for(command)
        local event_type = trim(command.type)
        if not external or event_type == "" then return nil, nil end
        local found, find_err = threads:find_event_by_external({
            thread_id = crm_id,
            event_type = event_type,
            external_source = external.external_source,
            external_id = external.external_id,
            external_version = external.external_version,
        })
        if find_err then return nil, find_err end
        local found_map: UnknownMap =
            type(found) == "table" and (found :: UnknownMap) or {}
        local row = type(found_map.event) == "table"
            and (found_map.event :: UnknownMap) or nil
        if not row then return nil, nil end
        duplicates = duplicates + 1
        max_seq = math.max(max_seq, tonumber(row.seq) or 0)
    end
    return { inserted = 0, duplicates = duplicates, max_seq = max_seq }, nil
end

-- The sink's external identity. The durable write protocol keys a crash-window
-- replay on this triple and the sink stamps the same triple on the command it
-- appends, so one place owns both.
local SINK_EXTERNAL_SOURCE = "kickside.crm.sink"
local SINK_EXTERNAL_VERSION = "1"

-- A delivery is identified by the writer, the operation it delivers, AND the source
-- item it carries -- the same triple its receipt is keyed by, so one effect owns one
-- receipt and one durable event. idempotency_key names only the item, so two syncs
-- reading one source arrive with the same key, and one sync sends both an upsert and
-- an update from one item; an identity missing either part folds two appends into
-- one and the second silently applies nothing. origin is a registry id and the
-- operation is a single word, so neither carries a space to separate them with.
function M.sink_external(origin: string, sink_op: string, idempotency_key: string): UnknownMap
    local parts: { string } = {}
    for _, value in ipairs({ trim(origin), trim(sink_op), trim(idempotency_key) }) do
        if value ~= "" then parts[#parts + 1] = value end
    end
    return {
        external_source = SINK_EXTERNAL_SOURCE,
        external_id = table.concat(parts, " "),
        external_version = SINK_EXTERNAL_VERSION,
    }
end

-- The already-durable event carrying this external identity, { type, body, seq }, or nil
-- when no candidate committed. A caller whose own receipt is missing reads the
-- effect it already appended from here instead of re-deriving it from current state.
function M.durable_event(crm_id: string, external: unknown,
    candidate_types: { string }): (UnknownMap?, error?)
    local identity = external_for({ external = external })
    if not identity or trim(crm_id) == "" then return nil, nil end
    local threads, threads_err = open_threads()
    if not threads then return nil, threads_err end
    for _, event_type in ipairs(candidate_types) do
        local found, find_err = threads:find_event_by_external({
            thread_id = crm_id,
            event_type = event_type,
            external_source = identity.external_source,
            external_id = identity.external_id,
            external_version = identity.external_version,
        })
        if find_err then return nil, find_err end
        local found_map: UnknownMap = type(found) == "table" and (found :: UnknownMap) or {}
        if type(found_map.event) == "table" then
            local body: unknown = (found_map.event :: UnknownMap).body
            if type(body) == "string" then
                local decoded, decode_err = json.decode(body :: string)
                if decode_err then return nil, errors.wrap(decode_err, "durable event body is not JSON") end
                body = decoded
            end
            return { type = event_type, body = type(body) == "table" and body or {},
                seq = tonumber((found_map.event :: UnknownMap).seq) }, nil
        end
    end
    return nil, nil
end

local function sorted_pair(a: unknown, b: unknown): (string, string)
    local left = tostring(a or "")
    local right = tostring(b or "")
    if left <= right then return left, right end
    return right, left
end

local function merge_decision_ref(row: MergeDecisionRow, left_id: string, right_id: string): string
    return "merge_decision:" .. left_id .. ":" .. right_id .. ":"
        .. tostring(row.decision or "") .. ":"
        .. tostring(row.resolved_at or row.updated_at or "")
end

local function merge_decision_row(db: Executor, crm_id: string, left_id: string,
    right_id: string): (MergeDecisionRow?, error?)
    local rows, qerr = db:query([[
        SELECT decision, resolved_at, updated_at
        FROM kickside_crm_merge_decision
        WHERE crm_id = $1 AND left_id = $2 AND right_id = $3
        LIMIT 1
    ]], { crm_id, left_id, right_id })
    if qerr then return nil, qerr end
    if type(rows) ~= "table" or type(rows[1]) ~= "table" then return nil, nil end
    return rows[1] :: MergeDecisionRow, nil
end

local function needs_merge_integrity(commands: { Command }): boolean
    for _, cmd in ipairs(commands) do
        local etype = cmd.type
        if etype == types.EVENTS.MERGE_DECIDED then return true end
    end
    return false
end

local function check_merge_integrity(crm_id: string, commands: { Command }): error?
    if not needs_merge_integrity(commands) then return nil end
    local db, derr = open_db()
    if not db then return derr end
    for _, cmd in ipairs(commands) do
        local etype = cmd.type
        local body: UnknownMap = type(cmd.body) == "table" and (cmd.body :: UnknownMap) or {}
        if etype == types.EVENTS.MERGE_DECIDED then
            local left_id, right_id = sorted_pair(body.left_id, body.right_id)
            local row, rerr = merge_decision_row(db, crm_id, left_id, right_id)
            if rerr then db:release(); return rerr end
            local decision = tostring(body.decision or "")
            local is_override = body.override == true
            local prior_is_block = row and tostring(row.decision or "") == "do_not_merge"
            if prior_is_block and decision ~= "do_not_merge" then
                local expected = merge_decision_ref(row, left_id, right_id)
                local reviewer = actor_id_for_context()
                if not is_override or reviewer == "" or trim(body.reason) == ""
                    or trim(body.prior_decision_ref) ~= expected then
                    db:release()
                    return errors.new({ kind = errors.CONFLICT, message = "merge override blocked: prior do_not_merge requires override=true with an authenticated reviewer,"
                        .. " reason, and prior_decision_ref=" .. expected })
                end
                body.reviewer_actor = reviewer
            elseif is_override then
                db:release()
                return errors.new({ kind = errors.CONFLICT, message = "merge override blocked: override=true requires an existing do_not_merge decision" })
            end
        end
    end
    db:release()
    return nil
end

-- Append a batch of { type, body } commands to the CRM thread after validating the
-- event vocabulary and running write-boundary constraints.
-- The dependency key a record answers to, for callers that release writes
-- blocked on it once the record lands.
function M.record_dependency_key(crm_id: string, record_id: string): string
    return validation.record_dependency_key(crm_id, record_id)
end

function M.append(crm_id: string, commands: unknown): (boolean?, error?, UnknownMap?, unknown?)
    if type(crm_id) ~= "string" or crm_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id required" }) end
    if type(commands) ~= "table" or #commands == 0 then return nil, errors.new({ kind = errors.INVALID, message = "commands array required" }) end

    local allowed, aerr = M.require_access(crm_id, component.ACCESS.WRITE)
    if not allowed then return nil, aerr end

    local c, err = open_threads()
    if not c then return nil, err end
    local tid, terr = M.thread_id_for(c, crm_id)
    if not tid then return nil, terr end

    local safe_commands = copy(commands) :: { Command }
    local actor_context = runtime_actor_context()
    if not actor_context then
        for _, command in ipairs(safe_commands) do
            command.external = nil
            command.trace_context = nil
        end
    end
    local source_context = {
        actor_id = actor_id_for_context(),
        actor_context = actor_context,
    }
    local filtered, outcomes, perr = policy.enforce(crm_id, safe_commands, source_context)
    if not filtered then return nil, perr end

    local filtered_commands = filtered :: { Command }
    if #filtered_commands == 0 then
        local result: AppendSummary = {}
        result.inserted = 0
        result.duplicates = 0
        result.outcomes = outcomes or {}
        local summary = policy.summary(outcomes)
        result.applied = summary.applied
        return true, nil, result, outcomes
    end

    local canonical_err = canonicalize_merge_actors(filtered_commands)
    if canonical_err then return nil, canonical_err end
    local shape_err = validate_command_shapes(filtered_commands)
    if shape_err then return nil, shape_err end

    local durable, durable_err = durable_external_batch(c, crm_id, filtered_commands)
    if durable_err then return nil, durable_err end
    if durable then
        local projected, projection_err = catch_up(c, tid, tonumber(durable.max_seq))
        if not projected then return nil, projection_err end
        durable.outcomes = outcomes or {}
        local summary = policy.summary(outcomes)
        durable.applied = summary.applied
        return true, nil, durable, outcomes
    end

    local vok, verr = validation.validate_commands(crm_id, filtered_commands)
    if not vok then return nil, verr end

    local expanded = filtered_commands

    local ierr = check_merge_integrity(crm_id, expanded)
    if ierr then return nil, ierr end

    local events: { UnknownMap } = {}
    for _, cmd in ipairs(expanded) do
        local etype = cmd.type
        local body = copy(type(cmd.body) == "table" and cmd.body or {}) :: UnknownMap
        if trim(body.occurred_at) == "" then
            body.occurred_at = types.now()
        end
        body.actor = actor_id_for_context()
        events[#events + 1] = {
            type = etype,
            body = body,
            external = external_for(cmd),
            trace_context = trace_for(cmd),
        }
    end

    local reservations, reservation_err = aliases.reserve_for_commands(crm_id, expanded)
    if not reservations then return nil, reservation_err end

    local result, aerr = c:append_events({ thread_id = tid, events = events })
    if aerr then return nil, aerr end
    if type(result) == "table" then
        local result_map = result :: UnknownMap
        result_map.outcomes = outcomes or {}
        local summary = policy.summary(outcomes)
        for k, v in pairs(summary) do result_map[k] = v end
    end
    if type(result) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "thread append returned an invalid result" }) end
    local append_seq = tonumber((result :: UnknownMap).max_seq)
    if not append_seq or append_seq < 1 then return nil, errors.new({ kind = errors.INTERNAL, message = "thread append returned no durable sequence" }) end
    -- The event append commits before the asynchronous projection transaction.
    -- Validation reads the projected locator and typed records, so acknowledge
    -- only after committed cursor progress covers this append (including replay).
    local projected, projection_err = catch_up(c, tid, append_seq)
    if not projected then return nil, projection_err end
    return true, nil, result :: UnknownMap, outcomes
end

-- ── typed builders ──────────────────────────────────────────────────────────
function M.create_record(crm_id: string, record_id: string, object_type: string,
    values: unknown): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.RECORD_CREATED,
        body = { record_id = record_id, object_type = object_type, values = values or {} } } })
end

function M.update_record(crm_id: string, record_id: string, object_type: string,
    set: unknown, unset: unknown?): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.RECORD_UPDATED,
        body = { record_id = record_id, object_type = object_type, set = set or {}, unset = unset or {} } } })
end

function M.merge_suggested(crm_id: string, body: unknown): (boolean?, error?, UnknownMap?)
    return M.append(crm_id, { { type = types.EVENTS.MERGE_SUGGESTED, body = body or {} } })
end

function M.merge_decided(crm_id: string, body: unknown): (boolean?, error?, UnknownMap?)
    return M.append(crm_id, { { type = types.EVENTS.MERGE_DECIDED, body = body or {} } })
end

function M.link(crm_id: string, object_type: string, record_id: string, attr: string,
    reference: unknown, relation: string?): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.RELATION_LINKED,
        body = { object_type = object_type, record_id = record_id, attr = attr, reference = reference, relation = relation } } })
end

function M.unlink(crm_id: string, object_type: string, record_id: string, attr: string,
    reference: unknown, relation: string?): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.RELATION_UNLINKED,
        body = { object_type = object_type, record_id = record_id, attr = attr, reference = reference, relation = relation } } })
end

-- Generalized reference edge over the closed ref/role vocabularies. Distinct from
-- M.link/M.unlink, which own the typed object relations; this is the loose
-- cross-kind plane (record/activity <-> resource) folded into kickside_crm_ref.
function M.link_ref(crm_id: string, from_ref: string, edge_type: string, to_ref: string,
    attrs: unknown?, active: boolean?): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.REFERENCE_LINKED,
        body = { from_ref = from_ref, edge_type = edge_type, to_ref = to_ref, attrs = attrs, active = active } } })
end

function M.unlink_ref(crm_id: string, from_ref: string, edge_type: string, to_ref: string): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.REFERENCE_UNLINKED,
        body = { from_ref = from_ref, edge_type = edge_type, to_ref = to_ref } } })
end

function M.set_membership(crm_id: string, collection_id: string, record_id: string, stage_id: string, position: number, from_stage_id: string?): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.MEMBERSHIP_SET,
        body = { collection_id = collection_id, record_id = record_id, stage_id = stage_id,
            from_stage_id = from_stage_id, position = position or 0 } } })
end

function M.log_activity(crm_id: string, activity: unknown): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.ACTIVITY_LOGGED, body = activity or {} } })
end

-- delete_activity addresses an activity by whichever identity the caller holds;
-- the projection resolves it through the convergence index, and an identity this
-- CRM never held settles as a no-op there. An empty identity addresses nothing
-- and is refused rather than appended. The read model is caught up to the
-- appended event, the same discipline the sink write path keeps, so the deletion
-- is observable when the call returns.
function M.delete_activity(crm_id: string, identity: unknown): (boolean?, error?)
    local body = type(identity) == "table" and (identity :: UnknownMap) or {}
    local activity_id = tostring(body.activity_id or "")
    local external_id = tostring(body.external_id or "")
    local correlation_key = tostring(body.correlation_key or "")
    if activity_id == "" and external_id == "" and correlation_key == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "activity deletes require activity_id, external_id, or correlation_key" })
    end
    local event_body: UnknownMap = {}
    if activity_id ~= "" then event_body.activity_id = activity_id end
    if external_id ~= "" then event_body.external_id = external_id end
    if correlation_key ~= "" then event_body.correlation_key = correlation_key end
    local appended, append_err, append_result = M.append(crm_id,
        { { type = types.EVENTS.ACTIVITY_DELETED, body = event_body } })
    if not appended then return nil, append_err end
    local append_seq: number? = nil
    if type(append_result) == "table" then append_seq = tonumber((append_result :: UnknownMap).max_seq) end
    local _, projection_err = M.catch_up_read_model(crm_id, append_seq)
    if projection_err then return nil, errors.wrap(projection_err, "activity delete projection") end
    return true, nil
end

function M.external_write_requested(crm_id: string, write: unknown): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.EXTERNAL_WRITE_REQUESTED, body = write or {} } })
end

function M.external_write_succeeded(crm_id: string, write: unknown): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.EXTERNAL_WRITE_SUCCEEDED, body = write or {} } })
end

function M.external_write_failed(crm_id: string, write: unknown): (boolean?, error?)
    return M.append(crm_id, { { type = types.EVENTS.EXTERNAL_WRITE_FAILED, body = write or {} } })
end

return M
