local aliases = require("aliases")
local reader = require("reader")
local writer = require("writer")
local types = require("types")
local suggest = require("suggest")

local M = {}

type Value = string | number | boolean | { string }
type Values = { [string]: Value }
type Match = { alias_type: string?, alias_value: string | number? }
type ResolveArgs = {
    crm_id: string?,
    object_type: string?,
    record_id: string?,
    match: Match?,
    values: Values?,
}
type BlockArgs = { input: ResolveArgs?, config: { crm_id: string? }? }
type AliasAttribute = { attr: string?, data_type: string? }
type Reservation = {
    state: string?,
    record_id: string?,
    alias_hash: string?,
}
type Record = { record_id: string, object_type: string, values: Values }
type External = {
    external_source: string,
    external_id: string,
    external_version: string,
}
type EventBody = {
    record_id: string,
    object_type: string,
    values: Values?,
    set: Values?,
}
type Command = { type: string, body: EventBody, external: External? }
type ProjectionCheckpoint = { last_seq: unknown? }
type AppendResult = { max_seq: number?, outcomes: { { status: string? } }? }
type Suggestion = {
    left_id: string?,
    right_id: string?,
    confidence: number?,
    reason: string?,
    evidence_hash: string?,
}
type ResolveResult = {
    record: Record,
    created: boolean,
    outcomes: { { status: string? } },
    receipt: { crm_id: string, appended_seq: number? },
    checkpoint: { crm_id: string, appended_seq: number?, projected_seq: number?, last_seq: number?, target_seq: number? },
    merge_suggestions: { Suggestion },
}

local function trim(value: string?): string
    if value == nil then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function copy_values(value: Values): Values
    local out: Values = {}
    for key, item in pairs(value) do
        if type(item) == "table" then
            local list: { string } = {}
            for index, entry in ipairs(item) do list[index] = entry end
            out[key] = list
        else
            out[key] = item
        end
    end
    return out
end

local function alias_attributes(crm_id: string, object_type: string, alias_type: string): ({ AliasAttribute }?, error?)
    local attributes, err = aliases.alias_attrs(crm_id, object_type, alias_type)
    if err then return nil, err end
    if type(attributes) ~= "table" or #attributes == 0 then
        return nil, errors.new({ kind = errors.INVALID, message = "unknown alias type for " .. object_type .. ": " .. alias_type })
    end
    if #attributes ~= 1 then
        return nil, errors.new({ kind = errors.INVALID, message = "alias type must map to exactly one field: " .. object_type .. "." .. alias_type })
    end
    return attributes :: { AliasAttribute }, nil
end

local function apply_alias_value(values: Values, attributes: { AliasAttribute }, alias_value: string | number)
    local attr = trim(attributes[1].attr)
    if attr ~= "" and values[attr] == nil then values[attr] = alias_value end
end

local function appended_seq(result: AppendResult?): number?
    return result and result.max_seq or nil
end

function M.resolve(crm_id: string, args: ResolveArgs): (ResolveResult?, error?)
    crm_id = trim(crm_id)
    if crm_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id required" }) end

    local allowed, access_err = writer.require_access(crm_id, (require("component").ACCESS.WRITE :: integer))
    if not allowed then return nil, access_err end

    local object_type = trim(args.object_type)
    if object_type == "" then return nil, errors.new({ kind = errors.INVALID, message = "object_type required" }) end
    local match: Match = args.match or {}
    local alias_type = trim(match.alias_type)
    local alias_value = match.alias_value
    if alias_type == "" then return nil, errors.new({ kind = errors.INVALID, message = "match.alias_type required" }) end
    if type(alias_value) ~= "string" and type(alias_value) ~= "number" then
        return nil, errors.new({ kind = errors.INVALID, message = "match.alias_value must be a string or number" })
    end

    local attributes, config_err = alias_attributes(crm_id, object_type, alias_type)
    if config_err then return nil, config_err end

    local proposed_id = trim(args.record_id)
    if proposed_id == "" then
        local generated, id_err = types.new_record_id(object_type)
        if id_err then return nil, id_err end
        proposed_id = generated :: string
    end
    local reservation, reservation_err = aliases.reserve(crm_id, object_type, alias_type, alias_value, proposed_id)
    if not reservation then return nil, reservation_err end

    -- A pending claim is durable write intent. Its private alias hash identifies
    -- exactly one create event until projection commits the claim.
    local claim = reservation :: Reservation
    local created = claim.state == "pending"
    local record_id = trim(claim.record_id)
    local values = copy_values(args.values or {})
    if created then apply_alias_value(values, attributes, alias_value) end

    local event_type = created and types.EVENTS.RECORD_CREATED or types.EVENTS.RECORD_UPDATED
    local body: EventBody = { record_id = record_id, object_type = object_type }
    if created then body.values = values else body.set = values end

    local command: Command = { type = event_type, body = body }
    if created then
        command.external = {
            external_source = "kickside.crm.resolve",
            external_id = object_type .. ":" .. alias_type .. ":" .. trim(claim.alias_hash),
            external_version = "1",
        }
    end
    local ok, append_err, result = writer.append(crm_id, { command })
    if not ok then return nil, append_err end

    local append_result = type(result) == "table" and result :: AppendResult or nil
    local seq = appended_seq(append_result)
    local projected, projection_err = writer.catch_up_read_model(crm_id, seq)
    if not projected then return nil, projection_err end
    local projected_seq = tonumber((projected :: ProjectionCheckpoint).last_seq)

    local record: Record
    if created then
        record = { record_id = record_id, object_type = object_type, values = copy_values(values) }
    else
        local existing, read_err = reader.get_record(crm_id, record_id)
        if read_err then return nil, read_err end
        if not existing then return nil, errors.new({ kind = errors.NOT_FOUND, message = "resolved record not found: " .. record_id }) end
        local existing_record = existing :: Record
        record = {
            record_id = existing_record.record_id,
            object_type = existing_record.object_type,
            values = copy_values(existing_record.values or {}),
        }
        for key, value in pairs(values) do record.values[key] = value end
    end

    local out: ResolveResult = {
        record = record,
        created = created,
        outcomes = append_result and append_result.outcomes or {},
        receipt = {
            crm_id = crm_id,
            appended_seq = seq,
        },
        checkpoint = {
            crm_id = crm_id,
            appended_seq = seq,
            projected_seq = projected_seq,
            last_seq = projected_seq,
            target_seq = seq,
        },
        merge_suggestions = {},
    }
    if not created then
        local suggestions, suggestion_err = suggest.after_resolve(crm_id, out)
        if suggestion_err then return nil, suggestion_err end
        out.merge_suggestions = suggestions and suggestions :: { Suggestion } or {}
    end
    return out, nil
end

function M.resolve_entry(args: ResolveArgs): (ResolveResult?, error?)
    return M.resolve(trim(args.crm_id), args)
end

function M.resolve_block(args: BlockArgs): (ResolveResult?, error?)
    local input = args.input or {}
    local config = args.config or {}
    return M.resolve(trim(config.crm_id), input)
end

return M
