-- Public, access-checked CRM read surface.
local component = require("component")
local internal = require("reader_internal")

local M = {}

local function trim(v: unknown): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

function M.require_access(crm_id: string, access: integer): (boolean?, error?)
    if trim(crm_id) == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id required" }) end
    local _, err = component.validate_access(crm_id, access)
    if err then return nil, errors.wrap(err, "crm access denied") end
    return true, nil
end

local function read_access_error(crm_id: string): error?
    local _, err = M.require_access(crm_id, component.ACCESS.READ)
    return err
end

function M.list_records(crm_id: string, object_type: string, opts: unknown): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_list_records(crm_id, object_type, opts)
end

function M.count_records(crm_id: string, object_type: string): (number?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_count_records(crm_id, object_type)
end

function M.get_record(crm_id: string, record_id: string): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_get_record(crm_id, record_id)
end

function M.records_by_ids(crm_id: string, ids: unknown): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_records_by_ids(crm_id, ids)
end

function M.exists(crm_id: string, record_id: string, object_type: string?): (boolean?, error?)
    local access_err = read_access_error(crm_id)
    if access_err then return nil, access_err end
    local value, err = internal.internal_exists(crm_id, record_id, object_type)
    if value == nil then return nil, err end
    return value == true, err
end

function M.related(crm_id: string, record_id: string): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_related(crm_id, record_id)
end

function M.board(crm_id: string, collection_id: string, opts: unknown): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_board(crm_id, collection_id, opts)
end

function M.merge_reviews(crm_id: string, opts: unknown): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_merge_reviews(crm_id, opts)
end

function M.merge_resolution(crm_id: string, resolution_id: string): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_merge_resolution(crm_id, resolution_id)
end

-- timeline returns one newest-first page and the cursor of the following page.
function M.timeline(crm_id: string, record_id: string?, limit: number?, cursor: string?): (unknown?, error?, string?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_timeline(crm_id, record_id, limit, cursor)
end

function M.references(crm_id: string, from_ref: string, include_inactive: boolean?, limit: number?, offset: number?): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_references(crm_id, from_ref, include_inactive, limit, offset)
end

function M.inbound_references(crm_id: string, to_ref: string, include_inactive: boolean?, limit: number?, offset: number?): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_inbound_references(crm_id, to_ref, include_inactive, limit, offset)
end

function M.attributes(crm_id: string, object_type: string?): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_attributes(crm_id, object_type)
end

function M.views(crm_id: string, object_type: string?): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_views(crm_id, object_type)
end

function M.objects(crm_id: string): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_objects(crm_id)
end

function M.pipelines(crm_id: string): (unknown?, error?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_pipelines(crm_id)
end

function M.bootstrap(crm_id: string): (unknown?, error?)
    local _, rerr = M.require_access(crm_id, component.ACCESS.READ)
    if rerr then return nil, rerr end
    return internal.internal_bootstrap(crm_id)
end

-- query reads one projection; a timeline read also returns its next_cursor.
function M.query(crm_id: string, req: unknown): (unknown?, error?, string?)
    local err = read_access_error(crm_id)
    if err then return nil, err end
    return internal.internal_query(crm_id, req)
end

return M
