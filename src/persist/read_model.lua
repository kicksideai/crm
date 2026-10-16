-- CRM read model. Every record read routes through the typed persistence facade;
-- readers never open threads, advance projections, or construct physical identifiers.
local json = require("json")
local storage = require("storage")
local types = require("types")
local sql = require("sql")

local M = {}

type UnknownMap = { [string]: unknown }
type Executor = sql.DB | sql.Transaction
type SchemaState = {
    revision: unknown,
    declaration: UnknownMap?,
}
type Record = {
    record_id: unknown,
    values: UnknownMap?,
    associations: UnknownMap?,
}
type RecordPage = {
    rows: { Record }?,
    total: unknown,
}
type Association = {
    attr: unknown,
    target: unknown,
}
type Related = {
    outgoing: { Association }?,
    incoming: { Association }?,
}
type Pipeline = {
    collection_id: unknown,
    stages: { unknown }?,
}
type Stage = {
    stage_id: unknown,
}
type BoardRow = {
    stage_id: unknown,
    record_id: unknown,
    position: unknown,
    stage_total: unknown,
    stage_row: unknown,
}
type TimelineRow = {
    payload: unknown,
    done: unknown,
}
type CountRow = {
    total: unknown,
}
type Lane = {
    records: { UnknownMap },
    total: number,
}
type ReviewPage = {
    rows: { UnknownMap },
    total: number,
    limit: number,
    offset: number,
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function open_db(): (sql.DB?, error?)
    local db, err = sql.get(types.db_id())
    if err then return nil, err end
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "CRM database unavailable" }) end
    return db, nil
end

local function decode(value: unknown): unknown
    if type(value) ~= "string" then return value end
    local decoded, err = json.decode(value)
    if err then return nil end
    return decoded
end

local function schema(db: Executor, crm_id: string): (SchemaState?, error?)
    local current, err = storage.load_schema(db, crm_id)
    if err then return nil, err end
    if type(current) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM schema storage returned a non-object state" }) end
    return current :: SchemaState, nil
end

local function declaration_list(current: SchemaState?, key: string): { UnknownMap }
    if not current or type(current.declaration) ~= "table" then return {} end
    local rows = current.declaration[key]
    if type(rows) ~= "table" then return {} end
    return rows :: { UnknownMap }
end

local function attach_associations(records: { Record }, groups: UnknownMap)
    for _, record in ipairs(records) do
        local record_id = tostring(record.record_id or "")
        local raw_related = groups[record_id]
        local related: Related = type(raw_related) == "table"
            and raw_related :: Related or { outgoing = {}, incoming = {} }
        record.associations = related :: UnknownMap
        local values: UnknownMap = type(record.values) == "table" and record.values or {}
        local by_attr: { [string]: { unknown } } = {}
        for _, edge in ipairs(type(related.outgoing) == "table" and related.outgoing or {}) do
            local attr = trim(edge.attr)
            local target = edge.target
            if attr ~= "" and type(target) == "table" then
                by_attr[attr] = by_attr[attr] or {}
                by_attr[attr][#by_attr[attr] + 1] = target
            end
        end
        for attr, references in pairs(by_attr) do values[attr] = references end
        record.values = values
    end
end

function M.internal_list_records(crm_id: string, object_type: string, opts: unknown): (RecordPage?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local result, list_err = storage.list(db, crm_id, object_type, opts)
    if not list_err and result then
        local page = result :: RecordPage
        local rows = type(page.rows) == "table" and page.rows or {}
        local ids: { unknown } = {}
        for _, record in ipairs(rows) do ids[#ids + 1] = record.record_id end
        local groups, related_err = storage.related_many(db, crm_id, ids)
        if related_err then db:release(); return nil, related_err end
        attach_associations(rows, type(groups) == "table" and groups :: UnknownMap or {})
    end
    db:release()
    if result == nil then return nil, list_err end
    if type(result) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM storage returned a non-object record page" }) end
    return result :: RecordPage, list_err
end

function M.internal_count_records(crm_id: string, object_type: string): (number?, error?)
    local page, err = M.internal_list_records(crm_id, object_type, { limit = 1, offset = 0 })
    if err then return nil, err end
    return tonumber(type(page) == "table" and (page :: RecordPage).total) or 0, nil
end

function M.internal_find_record_ids_by_value(crm_id: string, object_type: string, attr: string, value: unknown): ({ unknown }?, error?)
    local page, err = M.internal_list_records(crm_id, object_type, {
        filters = { { attr = attr, op = "eq", value = value } },
        sort = { attr = "record_id", dir = "asc" },
        limit = 500,
        offset = 0,
    })
    if err then return nil, err end
    local ids: { unknown } = {}
    local typed_page = type(page) == "table" and page :: RecordPage or nil
    for _, row in ipairs(typed_page and type(typed_page.rows) == "table" and typed_page.rows or {}) do
        ids[#ids + 1] = row.record_id
    end
    return ids, nil
end

function M.internal_get_record(crm_id: string, record_id: string): (Record?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local record, read_err = storage.get_any(db, crm_id, record_id)
    if not read_err and record then
        local groups, related_err = storage.related_many(db, crm_id, { record_id })
        if related_err then db:release(); return nil, related_err end
        attach_associations({ record :: Record }, type(groups) == "table" and groups :: UnknownMap or {})
    end
    db:release()
    if record == nil then return nil, read_err end
    if type(record) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM storage returned a non-object record" }) end
    return record :: Record, read_err
end

function M.internal_records_by_ids(crm_id: string, ids: unknown): ({ Record }?, error?)
    if type(ids) ~= "table" or #ids == 0 then return {}, nil end
    local db, err = open_db()
    if not db then return nil, err end
    local records, read_err = storage.get_many(db, crm_id, ids)
    if not read_err and records then
        local typed_records = records :: { Record }
        local record_ids: { unknown } = {}
        for _, record in ipairs(typed_records) do record_ids[#record_ids + 1] = record.record_id end
        local groups, related_err = storage.related_many(db, crm_id, record_ids)
        if related_err then db:release(); return nil, related_err end
        attach_associations(typed_records, type(groups) == "table" and groups :: UnknownMap or {})
    end
    db:release()
    if records == nil then return nil, read_err end
    if type(records) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM storage returned a non-array record set" }) end
    return records :: { Record }, read_err
end

function M.internal_exists(crm_id: string, record_id: string, object_type: string?): (boolean?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local exists, exists_err
    if trim(object_type) ~= "" then
        exists, exists_err = storage.exists(db, crm_id, object_type :: string, record_id)
    else
        local locator
        locator, exists_err = storage.locate(db, crm_id, record_id)
        exists = locator ~= nil
    end
    db:release()
    return exists == true, exists_err
end

function M.internal_related(crm_id: string, record_id: string): (unknown?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local rows, related_err = storage.related(db, crm_id, record_id)
    db:release()
    return rows, related_err
end

local function pipeline_for(current: SchemaState?, collection_id: string): Pipeline?
    for _, pipeline in ipairs(declaration_list(current, "pipelines")) do
        if trim(pipeline.collection_id) == collection_id then return pipeline :: Pipeline end
    end
    return nil
end

function M.internal_board(crm_id: string, collection_id: string, raw_opts: unknown): (unknown?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local current, schema_err = schema(db, crm_id)
    if schema_err then db:release(); return nil, schema_err end
    local pipeline = pipeline_for(current, collection_id)
    if not pipeline then db:release(); return nil, errors.new({ kind = errors.NOT_FOUND, message = "unknown CRM collection: " .. collection_id }) end
    local opts: UnknownMap = type(raw_opts) == "table" and raw_opts :: UnknownMap or {}
    local limit = math.max(1, math.min(math.floor(tonumber(opts.limit) or 50), 200))
    local offset = math.max(0, math.floor(tonumber(opts.offset) or 0))
    local rows, query_err = db:query([[
        SELECT stage_id, record_id, position,
               COUNT(*) OVER (PARTITION BY stage_id) AS stage_total,
               ROW_NUMBER() OVER (PARTITION BY stage_id ORDER BY position, record_id) AS stage_row
        FROM kickside_crm_collection_membership
        WHERE crm_id = $1 AND collection_id = $2
        ORDER BY stage_id, position, record_id
    ]], { crm_id, collection_id })
    db:release()
    if query_err then return nil, query_err end

    local lanes: { [string]: Lane } = {}
    for _, raw_stage in ipairs(type(pipeline.stages) == "table" and pipeline.stages or {}) do
        local stage_id = type(raw_stage) == "table" and trim((raw_stage :: Stage).stage_id) or trim(raw_stage)
        if stage_id ~= "" then lanes[stage_id] = { records = {}, total = 0 } end
    end
    for _, row in ipairs(type(rows) == "table" and rows :: { BoardRow } or {}) do
        local stage_id = trim(row.stage_id)
        local lane = lanes[stage_id]
        if not lane then return nil, errors.new({ kind = errors.INTERNAL, message = "membership references undeclared stage: " .. stage_id }) end
        lane.total = tonumber(row.stage_total) or lane.total
        local ordinal = tonumber(row.stage_row) or 0
        if ordinal > offset and ordinal <= offset + limit then
            lane.records[#lane.records + 1] = {
                record_id = row.record_id,
                position = tonumber(row.position) or 0,
            }
        end
    end
    return lanes, nil
end

-- One relation hop out of a record, as a subquery rather than a list of ids. A
-- company reaches hundreds of people and a per-neighbour parameter would bound
-- the chronology by how many connections the record happens to have; the join
-- bounds it by the schema instead. Both directions travel: the records this one
-- points at, and the records that point at it.
local function neighbor_cte(db: sql.DB, crm_id: string): (string?, error?)
    local tables, err = storage.relation_tables(db, crm_id)
    if err then return nil, err end
    local branches: { string } = {}
    for _, name in ipairs(type(tables) == "table" and tables :: { string } or {}) do
        branches[#branches + 1] = "SELECT target_id AS record_id FROM " .. name
            .. " WHERE crm_id = $1 AND source_id = $2 AND target_kind = 'record'"
        branches[#branches + 1] = "SELECT source_id AS record_id FROM " .. name
            .. " WHERE crm_id = $1 AND target_id = $2 AND target_kind = 'record'"
    end
    if #branches == 0 then return "", nil end
    return "WITH crm_timeline_neighbor AS (\n" .. table.concat(branches, "\nUNION\n") .. "\n)\n", nil
end

-- Timeline pages walk (occurred_at, activity_id) newest first. The cursor is the
-- key of the last row returned; next_cursor is absent on the final page.
local TIMELINE_CURSOR_SEPARATOR = "\31"

local function timeline_cursor(cursor: string?): (string?, string?, error?)
    local text = trim(cursor)
    if text == "" then return nil, nil, nil end
    local occurred_at, activity_id = text:match("^(.-)" .. TIMELINE_CURSOR_SEPARATOR .. "(.+)$")
    if type(occurred_at) ~= "string" or type(activity_id) ~= "string" then
        return nil, nil, errors.new({ kind = errors.INVALID, message = "cursor must be a next_cursor value from a previous timeline page" })
    end
    return occurred_at :: string, activity_id :: string, nil
end

function M.internal_timeline(crm_id: string, record_id: string?, limit: number?, cursor: string?): ({ TimelineRow }?, error?, string?)
    local after_occurred_at, after_activity_id, cursor_err = timeline_cursor(cursor)
    if cursor_err then return nil, cursor_err end
    local db, err = open_db()
    if not db then return nil, err end
    local bounded = math.max(1, math.min(math.floor(tonumber(limit) or 100), 500))
    local rows, query_err
    local columns = [[activity_id, record_id, participant_record_id, activity_type, occurred_at,
        due_at, done, source, external_id, correlation_key, direction, duration_sec, outcome,
        recording_url, has_transcript, payload]]
    local params: { unknown } = { crm_id }
    local scope = ""
    local cte = ""
    if trim(record_id) ~= "" then
        -- A record's timeline covers every activity referencing it: rows keyed on the
        -- record plus rows linked to it through an active reference edge (participant,
        -- deal_context, ...), plus the activity of the records it is connected to one
        -- relation hop out. The last of those is what makes a company's page answer
        -- "what has happened here" -- a call is logged against the person or the deal,
        -- and the company it belongs to is where the history is read. One pass over the
        -- activity table de-duplicates the overlap.
        local built, cte_err = neighbor_cte(db, crm_id)
        if cte_err then db:release(); return nil, cte_err end
        cte = type(built) == "string" and built :: string or ""
        local rolled_up = ""
        if cte ~= "" then
            rolled_up = [[
                OR record_id IN (SELECT record_id FROM crm_timeline_neighbor)
                OR participant_record_id IN (SELECT record_id FROM crm_timeline_neighbor)]]
        end
        params[#params + 1] = record_id
        params[#params + 1] = types.record_ref(record_id :: string)
        params[#params + 1] = types.REF_PREFIX.activity
        params[#params + 1] = true
        scope = [[ AND (record_id = $2 OR participant_record_id = $2
                OR EXISTS (
                    SELECT 1 FROM kickside_crm_ref
                    WHERE kickside_crm_ref.crm_id = kickside_crm_activity.crm_id
                      AND kickside_crm_ref.to_ref = $3
                      AND kickside_crm_ref.from_ref = $4 || kickside_crm_activity.activity_id
                      AND kickside_crm_ref.active = $5
                )]] .. rolled_up .. ")"
    end
    local after = ""
    if after_occurred_at then
        params[#params + 1] = after_occurred_at
        params[#params + 1] = after_activity_id
        after = " AND (occurred_at, activity_id) < ($" .. tostring(#params - 1) .. ", $" .. tostring(#params) .. ")"
    end
    params[#params + 1] = bounded + 1
    rows, query_err = db:query(cte .. "SELECT " .. columns .. [[
        FROM kickside_crm_activity
        WHERE crm_id = $1]] .. scope .. after .. [[
        ORDER BY occurred_at DESC, activity_id DESC LIMIT $]] .. tostring(#params), params)
    db:release()
    if query_err then return nil, query_err end
    if rows == nil then return {}, nil end
    if type(rows) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM SQL query returned a non-array timeline" }) end
    local page = rows :: { TimelineRow }
    local next_cursor: string? = nil
    if #page > bounded then
        page[#page] = nil
        local last = page[#page] :: UnknownMap
        next_cursor = tostring(last.occurred_at) .. TIMELINE_CURSOR_SEPARATOR .. tostring(last.activity_id)
    end
    for _, row in ipairs(page) do
        row.payload = decode(row.payload) or {}
        row.done = row.done == true or row.done == 1
        (row :: UnknownMap).has_transcript = (row :: UnknownMap).has_transcript == true or (row :: UnknownMap).has_transcript == 1
    end
    return page, nil, next_cursor
end

type ReferenceRow = {
    attrs: unknown,
    active: unknown,
}

local function decode_reference_rows(rows: unknown): { ReferenceRow }
    local out: { ReferenceRow } = {}
    for _, row in ipairs(type(rows) == "table" and rows :: { ReferenceRow } or {}) do
        row.attrs = decode(row.attrs) or {}
        row.active = row.active == true or row.active == 1
        out[#out + 1] = row
    end
    return out
end

local function reference_rows(crm_id: string, column: string, value: string, include_inactive: boolean, limit: number?, offset: number?): ({ ReferenceRow }?, error?)
    if trim(value) == "" then return nil, errors.new({ kind = errors.INVALID, message = column .. " is required" }) end
    local db, err = open_db()
    if not db then return nil, err end
    local where = "crm_id = $1 AND " .. column .. " = $2"
    if not include_inactive then where = where .. " AND active = $3" end
    local params: { unknown } = { crm_id, value }
    if not include_inactive then params[#params + 1] = true end
    local bounded = math.max(1, math.min(math.floor(tonumber(limit) or 100), 500))
    local page_offset = math.max(0, math.floor(tonumber(offset) or 0))
    params[#params + 1] = bounded
    params[#params + 1] = page_offset
    local rows, query_err = db:query("SELECT ref_id, from_ref, edge_type, to_ref, attrs, active, source, updated_at FROM kickside_crm_ref WHERE "
        .. where .. " ORDER BY edge_type, updated_at DESC, to_ref, ref_id LIMIT $"
        .. tostring(#params - 1) .. " OFFSET $" .. tostring(#params), params)
    db:release()
    if query_err then return nil, query_err end
    if rows ~= nil and type(rows) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM SQL query returned a non-array reference set" }) end
    return decode_reference_rows(rows), nil
end

-- Outbound edges owned by a source reference (a record's or activity's references).
function M.internal_references(crm_id: string, from_ref: string, include_inactive: boolean?, limit: number?, offset: number?): ({ ReferenceRow }?, error?)
    return reference_rows(crm_id, "from_ref", from_ref, include_inactive == true, limit, offset)
end

-- Inbound edges pointing at a target reference (who links this resource).
function M.internal_inbound_references(crm_id: string, to_ref: string, include_inactive: boolean?, limit: number?, offset: number?): ({ ReferenceRow }?, error?)
    return reference_rows(crm_id, "to_ref", to_ref, include_inactive == true, limit, offset)
end

local function review_page(table_name: string, crm_id: string, raw_opts: unknown, columns: string, status_column: string): (ReviewPage?, error?)
    local opts: UnknownMap = type(raw_opts) == "table" and raw_opts :: UnknownMap or {}
    local status = trim(opts.status)
    if status == "" then status = "pending" end
    local limit = math.max(1, math.min(math.floor(tonumber(opts.limit) or 50), 200))
    local offset = math.max(0, math.floor(tonumber(opts.offset) or 0))
    local db, err = open_db()
    if not db then return nil, err end
    local where = "crm_id = $1"
    local params: { unknown } = { crm_id }
    if status ~= "all" then
        where = where .. " AND " .. status_column .. " = $2"
        params[#params + 1] = status
    end
    local total_rows, count_err = db:query("SELECT COUNT(*) AS total FROM " .. table_name .. " WHERE " .. where, params)
    if count_err then db:release(); return nil, count_err end
    local page_params = {}
    for index, value in ipairs(params) do page_params[index] = value end
    page_params[#page_params + 1] = limit
    page_params[#page_params + 1] = offset
    local rows, query_err = db:query("SELECT " .. columns .. " FROM " .. table_name .. " WHERE " .. where
        .. " ORDER BY updated_at DESC LIMIT $" .. tostring(#page_params - 1) .. " OFFSET $" .. tostring(#page_params), page_params)
    db:release()
    if query_err then return nil, query_err end
    if rows ~= nil and type(rows) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "CRM SQL query returned a non-array review page" })
    end
    local typed_rows: { UnknownMap } = rows and rows :: { UnknownMap } or {}
    local first_count = type(total_rows) == "table" and total_rows[1] or nil
    return { rows = typed_rows, total = tonumber(first_count and (first_count :: CountRow).total) or 0,
        limit = limit, offset = offset }, nil
end

function M.internal_merge_reviews(crm_id: string, opts: unknown): (unknown?, error?)
    local page, err = review_page("kickside_crm_merge_decision", crm_id, opts,
        "resolution_id, left_id, right_id, object_type, decision AS status, decision, winner_id, loser_id, confidence, reason, evidence_hash, resolved_by, resolved_at, updated_at", "decision")
    if err then return nil, err end
    return page, nil
end

function M.internal_merge_resolution(crm_id: string, resolution_id: string): (unknown?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local rows, query_err = db:query([[SELECT resolution_id, left_id, right_id, object_type, decision,
        winner_id, loser_id, note, resolved_by, resolved_at
        FROM kickside_crm_merge_resolution
        WHERE crm_id = $1 AND resolution_id = $2 LIMIT 1]], { crm_id, resolution_id })
    db:release()
    if query_err then return nil, query_err end
    if type(rows) ~= "table" or rows[1] == nil then return nil, nil end
    if type(rows[1]) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM SQL query returned a non-object merge resolution" }) end
    return rows[1] :: UnknownMap, nil
end

local function schema_list(crm_id: string, key: string, object_type: string?): (unknown?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local current, schema_err = schema(db, crm_id)
    db:release()
    if schema_err then return nil, schema_err end
    local rows = declaration_list(current, key)
    if trim(object_type) == "" then return rows, nil end
    local out = {}
    for _, row in ipairs(rows) do
        local owner = key == "objects" and trim(row.type) or trim(row.object_type)
        if owner == object_type then out[#out + 1] = row end
    end
    return out, nil
end

function M.internal_attributes(crm_id: string, object_type: string?): (unknown?, error?)
    return schema_list(crm_id, "attributes", object_type)
end

function M.internal_views(crm_id: string, object_type: string?): (unknown?, error?)
    return schema_list(crm_id, "views", object_type)
end

function M.internal_objects(crm_id: string): (unknown?, error?)
    return schema_list(crm_id, "objects", nil)
end

function M.internal_pipelines(crm_id: string): (unknown?, error?)
    return schema_list(crm_id, "pipelines", nil)
end

function M.internal_bootstrap(crm_id: string): (unknown?, error?)
    local db, err = open_db()
    if not db then return nil, err end
    local current, schema_err = schema(db, crm_id)
    db:release()
    if schema_err then return nil, schema_err end
    return {
        revision = (current :: SchemaState).revision,
        objects = declaration_list(current, "objects"),
        attributes = declaration_list(current, "attributes"),
        pipelines = declaration_list(current, "pipelines"),
        views = declaration_list(current, "views"),
    }, nil
end

function M.internal_query(crm_id: string, raw_req: unknown): (unknown?, error?, string?)
    local req: UnknownMap = type(raw_req) == "table" and raw_req :: UnknownMap or {}
    local kind = trim(req.kind)
    if kind == "records" then
        return M.internal_list_records(crm_id, trim(req.object_type), {
            filters = req.filters,
            sort = req.sort,
            search = req.search,
            limit = req.limit,
            offset = req.offset,
        })
    end
    if kind == "count" then return M.internal_count_records(crm_id, trim(req.object_type)) end
    if kind == "record" then return M.internal_get_record(crm_id, trim(req.record_id)) end
    if kind == "records_by_ids" then return M.internal_records_by_ids(crm_id, req.ids) end
    if kind == "board" then return M.internal_board(crm_id, trim(req.collection_id), req) end
    if kind == "timeline" then return M.internal_timeline(crm_id, trim(req.record_id), tonumber(req.limit), trim(req.cursor)) end
    if kind == "related" then return M.internal_related(crm_id, trim(req.record_id)) end
    if kind == "references" then return M.internal_references(crm_id, trim(req.from_ref), req.include_inactive == true, tonumber(req.limit), tonumber(req.offset)) end
    if kind == "inbound_references" then return M.internal_inbound_references(crm_id, trim(req.to_ref), req.include_inactive == true, tonumber(req.limit), tonumber(req.offset)) end
    if kind == "merge_reviews" then return M.internal_merge_reviews(crm_id, req) end
    return nil, errors.new({ kind = errors.INVALID, message = "unknown CRM query kind: " .. kind })
end

return M
