-- CRM type predicates and runtime value accessors.
local M = require("consts")
local registry = require("registry")

M._registry = registry

local ATTR_SET = {}
for _, t in ipairs(M.ATTR_TYPES) do ATTR_SET[t] = true end

function M.is_attr_type(t: unknown): boolean
    return type(t) == "string" and ATTR_SET[t] == true
end

-- Canonical RFC3339 UTC timestamp used by CRM-owned records and events.
function M.now(): string
    return os.date("!%Y-%m-%dT%H:%M:%SZ") :: string
end

-- Canonical reference strings for CRM-owned identities inside kickside_crm_ref.
function M.record_ref(record_id: string): string
    return M.REF_PREFIX.record .. record_id
end

function M.activity_ref(activity_id: string): string
    return M.REF_PREFIX.activity .. activity_id
end

-- The activity identity a reference names, or nil when the reference names anything else.
function M.activity_ref_tail(ref: unknown): string?
    if type(ref) ~= "string" then return nil end
    local prefix = M.REF_PREFIX.activity
    if (ref :: string):sub(1, #prefix) ~= prefix then return nil end
    local tail = (ref :: string):sub(#prefix + 1)
    if tail == "" then return nil end
    return tail
end

-- The read can fail three ways and they are not the same failure. A refused or
-- otherwise broken read means this caller may not open the entry -- the module's
-- own config-read policy is not in their scope -- and it is a permission problem
-- an operator fixes by wiring the module's security scope, so the engine's own
-- error is carried out verbatim rather than replaced by a guess. NOT_FOUND means
-- there is no entry, and an entry carrying no db_id means it is there and says
-- nothing: both are the one configuration problem and answer as one. Reporting a
-- missing entry as a read failure sends an operator to fix a scope that is
-- already correct.
function M.db_id(): string
    local reg = M._registry or registry
    local entry: unknown, err: unknown = reg.get(M.DB_CONFIG)
    if err ~= nil then
        if errors.is(err, errors.NOT_FOUND) then error("CRM database is not configured", 2) end
        error("CRM database configuration could not be read: " .. tostring(err), 2)
    end
    if type(entry) ~= "table" then error("CRM database is not configured", 2) end
    local meta: unknown = (entry :: { meta: unknown? }).meta
    if type(meta) ~= "table" then error("CRM database is not configured", 2) end
    local db_id: unknown = (meta :: { db_id: unknown? }).db_id
    if type(db_id) ~= "string" or db_id == "" then error("CRM database is not configured", 2) end
    return db_id
end

return M
