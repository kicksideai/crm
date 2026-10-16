-- The sole CRM workspace creation authority. A request owns one actor-scoped,
-- deterministic component id, applies the declared physical schema first, and only
-- then publishes the component + thread through the canonical threads contract.
-- Reads and writes never call this service and never repair incomplete creation.

local component = require("component")
local contract = require("contract")
local hash = require("hash")
local registry = require("registry")
local security = require("security")
local schema = require("schema")
local mutation = require("mutation")
local types = require("types")

local M = {}

type UnknownMap = { [string]: unknown }
type CreateRequest = {
    idempotency_key: string,
    title: string,
    parent_id: string,
}
type RegistryEntry = {
    meta: unknown?,
}
type RegistryMeta = { config: unknown? }
type ComponentRow = {
    impl_id: unknown?,
    meta: unknown?,
    parent_id: unknown?,
}
type ComponentMeta = { title: unknown? }
type SchemaState = { revision: unknown? }
type CreateResult = {
    id: string,
    component_id: string,
    title: string,
    revision: unknown?,
    replayed: boolean,
}
type ThreadsClient = {
    create: (self: ThreadsClient, request: UnknownMap) -> (unknown?, unknown?),
}

local ID_NAMESPACE = "kickside.crm.create.v1"

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function actor_id(): (string?, error?)
    local actor = security.actor()
    if not actor then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "authentication required" }) end
    local ok, id = pcall(function() return actor:id() end)
    if not ok or type(id) ~= "string" or id == "" then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "authenticated actor has no stable id" })
    end
    return id, nil
end

local function request_key(value: unknown): (string?, error?)
    if type(value) ~= "string" then return nil, errors.new({ kind = errors.INVALID, message = "idempotency_key is required" }) end
    local key = trim(value)
    if key == "" then return nil, errors.new({ kind = errors.INVALID, message = "idempotency_key must not be blank" }) end
    if #key > 255 then return nil, errors.new({ kind = errors.INVALID, message = "idempotency_key must be at most 255 characters" }) end
    return key, nil
end

local function normalized_request(input: UnknownMap): (CreateRequest?, error?)
    local key, key_err = request_key(input.idempotency_key)
    if not key then return nil, key_err end
    local title = trim(input.title)
    if title == "" then title = "CRM" end
    local parent_id = trim(input.parent_id)
    return {
        idempotency_key = key,
        title = title,
        parent_id = parent_id,
    }, nil
end

local function uuid_from_digest(digest: unknown): (string?, error?)
    local hex = tostring(digest or ""):gsub("[^a-fA-F0-9]", ""):lower()
    if #hex < 32 then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM idempotency hash unavailable" }) end
    hex = hex:sub(1, 32)
    -- UUIDv5-shaped, RFC 4122 variant. The content is SHA-256-derived rather than
    -- UUID SHA-1 so the platform's existing hash primitive remains the only one used.
    hex = hex:sub(1, 12) .. "5" .. hex:sub(14, 16) .. "8" .. hex:sub(18)
    return table.concat({
        hex:sub(1, 8),
        hex:sub(9, 12),
        hex:sub(13, 16),
        hex:sub(17, 20),
        hex:sub(21, 32),
    }, "-"), nil
end

function M.component_id(idempotency_key: unknown): (string?, error?)
    local key, key_err = request_key(idempotency_key)
    if not key then return nil, key_err end
    local owner, actor_err = actor_id()
    if not owner then return nil, actor_err end
    local digest, digest_err = hash.sha256(ID_NAMESPACE .. "\0" .. owner .. "\0" .. key)
    if digest_err then return nil, errors.wrap(digest_err, "CRM idempotency hash failed") end
    return uuid_from_digest(digest)
end

local function declaration(): (UnknownMap?, error?)
    local entry = registry.get(types.CONFIG)
    local meta: unknown = nil
    if type(entry) == "table" then
        local typed_entry = entry :: RegistryEntry
        meta = typed_entry.meta
    end
    local config = type(meta) == "table" and (meta :: RegistryMeta).config or nil
    if type(config) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = types.CONFIG .. " has no declaration" }) end
    return config :: UnknownMap, nil
end

local function open_threads(): (ThreadsClient?, error?)
    local def, def_err = contract.get(types.THREADS)
    if def_err then return nil, errors.wrap(def_err, "threads contract unavailable") end
    if not def then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "threads contract unavailable" }) end
    local instance, open_err = def:with_actor(security.actor()):with_scope(security.scope()):open()
    if open_err then return nil, errors.wrap(open_err, "threads open failed") end
    if not instance then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "threads open returned no client" }) end
    if type(instance) ~= "table" and type(instance) ~= "userdata" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "threads open returned an invalid client" })
    end
    return instance :: ThreadsClient, nil
end

local function existing(component_id: string, request: CreateRequest): (CreateResult?, error?)
    local rows, query_err = component.query({
        component_ids = { component_id },
        include = { meta = true, placement = true },
        limit = 1,
    })
    if query_err then return nil, errors.wrap(query_err, "CRM idempotency lookup failed") end
    local row: ComponentRow? = nil
    if type(rows) == "table" and type(rows[1]) == "table" then row = rows[1] :: ComponentRow end
    if type(row) ~= "table" then return nil, nil end
    if tostring(row.impl_id or "") ~= types.CRM_IMPL then
        return nil, errors.new({ kind = errors.CONFLICT, message = "CRM idempotency key collides with another component" })
    end

    local meta: ComponentMeta = type(row.meta) == "table" and row.meta :: ComponentMeta or {}
    local current_title = trim(meta.title)
    if current_title == "" then current_title = "CRM" end
    local current_parent = trim(row.parent_id)
    if current_title ~= request.title or current_parent ~= request.parent_id then
        return nil, errors.new({ kind = errors.CONFLICT, message = "CRM idempotency key was already used with a different request" })
    end

    local current, schema_err = schema.load(component_id)
    if schema_err then return nil, errors.wrap(schema_err, "CRM creation is incomplete for " .. component_id) end
    return {
        id = component_id,
        component_id = component_id,
        title = current_title,
        revision = (current :: SchemaState).revision,
        replayed = true,
    }, nil
end

local function rollback_schema(component_id: string, create_err: error): (nil, error)
    local _, rollback_err = mutation.rollback_provision(component_id)
    if rollback_err then
        return nil, errors.new({ kind = errors.INTERNAL, message = "CRM thread create failed: " .. tostring(create_err)
            .. "; schema rollback failed: " .. tostring(rollback_err) })
    end
    return nil, errors.wrap(create_err, "CRM thread create failed")
end

function M.create(input: unknown): (CreateResult?, error?)
    local raw_input: UnknownMap = type(input) == "table" and input :: UnknownMap or {}
    local request, request_err = normalized_request(raw_input)
    if not request then return nil, request_err end
    local component_id, id_err = M.component_id(request.idempotency_key)
    if not component_id then return nil, id_err end

    local prior, prior_err = existing(component_id, request)
    if prior_err then return nil, prior_err end
    if prior then return prior, nil end

    local config, config_err = declaration()
    if not config then return nil, config_err end
    local applied, schema_err = mutation.provision(component_id, config)
    if schema_err then return nil, errors.wrap(schema_err, "CRM schema provision failed") end
    local threads, threads_err = open_threads()
    if not threads then return rollback_schema(component_id, threads_err) end

    local title = request.title
    local parent_id = request.parent_id
    local created, create_err = threads:create({
        id = component_id,
        impl_id = types.CRM_IMPL,
        thread_class = types.THREAD_CLASS,
        parent_id = parent_id ~= "" and parent_id or nil,
        title = title,
        icon = "tabler:address-book",
    })
    if not created then
        -- A concurrent retry may have won after our initial lookup. It is the same
        -- actor-scoped identity, so returning the now-complete component is the
        -- idempotency protocol, not a repair path.
        local winner, winner_err = existing(component_id, request)
        if winner then return winner, nil end
        if winner_err then
            return rollback_schema(component_id, errors.new({ kind = errors.INTERNAL,
                message = tostring(create_err) .. "; idempotency recheck failed: " .. tostring(winner_err) }))
        end
        return rollback_schema(component_id, create_err :: error)
    end

    return {
        id = component_id,
        component_id = component_id,
        title = title,
        revision = type(applied) == "table" and (applied :: SchemaState).revision or nil,
        replayed = false,
    }, nil
end

return M
