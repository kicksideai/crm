-- Physical-schema operations. Callers authorize before invoking; the
-- expected_revision check runs inside the storage transaction.

local schema = require("schema")
local sql = require("sql")
local storage = require("storage")
local types = require("types")

local M = {}

type UnknownMap = { [string]: unknown }
type DynamicTable = { [string | number]: unknown }
type Executor = sql.DB | sql.Transaction
type ObjectDefinition = {
    id: unknown?,
    type: unknown?,
}
type AttributeDefinition = {
    id: unknown?,
    attr: unknown?,
    object_type: unknown?,
    config: unknown?,
}
type PipelineDefinition = {
    collection_id: unknown?,
    object_type: unknown?,
}
type ViewDefinition = {
    view_id: unknown?,
    object_type: unknown?,
}
type SchemaDeclaration = {
    objects: {ObjectDefinition},
    attributes: {AttributeDefinition},
    pipelines: {PipelineDefinition},
    views: {ViewDefinition},
}
type AppliedSchema = {
    revision: unknown?,
    source_hash: unknown?,
    declaration: SchemaDeclaration,
}
type EnsureObjectRequest = {
    object: ObjectDefinition,
    attributes: {AttributeDefinition}?,
    pipelines: {PipelineDefinition}?,
    views: {ViewDefinition}?,
}
type DbOperation = (sql.DB, string) -> (unknown?, error?)

local function trim(value: unknown): string
    return type(value) == "string" and value:match("^%s*(.-)%s*$") or ""
end

local function clone(value: unknown): unknown
    if type(value) ~= "table" then return value end
    local out: DynamicTable = {}
    for key, item in pairs(value :: DynamicTable) do out[key] = clone(item) end
    return out
end

local function with_db(operation: DbOperation): (unknown?, error?)
    local db, db_err = sql.get(types.db_id())
    if db_err then return nil, db_err end
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "CRM database unavailable" }) end
    local db_type, type_err = db:type()
    if type_err then db:release(); return nil, type_err end
    local dialect = db_type == sql.type.SQLITE and "sqlite" or db_type == sql.type.POSTGRES and "postgres" or nil
    if not dialect then db:release(); return nil, errors.new({ kind = errors.INTERNAL, message = "unsupported CRM database type: " .. tostring(db_type) }) end
    local result, err = operation(db, dialect)
    db:release()
    return result, err
end

function M.apply(crm_id: string, declaration: unknown, expected_revision: unknown): (unknown?, error?)
    local result, err = with_db(function(db: sql.DB, dialect: string)
        return storage.ensure(db, dialect, crm_id, declaration, expected_revision)
    end)
    if err then return nil, err end
    if type(result) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema change returned an invalid result" }) end
    return result :: UnknownMap, nil
end

function M.provision(crm_id: string, declaration: unknown): (unknown?, error?)
    local result, err = with_db(function(db: sql.DB, dialect: string)
        return storage.ensure(db, dialect, crm_id, declaration)
    end)
    if err then return nil, err end
    if type(result) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema provision returned an invalid result" }) end
    return result :: UnknownMap, nil
end

function M.rollback_provision(crm_id: string): (boolean?, error?)
    if trim(crm_id) == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    local result, operation_err = with_db(function(db: sql.DB, _dialect: string)
        local destroyed, err = storage.destroy_crm(db, crm_id)
        if not destroyed then return nil, err end
        return true, nil
    end)
    if operation_err then return nil, operation_err end
    return result == true, nil
end

function M.import_config(crm_id: string, artifact: unknown, expected_revision: unknown): (unknown?, error?)
    local declaration, declaration_err = schema.import_declaration(artifact)
    if not declaration then return nil, declaration_err end
    return with_db(function(db: sql.DB, dialect: string)
        local loaded, load_err = storage.load_schema(db, crm_id)
        if load_err then return nil, load_err end
        local applied = loaded :: AppliedSchema
        local unchanged, match_err = schema.matches_declaration(artifact, applied.declaration)
        if match_err then return nil, match_err end
        if unchanged then
            if expected_revision ~= nil and tostring(expected_revision) ~= tostring(applied.revision) then
                return nil, errors.new({ kind = errors.CONFLICT, message = "CRM schema revision conflict" })
            end
            return { changed = false, revision = applied.revision, source_hash = applied.source_hash }, nil
        end
        return storage.ensure(db, dialect, crm_id, declaration, expected_revision)
    end)
end

local function object_identity(object: ObjectDefinition): string
    return trim(object.id) ~= "" and trim(object.id) or trim(object.type)
end

local function field_identity(field: AttributeDefinition): string
    local config: unknown = field.config
    local stable_id: unknown = nil
    if type(config) == "table" then stable_id = (config :: UnknownMap).stable_id end
    return trim(field.id) ~= "" and trim(field.id)
        or trim(stable_id) ~= "" and trim(stable_id)
        or trim(field.attr)
end

local function merge_owned_rows(
    existing: {UnknownMap},
    wanted: {UnknownMap}?,
    object_type: string,
    identity: (UnknownMap) -> string
): (boolean?, error?)
    local rows: {UnknownMap} = type(wanted) == "table" and wanted or {}
    for row_index = 1, #rows do
        local row = rows[row_index] :: UnknownMap
        if trim(row.object_type) ~= object_type then
            return nil, errors.new({ kind = errors.INVALID, message = "schema contribution may only declare rows for object type " .. object_type })
        end
        local row_id = identity(row)
        if row_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "schema contribution stable identity is required" }) end
        local replaced = false
        for index, current in ipairs(existing) do
            if identity(current) == row_id then
                existing[index], replaced = clone(row) :: UnknownMap, true
                break
            end
        end
        if not replaced then existing[#existing + 1] = clone(row) :: UnknownMap end
    end
    return true, nil
end

function M.ensure_object_type(crm_id: string, definition: unknown, expected_revision: unknown): (unknown?, error?)
    if type(definition) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "object definition is required" }) end
    local request = definition :: UnknownMap
    if type(request.object) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "object definition is required" }) end
    local typed = request :: EnsureObjectRequest
    local result, operation_err = with_db(function(db: sql.DB, dialect: string)
        local loaded, err = storage.load_schema(db, crm_id)
        if err then return nil, err end
        if type(loaded) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema is unavailable" }) end
        local applied = loaded :: AppliedSchema
        if type(applied.declaration) ~= "table"
            or type(applied.declaration.objects) ~= "table"
            or type(applied.declaration.attributes) ~= "table" then
            return nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema declaration is invalid" })
        end
        if expected_revision ~= nil and tostring(applied.revision) ~= tostring(expected_revision) then
            return nil, errors.new({ kind = errors.CONFLICT, message = "CRM schema revision conflict" })
        end
        local declaration = clone(applied.declaration) :: SchemaDeclaration
        local wanted_object = clone(typed.object) :: ObjectDefinition
        local object_id = object_identity(typed.object)
        if object_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "object stable identity is required" }) end
        local object_type = trim(wanted_object.type)
        if object_type == "" then return nil, errors.new({ kind = errors.INVALID, message = "object type is required" }) end
        local replaced = false
        for index, object in ipairs(declaration.objects) do
            if object_identity(object) == object_id then declaration.objects[index], replaced = wanted_object, true; break end
        end
        if not replaced then declaration.objects[#declaration.objects + 1] = wanted_object end
        for _, wanted in ipairs(type(typed.attributes) == "table" and typed.attributes or {}) do
            if trim(wanted.object_type) ~= object_type then
                return nil, errors.new({ kind = errors.INVALID, message = "schema contribution may only declare fields for object type " .. object_type })
            end
            local field_id, field_replaced = field_identity(wanted), false
            for index, field in ipairs(declaration.attributes) do
                if field.object_type == wanted_object.type and field_identity(field) == field_id then
                    declaration.attributes[index], field_replaced = clone(wanted), true
                    break
                end
            end
            if not field_replaced then declaration.attributes[#declaration.attributes + 1] = clone(wanted) end
        end
        declaration.pipelines = type(declaration.pipelines) == "table" and declaration.pipelines or {}
        declaration.views = type(declaration.views) == "table" and declaration.views or {}
        local pipelines_ok, pipelines_err = merge_owned_rows(
            declaration.pipelines :: {UnknownMap},
            typed.pipelines :: {UnknownMap}?,
            object_type,
            function(row: UnknownMap): string return trim(row.collection_id) end
        )
        if not pipelines_ok then return nil, pipelines_err end
        local views_ok, views_err = merge_owned_rows(
            declaration.views :: {UnknownMap},
            typed.views :: {UnknownMap}?,
            object_type,
            function(row: UnknownMap): string return trim(row.view_id) end
        )
        if not views_ok then return nil, views_err end
        return storage.ensure(db, dialect, crm_id, declaration)
    end)
    if operation_err then return nil, operation_err end
    if type(result) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema object change returned an invalid result" })
    end
    return result :: UnknownMap, nil
end

return M
