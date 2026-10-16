-- POST /workspace/crm/{id}/apply -- append typed crm.* command-events to the CRM
-- thread through the single write path. Body: { commands: [{ type, body }, ...] }.
local http = require("http")
local api_access = require("api_access")
local json = require("json")
local writer = require("writer")

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

function M.apply()
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

    local ok, err = writer.append(crm_id, body.commands or {})
    if not ok then
        write(res, http.STATUS.BAD_REQUEST, { success = false, error = tostring(err) })
        return
    end
    res:write_json({ success = true })
end

return M
