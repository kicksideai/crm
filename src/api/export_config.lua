-- GET /workspace/crm/{id}/config/export -- returns the deterministic declaration-shaped
-- portable schema artifact. Round-trips with POST /config/import.
local http = require("http")
local api_access = require("api_access")
local schema = require("schema")

local M = {}

function M.export()
    local res, req = http.response(), http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    local status, body = api_access.require_actor()
    if status then res:set_status(status); res:write_json(body); return end
    local crm_id = tostring(req:param("id") or "")
    local denied, denied_body = api_access.require_read(crm_id)
    if denied then res:set_status(denied); res:write_json(denied_body); return end
    local artifact, err = schema.export_config(crm_id, {})
    if not artifact then
        res:set_status(http.STATUS.BAD_REQUEST); res:write_json({ success = false, error = tostring(err) }); return
    end
    res:write_json({ success = true, config = artifact })
end

return M
