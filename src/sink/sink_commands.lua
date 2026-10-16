-- The CRM writable sink's request vocabulary: the input fields each kind accepts,
-- canonical provenance, the field map a sync configures, and the CRM command one
-- delivery appends. Pure functions over the request; no storage access.
local types = require("types")

local M = {}

type UnknownMap = { [string]: unknown }
type Command = {
    type: string,
    body: UnknownMap,
    external: UnknownMap?,
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- Canonical source attribution a writer may attach to any write. Optional:
-- the durable write protocol keys identity on origin + idempotency, and
-- provenance rides the event body as the record of where the data came from.
type Provenance = {
    source_type: string,
    source_id: string,
    source_event_id: string?,
    confidence: number?,
}

local PROVENANCE_FIELDS = { source_type = true, source_id = true, source_event_id = true, confidence = true }

function M.validate_provenance(input: UnknownMap): (Provenance?, string?)
    local raw = input.provenance
    if raw == nil then return nil, nil end
    if type(raw) ~= "table" then return nil, "input.provenance must be an object" end
    local provenance = raw :: UnknownMap
    for key in pairs(provenance) do
        if not PROVENANCE_FIELDS[key] then return nil, "unknown input.provenance field: " .. tostring(key) end
    end
    if trim(provenance.source_type) == "" then return nil, "input.provenance.source_type is required" end
    if trim(provenance.source_id) == "" then return nil, "input.provenance.source_id is required" end
    if provenance.confidence ~= nil and type(provenance.confidence) ~= "number" then
        return nil, "input.provenance.confidence must be a number"
    end
    return provenance :: Provenance, nil
end

local COMMON_INPUT = { kind = true, provenance = true }
local KIND_INPUT = {
    record = { object_type = true, record_id = true, values = true, set = true,
        set_if_absent = true, append_unique = true, unset = true },
    relation = { object_type = true, record_id = true, attr = true, reference = true, relation = true },
    activity = { activity_id = true, record_id = true, participant_record_id = true, activity_type = true, occurred_at = true,
        due_at = true, done = true, payload = true, source = true, external_id = true, correlation_key = true,
        direction = true, duration_sec = true, outcome = true, recording_url = true, has_transcript = true },
    reference = { from_ref = true, edge_type = true, to_ref = true, attrs = true, active = true },
    membership = { collection_id = true, record_id = true, stage_id = true, from_stage_id = true, position = true },
}

function M.validate_shape(config: UnknownMap, input: UnknownMap): string?
    for key in pairs(config) do
        if key ~= "crm_id" and key ~= "field_map" then return "unknown config field: " .. tostring(key) end
    end
    local kind = trim(input.kind)
    local allowed = KIND_INPUT[kind]
    if not allowed then return "unsupported CRM sink kind: " .. kind end
    for key in pairs(input) do
        if not COMMON_INPUT[key] and not allowed[key] then return "unknown input field for " .. kind .. ": " .. tostring(key) end
    end
    return nil
end

function M.mapped_fields(config: UnknownMap, fields: unknown, field_name: string): (UnknownMap?, string?)
    if type(fields) ~= "table" then return nil, "input." .. field_name .. " is required" end
    local source = fields :: UnknownMap
    if config.field_map == nil then return source, nil end
    if type(config.field_map) ~= "table" then return nil, "config.field_map must be an object" end
    local values: UnknownMap = {}
    for source_attr, target_attr in pairs(config.field_map) do
        if type(source_attr) ~= "string" or type(target_attr) ~= "string" or target_attr == "" then
            return nil, "config.field_map must map field names to non-empty CRM field names"
        end
        if source[source_attr] ~= nil then values[target_attr] = source[source_attr] end
    end
    return values, nil
end

function M.mapped_unset(config: UnknownMap, unset: unknown): ({ string }?, string?)
    if type(unset) ~= "table" then return nil, "input.unset must be an array" end
    local source = unset :: { unknown }
    if config.field_map == nil then
        local copied: { string } = {}
        for _, source_attr in ipairs(source) do
            if type(source_attr) ~= "string" then return nil, "input.unset entries must be strings" end
            copied[#copied + 1] = source_attr
        end
        return copied, nil
    end
    if type(config.field_map) ~= "table" then return nil, "config.field_map must be an object" end
    local field_map = config.field_map :: UnknownMap
    local mapped: { string } = {}
    for _, source_attr in ipairs(source) do
        if type(source_attr) ~= "string" then return nil, "input.unset entries must be strings" end
        local target_attr = field_map[source_attr]
        if target_attr ~= nil then
            if type(target_attr) ~= "string" or target_attr == "" then return nil, "config.field_map values must be non-empty strings" end
            mapped[#mapped + 1] = target_attr
        end
    end
    return mapped, nil
end


function M.optional_input(input: UnknownMap, field: string): string?
    local value = trim(input[field])
    if value == "" then return nil end
    return value
end

-- The field that marks each kind's dest_ref as command_for issues it, in the
-- order that tells them apart: a relation ref also carries object_type, and an
-- activity or membership ref also carries record_id.
local DEST_REF_KINDS: { { string } } = {
    { "from_ref", "reference" },
    { "collection_id", "membership" },
    { "attr", "relation" },
    { "activity_id", "activity" },
    { "object_type", "record" },
}

-- The delete input for the destination a dest_ref names: the identity this
-- sink answered when it wrote that destination, in the CRM the config names.
function M.delete_input(crm_id: string, current_ref: unknown): (UnknownMap?, string?)
    if type(current_ref) ~= "table" then
        return nil, "a delete names its CRM target through input.kind or the destination's dest_ref"
    end
    local ref = current_ref :: UnknownMap
    if trim(ref.crm_id) ~= crm_id then return nil, "dest_ref.crm_id must match config.crm_id" end
    for _, marker in ipairs(DEST_REF_KINDS) do
        if ref[marker[1]] ~= nil then
            local input: UnknownMap = { kind = marker[2] }
            for key, value in pairs(ref) do
                if key ~= "crm_id" then input[key] = value end
            end
            return input, nil
        end
    end
    return nil, "dest_ref names no CRM record, activity, relation, reference, or membership"
end

function M.command_for(operation: string, input: UnknownMap,
    current_ref: unknown): (Command?, string?, UnknownMap?, string?)
    local kind = trim(input.kind)
    if kind == "record" then
        local object_type = trim(input.object_type)
        local record_id = trim(input.record_id)
        if object_type == "" then return nil, nil, nil, "record writes require input.object_type" end
        if record_id == "" then return nil, nil, nil, "record writes require input.record_id" end
        local body: UnknownMap = { object_type = object_type, record_id = record_id }
        local event_type, outcome
        if operation == "delete" then
            event_type, outcome = types.EVENTS.RECORD_DELETED, "deleted"
        elseif operation == "update" then
            if input.set ~= nil and type(input.set) ~= "table" then return nil, nil, nil, "input.set must be an object" end
            if input.set_if_absent ~= nil and type(input.set_if_absent) ~= "table" then return nil, nil, nil, "input.set_if_absent must be an object" end
            if input.append_unique ~= nil and type(input.append_unique) ~= "table" then return nil, nil, nil, "input.append_unique must be an object" end
            if input.unset ~= nil and type(input.unset) ~= "table" then return nil, nil, nil, "input.unset must be an array" end
            if input.set == nil and input.unset == nil and input.set_if_absent == nil and input.append_unique == nil then
                return nil, nil, nil, "record updates require input.set, input.set_if_absent, input.append_unique, or input.unset"
            end
            body.set, body.unset = input.set, input.unset
            body.set_if_absent, body.append_unique = input.set_if_absent, input.append_unique
            event_type, outcome = types.EVENTS.RECORD_UPDATED, "updated"
        elseif operation == "upsert" then
            if current_ref == nil then
                -- record_id is the natural key either way; _update_shape carries the
                -- resolution the caller already made.
                if input._update_shape then
                    body.set, body.unset = input.values, {}
                    event_type, outcome = types.EVENTS.RECORD_UPDATED, "updated"
                else
                    body.values = input.values
                    event_type, outcome = types.EVENTS.RECORD_CREATED, "created"
                end
            else
                if type(current_ref) ~= "table" then return nil, nil, nil, "dest_ref must be an object" end
                local ref = current_ref :: UnknownMap
                if trim(ref.crm_id) ~= trim(input._crm_id)
                    or trim(ref.object_type) ~= object_type
                    or trim(ref.record_id) ~= record_id then
                    return nil, nil, nil, "dest_ref must match config.crm_id, input.object_type, and input.record_id"
                end
                body.set, body.unset = input.values, {}
                event_type, outcome = types.EVENTS.RECORD_UPDATED, "updated"
            end
        else
            return nil, nil, nil, "unsupported record sink operation: " .. operation
        end
        local command: Command = { type = event_type, body = body }
        return command, outcome, { crm_id = input._crm_id, object_type = object_type, record_id = record_id }, nil
    end

    if kind == "relation" then
        local object_type = trim(input.object_type)
        local record_id = trim(input.record_id)
        local attr = trim(input.attr)
        if object_type == "" then return nil, nil, nil, "relation writes require input.object_type" end
        if record_id == "" then return nil, nil, nil, "relation writes require input.record_id" end
        if attr == "" then return nil, nil, nil, "relation writes require input.attr" end
        if type(input.reference) ~= "table" then return nil, nil, nil, "relation writes require input.reference" end
        local event_type = operation == "delete" and types.EVENTS.RELATION_UNLINKED or types.EVENTS.RELATION_LINKED
        if operation ~= "delete" and operation ~= "upsert" then return nil, nil, nil, "unsupported relation sink operation: " .. operation end
        local body: UnknownMap = {
            object_type = object_type,
            record_id = record_id,
            attr = attr,
            reference = input.reference,
            relation = input.relation,
        }
        local command: Command = { type = event_type, body = body }
        return command, operation == "delete" and "deleted" or "created",
            { crm_id = input._crm_id, object_type = object_type, record_id = record_id, attr = attr, reference = input.reference }, nil
    end

    if kind == "activity" then
        if operation == "delete" then
            local body: UnknownMap = {
                activity_id = M.optional_input(input, "activity_id"),
                external_id = M.optional_input(input, "external_id"),
                correlation_key = M.optional_input(input, "correlation_key"),
            }
            if body.activity_id == nil and body.external_id == nil and body.correlation_key == nil then
                return nil, nil, nil,
                    "activity deletes require input.activity_id, input.external_id, or input.correlation_key"
            end
            local command: Command = { type = types.EVENTS.ACTIVITY_DELETED, body = body }
            return command, "deleted",
                { crm_id = input._crm_id, activity_id = body.activity_id, external_id = body.external_id }, nil
        end
        if operation ~= "upsert" then return nil, nil, nil, "unsupported activity sink operation: " .. operation end
        local activity_id = trim(input.activity_id)
        local record_id = trim(input.record_id)
        local activity_type = trim(input.activity_type)
        if activity_id == "" or record_id == "" or activity_type == "" then
            return nil, nil, nil, "activity writes require input.activity_id, input.record_id, and input.activity_type"
        end
        local body: UnknownMap = {
            activity_id = activity_id,
            record_id = record_id,
            activity_type = activity_type,
            participant_record_id = input.participant_record_id,
            occurred_at = input.occurred_at,
            due_at = input.due_at,
            done = input.done,
            source = input.source,
            external_id = input.external_id,
            correlation_key = input.correlation_key,
            direction = input.direction,
            duration_sec = input.duration_sec,
            outcome = input.outcome,
            recording_url = input.recording_url,
            has_transcript = input.has_transcript,
            payload = input.payload,
        }
        local command: Command = { type = types.EVENTS.ACTIVITY_LOGGED, body = body }
        return command, "created", { crm_id = input._crm_id, activity_id = activity_id, record_id = record_id }, nil
    end

    if kind == "reference" then
        local from_ref = trim(input.from_ref)
        local edge_type = trim(input.edge_type)
        local to_ref = trim(input.to_ref)
        if from_ref == "" or edge_type == "" or to_ref == "" then
            return nil, nil, nil, "reference writes require input.from_ref, input.edge_type, and input.to_ref"
        end
        if operation ~= "upsert" and operation ~= "delete" then return nil, nil, nil, "unsupported reference sink operation: " .. operation end
        if input.attrs ~= nil and type(input.attrs) ~= "table" then return nil, nil, nil, "input.attrs must be an object" end
        local body: UnknownMap = {
            from_ref = from_ref,
            edge_type = edge_type,
            to_ref = to_ref,
            attrs = input.attrs,
            active = input.active,
        }
        local event_type = operation == "delete" and types.EVENTS.REFERENCE_UNLINKED or types.EVENTS.REFERENCE_LINKED
        local command: Command = { type = event_type, body = body }
        return command, operation == "delete" and "deleted" or "created",
            { crm_id = input._crm_id, from_ref = from_ref, edge_type = edge_type, to_ref = to_ref }, nil
    end

    if kind == "membership" then
        local collection_id = trim(input.collection_id)
        local record_id = trim(input.record_id)
        if collection_id == "" or record_id == "" then return nil, nil, nil, "membership writes require input.collection_id and input.record_id" end
        if operation ~= "upsert" and operation ~= "delete" then return nil, nil, nil, "unsupported membership sink operation: " .. operation end
        local body: UnknownMap = {
            collection_id = collection_id,
            record_id = record_id,
            stage_id = input.stage_id,
            from_stage_id = input.from_stage_id,
            position = input.position,
        }
        local event_type = operation == "delete" and types.EVENTS.MEMBERSHIP_REMOVED or types.EVENTS.MEMBERSHIP_SET
        local command: Command = { type = event_type, body = body }
        return command, operation == "delete" and "deleted" or "updated",
            { crm_id = input._crm_id, collection_id = collection_id, record_id = record_id }, nil
    end
    return nil, nil, nil, "unsupported CRM sink kind: " .. kind
end

return M
