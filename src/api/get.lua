-- GET /workspace/crm/{id} -- bootstrap the shell: the object schema (attributes) and
-- saved views for this workspace CRM, so the UI renders every object/view generically
-- without per-object code.
local http = require("http")
local api_access = require("api_access")

local M = {}

local function write(res: http.Response, status: number, body: unknown)
    res:set_status(status)
    res:write_json(body)
end

local function begin(): (http.Response?, http.Request?, string?)
    local res, req = http.response(), http.request()
    if not res or not req then return nil, nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    local status, body = api_access.require_actor()
    if status then
        write(res, status, body)
        return nil, nil, nil
    end
    return res, req, nil
end

function M.get()
    local res, req, berr = begin()
    if berr then return nil, berr end
    if not res or not req then return end

    local crm_id = tostring(req:param("id") or "")
    local status, body = api_access.require_read(crm_id)
    if status then
        write(res, status, body)
        return
    end

    local payload, err = api_access.bootstrap_payload(crm_id)
    if not payload then
        write(res, http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(err) })
        return
    end
    res:write_json(payload)
end

return M
