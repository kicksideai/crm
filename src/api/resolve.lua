-- POST /workspace/crm/{id}/resolve -- exact-tier find-or-create over the CRM identity
-- layer. Body: { object_type, match: { alias_type, alias_value }, values? }.
local http = require("http")
local api_access = require("api_access")
local http_errors = require("http_errors")
local json = require("json")
local resolver = require("resolver")

local M = {}

-- HTTP JSON is untyped at the boundary. Keep the resolver's canonical typed
-- contract while making the decode-to-library handoff explicit.
type ResolveBody = {
    object_type: string?,
    record_id: string?,
    match: { alias_type: string?, alias_value: string | number? }?,
    values: { [string]: string | number | boolean | { string } }?,
}

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

function M.resolve()
    local res, req, berr = begin()
    if berr then return nil, berr end
    if not res or not req then return end

    local body = json.decode(tostring(req:body() or ""))
    if type(body) ~= "table" then
        write(res, http.STATUS.BAD_REQUEST, { success = false, error = "invalid json" })
        return
    end

    local crm_id = tostring(req:param("id") or "")
    local status, denied = api_access.require_write(crm_id)
    if status then
        write(res, status, denied)
        return
    end

    local out, err = resolver.resolve(crm_id, body :: ResolveBody)
    if err then
        write(res, http_errors.classify(err), { success = false, error = tostring(err) })
        return
    end
    res:write_json({ success = true, data = out })
end

return M
