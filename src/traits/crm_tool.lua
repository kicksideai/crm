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

local function crm_id(args: UnknownMap): string
    local direct = trim(args.crm_id)
    if direct ~= "" then return direct end
    return trim(ctx.get("crm_id"))
end

local function generated_id(): (string?, error?)
    local id, err = uuid.v7()
    if err then return nil, errors.wrap(err, "UUID v7 generation failed") end
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "UUID v7 generation failed" })
    end
    return id, nil
end

-- execute runs one CRM operation. A missing crm_id is the tool's domain error;
-- an operation failure is its typed error; a result is the published success
-- shape, which carries success = true.
local function execute(args: unknown, operation: Operation): (UnknownMap?, error?)
    local input: UnknownMap = type(args) == "table" and (args :: UnknownMap) or {}
    local component_id = crm_id(input)
    if component_id == "" then return tool_result.domain_error("crm_id is required") end

    local fields, err = operation(component_id, input)
    if err then return nil, err end
    local out: UnknownMap = {}
    for key, value in pairs(type(fields) == "table" and (fields :: UnknownMap) or {}) do out[key] = value end
    out.success = true
    return out, nil
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
        return mutation.import_config(component_id, input.artifact, input.expected_revision)
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
        local record_id = trim(input.record_id)
        if record_id == "" then
            local generated, generation_err = generated_id()
            if not generated then return nil, generation_err end
            record_id = generated
        end
        local written, err = writer.create_record(component_id, record_id, trim(input.object_type), input.values or {})
        if not written then return nil, err end
        return { record_id = record_id }, nil
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
