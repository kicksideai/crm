-- POST /workspace/crm/{id}/query -- read the projections generically. Body:
--   { kind: "records", object_type, filters?, sort? }
--   { kind: "record",  record_id }
--   { kind: "board",   collection_id }
--   { kind: "timeline", record_id?, limit?, cursor? } -- response carries next_cursor
-- One endpoint backs every UI layout (table/board/timeline) over the read model.
local http = require("http")
local api_access = require("api_access")
local http_errors = require("http_errors")
local json = require("json")
local reader = require("reader")

local M = {}
local QUERY_KINDS = {
    records = true,
    count = true,
    record = true,
    records_by_ids = true,
    board = true,
    timeline = true,
    related = true,
    references = true,
    inbound_references = true,
    merge_reviews = true,
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

function M.query()
    local res, req, berr = begin()
    if berr then return nil, berr end
    if not res or not req then return end

    local body = json.decode(tostring(req:body() or ""))
    if type(body) ~= "table" then
        write(res, http.STATUS.BAD_REQUEST, { success = false, error = "invalid json" })
        return
    end

    local crm_id = tostring(req:param("id") or "")
    local status, denied = api_access.require_read(crm_id)
    if status then
        write(res, status, denied)
        return
    end

    local kind = type(body.kind) == "string" and body.kind or ""
    if not QUERY_KINDS[kind] then
        write(res, http.STATUS.BAD_REQUEST, { success = false, error = "unknown CRM query kind: " .. kind })
        return
    end
    local data, err, next_cursor = reader.query(crm_id, body)
    if err then
        write(res, http_errors.classify(err), { success = false, error = tostring(err) })
        return
    end
    res:write_json({ success = true, kind = kind, data = data, next_cursor = next_cursor })
end

return M
