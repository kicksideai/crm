-- Deletable contract implementation for CRM-owned persistence.
local ctx = require("ctx")
local storage = require("storage")
local types = require("types")

local function delete(): (any?, error?)
    local id = ctx.get("component_id")
    if id and id ~= "" then
        local db, derr = require("sql").get(types.db_id())
        if derr then return nil, derr end
        if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "CRM database unavailable" }) end
        local _, err = storage.destroy_crm(db, tostring(id))
        db:release()
        if err then return nil, err end
    end
    return { success = true }
end

return { delete = delete }
