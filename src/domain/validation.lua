-- Field validation against the applied typed schema and materialized records.
local types = require("types")
local sql = require("sql")
local component = require("component")
local contract = require("contract")
local json = require("json")
local security = require("security")
local storage = require("storage")

local M = {}

type UnknownMap = { [string]: unknown }
type Executor = sql.DB | sql.Transaction
type StringSet = { [string]: boolean }
type RecordCache = { [string]: string | boolean }
type Pipeline = {
    object_type: string,
    stages: StringSet,
}
-- A record the command needs that is not there yet. The writer answers it as
-- a dependency (retriable once the record lands), never as a malformed write.
type MissingRecord = {
    record_id: string,
    object_type: string?,
}

type ValidationContext = {
    crm_id: string,
    schema: UnknownMap,
    records: RecordCache,
    unique_values: { [string]: string },
    pipelines: { [string]: Pipeline },
    missing: MissingRecord?,
}
type ObjectSchema = {
    object: UnknownMap,
    ordered: { UnknownMap },
    by_attr: { [string]: UnknownMap },
}
type TypedReference = {
    kind: string,
    id: string,
    type: string,
}
type Command = {
    type: unknown?,
    body: unknown?,
}

local function open_db(): (sql.DB?, error?)
    local db, err = sql.get(types.db_id())
    if err then return nil, err end
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "crm: app:db unavailable" }) end
    return db, nil
end

local function invalid(message: string): error
    return errors.new({ kind = errors.INVALID, message = message })
end

local function trim(v: unknown): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local function is_array(t: unknown): boolean
    if type(t) ~= "table" then return false end
    for k, _ in pairs(t) do
        if type(k) ~= "number" or k < 1 or math.floor(k) ~= k then return false end
    end
    return true
end

local function is_empty(v: unknown): boolean
    if v == nil then return true end
    if type(v) == "string" then return trim(v) == "" end
    if type(v) == "table" then return next(v) == nil end
    return false
end

local function label_for(def: UnknownMap): string
    local label = trim(def.label)
    if label ~= "" then return label end
    return tostring(def.attr or "")
end

local function number_value(v: unknown): number?
    if type(v) == "number" then return v :: number end
    if type(v) == "string" and trim(v) ~= "" then return tonumber(v) end
    return nil
end

local function decimal_places(value: unknown): number
    local s = tostring(value)
    s = s:match("^[+-]?%d*%.%d+") or s:match("^[+-]?%d+%.%d*") or ""
    if s == "" then return 0 end
    local frac = s:match("%.(%d+)$") or ""
    frac = frac:gsub("0+$", "")
    return #frac
end

local function choice_token(choice: unknown): string?
    if type(choice) == "string" or type(choice) == "number" or type(choice) == "boolean" then
        return tostring(choice)
    end
    if type(choice) == "table" then
        local item = choice :: UnknownMap
        local value = item.value or item.id or item.label
        if value ~= nil then return tostring(value) end
    end
    return nil
end

local function choices(cfg: UnknownMap): (StringSet, { string })
    local set: StringSet, ordered: { string } = {}, {}
    local configured = type(cfg.choices) == "table" and (cfg.choices :: { unknown }) or {}
    for _, choice in ipairs(configured) do
        local token = choice_token(choice)
        if token and token ~= "" then
            set[token] = true
            ordered[#ordered + 1] = token
        end
    end
    return set, ordered
end

local function relation_refs(v: unknown): { TypedReference }
    local out: { TypedReference } = {}
    local function add(item: unknown)
        if type(item) ~= "table" then return end
        local ref = item :: UnknownMap
        if type(ref.kind) == "string" and type(ref.id) == "string" and trim(ref.id) ~= "" then
            out[#out + 1] = { kind = trim(ref.kind), id = trim(ref.id), type = trim(ref.type) }
        end
    end
    if is_array(v) then
        for _, item in ipairs(v :: { unknown }) do add(item) end
    else
        add(v)
    end
    return out
end

local function load_applied_schema(crm_id: string): (UnknownMap?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local schema, schema_err = storage.load_schema(db, crm_id)
    db:release()
    if schema_err then return nil, schema_err end
    if type(schema) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema storage returned a non-object state" }) end
    return schema :: UnknownMap, nil
end

local function object_schema(context: ValidationContext, object_type: string): (ObjectSchema?, error?)
    local objects = type(context.schema.objects) == "table"
        and (context.schema.objects :: { [string]: UnknownMap }) or {}
    local object = objects[object_type]
    if not object then return nil, invalid("unknown CRM object type: " .. tostring(object_type)) end
    local ordered: { UnknownMap }, by_attr: { [string]: UnknownMap } = {}, {}
    local fields = type(object.fields) == "table" and (object.fields :: { [string]: UnknownMap }) or {}
    local relations = type(object.relations) == "table" and (object.relations :: { [string]: UnknownMap }) or {}
    for _, attr in ipairs(type(object.field_order) == "table" and (object.field_order :: { string }) or {}) do
        local def = fields[attr]
        ordered[#ordered + 1], by_attr[attr] = def, def
    end
    for _, attr in ipairs(type(object.relation_order) == "table" and (object.relation_order :: { string }) or {}) do
        local def = relations[attr]
        ordered[#ordered + 1], by_attr[attr] = def, def
    end
    table.sort(ordered, function(left, right)
        local lo, ro = tonumber(left.sort_order) or 0, tonumber(right.sort_order) or 0
        if lo == ro then return tostring(left.attr) < tostring(right.attr) end
        return lo < ro
    end)
    return { object = object, ordered = ordered, by_attr = by_attr }, nil
end

local function record_type(context: ValidationContext, record_id: string): (string?, error?)
    if trim(record_id) == "" then return nil, nil end
    local cached = context.records[record_id]
    if cached ~= nil then
        if cached == false then return nil, nil end
        return tostring(cached), nil
    end
    local db, err = open_db()
    if not db then return nil, err end
    local rows, locate_err = db:query([[SELECT object_type FROM kickside_crm_record_locator
        WHERE crm_id = $1 AND record_id = $2 LIMIT 1]],
        { context.crm_id, record_id })
    db:release()
    if locate_err then return nil, locate_err end
    local locator: UnknownMap? = type(rows) == "table" and type(rows[1]) == "table"
        and (rows[1] :: UnknownMap) or nil
    local found = locator and trim(locator.object_type) or ""
    context.records[record_id] = found ~= "" and found or false
    if found == "" then return nil, nil end
    return found, nil
end

-- require_record answers the reason a required record fails the command, or the
-- storage failure that kept it from being read.
local function require_record(context: ValidationContext, record_id: string, object_type: string?, role: string?): (string?, error?)
    local found, err = record_type(context, record_id)
    if err then return nil, err end
    if not found then
        context.missing = { record_id = record_id, object_type = object_type }
        return (role or "record") .. " not found", nil
    end
    if trim(object_type) ~= "" and found ~= object_type then
        return (role or "record") .. " object type mismatch", nil
    end
    return nil, nil
end

-- required answers require_record as one typed failure.
local function required(context: ValidationContext, record_id: string, object_type: string?, role: string?): error?
    local reason, err = require_record(context, record_id, object_type, role)
    if err then return err end
    if reason then return invalid(reason) end
    return nil
end

function M.exists(crm_id: string, record_id: string, object_type: string?): (boolean?, error?)
    if trim(record_id) == "" then return false, nil end
    local db, err = open_db()
    if not db then return nil, err end
    local found, read_err
    if trim(object_type) ~= "" then
        found, read_err = storage.exists(db, crm_id, object_type :: string, record_id)
    else
        local locator
        locator, read_err = storage.locate(db, crm_id, record_id)
        found = locator ~= nil
    end
    db:release()
    if read_err then return nil, read_err end
    return found == true, nil
end

local function validate_text(_def: UnknownMap, cfg: UnknownMap, value: unknown): string?
    if type(value) ~= "string" then return "must be text" end
    local s = value :: string
    local min_length = tonumber(cfg.min_length)
    local max_length = tonumber(cfg.max_length)
    if min_length and #s < min_length then return "must be at least " .. tostring(min_length) .. " characters" end
    if max_length and #s > max_length then return "must be at most " .. tostring(max_length) .. " characters" end
    if type(cfg.pattern) == "string" and cfg.pattern ~= "" then
        local ok, matched = pcall(string.match, s, cfg.pattern)
        if not ok then return "has invalid pattern" end
        if not matched then return "must match pattern" end
    end
    return nil
end

local function validate_number(cfg: UnknownMap, value: unknown): string?
    local n = number_value(value)
    if n == nil then return "must be a number" end
    local min = tonumber(cfg.min)
    local max = tonumber(cfg.max)
    if min and n < min then return "must be at least " .. tostring(min) end
    if max and n > max then return "must be at most " .. tostring(max) end
    local precision_raw = cfg.precision
    if precision_raw ~= nil then
        local precision = tonumber(precision_raw)
        if precision and precision >= 0 and math.floor(precision) == precision then
            if decimal_places(value) > precision then
                return "must have at most " .. tostring(precision) .. " decimal places"
            end
        end
    end
    return nil
end

local function validate_select(cfg: UnknownMap, value: unknown): string?
    local set, ordered = choices(cfg)
    if #ordered == 0 then return nil end
    if not set[tostring(value)] then return "must be one of " .. table.concat(ordered, ", ") end
    return nil
end

local function validate_multi_select(cfg: UnknownMap, value: unknown): string?
    local set, ordered = choices(cfg)
    if not is_array(value) then return "must be a string array" end
    for _, item in ipairs(value :: { unknown }) do
        if type(item) ~= "string" then return "must be a string array" end
    end
    if #ordered == 0 then return nil end
    for _, item in ipairs(value :: { unknown }) do
        if not set[tostring(item)] then return "must be one of " .. table.concat(ordered, ", ") end
    end
    return nil
end

local function principal_exists(kind: string, id: string): (boolean?, error?)
    local def, derr = contract.get("kickside.contract:directory")
    if derr then return nil, errors.wrap(derr, "principal directory unavailable") end
    if not def then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "principal directory unavailable" }) end
    local opener: contract.Contract = def
    local actor = security.actor()
    if actor then opener = opener:with_actor(actor):with_scope(security.scope()) end
    local directory, oerr = opener:open()
    if oerr then return nil, errors.wrap(oerr, "principal directory unavailable") end
    if not directory then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "principal directory unavailable" }) end
    local result, rerr = directory:exists({ type = kind, id = id })
    if rerr then return nil, rerr end
    return type(result) == "table" and (result :: UnknownMap).exists == true, nil
end

local function component_exists(target: UnknownMap, id: string): (boolean?, error?)
    local class = trim(target.class)
    if class == "" then return nil, invalid("component target class is required") end
    local rows, qerr = component.query({ component_ids = { id }, meta = { class = class }, include = { meta = true }, limit = 1 })
    if qerr then return nil, qerr end
    if type(rows) ~= "table" or not rows[1] then return false, nil end
    local required_contract = trim(target.contract)
    if required_contract ~= "" then
        local _, oerr = component.open(id, component.ACCESS.READ, required_contract)
        if oerr then return false, nil end
    end
    return true, nil
end

local function allowed_kind(kinds: unknown, kind: string): boolean
    for _, configured in ipairs(type(kinds) == "table" and (kinds :: { unknown }) or {}) do
        if tostring(configured) == kind then return true end
    end
    return false
end

local function value_reason(def: UnknownMap, value: unknown): string?
    local cfg = type(def.config) == "table" and (def.config :: UnknownMap) or {}
    local data_type = tostring(def.data_type or "")
    if data_type == "text" or data_type == "phone" or data_type == "ai" then
        if type(value) ~= "string" then return "must be text" end
        return validate_text(def, cfg, value)
    elseif data_type == "number" or data_type == "currency" then
        return validate_number(cfg, value)
    elseif data_type == "email" then
        if type(value) ~= "string" then return "must be a valid email" end
        local s = value :: string
        if not s:match("^[^@%s]+@[^@%s]+%.[^@%s]+$") then return "must be a valid email" end
    elseif data_type == "url" then
        if type(value) ~= "string" then return "must be a valid URL" end
        local s = value :: string
        if not (s:match("^https://%S+%.%S+$") or s:match("^http://%S+%.%S+$")) then return "must be a valid URL" end
    elseif data_type == "select" then
        return validate_select(cfg, value)
    elseif data_type == "multi_select" then
        return validate_multi_select(cfg, value)
    elseif data_type == "date" then
        if type(value) ~= "string" or not (value :: string):match("^%d%d%d%d%-%d%d%-%d%d$") then return "must be a YYYY-MM-DD date" end
    elseif data_type == "time" then
        if type(value) ~= "string" or not (value :: string):match("^%d%d:%d%d:?%d?%d?$") then return "must be an HH:mm or HH:mm:ss time" end
    elseif data_type == "datetime" then
        if type(value) ~= "string" or not (value :: string):match("^%d%d%d%d%-%d%d%-%d%dT%d%d:%d%d:%d%d") then return "must be an RFC3339 datetime" end
    elseif data_type == "boolean" then
        if type(value) ~= "boolean" then return "must be a boolean" end
    end
    return nil
end

-- validate_relation answers the reason a reference fails its target, or the
-- failure that kept the target from being checked.
local function validate_relation(crm_id: string, cfg: UnknownMap, value: unknown,
    context: ValidationContext?, require_target: boolean?): (string?, error?)
    local refs = relation_refs(value)
    if #refs == 0 then return "must be a typed reference", nil end
    local target = type(cfg.target) == "table" and (cfg.target :: UnknownMap) or nil
    if not target then return "target is required", nil end
    local target_kind = trim(target.kind)
    local cardinality = trim(cfg.cardinality)
    if cardinality == "" then cardinality = "one" end
    if cardinality ~= "many" and #refs > 1 then return "must reference one target", nil end
    for _, ref in ipairs(refs) do
        if ref.kind ~= target_kind then return "reference kind must be " .. target_kind, nil end
        local ref_type = trim(ref.type)
        local id = ref.id
        if target_kind == "record" then
            local object_type = trim(target.object_type)
            if object_type == "" then return "record target object_type is required", nil end
            if ref_type ~= object_type then return "reference type must be " .. object_type, nil end
            if require_target ~= false then
                if context then
                    local reason, err = require_record(context, id, object_type, "related " .. object_type)
                    if err then return nil, err end
                    if reason then return reason, nil end
                else
                    local ok, exists_err = M.exists(crm_id, id, object_type)
                    if exists_err then return nil, exists_err end
                    if not ok then return "related " .. object_type .. " not found", nil end
                end
            end
        elseif target_kind == "principal" then
            if ref_type == "" or not allowed_kind(target.kinds, ref_type) then return "principal kind is not allowed", nil end
            if require_target ~= false then
                local ok, err = principal_exists(ref_type, id)
                if err then return nil, err end
                if not ok then return "principal not found", nil end
            end
        elseif target_kind == "component" then
            local class = trim(target.class)
            if ref_type ~= class then return "reference type must be " .. class, nil end
            if require_target ~= false then
                local ok, err = component_exists(target, id)
                if err then return nil, err end
                if not ok then return "component not found or inaccessible", nil end
            end
        else
            return "target kind must be record, principal, or component", nil
        end
    end
    return nil, nil
end

-- validate_value answers the reason a value fails its declaration, or the
-- failure that kept a relation target from being checked.
local function validate_value(crm_id: string, def: UnknownMap, value: unknown,
    context: ValidationContext?): (string?, error?)
    if is_empty(value) then return nil, nil end
    local data_type = tostring(def.data_type or "")
    if data_type == "relation" then
        local cfg = type(def.config) == "table" and (def.config :: UnknownMap) or {}
        return validate_relation(crm_id, cfg, value, context, true)
    end
    return value_reason(def, value), nil
end

local function duplicate_unique(crm_id: string, object_type: string, record_id: string,
    def: UnknownMap, value: unknown): (boolean?, error?)
    if is_empty(value) then return false, nil end
    local cfg = type(def.config) == "table" and (def.config :: UnknownMap) or {}
    if cfg.unique ~= true then return false, nil end
    local db, err = open_db()
    if not db then return nil, err end
    local page, query_err = storage.list(db, crm_id, object_type, {
        filters = { { attr = def.attr, op = "eq", value = value } }, limit = 2, offset = 0,
    })
    db:release()
    if not page then return nil, query_err end
    local typed_page = page :: UnknownMap
    local rows = type(typed_page.rows) == "table" and (typed_page.rows :: { UnknownMap }) or {}
    for _, row in ipairs(rows) do
        if tostring(row.record_id) ~= record_id then return true, nil end
    end
    return false, nil
end

local function reserve_unique(context: ValidationContext, object_type: string, record_id: string,
    def: UnknownMap, value: unknown): (string?, error?)
    if is_empty(value) then return nil, nil end
    local cfg = type(def.config) == "table" and (def.config :: UnknownMap) or {}
    if cfg.unique ~= true then return nil, nil end
    local encoded, encode_err = json.encode(value)
    if encode_err then return nil, errors.wrap(encode_err, "unique value could not be encoded") end
    local key = object_type .. "\0" .. tostring(def.attr) .. "\0" .. tostring(encoded)
    local owner = context.unique_values[key]
    if owner ~= nil and owner ~= record_id then return "must be unique", nil end
    context.unique_values[key] = record_id
    return nil, nil
end

-- check_value collects the reasons one written value fails its declaration and
-- uniqueness; a storage failure aborts the validation.
local function check_value(context: ValidationContext, object_type: string, record_id: string,
    def: UnknownMap, value: unknown, reasons: { string }, unique: boolean): error?
    local reason, err = validate_value(context.crm_id, def, value, context)
    if err then return err end
    if reason then reasons[#reasons + 1] = label_for(def) .. ": " .. reason end
    if not unique then return nil end
    local duplicate, unique_err = duplicate_unique(context.crm_id, object_type, record_id, def, value)
    if unique_err then return unique_err end
    if duplicate then
        reasons[#reasons + 1] = label_for(def) .. ": must be unique"
        return nil
    end
    local reserve_reason, reserve_err = reserve_unique(context, object_type, record_id, def, value)
    if reserve_err then return reserve_err end
    if reserve_reason then reasons[#reasons + 1] = label_for(def) .. ": " .. reserve_reason end
    return nil
end

local function apply_create_defaults(schema: ObjectSchema, body: UnknownMap): UnknownMap
    local values: UnknownMap = {}
    if type(body.values) == "table" then values = body.values :: UnknownMap end
    body.values = values
    for _, def in ipairs(schema.ordered) do
        local cfg = type(def.config) == "table" and (def.config :: UnknownMap) or {}
        local attr = tostring(def.attr or "")
        if cfg.default ~= nil and is_empty(values[attr]) then
            values[attr] = cfg.default
        end
    end
    return values
end

local function validate_record(context: ValidationContext, etype: string, value: unknown): (boolean?, error?)
    local body: UnknownMap = type(value) == "table" and (value :: UnknownMap) or {}
    local object_type = tostring(body.object_type or "")
    local schema, serr = object_schema(context, object_type)
    if not schema then return nil, serr end

    local reasons: { string } = {}
    local record_id = tostring(body.record_id or "")
    if etype == types.EVENTS.RECORD_CREATED then
        local existing, exists_err = record_type(context, record_id)
        if exists_err then return nil, exists_err end
        if existing then return nil, errors.new({ kind = errors.CONFLICT, message = "record already exists" }) end
        local values = apply_create_defaults(schema, body)
        for _, def in ipairs(schema.ordered) do
            local cfg = type(def.config) == "table" and (def.config :: UnknownMap) or {}
            local value = values[tostring(def.attr)]
            if cfg.required == true and is_empty(value) then
                reasons[#reasons + 1] = label_for(def) .. ": required"
            end
        end
        for attr, value in pairs(values) do
            local def = schema.by_attr[tostring(attr)]
            if not def then
                reasons[#reasons + 1] = tostring(attr) .. ": undeclared field"
            else
                local err = check_value(context, object_type, record_id, def, value, reasons, true)
                if err then return nil, err end
            end
        end
    else
        local exists_err = required(context, record_id, object_type)
        if exists_err then return nil, exists_err end
        local set: UnknownMap = type(body.set) == "table" and (body.set :: UnknownMap) or {}
        local unset: StringSet = {}
        for _, attr in ipairs(type(body.unset) == "table" and (body.unset :: { unknown }) or {}) do
            if type(attr) ~= "string" or attr == "" then reasons[#reasons + 1] = "unset: invalid field"
            elseif unset[attr] then reasons[#reasons + 1] = attr .. ": duplicate unset field"
            else unset[attr] = true end
        end
        for attr, value in pairs(set) do
            local def = schema.by_attr[tostring(attr)]
            if not def then
                reasons[#reasons + 1] = tostring(attr) .. ": undeclared field"
            elseif unset[tostring(attr)] then
                reasons[#reasons + 1] = tostring(attr) .. ": cannot be both set and unset"
            else
                local cfg = type(def.config) == "table" and (def.config :: UnknownMap) or {}
                if cfg.required == true and is_empty(value) then
                    reasons[#reasons + 1] = label_for(def) .. ": required"
                else
                    local err = check_value(context, object_type, record_id, def, value, reasons, true)
                    if err then return nil, err end
                end
            end
        end
        for attr in pairs(unset) do
            local def = schema.by_attr[attr]
            if not def then reasons[#reasons + 1] = attr .. ": undeclared field"
            elseif type(def.config) == "table" and (def.config :: UnknownMap).required == true then
                reasons[#reasons + 1] = label_for(def) .. ": required"
            end
        end
        -- Conditional writes validate declaration and type here; whether they
        -- apply is the fold's decision, taken against the record's state in the
        -- destination's own event order, so uniqueness also settles there.
        local set_if_absent: UnknownMap = type(body.set_if_absent) == "table" and (body.set_if_absent :: UnknownMap) or {}
        for attr, value in pairs(set_if_absent) do
            local def = schema.by_attr[tostring(attr)]
            if not def then
                reasons[#reasons + 1] = tostring(attr) .. ": undeclared field"
            elseif set[tostring(attr)] ~= nil then
                reasons[#reasons + 1] = tostring(attr) .. ": cannot be both set and set_if_absent"
            elseif unset[tostring(attr)] then
                reasons[#reasons + 1] = tostring(attr) .. ": cannot be both set_if_absent and unset"
            else
                local err = check_value(context, object_type, record_id, def, value, reasons, false)
                if err then return nil, err end
            end
        end
        local append_unique: UnknownMap = type(body.append_unique) == "table" and (body.append_unique :: UnknownMap) or {}
        for attr, value in pairs(append_unique) do
            local def = schema.by_attr[tostring(attr)]
            if not def then
                reasons[#reasons + 1] = tostring(attr) .. ": undeclared field"
            elseif tostring(def.data_type or "") ~= "multi_select" then
                reasons[#reasons + 1] = tostring(attr) .. ": append_unique requires a multi_select field"
            elseif set[tostring(attr)] ~= nil or set_if_absent[tostring(attr)] ~= nil or unset[tostring(attr)] then
                reasons[#reasons + 1] = tostring(attr) .. ": append_unique conflicts with another operation on the same field"
            else
                local err = check_value(context, object_type, record_id, def, value, reasons, false)
                if err then return nil, err end
            end
        end
    end

    if #reasons > 0 then return nil, invalid(table.concat(reasons, "; ")) end
    if etype == types.EVENTS.RECORD_CREATED then
        context.records[record_id] = object_type
    end
    return true, nil
end

local function relation_event(context: ValidationContext, body: UnknownMap, linked: boolean): error?
    local object_type = trim(body.object_type)
    local schema, schema_err = object_schema(context, object_type)
    if not schema then return schema_err end
    local source_err = required(context, trim(body.record_id), object_type, "relation source")
    if source_err then return source_err end
    local attr = trim(body.attr)
    local def = schema.by_attr[attr]
    if not def or tostring(def.data_type or "") ~= "relation" then
        return invalid("unknown CRM relation: " .. object_type .. "." .. attr)
    end
    local cfg = type(def.config) == "table" and (def.config :: UnknownMap) or {}
    local reason, err = validate_relation(context.crm_id, cfg, body.reference, context, linked)
    if err then return err end
    if reason then return invalid(reason) end
    return nil
end

local function pipeline_index(schema: UnknownMap): { [string]: Pipeline }
    local out: { [string]: Pipeline } = {}
    local declaration = type(schema.declaration) == "table"
        and (schema.declaration :: UnknownMap) or {}
    local pipelines = type(declaration.pipelines) == "table"
        and (declaration.pipelines :: { unknown }) or {}
    for _, value in ipairs(pipelines) do
        local pipeline: UnknownMap = type(value) == "table" and (value :: UnknownMap) or {}
        local id = trim(pipeline.collection_id)
        if id ~= "" then
            local stages: StringSet = {}
            for _, stage in ipairs(type(pipeline.stages) == "table"
                and (pipeline.stages :: { unknown }) or {}) do
                local stage_id = type(stage) == "table"
                    and trim((stage :: UnknownMap).stage_id) or trim(stage)
                if stage_id ~= "" then stages[stage_id] = true end
            end
            out[id] = { object_type = trim(pipeline.object_type), stages = stages }
        end
    end
    return out
end

local function membership_event(context: ValidationContext, body: UnknownMap, present: boolean): error?
    local collection_id = trim(body.collection_id)
    local pipeline = context.pipelines[collection_id]
    if not pipeline then return invalid("unknown CRM collection: " .. collection_id) end
    local wanted_type = trim(pipeline.object_type)
    local record_err = required(context, trim(body.record_id),
        wanted_type ~= "" and wanted_type or nil, "collection record")
    if record_err then return record_err end
    if present then
        local stages = pipeline.stages
        local stage_id = trim(body.stage_id)
        if not stages[stage_id] then return invalid("unknown CRM collection stage: " .. stage_id) end
        local from_stage = trim(body.from_stage_id)
        if from_stage ~= "" and not stages[from_stage] then
            return invalid("unknown CRM collection stage: " .. from_stage)
        end
    end
    return nil
end

local function merge_event(context: ValidationContext, body: UnknownMap, decided: boolean): error?
    local object_type = trim(body.object_type)
    local _, schema_err = object_schema(context, object_type)
    if schema_err then return schema_err end
    local left = trim(body.left_id)
    local right = trim(body.right_id)
    local err = required(context, left, object_type, "left merge record")
    if err then return err end
    err = required(context, right, object_type, "right merge record")
    if err then return err end
    if decided and body.decision == "merged" then
        local winner = trim(body.winner_id)
        local loser = trim(body.loser_id)
        if (winner ~= left and winner ~= right) or (loser ~= left and loser ~= right) then
            return invalid("winner and loser must be the reviewed pair")
        end
        context.records[loser] = false
    end
    return nil
end

local function validate_command(context: ValidationContext, etype: unknown,
    body: UnknownMap): (boolean?, error?)
    if etype == types.EVENTS.RECORD_CREATED or etype == types.EVENTS.RECORD_UPDATED then
        return validate_record(context, etype :: string, body)
    end
    if etype == types.EVENTS.RECORD_DELETED then
        local object_type = trim(body.object_type)
        local _, schema_err = object_schema(context, object_type)
        if schema_err then return nil, schema_err end
        local record_id = trim(body.record_id)
        local err = required(context, record_id, object_type)
        if err then return nil, err end
        context.records[record_id] = false
    elseif etype == types.EVENTS.RELATION_LINKED or etype == types.EVENTS.RELATION_UNLINKED then
        local err = relation_event(context, body, etype == types.EVENTS.RELATION_LINKED)
        if err then return nil, err end
    elseif etype == types.EVENTS.MEMBERSHIP_SET or etype == types.EVENTS.MEMBERSHIP_REMOVED then
        local err = membership_event(context, body, etype == types.EVENTS.MEMBERSHIP_SET)
        if err then return nil, err end
    elseif etype == types.EVENTS.ACTIVITY_LOGGED then
        local err = required(context, trim(body.record_id), nil, "activity record")
        if err then return nil, err end
        local participant = trim(body.participant_record_id)
        if participant ~= "" then
            err = required(context, participant, nil, "activity participant")
            if err then return nil, err end
        end
    elseif etype == types.EVENTS.MERGE_SUGGESTED or etype == types.EVENTS.MERGE_DECIDED then
        local err = merge_event(context, body, etype == types.EVENTS.MERGE_DECIDED)
        if err then return nil, err end
    elseif etype == types.EVENTS.AI_ATTRIBUTE_FILLED then
        if body.value == nil then return nil, invalid("ai attribute fill value required") end
        local attr = tostring(body.attr or "")
        return validate_record(context, types.EVENTS.RECORD_UPDATED, {
            record_id = body.record_id,
            object_type = body.object_type,
            set = { [attr] = body.value },
        })
    end
    return true, nil
end

-- The dependency key a missing record answers to. Platform vocabulary: the
-- owner that blocked on it is unblocked by the same key when the record lands.
function M.record_dependency_key(crm_id: string, record_id: string): string
    return "crm:" .. crm_id .. ":record:" .. record_id
end

-- A command blocked on a record that does not exist yet fails with details
-- { code = "dependency_missing", dependency_key } naming the record it waits on.
function M.validate_commands(crm_id: string, commands: unknown): (boolean?, error?)
    if type(commands) ~= "table" then return true, nil end
    local schema, schema_err = load_applied_schema(crm_id)
    if not schema then return nil, schema_err end
    local typed_schema = schema :: UnknownMap
    local context: ValidationContext = {
        crm_id = crm_id,
        schema = typed_schema,
        records = {},
        unique_values = {},
        pipelines = pipeline_index(typed_schema),
    }
    for _, value in ipairs(commands :: { unknown }) do
        local cmd: Command = type(value) == "table" and (value :: Command) or {}
        local etype = cmd.type
        local body: UnknownMap = type(cmd.body) == "table" and (cmd.body :: UnknownMap) or {}
        local ok, err = validate_command(context, etype, body)
        if not ok then
            local failure = err :: error
            local missing = context.missing
            if missing ~= nil and errors.is(failure, errors.INVALID) then
                return nil, errors.new({ kind = errors.INVALID, message = failure:message(), details = {
                    code = "dependency_missing",
                    dependency_key = M.record_dependency_key(crm_id, (missing :: MissingRecord).record_id),
                } })
            end
            return nil, failure
        end
    end
    return true, nil
end

return M
