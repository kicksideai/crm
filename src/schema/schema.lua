-- Access-checked schema catalog and portable configuration codec.
local hash = require("hash")
local storage = require("storage")
local component = require("component")
local sql = require("sql")
local types = require("types")

local M = {}

type UnknownMap = { [string]: unknown }
type DynamicTable = { [string | number]: unknown }
type Executor = sql.DB | sql.Transaction
type Row = { [string]: unknown }
type Declaration = {
    version: unknown?,
    objects: {Row},
    attributes: {Row},
    pipelines: {Row},
    views: {Row},
    policies: {Row},
    merge_config: UnknownMap?,
}
type ArtifactMetadata = {
    portableKey: unknown?,
    sourceHash: unknown?,
    revision: unknown?,
}
type ArtifactSpec = {
    version: unknown?,
    objectTypes: {Row},
    attributes: {Row},
    pipelines: {Row},
    views: {Row},
    policies: {Row},
    mergeConfig: unknown?,
}
type Artifact = {
    apiVersion: unknown?,
    kind: unknown?,
    metadata: ArtifactMetadata,
    spec: ArtifactSpec,
    serialized: unknown?,
}
type AppliedSchema = {
    revision: unknown?,
    declaration: Declaration,
}
type ExportOptions = { portable_key: unknown? }

local function trim(value: unknown): string
    return type(value) == "string" and value:match("^%s*(.-)%s*$") or ""
end

local function clone(value: unknown): unknown
    if type(value) ~= "table" then return value end
    local out: DynamicTable = {}
    for key, item in pairs(value :: DynamicTable) do out[key] = clone(item) end
    return out
end

local function stable(value: unknown): string
    local kind = type(value)
    if kind == "nil" then return "null" end
    if kind == "boolean" then return value and "true" or "false" end
    if kind == "number" then return tostring(value) end
    if kind == "string" then return '"' .. value:gsub("\\", "\\\\"):gsub('"', '\\"'):gsub("\n", "\\n"):gsub("\r", "\\r"):gsub("\t", "\\t") .. '"' end
    if kind ~= "table" then error("unsupported schema value: " .. kind) end
    local source = value :: DynamicTable
    local n, array = #source, #source > 0
    if array then for key in pairs(source) do if type(key) ~= "number" or key < 1 or key > n or key % 1 ~= 0 then array = false; break end end end
    local out = {}
    if array then for index = 1, n do out[index] = stable(source[index]) end; return "[" .. table.concat(out, ",") .. "]" end
    local keys = {}; for key in pairs(source) do keys[#keys + 1] = tostring(key) end; table.sort(keys)
    for _, key in ipairs(keys) do out[#out + 1] = stable(key) .. ":" .. stable(source[key]) end
    return "{" .. table.concat(out, ",") .. "}"
end

local function ordered(items: {Row}, key: (Row) -> string): {Row}
    local out: {Row} = {}; for _, item in ipairs(items) do out[#out + 1] = clone(item) :: Row end
    table.sort(out, function(left, right) return key(left) < key(right) end); return out
end

local function portable_declaration(declaration: Declaration): Declaration
    local objects = ordered(declaration.objects, function(row) return trim(row.id) ~= "" and trim(row.id) or trim(row.type) end)
    local attributes = ordered(declaration.attributes, function(row)
        return trim(row.object_type) .. "/" .. (trim(row.id) ~= "" and trim(row.id) or trim(row.attr))
    end)
    local pipelines = ordered(declaration.pipelines, function(row) return trim(row.collection_id) end)
    local views = ordered(declaration.views, function(row) return trim(row.view_id) end)
    local policies = ordered(declaration.policies, function(row) return trim(row.portableKey) ~= "" and trim(row.portableKey) or trim(row.key) end)
    for _, row in ipairs(objects) do row.portableKey = "object/" .. trim(row.type) end
    for _, row in ipairs(attributes) do row.portableKey = "attribute/" .. trim(row.object_type) .. "/" .. trim(row.attr) end
    for _, row in ipairs(pipelines) do row.portableKey = "pipeline/" .. trim(row.collection_id) end
    for _, row in ipairs(views) do row.portableKey = "view/" .. trim(row.view_id) end
    for _, row in ipairs(policies) do if trim(row.portableKey) == "" then row.portableKey = "policy/" .. trim(row.key) end end
    local cloned_merge = clone(declaration.merge_config or {})
    local merge_config: UnknownMap = {}
    if type(cloned_merge) == "table" then merge_config = cloned_merge :: UnknownMap end
    return { version = declaration.version, objects = objects, attributes = attributes, pipelines = pipelines,
        views = views, policies = policies, merge_config = merge_config }
end

local function config_spec(declaration: Declaration): ArtifactSpec
    local portable = portable_declaration(declaration)
    return {
        version = portable.version,
        objectTypes = portable.objects,
        attributes = portable.attributes,
        pipelines = portable.pipelines,
        views = portable.views,
        policies = portable.policies,
        mergeConfig = portable.merge_config,
    }
end

local function clean_portable(rows: {Row}): {Row}
    local out: {Row} = {}; for _, source in ipairs(rows) do local row = clone(source) :: Row; row.portableKey = nil; out[#out + 1] = row end; return out
end

local function artifact_without_hash(artifact: Artifact): Artifact
    local out = clone(artifact) :: Artifact; out.serialized = nil
    if type(out.metadata) == "table" then out.metadata.sourceHash = nil end
    return out
end

local function validate_artifact(value: unknown): (Artifact?, error?)
    if type(value) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "unsupported CRM config artifact" }) end
    local artifact = value :: UnknownMap
    if artifact.apiVersion ~= "kickside.crm/config.v1" or artifact.kind ~= "CRMConfig" then
        return nil, errors.new({ kind = errors.INVALID, message = "unsupported CRM config artifact" })
    end
    if type(artifact.metadata) ~= "table" or trim(artifact.metadata.portableKey) == "" or type(artifact.spec) ~= "table" then
        return nil, errors.new({ kind = errors.INVALID, message = "portable CRM config metadata and spec are required" })
    end
    for name, prefix in pairs({ objectTypes="object/", attributes="attribute/", pipelines="pipeline/", views="view/", policies="policy/" }) do
        if type(artifact.spec[name]) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "portable CRM config spec." .. name .. " is required" }) end
        for _, row in ipairs(artifact.spec[name]) do
            if type(row) ~= "table" or trim(row.portableKey):sub(1, #prefix) ~= prefix then return nil, errors.new({ kind = errors.INVALID, message = "invalid portable key in " .. name }) end
        end
    end
    local expected = "sha256:" .. tostring(hash.sha256(stable(artifact_without_hash(artifact))))
    if trim(artifact.metadata.sourceHash) ~= expected then return nil, errors.new({ kind = errors.INVALID, message = "CRM config sourceHash does not match artifact" }) end
    return artifact :: Artifact, nil
end

local function open_db(crm_id: string, access: integer): (sql.DB?, string?, error?)
    if trim(crm_id) == "" then return nil, nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    local _, access_err = component.validate_access(crm_id, access)
    if access_err then return nil, nil, errors.wrap(access_err, "crm access denied") end
    local db, db_err = sql.get(types.db_id())
    if db_err then return nil, nil, db_err end
    if not db then return nil, nil, errors.new({ kind = errors.UNAVAILABLE, message = "CRM database unavailable" }) end
    local db_type, type_err = db:type()
    if type_err then db:release(); return nil, nil, type_err end
    local dialect
    if db_type == sql.type.SQLITE then dialect = "sqlite"
    elseif db_type == sql.type.POSTGRES then dialect = "postgres"
    else db:release(); return nil, nil, errors.new({ kind = errors.INTERNAL, message = "unsupported CRM database type: " .. tostring(db_type) }) end
    return db, dialect, nil
end

local function close_with(db: Executor, value: unknown, err: error?): (unknown?, error?)
    db:release()
    return value, err
end

function M.load(crm_id: string): (unknown?, error?)
    local db, _, open_err = open_db(crm_id, component.ACCESS.READ)
    if not db then return nil, open_err end
    local loaded, err = storage.load_schema(db, crm_id)
    if err then return close_with(db, nil, err) end
    if type(loaded) ~= "table" then return close_with(db, nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema is unavailable" })) end
    return close_with(db, loaded :: UnknownMap, nil)
end

function M.export_config(crm_id: string, options: unknown): (unknown?, error?)
    local db, _, open_err = open_db(crm_id, component.ACCESS.READ)
    if not db then return nil, open_err end
    local loaded, err = storage.load_schema(db, crm_id)
    if err then return close_with(db, nil, err) end
    if type(loaded) ~= "table" then return close_with(db, nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema is unavailable" })) end
    local applied = loaded :: AppliedSchema
    local artifact: Artifact = {
        apiVersion = "kickside.crm/config.v1",
        kind = "CRMConfig",
        metadata = {
            portableKey = trim(type(options) == "table" and (options :: ExportOptions).portable_key or nil) ~= ""
                and trim((options :: ExportOptions).portable_key) or "crm/default",
            revision = applied.revision,
        },
        spec = config_spec(applied.declaration),
    }
    artifact.metadata.sourceHash = "sha256:" .. tostring(hash.sha256(stable(artifact)))
    artifact.serialized = stable(artifact)
    return close_with(db, artifact, nil)
end

function M.matches_declaration(value: unknown, declaration: unknown): (boolean?, error?)
    local artifact, err = validate_artifact(value)
    if not artifact then return nil, err end
    if type(declaration) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "CRM schema declaration is required" }) end
    return stable(artifact.spec) == stable(config_spec(declaration :: Declaration)), nil
end

-- seal stamps the canonical sourceHash and serialized form onto an artifact a
-- caller assembled or edited programmatically, sharing the exact encoding
-- validate_artifact checks. The caller owns the content; this only signs it.
function M.seal(value: unknown): (unknown?, error?)
    if type(value) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "artifact must be a table" }) end
    local artifact = clone(value) :: Artifact
    if type(artifact.metadata) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "artifact metadata is required" }) end
    artifact.serialized = nil
    artifact.metadata.sourceHash = nil
    artifact.metadata.sourceHash = "sha256:" .. tostring(hash.sha256(stable(artifact)))
    artifact.serialized = stable(artifact)
    return artifact, nil
end

-- spec.remove is the artifact's explicit-destruction list, mirrored verbatim
-- into the declaration the compiler validates: removals never happen by
-- omission, only by naming { objects = {...}, attributes = {{object_id,
-- field_id}} }. Exports never emit it -- it is an operation, not state -- so a
-- round-tripped artifact stays free of destructive intent.
local function import_remove(spec_remove: unknown): (unknown, error?)
    if spec_remove == nil then return {}, nil end
    if type(spec_remove) ~= "table" then return {}, errors.new({ kind = errors.INVALID, message = "spec.remove must be an object" }) end
    return clone(spec_remove), nil
end

function M.import_declaration(value: unknown): (unknown?, error?)
    local artifact, err = validate_artifact(value)
    if not artifact then return nil, err end
    local spec = artifact.spec
    local remove, remove_err = import_remove((spec :: DynamicTable).remove)
    if remove_err then return nil, remove_err end
    return {
        version = spec.version,
        objects = clean_portable(spec.objectTypes),
        attributes = clean_portable(spec.attributes),
        pipelines = clean_portable(spec.pipelines),
        views = clean_portable(spec.views),
        policies = clean_portable(spec.policies),
        merge_config = clone(spec.mergeConfig or {}),
        remove = remove,
    }, nil
end

return M
