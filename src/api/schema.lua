local http = require("http")
local json = require("json")
local api_access = require("api_access")
local mutation = require("mutation")
local schema = require("schema")
local writer = require("writer")

local M = {}

local function write(res, status, body)
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
    local current, err = schema.load(crm_id)
    if not current then
        write(res, http.STATUS.BAD_REQUEST, { success = false, code = "schema_read_failed", error = tostring(err) })
        return
    end
    res:write_json({ success = true, revision = current.revision, declaration = current.declaration })
end

function M.apply()
    local res, req = http.response(), http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    local status, body = api_access.require_actor()
    if status then write(res, status, body); return end
    status, body = api_access.require_schema_admin()
    if status then write(res, status, body); return end
    local crm_id = tostring(req:param("id") or "")
    status, body = api_access.require_write(crm_id)
    if status then write(res, status, body); return end
    local input, decode_err = json.decode(tostring(req:body() or ""))
    if decode_err or type(input) ~= "table" or type(input.declaration) ~= "table" then
        write(res, http.STATUS.BAD_REQUEST, { success = false, code = "invalid_schema_request", error = "declaration is required" })
        return
    end
    local _, checkpoint_err = writer.catch_up_read_model(crm_id)
    if checkpoint_err then
        write(res, http.STATUS.CONFLICT, {
            success = false,
            code = "schema_projection_lag",
            error = "CRM schema change requires a current read model: " .. tostring(checkpoint_err),
        })
        return
    end
    local result, err = mutation.apply(crm_id, input.declaration, input.expected_revision)
    if not result then
        if errors.is(err, errors.CONFLICT) then
            write(res, http.STATUS.CONFLICT, { success = false, code = "schema_revision_conflict", error = tostring(err) })
        else
            write(res, http.STATUS.BAD_REQUEST, { success = false, code = "schema_apply_failed", error = tostring(err) })
        end
        return
    end
    local current, load_err = schema.load(crm_id)
    if not current then
        write(res, http.STATUS.INTERNAL_ERROR, { success = false, code = "schema_read_failed", error = tostring(load_err) })
        return
    end
    res:write_json({ success = true, changed = result.changed, revision = current.revision,
        source_hash = result.source_hash, declaration = current.declaration })
end

return M
