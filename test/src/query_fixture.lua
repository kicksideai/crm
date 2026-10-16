local json = require("json")
local M = {
    CONTENT = { JSON = "application/json" },
    STATUS = { BAD_REQUEST = 400, INTERNAL_ERROR = 500 },
}
local body = {}
local response = {}
local called = nil
local read_error = nil
function M.reset(input, err)
    body = input
    response = { status = 200 }
    called = nil
    read_error = err
end
function M.request()
    return {
        param = function(_, key) return key == "id" and "northwind-crm" or nil end,
        body = function() return json.encode(body) end,
    }
end
function M.response()
    return {
        set_content_type = function(_, value) response.content_type = value end,
        set_status = function(_, value) response.status = value end,
        write_json = function(_, value) response.body = value end,
    }
end
function M.require_actor() return nil, nil end
function M.require_read(_) return nil, nil end
function M.query(crm_id, input)
    called = { crm_id = crm_id, input = input }
    if read_error then return nil, read_error end
    if input.kind == "timeline" then
        return { { activity_id = "activity:2", occurred_at = "2026-10-14T11:00:00Z" } }, nil, "next-timeline-page"
    end
    return { { from_ref = "crm:person:northwind", to_ref = "crm:company:northwind", active = true } }, nil
end
function M.result() return response, called end
return M
