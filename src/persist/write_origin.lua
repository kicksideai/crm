-- CRM-owned lookup over the external_write.succeeded projection. The CRM thread
-- is the ledger; this table is only its component-owned read model used at the
-- inbound policy boundary to recognize provider echoes.
local registry = require("registry")
local json = require("json")
local hash = require("hash")
local sql = require("sql")
local types = require("types")

local M = {}

type UnknownMap = { [string]: unknown }
type DynamicTable = { [string | number]: unknown }
type Executor = sql.DB | sql.Transaction
type ConfigEntry = { meta: unknown? }
type ConfigMeta = { retention_days: unknown? }
type OriginRow = {
    provider: unknown?,
    connection_id: unknown?,
    object_type: unknown?,
    target_ref: unknown?,
    attr: unknown?,
    value_hash: unknown?,
    write_ref: unknown?,
    completed_at: unknown?,
}
type LookupResult = {
    found: boolean,
    provider: unknown?,
    connection_id: unknown?,
    object_type: unknown?,
    target_ref: unknown?,
    attr: unknown?,
    value_hash: unknown?,
    write_ref: unknown?,
    completed_at: unknown?,
}

local CONFIG = "kickside.crm.persist:write_origin_config"
local DEFAULT_RETENTION_DAYS = 30

local function trim(v: unknown): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

-- Canonical JSON used by crm.external_write.* value_hashes. Scalars use the
-- runtime JSON encoder; arrays retain index order; objects sort stringified keys
-- recursively without whitespace. Empty Lua tables intentionally encode as [].
local function stable_encode(value: unknown): string
    local t = type(value)
    if t == "nil" or t == "string" or t == "number" or t == "boolean" then
        return json.encode(value)
    end
    if t ~= "table" then return json.encode(tostring(value)) end
    local source = value :: DynamicTable
    local is_array = true
    local max = 0
    for k in pairs(source) do
        if type(k) ~= "number" or k < 1 or math.floor(k) ~= k then is_array = false; break end
        if k > max then max = k end
    end
    if is_array then
        local parts = {}
        for i = 1, max do parts[#parts + 1] = stable_encode(source[i]) end
        return "[" .. table.concat(parts, ",") .. "]"
    end
    local keys = {}
    for k in pairs(source) do keys[#keys + 1] = tostring(k) end
    table.sort(keys)
    local parts = {}
    for _, k in ipairs(keys) do
        parts[#parts + 1] = json.encode(k) .. ":" .. stable_encode(source[k])
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

function M.value_hash(value: unknown): string
    return hash.sha256(stable_encode(value))
end

local function retention_days(): number
    local entry, err = registry.get(CONFIG)
    if not err and type(entry) == "table" then
        local raw_meta = (entry :: ConfigEntry).meta
        local meta: ConfigMeta = type(raw_meta) == "table" and raw_meta :: ConfigMeta or {}
        local configured = tonumber(meta.retention_days)
        if configured and configured >= 0 then return math.floor(configured) end
    end
    return DEFAULT_RETENTION_DAYS
end

local function cutoff(): string
    return tostring(os.date("!%Y-%m-%dT%H:%M:%SZ", os.time() - (retention_days() * 86400)))
end

function M.lookup(
    crm_id: string,
    provider: string,
    connection_id: string,
    object_type: string,
    target_ref: string,
    attr: string
): (LookupResult?, string?)
    local cid = trim(crm_id)
    local p = trim(provider)
    local connection = trim(connection_id)
    local object = trim(object_type)
    local ref = trim(target_ref)
    local field = trim(attr)
    if cid == "" then return nil, "crm_id is required" end
    if p == "" then return nil, "provider is required" end
    if connection == "" then return nil, "connection_id is required" end
    if object == "" then return nil, "object_type is required" end
    if ref == "" then return nil, "target_ref is required" end
    if field == "" then return nil, "attr is required" end

    local db, derr = sql.get(types.db_id())
    if derr or not db then return nil, tostring(derr or "crm: app:db unavailable") end
    local rows, qerr = db:query([[
        SELECT provider, connection_id, object_type, target_ref, attr, value_hash, write_ref, completed_at
        FROM kickside_crm_write_origin
        WHERE crm_id = $1
          AND provider = $2
          AND connection_id = $3
          AND object_type = $4
          AND target_ref = $5
          AND attr = $6
          AND completed_at >= $7
        LIMIT 1
    ]], { cid, p, connection, object, ref, field, cutoff() })
    db:release()
    if qerr then return nil, tostring(qerr) end
    local row: OriginRow? = nil
    if type(rows) == "table" and type(rows[1]) == "table" then row = rows[1] :: OriginRow end
    if not row then return { found = false }, nil end
    return {
        found = true,
        provider = row.provider,
        connection_id = row.connection_id,
        object_type = row.object_type,
        target_ref = row.target_ref,
        attr = row.attr,
        value_hash = row.value_hash,
        write_ref = row.write_ref,
        completed_at = row.completed_at,
    }, nil
end

function M.matches(
    crm_id: string,
    provider: string,
    connection_id: string,
    object_type: string,
    target_ref: string,
    attr: string,
    value: unknown
): (LookupResult?, string?)
    local row, err = M.lookup(crm_id, provider, connection_id, object_type, target_ref, attr)
    if err or not row or row.found ~= true then return nil, err end
    if trim(row.value_hash) == M.value_hash(value) then return row, nil end
    return nil, nil
end

return M
