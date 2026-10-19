-- Pure write policy over catalog definitions and current materialized values.
local sql = require("sql")
local storage = require("storage")
local types = require("types")

local M = {}

type UnknownMap = { [string]: unknown }
type Executor = sql.DB | sql.Transaction
type Context = {
    actor_id: unknown?,
    actor_context: unknown?,
}
type Command = {
    type: unknown?,
    body: unknown?,
}
type RecordBody = {
    object_type: unknown?,
    record_id: unknown?,
    values: unknown?,
    set: unknown?,
    unset: unknown?,
    attr: unknown?,
}
type FieldPolicy = {
    human_protected: boolean?,
    review_required: boolean?,
}
type FieldConfig = { policy: unknown? }
type FieldSchema = { config: unknown? }
type ObjectSchema = {
    object_type: unknown?,
    fields: {[string]: FieldSchema},
    relations: {[string]: FieldSchema},
}
type Outcome = {
    outcome: string,
    reason: string,
    command_type: string,
    record_id: unknown?,
    object_type: unknown?,
}

local FIELD_EVENTS = {
    [types.EVENTS.RECORD_CREATED] = true,
    [types.EVENTS.RECORD_UPDATED] = true,
    [types.EVENTS.AI_ATTRIBUTE_FILLED] = true,
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function open_db(): (sql.DB?, error?)
    local db, err = sql.get(types.db_id())
    if err then return nil, err end
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "crm: app:db unavailable" }) end
    return db, nil
end

local function actor_id(context: unknown): string
    if type(context) ~= "table" then return "" end
    return trim((context :: Context).actor_id)
end

local function is_machine_context(context: unknown): boolean
    if type(context) ~= "table" then return false end
    local typed = context :: Context
    return typed.actor_context ~= nil
end

local function command_fields(event_type: string, body: RecordBody): (UnknownMap?, error?)
    if event_type == types.EVENTS.RECORD_CREATED then
        if type(body.values) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = event_type .. " values must be an object" }) end
        return body.values :: UnknownMap, nil
    end
    if event_type == types.EVENTS.RECORD_UPDATED then
        local fields: UnknownMap = {}
        if body.set ~= nil and type(body.set) ~= "table" then
            return nil, errors.new({ kind = errors.INVALID, message = "record.updated set must be an object" })
        end
        if body.unset ~= nil and type(body.unset) ~= "table" then
            return nil, errors.new({ kind = errors.INVALID, message = "record.updated unset must be an array" })
        end
        local set: UnknownMap = type(body.set) == "table" and body.set :: UnknownMap or {}
        local unset: {unknown} = type(body.unset) == "table" and body.unset :: {unknown} or {}
        for attr in pairs(set) do fields[attr] = true end
        local seen, count = {}, 0
        for key in pairs(unset) do
            count = count + 1
            if type(key) ~= "number" or key % 1 ~= 0 or key < 1 then return nil, errors.new({ kind = errors.INVALID, message = "record.updated unset must be a dense array" }) end
        end
        if count ~= #unset then return nil, errors.new({ kind = errors.INVALID, message = "record.updated unset must be a dense array" }) end
        for _, attr in ipairs(unset) do
            if type(attr) ~= "string" or attr == "" then return nil, errors.new({ kind = errors.INVALID, message = "record.updated unset entries must be non-empty strings" }) end
            if seen[attr] then return nil, errors.new({ kind = errors.INVALID, message = "record.updated unset contains duplicate field: " .. attr }) end
            if set[attr] ~= nil then return nil, errors.new({ kind = errors.INVALID, message = "record.updated cannot set and unset field: " .. attr }) end
            seen[attr] = true
            fields[attr] = true
        end
        return fields, nil
    end
    if event_type == types.EVENTS.AI_ATTRIBUTE_FILLED then
        local attr = trim(body.attr)
        if attr == "" then return nil, errors.new({ kind = errors.INVALID, message = "ai attribute fill requires attr" }) end
        local fields: UnknownMap = { [attr] = true }
        return fields, nil
    end
    return {}, nil
end

local function validate_field_policy(object: ObjectSchema, attr: string, machine: boolean): error?
    local field = object.fields[attr] or object.relations[attr]
    if not field then return errors.new({ kind = errors.INVALID, message = "unknown CRM field: " .. tostring(object.object_type) .. "." .. attr }) end
    local config = type(field.config) == "table" and field.config :: FieldConfig or nil
    local policy = config and config.policy or nil
    if type(policy) ~= "table" then return nil end
    local typed_policy = policy :: FieldPolicy

    if machine and typed_policy.human_protected == true then
        return errors.new({ kind = errors.INVALID, message = "CRM field rejects machine writes because it is human-protected: " .. tostring(object.object_type) .. "." .. attr })
    end
    if machine and typed_policy.review_required == true then
        return errors.new({ kind = errors.INVALID, message = "CRM field rejects machine writes because it requires human review: " .. tostring(object.object_type) .. "." .. attr })
    end

    return nil
end

function M.enforce(crm_id: string, commands: unknown, context: unknown): ({Command}?, {Outcome}?, error?)
    if type(commands) ~= "table" then return nil, nil, errors.new({ kind = errors.INVALID, message = "commands must be an array" }) end
    local db, db_err = open_db()
    if not db then return nil, nil, db_err end

    local filtered: {Command} = {}
    local outcomes: {Outcome} = {}
    local machine = is_machine_context(context)
    if not machine and actor_id(context) == "" then
        db:release()
        return nil, nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "interactive CRM writes require an authenticated actor" })
    end
    for index, raw_cmd in ipairs(commands :: {unknown}) do
        if type(raw_cmd) ~= "table" then db:release(); return nil, nil, errors.new({ kind = errors.INVALID, message = "command at index " .. tostring(index) .. " must be an object" }) end
        local cmd = raw_cmd :: Command
        local event_type = trim(cmd.type)
        local body: RecordBody = type(cmd.body) == "table" and cmd.body :: RecordBody or {}
        if FIELD_EVENTS[event_type] then
            local object_type = trim(body.object_type)
            if object_type == "" then db:release(); return nil, nil, errors.new({ kind = errors.INVALID, message = event_type .. " requires object_type" }) end
            local loaded_object, object_err = storage.object(db, crm_id, object_type)
            if type(loaded_object) ~= "table" then db:release(); return nil, nil, object_err end
            local object = loaded_object :: ObjectSchema
            local fields, fields_err = command_fields(event_type, body)
            if not fields then db:release(); return nil, nil, fields_err end
            for attr in pairs(fields) do
                local policy_err = validate_field_policy(object, tostring(attr), machine)
                if policy_err then db:release(); return nil, nil, policy_err end
            end
        end
        filtered[#filtered + 1] = cmd
        outcomes[#outcomes + 1] = {
            outcome = "applied",
            reason = "policy_allowed",
            command_type = event_type,
            record_id = body.record_id,
            object_type = body.object_type,
        }
    end
    db:release()
    return filtered, outcomes, nil
end

function M.summary(outcomes: unknown): {applied: integer}
    local summary = { applied = 0 }
    for _, outcome in ipairs(type(outcomes) == "table" and outcomes :: {unknown} or {}) do
        if type(outcome) == "table" and (outcome :: Outcome).outcome == "applied" then
            summary.applied = summary.applied + 1
        end
    end
    return summary
end

return M
