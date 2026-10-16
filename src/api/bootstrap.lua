-- GET /workspace/crm -- resolve the caller's accessible CRM component and return
-- the normal bootstrap payload plus crm_id. Callers may pass ?crm_id=<component_id>
-- to select an explicit CRM; the selected component is validated for READ before
-- bootstrap. When no crm_id is supplied and more than one readable CRM exists, the
-- route rejects ambiguity with:
--   409 { success=false, error="multiple crm components available",
--         code="multiple_crm_components",
--         candidates=[{ crm_id, component_id, label }] }
-- Candidate rows are produced by access-filtered component.query READ results.
local http = require("http")
local api_access = require("api_access")

local M = {}

local function write(res: http.Response, status: number, body: unknown)
    res:set_status(status)
    res:write_json(body)
end

local function trim(v: unknown): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
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

local function requested_crm_id(req: http.Request): string
    local id = trim(req:query("crm_id"))
    if id ~= "" then return id end
    return trim(req:param("crm_id"))
end

function M.get()
    local res, req, err = begin()
    if err then return nil, err end
    if not res or not req then return end

    local crm_id, status, body = api_access.resolve_bootstrap_crm_id(requested_crm_id(req))
    if not crm_id then
        write(res, status or http.STATUS.INTERNAL_ERROR, body or { success = false, error = "crm component resolve failed" })
        return
    end

    local payload, berr = api_access.bootstrap_payload(crm_id)
    if not payload then
        write(res, http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(berr) })
        return
    end
    res:write_json(payload)
end

return M
