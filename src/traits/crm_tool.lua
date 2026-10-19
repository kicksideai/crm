-- Exact agent operations over the canonical CRM read, write, schema, and
-- resolution facades. Merge adjudication remains owned by the durable
-- merge-review Block and cannot be performed directly by an agent tool.
local ctx = require("ctx")
local uuid = require("uuid")
local reader = require("reader")
local writer = require("writer")
local resolver = require("resolver")
local schema = require("schema")
local mutation = require("mutation")
local tool_result = require("tool_result")
local types = require("types")
local locate = require("locate")
local create_service = require("create_service")

local M = {}

type UnknownMap = { [string]: unknown }
type Operation = (string, UnknownMap) -> (unknown?, error?)
type ResolveMatch = { alias_type: string?, alias_value: string | number? }
type ResolveValues = { [string]: string | number | boolean | { string } }

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function field(name: string, value: unknown, err: error?): (unknown?, error?)
    if err then return nil, err end
    return { [name] = value }, nil
end

-- crm_id answers the CRM a call addresses: the call's crm_id, the trait
-- context's crm_id, or the caller's only readable CRM.
local function crm_id(args: UnknownMap): (string?, error?)
    local direct = trim(args.crm_id)
    if direct == "" then direct = trim(ctx.get("crm_id")) end
    return locate.resolve(direct)
end

local function record_id_for(object_type: string, given: unknown): (string?, error?)
    local record_id = trim(given)
    if record_id ~= "" then return record_id, nil end
    return types.new_record_id(object_type)
end

local function generated_id(): (string?, error?)
    local id, err = uuid.v7()
    if err then return nil, errors.wrap(err, "UUID v7 generation failed") end
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "UUID v7 generation failed" })
    end
    return id, nil
end

-- execute runs one CRM operation. A CRM the call cannot address is the tool's
-- domain error, naming how to address one; an operation failure is its typed
-- error; a result is the published success shape, which carries success = true.
local function execute(args: unknown, operation: Operation): (UnknownMap?, error?)
    local input: UnknownMap = type(args) == "table" and (args :: UnknownMap) or {}
    local component_id, locate_err = crm_id(input)
    if not component_id then return tool_result.domain_error(tostring(locate_err)) end

    local fields, err = operation(component_id, input)
    if err then return nil, err end
    local out: UnknownMap = {}
    for key, value in pairs(type(fields) == "table" and (fields :: UnknownMap) or {}) do out[key] = value end
    out.success = true
    return out, nil
end

function M.list_crms(_args: unknown): (UnknownMap?, error?)
    local crms, err = locate.readable()
    if not crms then return nil, err end
    local rows: { UnknownMap } = {}
    for _, crm in ipairs(crms) do rows[#rows + 1] = { crm_id = crm.crm_id, title = crm.label } end
    return { success = true, crms = rows }, nil
end

function M.create_crm(args: unknown): (UnknownMap?, error?)
    if require("security").can("access", types.SCHEMA_MUTATION_GATE) ~= true then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "CRM schema administration access denied" })
    end
    local input: UnknownMap = type(args) == "table" and (args :: UnknownMap) or {}
    local created, err = create_service.create({
        idempotency_key = input.idempotency_key,
        title = input.title,
        parent_id = input.parent_id,
    })
    if not created then return nil, err end
    local result = created :: UnknownMap
    return {
        success = true,
        crm_id = result.component_id,
        title = result.title,
        revision = result.revision,
        replayed = result.replayed,
    }, nil
end

function M.list_records(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local page, err = reader.list_records(component_id, trim(input.object_type), {
            filters = input.filters,
            sort = input.sort,
            search = input.search,
            limit = input.limit,
            offset = input.offset,
        })
        if err then return nil, err end
        local fields = input.fields or { "name", "title", "status", "owner" }
        for _, row in ipairs((page :: any).rows) do
            local values: UnknownMap = {}
            for _, attr in ipairs(fields :: { string }) do values[attr] = row.values[attr] end
            row.values = values
            row.associations = nil
        end
        return page, nil
    end)
end

function M.get_record(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        return field("record", reader.get_record(component_id, trim(input.record_id)))
    end)
end

function M.get_board(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        return field("board", reader.board(component_id, trim(input.collection_id), {
            limit = input.limit,
            offset = input.offset,
        }))
    end)
end

function M.get_timeline(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local record_id = trim(input.record_id)
        local entries, err, next_cursor = reader.timeline(component_id, record_id ~= "" and record_id or nil,
            tonumber(input.limit), trim(input.cursor))
        if err then return nil, err end
        local rows: { UnknownMap } = {}
        for _, raw in ipairs(entries :: { any }) do
            local entry: any = raw
            local payload: any = entry.payload
            if type(payload) == "table" and type(payload.title) == "string" then entry.title = payload.title end
            local row: UnknownMap = { activity_id = entry.activity_id, record_id = entry.record_id,
                participant_record_id = entry.participant_record_id }
            for _, key in ipairs((input.fields or { "title", "activity_type", "occurred_at", "due_at", "done", "source", "direction", "outcome" }) :: { string }) do
                row[key] = entry[key]
            end
            rows[#rows + 1] = row
        end
        return { entries = rows, next_cursor = next_cursor }, nil
    end)
end

function M.get_schema(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        return field("schema", schema.export_config(component_id, { portable_key = input.portable_key }))
    end)
end

function M.apply_schema(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        if require("security").can("access", "kickside.crm.security:schema_mutation_access") ~= true then
            return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "CRM schema administration access denied" })
        end
        local writable, writable_err = writer.require_write(component_id)
        if not writable then return nil, writable_err end
        local _, checkpoint_err = writer.catch_up_read_model(component_id)
        if checkpoint_err then
            return nil, errors.wrap(checkpoint_err, "CRM schema import requires a current read model")
        end
        -- The calling agent authors this declaration, so the tool seals it; the
        -- portable sourceHash guards artifacts in transit, not the author's own edit.
        local sealed, seal_err = schema.seal(input.artifact)
        if not sealed then return nil, seal_err end
        return mutation.import_config(component_id, sealed, input.expected_revision)
    end)
end

function M.resolve_record(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        return resolver.resolve(component_id, {
            object_type = trim(input.object_type),
            match = input.match :: ResolveMatch,
            values = (input.values or {}) :: ResolveValues,
            record_id = input.record_id :: string?,
        })
    end)
end

function M.create_record(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local object_type = trim(input.object_type)
        local record_id, id_err = record_id_for(object_type, input.record_id)
        if not record_id then return nil, id_err end
        local written, err = writer.create_record(component_id, record_id, object_type, input.values or {})
        if not written then return nil, err end
        return { record_id = record_id }, nil
    end)
end

-- create_records appends every record in one batch: all land or none do, and a
-- relation may name a record created earlier in the same batch.
function M.create_records(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        if type(input.records) ~= "table" or #(input.records :: { unknown }) == 0 then
            return nil, errors.new({ kind = errors.INVALID, message = "records must be a non-empty array" })
        end
        local commands: { UnknownMap } = {}
        local record_ids: { string } = {}
        for index, raw in ipairs(input.records :: { unknown }) do
            if type(raw) ~= "table" then
                return nil, errors.new({ kind = errors.INVALID, message = "records[" .. index .. "] must be an object" })
            end
            local record = raw :: UnknownMap
            local object_type = trim(record.object_type)
            local record_id, id_err = record_id_for(object_type, record.record_id)
            if not record_id then return nil, id_err end
            record_ids[index] = record_id
            commands[index] = { type = types.EVENTS.RECORD_CREATED,
                body = { record_id = record_id, object_type = object_type, values = record.values or {} } }
        end
        local written, err = writer.append(component_id, commands)
        if not written then return nil, err end
        return { record_ids = record_ids }, nil
    end)
end

function M.update_record(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local record_id = trim(input.record_id)
        local written, err = writer.update_record(
            component_id,
            record_id,
            trim(input.object_type),
            input.set or {},
            input.unset or {}
        )
        if not written then return nil, err end
        return { record_id = record_id }, nil
    end)
end

function M.set_membership(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local previous = trim(input.from_stage_id)
        local written, err = writer.set_membership(
            component_id,
            trim(input.collection_id),
            trim(input.record_id),
            trim(input.stage_id),
            tonumber(input.position) or 0,
            previous ~= "" and previous or nil
        )
        if not written then return nil, err end
        return {
            collection_id = trim(input.collection_id),
            record_id = trim(input.record_id),
            stage_id = trim(input.stage_id),
        }, nil
    end)
end

function M.log_activity(args: unknown): (UnknownMap?, error?)
    if type(args) ~= "table" or type((args :: UnknownMap).activity) ~= "table" then
        return tool_result.domain_error("activity is required")
    end
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local activity = input.activity
        local typed_activity = activity :: UnknownMap
        if trim(typed_activity.activity_id) == "" then
            local generated, generation_err = generated_id()
            if not generated then return nil, generation_err end
            typed_activity.activity_id = generated
        end
        local written, err = writer.log_activity(component_id, activity)
        if not written then return nil, err end
        return { activity_id = typed_activity.activity_id }, nil
    end)
end

function M.delete_activity(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local identity: UnknownMap = {
            activity_id = input.activity_id,
            external_id = input.external_id,
            correlation_key = input.correlation_key,
        }
        local written, err = writer.delete_activity(component_id, identity)
        if not written then return nil, err end
        return {
            activity_id = trim(input.activity_id),
            external_id = trim(input.external_id),
            correlation_key = trim(input.correlation_key),
        }, nil
    end)
end

function M.link_reference(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local relation = trim(input.relation)
        local written, err = writer.link(
            component_id,
            trim(input.object_type),
            trim(input.record_id),
            trim(input.attr),
            input.reference,
            relation ~= "" and relation or nil
        )
        if not written then return nil, err end
        return { record_id = trim(input.record_id), attr = trim(input.attr), reference = input.reference }, nil
    end)
end

function M.unlink_reference(args: unknown): (UnknownMap?, error?)
    return execute(args, function(component_id: string, input: UnknownMap): (unknown?, error?)
        local relation = trim(input.relation)
        local written, err = writer.unlink(
            component_id,
            trim(input.object_type),
            trim(input.record_id),
            trim(input.attr),
            input.reference,
            relation ~= "" and relation or nil
        )
        if not written then return nil, err end
        return { record_id = trim(input.record_id), attr = trim(input.attr), reference = input.reference }, nil
    end)
end

return M
