local json = require("json")

local M = {
    CONTENT = { JSON = "application/json" },
    STATUS = { BAD_REQUEST = 400 },
}

local body = {}
local response = {}
local resolve_error = nil

function M.reset(input, err)
    body = input
    response = { status = 200 }
    resolve_error = err
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
function M.require_write(_) return nil, nil end

function M.resolve(crm_id, input)
    if resolve_error then return nil, resolve_error end
    return { crm_id = crm_id, record = { record_id = "contact:1", object_type = input.object_type } }, nil
end

function M.result() return response end

return M
