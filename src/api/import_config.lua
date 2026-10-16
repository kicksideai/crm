local http = require("http")
local json = require("json")
local api_access = require("api_access")
local mutation = require("mutation")
local writer = require("writer")

local M = {}

function M.apply()
    local res, req = http.response(), http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    local status, body = api_access.require_actor()
    if status then res:set_status(status); res:write_json(body); return end
    status, body = api_access.require_schema_admin()
    if status then res:set_status(status); res:write_json(body); return end
    local crm_id = tostring(req:param("id") or "")
    local denied, denied_body = api_access.require_write(crm_id)
    if denied then res:set_status(denied); res:write_json(denied_body); return end
    local raw_body, body_err = req:body()
    if body_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(body_err) })
        return
    end
    local input, derr = json.decode(raw_body or "")
    if derr or type(input) ~= "table" or type(input.artifact) ~= "table" or input.expected_revision == nil then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "artifact and expected_revision are required" })
        return
    end
    local _, checkpoint_err = writer.catch_up_read_model(crm_id)
    if checkpoint_err then
        res:set_status(http.STATUS.CONFLICT)
        res:write_json({
            success = false,
            error = "CRM schema import requires a current read model: " .. tostring(checkpoint_err),
        })
        return
    end
    local result, err = mutation.import_config(crm_id, input.artifact, input.expected_revision)
    if not result then
        local status = errors.is(err, errors.CONFLICT) and http.STATUS.CONFLICT or http.STATUS.BAD_REQUEST
        res:set_status(status); res:write_json({ success = false, error = tostring(err) }); return
    end
    res:write_json({ success = true, result = {
        changed = result.changed == true,
        revision = result.revision,
        source_hash = result.source_hash,
    } })
end

return M
