-- POST /workspace/crm -- the HTTP adapter over the sole CRM create service.

local http = require("http")
local json = require("json")
local api_access = require("api_access")
local create_service = require("create_service")

local M = {}

type CreateResult = {
    id: string,
    component_id: string,
    title: string,
    revision: unknown?,
    replayed: boolean,
}

local function write(res: http.Response, status: number, body: unknown)
    res:set_status(status)
    res:write_json(body)
end

function M.create()
    local res, req = http.response(), http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local status, body = api_access.require_actor()
    if status then write(res, status, body); return end
    status, body = api_access.require_schema_admin()
    if status then write(res, status, body); return end

    local input, decode_err = json.decode(tostring(req:body() or ""))
    if decode_err or type(input) ~= "table" then
        write(res, http.STATUS.BAD_REQUEST, {
            success = false,
            code = "invalid_crm_create_request",
            error = "JSON request body is required",
        })
        return
    end

    local created, create_err = create_service.create(input)
    if not created then
        write(res, http.STATUS.BAD_REQUEST, {
            success = false,
            code = "crm_create_failed",
            error = tostring(create_err),
        })
        return
    end

    local result = created :: CreateResult
    write(res, result.replayed == true and http.STATUS.OK or http.STATUS.CREATED, {
        success = true,
        id = result.id,
        component_id = result.component_id,
        title = result.title,
        revision = result.revision,
        replayed = result.replayed == true,
    })
end

return M
