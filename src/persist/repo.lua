-- Catalog-resolved persistence; callers never construct physical identifiers.
local compiler = require("compiler")
local json = require("json")
local sql = require("sql")

local M = {}
type SqlParams = { unknown }
type SqlRow = { [string]: unknown }
type SqlRows = { SqlRow }
type UnknownMap = { [string]: unknown }
type Executor = sql.DB | sql.Transaction
type FieldConfig = {
    unique: boolean?,
}
type ScalarField = {
    attr: string,
    field_id: string,
    data_type: string,
    column_name: string,
    indexed: boolean,
    searchable: boolean,
    config: FieldConfig,
}
type Relation = {
    attr: string,
    field_id: string,
    data_type: string,
    object_type: string,
    relation_table: string,
    target_kind: string,
    target_type: string,
    target_object_id: string?,
    cardinality: string,
    config: UnknownMap,
}
type ObjectSchema = {
    object_id: string,
    object_type: string,
    table_name: string,
    fts_table: string?,
    label: string?,
    icon: string?,
    plural: string?,
    is_syncable: boolean,
    fields: { [string]: ScalarField },
    relations: { [string]: Relation },
    field_order: { string },
    relation_order: { string },
}
type Schema = {
    crm_id: string,
    revision: unknown,
    source_hash: unknown,
    dialect: string,
    declaration: UnknownMap,
    objects: { [string]: ObjectSchema },
}
type TypedRef = { kind: string, type: string, id: string }
type RecordInput = {
    record_id: string,
    values: UnknownMap?,
    unset: { string }?,
    created_at: string?,
    updated_at: string?,
}
type Filter = { attr: string, op: string, value: unknown? }
type Sort = { attr: string?, dir: string? }
type ListOptions = {
    filters: { Filter }?,
    search: string?,
    sort: Sort?,
    limit: number?,
    offset: number?,
}
type RelationEdge = {
    attr: string,
    source: TypedRef,
    target: TypedRef,
    ordinal: number?,
    updated_at: unknown?,
}
type RelationGroup = { outgoing: { RelationEdge }, incoming: { RelationEdge } }

-- fail raises a typed storage failure; raise re-raises a driver or callee error
-- unchanged. protected answers either as (nil, err).
local function fail(kind: string, message: string)
    error(errors.new({ kind = kind, message = message }), 0)
end

local function raise(err: unknown)
    error(err, 0)
end

local function execute(db: Executor, statement: string, params: SqlParams?): unknown
    local result, err = db:execute(statement, params or {})
    if err then raise(err) end
    return result
end

local function query(db: Executor, statement: string, params: SqlParams?): SqlRows
    local rows, err = db:query(statement, params or {})
    if err then raise(err) end
    return (rows or {}) :: SqlRows
end

local function safe_identifier(value: unknown): string
    if type(value) ~= "string" or #value > 63 or not value:match("^[a-z][a-z0-9_]*$") then
        fail(errors.INTERNAL, "invalid physical identifier in CRM schema catalog")
    end
    return value :: string
end

local function stored_string(value: unknown, name: string): string
    if type(value) ~= "string" then fail(errors.INTERNAL, "invalid " .. name .. " in CRM schema catalog") end
    return value :: string
end

local function optional_string(value: unknown): string?
    if type(value) == "string" then return value :: string end
    return nil
end

local function now(): string
    return tostring(os.date("!%Y-%m-%dT%H:%M:%SZ"))
end

-- A storage operation raises its typed failure; any other raise is a runtime
-- fault inside storage.
local function protected(fn: () -> unknown): (unknown?, error?)
    local ok, result = pcall(fn)
    if ok then return result, nil end
    if type(result) == "userdata" then return nil, result :: error end
    return nil, errors.new({ kind = errors.INTERNAL, message = tostring(result) })
end

local function atomic(db: Executor, operation: (Executor) -> unknown): unknown
    local transaction = db :: sql.Transaction
    if type(transaction.savepoint) == "function" then
        local name = "crm_storage_upsert"
        local _, savepoint_err = transaction:savepoint(name)
        if savepoint_err then raise(errors.wrap(savepoint_err, "failed to create CRM storage savepoint")) end
        local ok, result = pcall(operation, db)
        if not ok then
            local _, rollback_err = transaction:rollback_to(name)
            local _, release_err = transaction:release(name)
            if rollback_err or release_err then
                raise(errors.wrap(rollback_err or release_err, "failed to roll back CRM storage write"))
            end
            error(result, 0)
        end
        local _, release_err = transaction:release(name)
        if release_err then raise(errors.wrap(release_err, "failed to release CRM storage savepoint")) end
        return result
    end

    local root = db :: sql.DB
    local tx, begin_err = root:begin()
    if begin_err then raise(errors.wrap(begin_err, "failed to begin CRM storage transaction")) end
    local ok, result = pcall(operation, tx)
    if not ok then
        tx:rollback()
        error(result, 0)
    end
    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        raise(errors.wrap(commit_err, "failed to commit CRM storage transaction"))
    end
    return result
end

local function unique_conflict(object: ObjectSchema, message: unknown): string?
    local text = tostring(message)
    for _, attr in ipairs(object.field_order or {}) do
        local field = object.fields[attr]
        local config = type(field.config) == "table" and field.config or {}
        if config.unique == true then
            local index_name = compiler.unique_index_name(object, field)
            if text:find(index_name, 1, true)
                or text:find(object.table_name .. "." .. field.column_name, 1, true)
            then
                return "CRM unique field conflict: " .. tostring(object.object_type) .. "." .. tostring(attr)
            end
        end
    end
    return nil
end

local function decode_document(value: unknown): UnknownMap
    if type(value) ~= "string" or value == "" then return {} end
    local decoded, err = json.decode(value)
    if err or type(decoded) ~= "table" then fail(errors.INTERNAL, "invalid declaration in CRM schema catalog") end
    return decoded :: UnknownMap
end

local function load_schema(db: Executor, crm_id: string): Schema
    if type(crm_id) ~= "string" or crm_id == "" then fail(errors.INVALID, "crm_id is required") end
    local revision = query(db, [[SELECT revision, source_hash, dialect
        FROM kickside_crm_schema_revision WHERE crm_id = $1]], { crm_id })[1]
    if not revision then fail(errors.NOT_FOUND, "CRM schema is not applied: " .. crm_id) end

    local schema: Schema = {
        crm_id = crm_id,
        revision = revision.revision,
        source_hash = revision.source_hash,
        dialect = stored_string(revision.dialect, "dialect"),
        declaration = { objects = {}, attributes = {}, pipelines = {}, views = {}, policies = {}, merge_config = {} },
        objects = {},
    }
    for _, row in ipairs(query(db, [[SELECT object_id, object_type, table_name, fts_table,
            label, icon, plural, is_syncable, definition
        FROM kickside_crm_schema_object WHERE crm_id = $1 ORDER BY object_type]], { crm_id })) do
        local object: ObjectSchema = {
            object_id = stored_string(row.object_id, "object_id"),
            object_type = stored_string(row.object_type, "object_type"),
            table_name = safe_identifier(row.table_name),
            fts_table = row.fts_table and safe_identifier(row.fts_table) or nil,
            label = optional_string(row.label), icon = optional_string(row.icon), plural = optional_string(row.plural),
            is_syncable = row.is_syncable == true or row.is_syncable == 1,
            fields = {}, relations = {}, field_order = {}, relation_order = {},
        }
        schema.objects[object.object_type] = object
        local objects = schema.declaration.objects
        if type(objects) ~= "table" then fail(errors.INTERNAL, "invalid objects declaration catalog") end
        objects[#objects + 1] = decode_document(row.definition)
    end
    for _, row in ipairs(query(db, [[SELECT object_id, field_id, object_type, attr, data_type, column_name, relation_table,
            target_kind, target_type, target_object_id, cardinality, indexed, searchable,
            label, config, sort_order, system, definition
        FROM kickside_crm_schema_attribute WHERE crm_id = $1 ORDER BY object_type, attr]], { crm_id })) do
        local object_type = stored_string(row.object_type, "attribute object_type")
        local attr = stored_string(row.attr, "attribute attr")
        local object = schema.objects[object_type]
        if not object then fail(errors.INTERNAL, "orphan CRM schema attribute: " .. tostring(row.object_type) .. "." .. tostring(row.attr)) end
        if row.relation_table then
            local relation: Relation = {
                attr = attr, data_type = "relation",
                field_id = stored_string(row.field_id, "field_id"),
                object_type = object_type,
                relation_table = safe_identifier(row.relation_table),
                target_kind = stored_string(row.target_kind, "target_kind"),
                target_type = stored_string(row.target_type, "target_type"),
                target_object_id = optional_string(row.target_object_id),
                cardinality = stored_string(row.cardinality, "cardinality"),
                config = decode_document(row.config),
                sort_order = tonumber(row.sort_order) or 0,
                system = row.system == true or row.system == 1,
            }
            object.relations[attr] = relation
            object.relation_order[#object.relation_order + 1] = attr
        else
            local field: ScalarField = {
                attr = attr, data_type = stored_string(row.data_type, "data_type"),
                field_id = stored_string(row.field_id, "field_id"),
                column_name = safe_identifier(row.column_name),
                indexed = row.indexed == true or row.indexed == 1,
                searchable = row.searchable == true or row.searchable == 1,
                config = decode_document(row.config) :: FieldConfig,
                sort_order = tonumber(row.sort_order) or 0,
                system = row.system == true or row.system == 1,
            }
            object.fields[attr] = field
            object.field_order[#object.field_order + 1] = attr
        end
        local attributes = schema.declaration.attributes
        if type(attributes) ~= "table" then fail(errors.INTERNAL, "invalid attributes declaration catalog") end
        attributes[#attributes + 1] = decode_document(row.definition)
    end
    for _, row in ipairs(query(db, [[SELECT kind, declaration_id, definition
        FROM kickside_crm_schema_declaration WHERE crm_id = $1 ORDER BY kind, declaration_id]], { crm_id })) do
        local definition = decode_document(row.definition)
        if row.kind == "config" then
            schema.declaration.version = definition.version
            schema.declaration.merge_config = definition.merge_config or {}
        elseif row.kind == "pipeline" then schema.declaration.pipelines[#schema.declaration.pipelines + 1] = definition
        elseif row.kind == "view" then schema.declaration.views[#schema.declaration.views + 1] = definition
        elseif row.kind == "policy" then schema.declaration.policies[#schema.declaration.policies + 1] = definition end
    end
    return schema
end

local function object_for(db: Executor, crm_id: string, object_type: string): (ObjectSchema, Schema)
    local schema = load_schema(db, crm_id)
    local object = schema.objects[object_type]
    if not object then fail(errors.INVALID, "unknown CRM object type: " .. tostring(object_type)) end
    return object, schema
end

local function decode_value(field: ScalarField, value: unknown): unknown
    if value == nil then return nil end
    if field.data_type == "boolean" and type(value) == "number" then return value ~= 0 end
    if field.data_type ~= "multi_select" or type(value) ~= "string" then return value end
    local decoded, err = json.decode(value)
    if err then fail(errors.INTERNAL, "invalid stored multi_select value: " .. tostring(err)) end
    return decoded
end

local function encode_value(field: ScalarField, value: unknown): unknown
    if value == nil or field.data_type ~= "multi_select" then return value end
    local encoded, err = json.encode(value)
    if err then fail(errors.INTERNAL, "multi_select encode failed: " .. tostring(err)) end
    return encoded
end

local function cast_placeholder(schema: Schema, field: ScalarField, index: number): string
    local placeholder = "$" .. tostring(index)
    if schema.dialect == "postgres" and field.data_type == "multi_select" then return "CAST(" .. placeholder .. " AS JSONB)" end
    return placeholder
end

local function append_value(params: SqlParams, sql_values: { string }, schema: Schema, field: ScalarField?, value: unknown)
    if value == nil then sql_values[#sql_values + 1] = "NULL"; return end
    params[#params + 1] = value
    sql_values[#sql_values + 1] = field and cast_placeholder(schema, field, #params) or "$" .. tostring(#params)
end

local function assert_unique_available(db: Executor, schema: Schema, object: ObjectSchema, record_id: string, values: UnknownMap)
    for attr, value in pairs(values) do
        local field = object.fields[attr]
        local config = field and type(field.config) == "table" and field.config or {}
        if field and config.unique == true and value ~= nil then
            local params = { schema.crm_id, record_id, encode_value(field, value) }
            local duplicate = query(
                db,
                "SELECT record_id FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id <> $2 AND "
                    .. field.column_name .. " = " .. cast_placeholder(schema, field, 3) .. " LIMIT 1",
                params
            )[1]
            if duplicate then fail(errors.CONFLICT, "CRM unique field conflict: " .. tostring(object.object_type) .. "." .. tostring(attr)) end
        end
    end
end

local function hydrate(object: ObjectSchema, row: SqlRow?): UnknownMap?
    if not row then return nil end
    local record = {
        record_id = row.record_id,
        canonical_id = row.canonical_id,
        superseded_at = row.superseded_at,
        created_at = row.created_at,
        updated_at = row.updated_at,
        object_type = object.object_type,
        values = {},
    }
    for _, attr in ipairs(object.field_order) do
        local field = object.fields[attr]
        local value = row[field.column_name]
        if value ~= nil then record.values[attr] = decode_value(field, value) end
    end
    return record
end

local function rebuild_sqlite_fts(db: Executor, crm_id: string, object: ObjectSchema, record_id: string)
    if not object.fts_table then return end
    execute(db, "DELETE FROM " .. object.fts_table .. " WHERE crm_id = $1 AND record_id = $2", { crm_id, record_id })
    local columns, source = { "crm_id", "record_id" }, { "crm_id", "record_id" }
    for _, attr in ipairs(object.field_order) do
        local field = object.fields[attr]
        if field.searchable then columns[#columns + 1], source[#source + 1] = field.column_name, field.column_name end
    end
    execute(db, "INSERT INTO " .. object.fts_table .. " (" .. table.concat(columns, ", ") .. ") SELECT "
        .. table.concat(source, ", ") .. " FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id = $2", { crm_id, record_id })
end

function M.ensure(db: sql.DB, dialect: string, crm_id: string, declaration: unknown, expected_revision: unknown?)
    return protected(function() return compiler.apply(db, dialect, crm_id, declaration, expected_revision) end)
end

function M.load_schema(db: Executor, crm_id: string)
    return protected(function() return load_schema(db, crm_id) end)
end

function M.object(db: Executor, crm_id: string, object_type: string)
    return protected(function() return object_for(db, crm_id, object_type) end)
end

function M.reference(db: Executor, crm_id: string, object_type: string, attr: string)
    return protected(function()
        local object = object_for(db, crm_id, object_type)
        local relation = object.relations[attr]
        if not relation then fail(errors.INVALID, "unknown CRM relation: " .. tostring(object_type) .. "." .. tostring(attr)) end
        return relation
    end)
end

function M.get(db: Executor, crm_id: string, object_type: string, record_id: string)
    return protected(function()
        local object = object_for(db, crm_id, object_type)
        local row = query(db, "SELECT * FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id = $2 LIMIT 1", { crm_id, record_id })[1]
        return hydrate(object, row)
    end)
end

function M.exists(db: Executor, crm_id: string, object_type: string, record_id: string)
    return protected(function()
        local object = object_for(db, crm_id, object_type)
        return query(db, "SELECT 1 AS present FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id = $2 LIMIT 1", { crm_id, record_id })[1] ~= nil
    end)
end

function M.locate(db: Executor, crm_id: string, record_id: string)
    return protected(function()
        return query(db, [[SELECT record_id, object_type, created_at, updated_at
            FROM kickside_crm_record_locator WHERE crm_id = $1 AND record_id = $2 LIMIT 1]],
            { crm_id, record_id })[1]
    end)
end

function M.get_any(db: Executor, crm_id: string, record_id: string)
    return protected(function()
        local locator = query(db, "SELECT object_type FROM kickside_crm_record_locator WHERE crm_id = $1 AND record_id = $2 LIMIT 1", { crm_id, record_id })[1]
        if not locator then return nil end
        local object = object_for(db, crm_id, stored_string(locator.object_type, "locator object_type"))
        return hydrate(object, query(db, "SELECT * FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id = $2 LIMIT 1", { crm_id, record_id })[1])
    end)
end

function M.get_many(db: Executor, crm_id: string, record_ids: unknown)
    return protected(function()
        if type(record_ids) ~= "table" or #record_ids == 0 then return {} end
        local params, slots = { crm_id }, {}
        for _, record_id in ipairs(record_ids) do
            if type(record_id) ~= "string" or record_id == "" then fail(errors.INVALID, "record_ids must contain non-empty strings") end
            params[#params + 1] = record_id; slots[#slots + 1] = "$" .. tostring(#params)
        end
        local grouped = {}
        for _, row in ipairs(query(db, "SELECT record_id, object_type FROM kickside_crm_record_locator WHERE crm_id = $1 AND record_id IN (" .. table.concat(slots, ", ") .. ")", params)) do
            grouped[row.object_type] = grouped[row.object_type] or {}; grouped[row.object_type][#grouped[row.object_type] + 1] = row.record_id
        end
        local found = {}
        for object_type, ids in pairs(grouped) do
            local object = object_for(db, crm_id, stored_string(object_type, "locator object_type"))
            local object_params, object_slots = { crm_id }, {}
            for _, record_id in ipairs(ids) do object_params[#object_params + 1] = record_id; object_slots[#object_slots + 1] = "$" .. tostring(#object_params) end
            for _, row in ipairs(query(db, "SELECT * FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id IN (" .. table.concat(object_slots, ", ") .. ")", object_params)) do
                found[row.record_id] = hydrate(object, row)
            end
        end
        local out = {}; for _, record_id in ipairs(record_ids) do if found[record_id] then out[#out + 1] = found[record_id] end end; return out
    end)
end

-- Defined below alongside the relation helpers it depends on; forward-declared so
-- the record-materialization path can drain the edges parked on a new record.
local drain_pending_relations: (Executor, string, string) -> ()

function M.upsert(db: Executor, crm_id: string, object_type: string, record: unknown)
    return protected(function()
        return atomic(db, function(write_db: Executor)
        if type(record) ~= "table" or type(record.record_id) ~= "string" or record.record_id == "" then fail(errors.INVALID, "record_id is required") end
        local input = record :: RecordInput
        local object, schema = object_for(write_db, crm_id, object_type)
        local unset = {}
        if input.unset ~= nil and type(input.unset) ~= "table" then fail(errors.INVALID, "record.unset must be an array") end
        for _, attr in ipairs(input.unset or {}) do
            if type(attr) ~= "string" or not object.fields[attr] then fail(errors.INVALID, "unknown or non-scalar CRM field in unset: " .. tostring(attr)) end
            if unset[attr] then fail(errors.INVALID, "duplicate CRM field in unset: " .. attr) end
            unset[attr] = true
        end
        if input.values ~= nil and type(input.values) ~= "table" then fail(errors.INVALID, "record.values must be a map") end
        local input_values: UnknownMap = input.values or {}
        for attr in pairs(input_values) do if not object.fields[attr] then fail(errors.INVALID, "unknown or non-scalar CRM value field: " .. tostring(attr)) end end
        assert_unique_available(write_db, schema, object, input.record_id, input_values)
        local timestamp = input.updated_at or now()
        local created_at = input.created_at or timestamp
        execute(write_db, [[INSERT INTO kickside_crm_record_locator
            (crm_id, record_id, object_type, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (crm_id, record_id) DO UPDATE SET updated_at = excluded.updated_at
            WHERE kickside_crm_record_locator.object_type = excluded.object_type]],
            { crm_id, input.record_id, object_type, created_at, timestamp })
        local locator = query(write_db, "SELECT object_type FROM kickside_crm_record_locator WHERE crm_id = $1 AND record_id = $2", { crm_id, input.record_id })[1]
        if not locator or locator.object_type ~= object_type then fail(errors.INVALID, "record_id is already owned by another CRM object type") end
        local columns = { "crm_id", "record_id", "created_at", "updated_at" }
        local params = { crm_id, input.record_id, created_at, timestamp }
        local values = { "$1", "$2", "$3", "$4" }
        local updates = { "updated_at = excluded.updated_at" }

        for _, attr in ipairs(object.field_order) do
            local field = object.fields[attr]
            if not field then fail(errors.INVALID, "unknown CRM scalar field: " .. tostring(attr)) end
            local supplied = input_values[attr] ~= nil or unset[attr] == true
            if supplied then
                columns[#columns + 1] = field.column_name
                append_value(params, values, schema, field, unset[attr] and nil or encode_value(field, input_values[attr]))
                updates[#updates + 1] = field.column_name .. " = excluded." .. field.column_name
            end
        end
        local ok, write_err = pcall(function()
            execute(write_db, "INSERT INTO " .. object.table_name .. " (" .. table.concat(columns, ", ") .. ") VALUES ("
                .. table.concat(values, ", ") .. ") ON CONFLICT (crm_id, record_id) DO UPDATE SET " .. table.concat(updates, ", "), params)
        end)
        if not ok then
            local conflict = unique_conflict(object, write_err)
            if conflict then fail(errors.CONFLICT, conflict) end
            raise(write_err)
        end
        if schema.dialect == "sqlite" then rebuild_sqlite_fts(write_db, crm_id, object, input.record_id) end
        -- The record now holds, so any edge parked on it as source or target can land.
        drain_pending_relations(write_db, crm_id, input.record_id)
        return hydrate(object, query(write_db, "SELECT * FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id = $2", { crm_id, input.record_id })[1])
        end)
    end)
end

M.update = M.upsert

local function relation_rows(db: Executor, crm_id: string, relation: Relation, source_id: string): SqlRows
    return query(db, "SELECT target_kind, target_type, target_id, ordinal FROM " .. relation.relation_table
        .. " WHERE crm_id = $1 AND source_id = $2 ORDER BY ordinal", { crm_id, source_id })
end

local function validate_ref(relation: Relation, ref: unknown): TypedRef
    if type(ref) ~= "table" or type(ref.id) ~= "string" or ref.id == "" then fail(errors.INVALID, "typed relation reference is required") end
    if ref.kind ~= relation.target_kind then fail(errors.INVALID, "relation target kind mismatch") end
    if relation.target_kind == "record" or relation.target_kind == "component" then
        if relation.target_type ~= "" and ref.type ~= relation.target_type then fail(errors.INVALID, "relation target type mismatch") end
    elseif relation.target_type ~= "" then
        local allowed = {}
        for kind in relation.target_type:gmatch("[^,]+") do allowed[kind] = true end
        if not allowed[ref.type] then fail(errors.INVALID, "relation principal type mismatch") end
    end
    return ref :: TypedRef
end

local function require_record(db: Executor, crm_id: string, record_id: string, object_type: string?, role: string?)
    local locator = query(db, [[SELECT object_type FROM kickside_crm_record_locator
        WHERE crm_id = $1 AND record_id = $2 LIMIT 1]], { crm_id, record_id })[1]
    if not locator then fail(errors.NOT_FOUND, (role or "record") .. " does not exist: " .. tostring(record_id)) end
    if object_type and locator.object_type ~= object_type then
        fail(errors.INVALID, (role or "record") .. " object type mismatch")
    end
end

local function insert_relation(db: Executor, crm_id: string, relation: Relation, source_id: string, ref: TypedRef, ordinal: number, timestamp: string)
    ref = validate_ref(relation, ref)
    require_record(db, crm_id, source_id, relation.object_type, "relation source")
    if ref.kind == "record" then require_record(db, crm_id, ref.id, ref.type, "relation target") end
    execute(db, "INSERT INTO " .. relation.relation_table
        .. " (crm_id, source_id, ordinal, target_kind, target_type, target_id, created_at, updated_at)"
        .. " VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING",
        { crm_id, source_id, ordinal, ref.kind, ref.type, ref.id, timestamp, timestamp })
end

-- A record endpoint is present, absent, or the wrong object type. Absence is the
-- one ordering condition a seq-ordered stream recovers from on its own, so it is
-- reported for deferral; a type mismatch on a record that DOES exist is a real
-- error and fails like require_record.
local function locator_state(db: Executor, crm_id: string, record_id: string, object_type: string?, role: string?): string
    local locator = query(db, [[SELECT object_type FROM kickside_crm_record_locator
        WHERE crm_id = $1 AND record_id = $2 LIMIT 1]], { crm_id, record_id })[1]
    if not locator then return "absent" end
    if object_type and locator.object_type ~= object_type then
        fail(errors.INVALID, (role or "record") .. " object type mismatch")
    end
    return "present"
end

local function encode_ref_scalar(value: string): string
    local encoded, err = json.encode(value)
    if err then raise(errors.wrap(err, "failed to encode relation reference")) end
    return encoded :: string
end

-- The reference table rendered in a fixed field order, so the same edge always
-- yields the same string and the pending row dedups on it.
local function canonical_ref_json(ref: TypedRef): string
    return "{\"kind\":" .. encode_ref_scalar(ref.kind)
        .. ",\"type\":" .. encode_ref_scalar(ref.type)
        .. ",\"id\":" .. encode_ref_scalar(ref.id) .. "}"
end

-- Park the edge. A re-delivered defer upserts on its natural key, so the row
-- keeps the ordinal and timestamp its first arrival established: replay changes
-- nothing. ordinal is a per-CRM arrival counter, the order the drain re-applies in.
local function defer_relation(db: Executor, crm_id: string, object_type: string, source_id: string,
    attr: string, typed_ref: TypedRef, linked: boolean, timestamp: string)
    local ref_json = canonical_ref_json(typed_ref)
    local target_id = typed_ref.kind == "record" and typed_ref.id or nil
    local dedup_key = source_id .. "\31" .. attr .. "\31" .. ref_json .. "\31" .. (linked and "1" or "0")
    local ordinal_row = query(db, "SELECT COALESCE(MAX(ordinal), 0) AS ordinal FROM kickside_crm_pending_relation"
        .. " WHERE crm_id = $1", { crm_id })[1]
    local ordinal = (tonumber(ordinal_row and ordinal_row.ordinal) or 0) + 1
    execute(db, [[INSERT INTO kickside_crm_pending_relation
        (crm_id, source_object_type, source_id, attr, target_ref_json, target_id, linked, ordinal, dedup_key, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (crm_id, source_id, attr, target_ref_json, linked) DO NOTHING]],
        { crm_id, object_type, source_id, attr, ref_json, target_id, linked, ordinal, dedup_key, timestamp })
end

-- Park the edge when either endpoint record is not yet materialized; both endpoints
-- present lets the caller apply it directly. Reports whether it deferred.
local function defer_if_endpoint_absent(db: Executor, crm_id: string, object_type: string, source_id: string,
    attr: string, typed_ref: TypedRef, linked: boolean): boolean
    local source_absent = locator_state(db, crm_id, source_id, object_type, "relation source") == "absent"
    local target_absent = typed_ref.kind == "record"
        and locator_state(db, crm_id, typed_ref.id, typed_ref.type, "relation target") == "absent"
    if source_absent or target_absent then
        defer_relation(db, crm_id, object_type, source_id, attr, typed_ref, linked, now())
        return true
    end
    return false
end

-- Apply a link whose endpoints and reference are already verified. Cardinality-one
-- replaces; cardinality-many appends at the next ordinal.
local function link_internal(db: Executor, crm_id: string, object: ObjectSchema, relation: Relation,
    object_type: string, source_id: string, attr: string, typed_ref: TypedRef)
    if relation.cardinality == "one" then
        local result, err = M.replace_relation(db, crm_id, object_type, source_id, attr, { typed_ref })
        if err then raise(err) end
        return
    end
    local rows = query(db, "SELECT COALESCE(MAX(ordinal), 0) AS ordinal FROM " .. relation.relation_table
        .. " WHERE crm_id = $1 AND source_id = $2", { crm_id, source_id })
    insert_relation(db, crm_id, relation, source_id, typed_ref, (tonumber(rows[1] and rows[1].ordinal) or 0) + 1, now())
end

local function unlink_internal(db: Executor, crm_id: string, relation: Relation, source_id: string, typed_ref: TypedRef)
    execute(db, "DELETE FROM " .. relation.relation_table
        .. " WHERE crm_id = $1 AND source_id = $2 AND target_kind = $3 AND target_type = $4 AND target_id = $5",
        { crm_id, source_id, typed_ref.kind, typed_ref.type, typed_ref.id })
end

-- Drain the edges parked on a record that just materialized, as its source or its
-- target. An edge lands only once BOTH its endpoints hold, so it takes effect in
-- the seq order its events carried; a still-incomplete edge stays parked. Applied
-- rows are deleted by their natural key, so a replayed materialization re-drains a
-- clean table and no edge lands twice.
drain_pending_relations = function(db: Executor, crm_id: string, record_id: string)
    local rows = query(db, [[SELECT source_object_type, source_id, attr, target_ref_json, linked
        FROM kickside_crm_pending_relation
        WHERE crm_id = $1 AND (source_id = $2 OR target_id = $2)
        ORDER BY ordinal]], { crm_id, record_id })
    for _, row in ipairs(rows) do
        local source_object_type = stored_string(row.source_object_type, "pending relation source_object_type")
        local source_id = stored_string(row.source_id, "pending relation source_id")
        local attr = stored_string(row.attr, "pending relation attr")
        local ref_json = stored_string(row.target_ref_json, "pending relation reference")
        local linked = row.linked == true or row.linked == 1
        local decoded, decode_err = json.decode(ref_json)
        if decode_err or type(decoded) ~= "table" then fail(errors.INTERNAL, "invalid pending relation reference") end
        local typed_ref = decoded :: TypedRef
        local ready = locator_state(db, crm_id, source_id, source_object_type, "relation source") == "present"
        if ready and typed_ref.kind == "record" then
            ready = locator_state(db, crm_id, typed_ref.id, typed_ref.type, "relation target") == "present"
        end
        if ready then
            local object = object_for(db, crm_id, source_object_type)
            local relation = object.relations[attr]
            if relation then
                local valid_ref = validate_ref(relation, typed_ref)
                if linked then
                    link_internal(db, crm_id, object, relation, source_object_type, source_id, attr, valid_ref)
                else
                    unlink_internal(db, crm_id, relation, source_id, valid_ref)
                end
            end
            execute(db, [[DELETE FROM kickside_crm_pending_relation
                WHERE crm_id = $1 AND source_id = $2 AND attr = $3 AND target_ref_json = $4 AND linked = $5]],
                { crm_id, source_id, attr, ref_json, linked })
        end
    end
end

function M.field(db: Executor, crm_id: string, object_type: string, record_id: string, attr: string)
    return protected(function()
        local object = object_for(db, crm_id, object_type)
        local field = object.fields[attr]
        if field then
            local row = query(db, "SELECT * FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id = $2 LIMIT 1", { crm_id, record_id })[1]
            if not row then return nil end
            return { value = decode_value(field, row[field.column_name]) }
        end
        local relation = object.relations[attr]
        if not relation then fail(errors.INVALID, "unknown CRM field: " .. tostring(object_type) .. "." .. tostring(attr)) end
        local refs = {}
        for _, row in ipairs(relation_rows(db, crm_id, relation, record_id)) do
            refs[#refs + 1] = { kind = row.target_kind, type = row.target_type, id = row.target_id }
        end
        return { value = relation.cardinality == "many" and refs or refs[1] }
    end)
end

function M.replace_relation(db: Executor, crm_id: string, object_type: string, source_id: string, attr: string, refs: unknown)
    return protected(function()
        local object = object_for(db, crm_id, object_type)
        local relation = object.relations[attr]
        if not relation then fail(errors.INVALID, "unknown CRM relation: " .. tostring(object_type) .. "." .. tostring(attr)) end
        if type(refs) ~= "table" then fail(errors.INVALID, "relation replacement requires an array") end
        for key in pairs(refs) do
            if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > #refs then fail(errors.INVALID, "relation replacement requires a dense array") end
        end
        if relation.cardinality == "one" and #refs > 1 then fail(errors.INVALID, "one-valued relation accepts at most one reference") end
        require_record(db, crm_id, source_id, object_type, "relation source")
        local typed_refs: { TypedRef } = {}
        for _, ref in ipairs(refs) do
            local typed_ref = validate_ref(relation, ref)
            typed_refs[#typed_refs + 1] = typed_ref
            if typed_ref.kind == "record" then require_record(db, crm_id, typed_ref.id, typed_ref.type, "relation target") end
        end
        execute(db, "DELETE FROM " .. relation.relation_table .. " WHERE crm_id = $1 AND source_id = $2", { crm_id, source_id })
        local timestamp = now()
        for ordinal, ref in ipairs(typed_refs) do insert_relation(db, crm_id, relation, source_id, ref, ordinal, timestamp) end
        return true
    end)
end

function M.link(db: Executor, crm_id: string, object_type: string, source_id: string, attr: string, ref: unknown)
    return protected(function()
        local object = object_for(db, crm_id, object_type)
        local relation = object.relations[attr]
        if not relation then fail(errors.INVALID, "unknown CRM relation: " .. tostring(object_type) .. "." .. tostring(attr)) end
        local typed_ref = validate_ref(relation, ref)
        -- An edge naming a not-yet-materialized endpoint is a seq-ordering artifact:
        -- the record.created arrives later in the stream. Park it rather than fail,
        -- so the fold advances and the record-materialization path drains it.
        if defer_if_endpoint_absent(db, crm_id, object_type, source_id, attr, typed_ref, true) then return true end
        link_internal(db, crm_id, object, relation, object_type, source_id, attr, typed_ref)
        return true
    end)
end

function M.unlink(db: Executor, crm_id: string, object_type: string, source_id: string, attr: string, ref: unknown)
    return protected(function()
        local object = object_for(db, crm_id, object_type)
        local relation = object.relations[attr]
        if not relation then fail(errors.INVALID, "unknown CRM relation: " .. tostring(object_type) .. "." .. tostring(attr)) end
        local typed_ref = validate_ref(relation, ref)
        if defer_if_endpoint_absent(db, crm_id, object_type, source_id, attr, typed_ref, false) then return true end
        unlink_internal(db, crm_id, relation, source_id, typed_ref)
        return true
    end)
end

local FILTER_OPERATORS = { eq = true, neq = true, lt = true, lte = true, gt = true, gte = true, contains = true, in_list = true, is_null = true }

local function filter_sql(schema: Schema, object: ObjectSchema, filters: { Filter }?, params: SqlParams): { string }
    local clauses: { string } = {}
    for _, filter in ipairs(type(filters) == "table" and filters or {}) do
        if type(filter) ~= "table" or not FILTER_OPERATORS[filter.op] then fail(errors.INVALID, "unsupported CRM filter operator") end
        local field = object.fields[filter.attr]
        if not field then fail(errors.INVALID, "unknown or non-scalar CRM filter field: " .. tostring(filter.attr)) end
        local column, op = field.column_name, filter.op
        if op == "is_null" then
            clauses[#clauses + 1] = column .. (filter.value == false and " IS NOT NULL" or " IS NULL")
        elseif op == "in_list" then
            if type(filter.value) ~= "table" then fail(errors.INVALID, "in_list requires an array value") end
            if #filter.value == 0 then clauses[#clauses + 1] = "1 = 0"
            else
                local slots = {}
                for key, value in pairs(filter.value) do
                    if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > #filter.value or value == nil then
                        fail(errors.INVALID, "in_list requires a dense array of non-null values")
                    end
                end
                for _, value in ipairs(filter.value) do
                    params[#params + 1] = encode_value(field, value)
                    slots[#slots + 1] = cast_placeholder(schema, field, #params)
                end
                clauses[#clauses + 1] = column .. " IN (" .. table.concat(slots, ", ") .. ")"
            end
        else
            if filter.value == nil then fail(errors.INVALID, op .. " requires a non-null value") end
            params[#params + 1] = encode_value(field, filter.value)
            local slot = cast_placeholder(schema, field, #params)
            if op == "contains" then
                if field.data_type ~= "text" and field.data_type ~= "email" and field.data_type ~= "phone" and field.data_type ~= "url" and field.data_type ~= "select" then
                    fail(errors.INVALID, "contains is only valid for textual CRM fields")
                end
                clauses[#clauses + 1] = column .. (schema.dialect == "postgres" and " ILIKE " or " LIKE ") .. slot
                params[#params] = "%" .. tostring(filter.value or "") .. "%"
            else
                local operators = { eq = "=", neq = "<>", lt = "<", lte = "<=", gt = ">", gte = ">=" }
                clauses[#clauses + 1] = column .. " " .. operators[op] .. " " .. slot
            end
        end
    end
    return clauses
end

function M.list(db: Executor, crm_id: string, object_type: string, options: unknown)
    return protected(function()
        local object, schema = object_for(db, crm_id, object_type)
        local list_options: ListOptions = type(options) == "table" and options :: ListOptions or {}
        local params = { crm_id }
        local clauses = { "crm_id = $1" }
        for _, clause in ipairs(filter_sql(schema, object, list_options.filters, params)) do clauses[#clauses + 1] = clause end
        if type(list_options.search) == "string" and list_options.search ~= "" then
            if schema.dialect == "postgres" then
                local searchable = false
                for _, field in pairs(object.fields) do if field.searchable then searchable = true; break end end
                if not searchable then fail(errors.INVALID, "search is not configured for CRM object: " .. object_type) end
                -- Every token matches as a PREFIX ("intelli" finds Intellibuild),
                -- never only as a whole lexeme: a seller types the start of a
                -- name, not its dictionary form, and plainto_tsquery demanded
                -- the whole token. Tokens are stripped to what a tsquery treats
                -- as plain text so nothing a caller types can carry operators;
                -- a search that leaves no tokens matches nothing rather than
                -- everything.
                local terms = {}
                for token in list_options.search:gmatch("%S+") do
                    local clean = token:gsub("[&|!():*'\\<>]", "")
                    if clean ~= "" then terms[#terms + 1] = clean .. ":*" end
                end
                if #terms == 0 then
                    clauses[#clauses + 1] = "FALSE"
                else
                    params[#params + 1] = table.concat(terms, " & ")
                    clauses[#clauses + 1] = "search_document @@ to_tsquery('simple', $" .. tostring(#params) .. ")"
                end
            elseif object.fts_table then
                local terms = {}
                for token in list_options.search:gmatch("%S+") do
                    terms[#terms + 1] = '"' .. token:gsub('"', '""') .. '"*'
                end
                params[#params + 1] = table.concat(terms, " AND ")
                local search_slot = "$" .. tostring(#params)
                params[#params + 1] = crm_id
                clauses[#clauses + 1] = "record_id IN (SELECT record_id FROM " .. object.fts_table .. " WHERE "
                    .. object.fts_table .. " MATCH " .. search_slot .. " AND crm_id = $" .. tostring(#params) .. ")"
            else fail(errors.INVALID, "search is not configured for CRM object: " .. object_type) end
        end
        local sort: Sort = type(list_options.sort) == "table" and list_options.sort or {}
        local sort_column = "updated_at"
        if sort.attr and sort.attr ~= "updated_at" and sort.attr ~= "created_at" and sort.attr ~= "record_id" then
            local field = object.fields[sort.attr]
            if not field then fail(errors.INVALID, "unknown or non-scalar CRM sort field: " .. tostring(sort.attr)) end
            sort_column = field.column_name
        elseif sort.attr then sort_column = sort.attr end
        local direction = tostring(sort.dir or "desc"):lower()
        if direction ~= "asc" and direction ~= "desc" then fail(errors.INVALID, "CRM sort direction must be asc or desc") end
        local where = table.concat(clauses, " AND ")
        local total_row = query(db, "SELECT COUNT(*) AS total FROM " .. object.table_name .. " WHERE " .. where, params)[1]
        local limit = math.max(1, math.min(tonumber(list_options.limit) or 50, 500))
        local offset = math.max(0, tonumber(list_options.offset) or 0)
        local page_params = {}
        for index, value in ipairs(params) do page_params[index] = value end
        page_params[#page_params + 1] = limit
        page_params[#page_params + 1] = offset
        local rows = query(db, "SELECT * FROM " .. object.table_name .. " WHERE " .. where .. " ORDER BY "
            .. "(" .. sort_column .. " IS NULL) ASC, " .. sort_column .. " " .. direction:upper()
            .. ", record_id ASC LIMIT $" .. tostring(#page_params - 1)
            .. " OFFSET $" .. tostring(#page_params), page_params)
        local records = {}
        for _, row in ipairs(rows) do records[#records + 1] = hydrate(object, row) end
        return { rows = records, total = tonumber(total_row and total_row.total) or 0, limit = limit, offset = offset }
    end)
end

local function delete_record(db: Executor, schema: Schema, object: ObjectSchema, crm_id: string, record_id: string)
    if schema.dialect == "sqlite" and object.fts_table then
        execute(db, "DELETE FROM " .. object.fts_table .. " WHERE crm_id = $1 AND record_id = $2", { crm_id, record_id })
    end
    execute(db, "DELETE FROM " .. object.table_name .. " WHERE crm_id = $1 AND record_id = $2", { crm_id, record_id })
end

local function relation_descriptors(schema: Schema): { Relation }
    local out: { Relation } = {}
    for _, object in pairs(schema.objects) do
        for _, attr in ipairs(object.relation_order) do out[#out + 1] = object.relations[attr] end
    end
    table.sort(out, function(left, right) return left.relation_table < right.relation_table end)
    return out
end

function M.related_many(db: Executor, crm_id: string, record_ids: unknown)
    return protected(function()
        local schema = load_schema(db, crm_id)
        local result: { [string]: RelationGroup } = {}
        local ids = {}
        local seen = {}
        for _, raw_id in ipairs(type(record_ids) == "table" and record_ids or {}) do
            local record_id = tostring(raw_id or "")
            if record_id ~= "" and not seen[record_id] then
                seen[record_id] = true
                ids[#ids + 1] = record_id
                result[record_id] = { outgoing = {}, incoming = {} }
            end
        end
        if #ids == 0 then return result end
        local params = { crm_id }
        local slots = {}
        for _, record_id in ipairs(ids) do
            params[#params + 1] = record_id
            slots[#slots + 1] = "$" .. tostring(#params)
        end
        local id_set = "(" .. table.concat(slots, ", ") .. ")"
        for _, relation in ipairs(relation_descriptors(schema)) do
            for _, row in ipairs(query(db, "SELECT source_id, target_kind, target_type, target_id, ordinal, updated_at FROM "
                .. relation.relation_table .. " WHERE crm_id = $1 AND source_id IN " .. id_set
                .. " ORDER BY source_id, ordinal", params)) do
                local source_id = stored_string(row.source_id, "relation source_id")
                local group = result[source_id]
                if not group then fail(errors.INTERNAL, "relation source was not requested") end
                group.outgoing[#group.outgoing + 1] = {
                    attr = relation.attr,
                    source = { kind = "record", type = relation.object_type, id = source_id },
                    target = {
                        kind = stored_string(row.target_kind, "relation target_kind"),
                        type = stored_string(row.target_type, "relation target_type"),
                        id = stored_string(row.target_id, "relation target_id"),
                    },
                    ordinal = tonumber(row.ordinal), updated_at = row.updated_at,
                }
            end
            for _, row in ipairs(query(db, "SELECT source_id, target_id, ordinal, updated_at FROM " .. relation.relation_table
                .. " WHERE crm_id = $1 AND target_kind = 'record' AND target_id IN " .. id_set
                .. " ORDER BY target_id, source_id, ordinal", params)) do
                local target_id = stored_string(row.target_id, "relation target_id")
                local group = result[target_id]
                if not group then fail(errors.INTERNAL, "relation target was not requested") end
                group.incoming[#group.incoming + 1] = {
                    attr = relation.attr,
                    source = {
                        kind = "record",
                        type = relation.object_type,
                        id = stored_string(row.source_id, "relation source_id"),
                    },
                    target = { kind = "record", type = relation.target_type, id = target_id },
                    ordinal = tonumber(row.ordinal), updated_at = row.updated_at,
                }
            end
        end
        return result
    end)
end

-- The physical tables one relation hop travels through, in a stable order. A
-- reader that must join across "everything this record is connected to" asks the
-- schema which tables hold those edges rather than composing a table name of its
-- own, and joins against them instead of materializing the neighbour list into a
-- parameter per neighbour.
function M.relation_tables(db: Executor, crm_id: string): (unknown?, error?)
    return protected(function()
        local out: { string } = {}
        local seen: { [string]: boolean } = {}
        for _, relation in ipairs(relation_descriptors(load_schema(db, crm_id))) do
            if not seen[relation.relation_table] then
                seen[relation.relation_table] = true
                out[#out + 1] = relation.relation_table
            end
        end
        return out
    end)
end

function M.related(db: Executor, crm_id: string, record_id: string)
    local groups, err = M.related_many(db, crm_id, { record_id })
    if err then return nil, err end
    if type(groups) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "invalid related record response" }) end
    return (groups :: { [string]: RelationGroup })[record_id] or { outgoing = {}, incoming = {} }, nil
end

-- The object types the applied schema gives a pipeline. Pipeline ownership is
-- what makes an object type the activity-timeline anchor, so the set is read
-- from the declaration catalog, never from a vocabulary constant.
function M.pipeline_object_types(db: Executor, crm_id: string): ({ [string]: boolean }?, error?)
    local rows, err = db:query(
        "SELECT definition FROM kickside_crm_schema_declaration WHERE crm_id = $1 AND kind = 'pipeline'",
        { crm_id })
    if err then return nil, err end
    local out: { [string]: boolean } = {}
    for _, row in ipairs(type(rows) == "table" and rows :: SqlRows or {}) do
        local definition, decode_err = json.decode(tostring(row.definition))
        if decode_err then return nil, errors.new({ kind = errors.INTERNAL, message = "invalid pipeline definition: " .. tostring(decode_err) }) end
        if type(definition) == "table" then
            local object_type = (definition :: UnknownMap).object_type
            if type(object_type) == "string" and object_type ~= "" then out[object_type :: string] = true end
        end
    end
    return out, nil
end

-- The activity identity index: a row answers to its source external id, its
-- correlation key, every identity a convergence absorbed, and its own id.
-- Returns every held row the given identities answer to, distinct and in
-- convergence precedence: external and correlation identities first so a
-- delivery naming a new activity id still converges onto the surviving row,
-- then the alias index, then the direct id lookup for callers that hold the
-- surviving id itself. Every row in the list is the same real event; the first
-- is the one that survives.
function M.held_activities(db: Executor, crm_id: string, activity_id: unknown,
    external_id: unknown, correlation_key: unknown): ({ string }?, error?)
    local identities: { string } = {}
    local lookups: { { string } } = {}
    local function add(column: string?, value: unknown)
        if type(value) ~= "string" or value == "" then return end
        identities[#identities + 1] = value :: string
        if column then lookups[#lookups + 1] = { column :: string, value :: string } end
    end
    local own = type(activity_id) == "string" and activity_id ~= "" and activity_id :: string or nil
    if own then identities[#identities + 1] = own end
    add("external_id", external_id)
    add("correlation_key", correlation_key)
    local held: { string } = {}
    local seen: { [string]: boolean } = {}
    local function collect(query: string, key: string): error?
        local rows, err = db:query(query, { crm_id, key })
        if err then return err end
        if type(rows) == "table" and type(rows[1]) == "table" then
            local found = tostring((rows[1] :: SqlRow).activity_id)
            if not seen[found] then
                seen[found] = true
                held[#held + 1] = found
            end
        end
        return nil
    end
    for _, lookup in ipairs(lookups) do
        local err = collect("SELECT activity_id FROM kickside_crm_activity WHERE crm_id = $1 AND "
            .. lookup[1] .. " = $2", lookup[2])
        if err then return nil, err end
    end
    for _, identity in ipairs(identities) do
        local err = collect("SELECT a.activity_id FROM kickside_crm_activity_alias a"
            .. " JOIN kickside_crm_activity r ON r.crm_id = a.crm_id AND r.activity_id = a.activity_id"
            .. " WHERE a.crm_id = $1 AND a.alias = $2", identity)
        if err then return nil, err end
    end
    if own then
        local err = collect("SELECT activity_id FROM kickside_crm_activity WHERE crm_id = $1 AND activity_id = $2", own)
        if err then return nil, err end
    end
    return held, nil
end

-- The surviving row the given identities answer to, or nil when no held row answers.
function M.locate_activity(db: Executor, crm_id: string, activity_id: unknown,
    external_id: unknown, correlation_key: unknown): (string?, error?)
    local held, err = M.held_activities(db, crm_id, activity_id, external_id, correlation_key)
    if err then return nil, err end
    return (held :: { string })[1], nil
end

function M.cleanup_record(db: Executor, crm_id: string, object_type: string, record_id: string)
    return protected(function()
        local object, schema = object_for(db, crm_id, object_type)
        for _, relation in ipairs(relation_descriptors(schema)) do
            execute(db, "DELETE FROM " .. relation.relation_table
                .. " WHERE crm_id = $1 AND (source_id = $2 OR (target_kind = 'record' AND target_id = $2))", { crm_id, record_id })
        end
        delete_record(db, schema, object, crm_id, record_id)
        execute(db, "DELETE FROM kickside_crm_record_locator WHERE crm_id = $1 AND record_id = $2", { crm_id, record_id })
        return true
    end)
end

M.delete = M.cleanup_record

function M.merge(db: Executor, crm_id: string, object_type: string, winner_id: string, loser_id: string, at: string)
    return protected(function()
        if winner_id == loser_id then fail(errors.INVALID, "winner and loser must differ") end
        if type(at) ~= "string" or at == "" then fail(errors.INVALID, "merge timestamp is required") end
        local object, schema = object_for(db, crm_id, object_type)
        local winner = query(db, "SELECT * FROM " .. object.table_name
            .. " WHERE crm_id = $1 AND record_id = $2", { crm_id, winner_id })[1]
        local loser = query(db, "SELECT * FROM " .. object.table_name
            .. " WHERE crm_id = $1 AND record_id = $2", { crm_id, loser_id })[1]
        if not winner or not loser then fail(errors.NOT_FOUND, "merge record not found") end

        local assignments = { "updated_at = $1" }
        local params = { at }
        for _, attr in ipairs(object.field_order) do
            local field = object.fields[attr]
            if not field then fail(errors.INVALID, "unknown CRM scalar field: " .. tostring(attr)) end
            if winner[field.column_name] == nil and loser[field.column_name] ~= nil then
                local value_sql = {}
                append_value(params, value_sql, schema, field, loser[field.column_name])
                assignments[#assignments + 1] = field.column_name .. " = " .. value_sql[1]
            end
        end
        params[#params + 1] = crm_id
        local crm_slot = "$" .. tostring(#params)
        params[#params + 1] = winner_id
        local winner_slot = "$" .. tostring(#params)
        execute(db, "UPDATE " .. object.table_name .. " SET " .. table.concat(assignments, ", ")
            .. " WHERE crm_id = " .. crm_slot .. " AND record_id = " .. winner_slot, params)

        for _, relation in ipairs(relation_descriptors(schema)) do
            execute(db, "DELETE FROM " .. relation.relation_table
                .. " WHERE crm_id = $1 AND source_id = $2 AND target_kind = 'record'"
                .. " AND (target_id = $2 OR target_id = $3)",
                { crm_id, winner_id, loser_id })

            local existing = relation_rows(db, crm_id, relation, winner_id)
            local seen = {}
            local ordinal = 0
            for _, row in ipairs(existing) do
                local key = tostring(row.target_kind) .. "\0" .. tostring(row.target_type)
                    .. "\0" .. tostring(row.target_id)
                seen[key] = true
                ordinal = math.max(ordinal, tonumber(row.ordinal) or 0)
            end

            for _, row in ipairs(relation_rows(db, crm_id, relation, loser_id)) do
                local target_id = stored_string(row.target_id, "relation target_id")
                local target_kind = stored_string(row.target_kind, "relation target_kind")
                local target_type = stored_string(row.target_type, "relation target_type")
                if target_kind == "record" and target_id == loser_id then
                    target_id = winner_id
                end
                local self_edge = target_kind == "record" and target_id == winner_id
                local key = target_kind .. "\0" .. target_type
                    .. "\0" .. tostring(target_id)
                local has_capacity = relation.cardinality == "many" or ordinal == 0
                if not self_edge and not seen[key] and has_capacity then
                    ordinal = relation.cardinality == "one" and 1 or ordinal + 1
                    insert_relation(db, crm_id, relation, winner_id, {
                        kind = target_kind,
                        type = target_type,
                        id = target_id,
                    }, ordinal, at)
                    seen[key] = true
                end
            end
            execute(db, "DELETE FROM " .. relation.relation_table
                .. " WHERE crm_id = $1 AND source_id = $2", { crm_id, loser_id })

            local incoming = query(db, "SELECT source_id, target_type, ordinal FROM "
                .. relation.relation_table
                .. " WHERE crm_id = $1 AND target_kind = 'record' AND target_id = $2",
                { crm_id, loser_id })
            for _, row in ipairs(incoming) do
                local source_id = stored_string(row.source_id, "relation source_id")
                local target_type = stored_string(row.target_type, "relation target_type")
                local incoming_ordinal = tonumber(row.ordinal)
                if not incoming_ordinal then fail(errors.INTERNAL, "invalid relation ordinal") end
                execute(db, "DELETE FROM " .. relation.relation_table
                    .. " WHERE crm_id = $1 AND source_id = $2 AND ordinal = $3",
                    { crm_id, source_id, incoming_ordinal })
                if source_id ~= winner_id then
                    local duplicate = query(db, "SELECT 1 AS present FROM "
                        .. relation.relation_table
                        .. " WHERE crm_id = $1 AND source_id = $2 AND target_kind = 'record'"
                        .. " AND target_type = $3 AND target_id = $4 LIMIT 1",
                        { crm_id, source_id, target_type, winner_id })[1]
                    if not duplicate then
                        insert_relation(db, crm_id, relation, source_id, {
                            kind = "record",
                            type = target_type,
                            id = winner_id,
                        }, incoming_ordinal, at)
                    end
                end
            end
        end

        delete_record(db, schema, object, crm_id, loser_id)
        execute(db, "DELETE FROM kickside_crm_record_locator"
            .. " WHERE crm_id = $1 AND record_id = $2", { crm_id, loser_id })
        execute(db, "UPDATE kickside_crm_record_locator SET updated_at = $1"
            .. " WHERE crm_id = $2 AND record_id = $3", { at, crm_id, winner_id })
        if schema.dialect == "sqlite" then
            rebuild_sqlite_fts(db, crm_id, object, winner_id)
        end
        return true
    end)
end

function M.destroy_crm(db: sql.DB, crm_id: string)
    return protected(function()
        local tx, begin_err = db:begin()
        if begin_err then raise(errors.wrap(begin_err, "failed to begin CRM teardown transaction")) end
        local ok, result = pcall(function()
        local schema = load_schema(tx, crm_id)
        for _, relation in ipairs(relation_descriptors(schema)) do
            execute(tx, "DROP TABLE IF EXISTS " .. relation.relation_table)
        end
        for _, object in pairs(schema.objects) do
            if object.fts_table then execute(tx, "DROP TABLE IF EXISTS " .. object.fts_table) end
            execute(tx, "DROP TABLE IF EXISTS " .. object.table_name)
        end
        for _, table_name in ipairs({
            "kickside_crm_merge_resolution", "kickside_crm_merge_decision",
            "kickside_crm_alias_secret", "kickside_crm_alias_reservation", "kickside_crm_alias",
            "kickside_crm_pending_relation",
            "kickside_crm_ref", "kickside_crm_activity_alias",
            "kickside_crm_activity", "kickside_crm_collection_membership", "kickside_crm_sink_receipt",
            "kickside_crm_write_origin", "kickside_crm_record_locator",
            "kickside_crm_schema_declaration", "kickside_crm_schema_attribute",
            "kickside_crm_schema_object", "kickside_crm_schema_apply", "kickside_crm_schema_revision",
        }) do
            execute(tx, "DELETE FROM " .. table_name .. " WHERE crm_id = $1", { crm_id })
        end
        return true
        end)
        if not ok then tx:rollback(); error(result, 0) end
        local _, commit_err = tx:commit()
        if commit_err then tx:rollback(); raise(errors.wrap(commit_err, "failed to commit CRM teardown transaction")) end
        return result
    end)
end

return M
