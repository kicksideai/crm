local create_service = require("create_service")
local api_access = require("api_access")

local M = {}

type Args = { bootstrap_crm_id: unknown?, resolve_bootstrap: unknown? }

function M.run(args: unknown): (unknown?, string?)
    if type(args) == "table" and (args :: Args).resolve_bootstrap == true then
        local crm_id, status, body = api_access.resolve_bootstrap_crm_id(nil)
        return { crm_id = crm_id, status = status, body = body }, nil
    end
    if type(args) == "table" and type((args :: Args).bootstrap_crm_id) == "string" then
        return api_access.bootstrap_payload((args :: Args).bootstrap_crm_id)
    end
    return create_service.create(args)
end

return M
