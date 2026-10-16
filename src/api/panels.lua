-- GET /workspace/crm/{id}/panels/{object_type} -- record-panel declarations
-- available to this caller for one CRM object type.
local http = require("http")
local api_access = require("api_access")
local record_panels = require("record_panels")

local M = {}

local function write(res: http.Response, status: number, body: unknown)
    res:set_status(status)
    res:write_json(body)
end

function M.get()
    local res, req = http.response(), http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local status, body = api_access.require_actor()
    if status then write(res, status, body); return end

    local crm_id = tostring(req:param("id") or "")
    status, body = api_access.require_read(crm_id)
    if status then write(res, status, body); return end

    local object_type = tostring(req:param("object_type") or "")
    local panels, err = record_panels.for_object(object_type)
    if not panels then
        write(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "CRM record-panel discovery failed: " .. tostring(err) })
        return
    end
    res:write_json({ success = true, panels = panels })
end

return M
