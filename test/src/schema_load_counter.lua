-- Counts reads of the applied CRM schema catalog. A schema load starts with the
-- revision row, so each statement over kickside_crm_schema_revision is one load.
-- executor(db) wraps a handle a caller passes in; instrument(storage) routes the
-- handles that every function of the storage facade receives through the same
-- count, so loads made inside the facade are counted too.
local M = {}

type Executor = { [string]: unknown }

local CATALOG = "kickside_crm_schema_revision"
local loads = 0

local function counted(target: unknown): unknown
    local proxy = {}
    setmetatable(proxy, {
        __index = function(_: unknown, key: string): unknown
            local member = (target :: Executor)[key]
            if type(member) ~= "function" then return member end
            return function(_: unknown, ...: unknown): (unknown, unknown, unknown)
                local statement = ...
                if key == "query" and type(statement) == "string" and statement:find(CATALOG, 1, true) then
                    loads = loads + 1
                end
                local first, second, third = (member :: (unknown, ...unknown) -> (unknown, unknown, unknown))(target, ...)
                if key == "begin" and first ~= nil then return counted(first), second, third end
                return first, second, third
            end
        end,
    })
    return proxy
end

local function executor_like(value: unknown): boolean
    if type(value) ~= "userdata" and type(value) ~= "table" then return false end
    return type((value :: Executor).query) == "function"
end

function M.executor(target: unknown): unknown
    return counted(target)
end

function M.instrument(storage: { [string]: unknown })
    for name, member in pairs(storage) do
        if type(member) == "function" then
            local original = member :: (unknown, ...unknown) -> (unknown, unknown, unknown)
            storage[name] = function(first: unknown, ...: unknown): (unknown, unknown, unknown)
                if executor_like(first) then return original(counted(first), ...) end
                return original(first, ...)
            end
        end
    end
end

function M.reset()
    loads = 0
end

function M.count(): number
    return loads
end

return M
