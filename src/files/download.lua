-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Attachment identity is stable within an attempt; uploads owns its state.
local security = require("security")
local time = require("time")
local uuid = require("uuid")
local writer = require("writer")
local files = require("files")
local component = require("component")
local reader = require("reader_internal")
local attachment_ingest = require("attachment_ingest")
local upload_tokens = require("upload_tokens")
local execution_identity = require("execution_identity")

local M = {}

M.ON_COMPLETE = "kickside.crm.files:on_upload_complete"
M.MAX_ATTEMPTS = 3
M.PENDING_TTL_MS = 24 * 60 * 60 * 1000
M.DETAIL_MAX = 200
M.BACKFILL_PAGE = 100
-- How many record errors a backfill names in its answer.
M.ERRORS_SHOWN = 5
-- Errors worth another download: the file may come later or access may return.
M.RETRYABLE = { download_failed = true, no_access = true, expired = true, conversion_failed = true }

M.deps = {
    writer = writer, files = files, reader = reader, ingest = attachment_ingest,
    tokens = upload_tokens, identity = execution_identity,
}

type Map = { [string]: any }
type Item = { provider: string, ref: string, field: string }
type Counts = { downloaded: integer, failed: integer, skipped: integer, unlinked: integer }

local function trim(value: any): string
    if type(value) == "number" then value = tostring(value) end
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function now(): string
    return os.date("!%Y-%m-%dT%H:%M:%SZ") :: string
end

local function detail(text: any): string
    local value = trim(tostring(text or ""))
    value = value:gsub("https?://%S+", "<url>")
    if #value > M.DETAIL_MAX then value = value:sub(1, M.DETAIL_MAX) end
    return value
end

-- link(crm_id, record_id, upload_id, attrs, active) -> writes the whole edge;
-- attrs replace the stored ones, so every write carries all of them.
function M.link(crm_id: string, record_id: string, upload_id: string, attrs: Map, active: boolean?): (boolean?, error?)
    return M.deps.writer.link_ref(crm_id, "crm:" .. record_id, files.EDGE_TYPE, "file:" .. upload_id, attrs, active ~= false)
end

-- Codes a provider's fetcher may report (contract §1); any other word is not
-- a code the CRM shows and reads as download_failed.
M.FETCH_CODES = {
    too_large = true, no_access = true, not_found = true, download_failed = true,
    unsupported_type = true, upload_failed = true,
}

-- error_code(message) -> the shared attachment error code of an ingest failure.
function M.error_code(message: string): (string, string)
    local provider_code, provider_detail = message:match("^fetch failed: ([%w_]+): (.*)$")
    if provider_code then
        if M.FETCH_CODES[provider_code] then return provider_code, provider_detail or "" end
        return "download_failed", message
    end
    if message == "too large" then return "too_large", message end
    if message:find("^upload failed:") then
        if message:lower():find("unsupported") or message:lower():find("type") then return "unsupported_type", message end
        return "upload_failed", message
    end
    return "download_failed", message
end

local function age_ms(stamp: any): number?
    local parsed, err = time.parse(time.RFC3339, trim(stamp))
    if err or not parsed then return nil end
    return time.now():sub(parsed):milliseconds()
end

M.unsupported_type = files.unsupported_type

-- The token binds all deliveries of one attempt to the same upload identity.
function M.upload_id(crm_id: string, record_id: string, provider: string, ref: string, attempt: integer): (string?, error?)
    return uuid.v5("6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        table.concat({ crm_id, record_id, provider, ref, tostring(attempt) }, "\0"))
end

function M.fetch(crm_id: string, record_id: string, item: Item, component_id: string, attempt: integer): (string?, error?)
    local actor = security.actor()
    if not actor then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "no actor to download as" }) end
    local identity, capture_err = M.deps.identity.capture()
    if not identity then return nil, capture_err end
    local row, row_err = M.deps.identity.to_row(identity)
    if not row then return nil, row_err end

    local upload_id, id_err = M.upload_id(crm_id, record_id, item.provider, item.ref, attempt)
    if not upload_id then return nil, id_err end
    local attrs: Map = { provider = item.provider, ref = item.ref, attempt = attempt }
    local token, token_err = M.deps.tokens.pack({
        upload_id = upload_id,
        function_id = M.ON_COMPLETE,
        on_error_id = M.ON_COMPLETE,
        actor_id = row.actor_id,
        actor_context = row.actor_context,
        params = { crm_id = crm_id, record_id = record_id, attrs = attrs },
    })
    if token_err then return nil, errors.new({ kind = errors.INTERNAL, message = "upload token: " .. tostring(token_err) }) end

    local upload, ingest_err = M.deps.ingest.ingest({
        ref = item.ref, source = item.provider, component_id = component_id, actor_id = actor:id(),
        metadata = {
            __upload_token = token,
            crm_files = { crm_id = crm_id, record_id = record_id, provider = item.provider, ref = item.ref },
        },
    })
    if upload then
        local linked, link_err = M.link(crm_id, record_id, upload_id, attrs)
        if not linked then return nil, link_err end
        local metadata = type(upload.metadata) == "table" and upload.metadata or {}
        return M.unsupported_type(upload.mime_type, metadata.filename) and "failed" or "downloaded", nil
    end
    if errors.is(ingest_err, errors.CONFLICT) then return "skipped", nil end
    local code, why = M.error_code(tostring(ingest_err))
    attrs.error, attrs.error_detail, attrs.updated_at = code, detail(why), now()
    local linked, fail_err = M.link(crm_id, record_id, upload_id, attrs)
    if not linked then return nil, fail_err end
    return "failed", nil
end

-- download_record(crm_id, record_id, component_id) -> counts. Per expected
-- file: no edge -> download; ready or young pending -> skip; pending older than
-- the token lifetime or a retryable failure opens the next attempt.
function M.download_record(crm_id: string, record_id: string, component_id: string): (Counts?, error?)
    local allowed, access_err = M.deps.writer.require_access(crm_id, component.ACCESS.WRITE)
    if not allowed then return nil, access_err end
    local counts: Counts = { downloaded = 0, failed = 0, skipped = 0, unlinked = 0 }
    local record, read_err = M.deps.reader.internal_get_record(crm_id, record_id)
    if read_err then return nil, read_err end
    if not record then return counts, nil end
    local expected, expected_err = M.deps.files.expected(crm_id, record :: Map)
    if not expected then return nil, expected_err end
    local edges, edge_err = M.deps.files.edges(crm_id, record_id, true)
    if not edges then return nil, edge_err end
    local by_key = M.deps.files.best_edges(edges)

    for _, item in ipairs(expected) do
        local edge = by_key[item.provider .. "\0" .. item.ref]
        local attempt = 1
        local go = edge == nil
        if edge then
            local attrs = type(edge.attrs) == "table" and edge.attrs or {}
            local tries = math.floor(tonumber(attrs.attempt) or 1)
            if edge.active == false then
                go, attempt = true, tries + 1
            else
                local state, state_err = M.deps.files.state(crm_id, record_id, edge)
                if not state then return nil, state_err end
                local expired = state.status == "pending" and (age_ms(state.updated_at) or 0) > M.PENDING_TTL_MS
                if (expired or (state.status == "failed" and M.RETRYABLE[trim(state.error)])) and tries < M.MAX_ATTEMPTS then
                    go, attempt = true, tries + 1
                end
            end
        end
        if go then
            local outcome, err = M.fetch(crm_id, record_id, item, component_id, attempt)
            if not outcome then return nil, err end
            counts[outcome] = counts[outcome] + 1
        else
            counts.skipped = counts.skipped + 1
        end
    end
    local current, current_err = M.deps.files.edges(crm_id, record_id, true)
    if not current then return nil, current_err end
    local newest = M.deps.files.best_edges(current)
    for _, edge in ipairs(current) do
        local attrs = type(edge.attrs) == "table" and edge.attrs or {}
        local selected = newest[M.deps.files.edge_key(edge)]
        local selected_attrs = selected and type(selected.attrs) == "table" and selected.attrs or {}
        if edge.active ~= false and (tonumber(attrs.attempt) or 1) < (tonumber(selected_attrs.attempt) or 1) then
            local _, err = M.deps.writer.unlink_ref(crm_id, "crm:" .. record_id, files.EDGE_TYPE, trim(edge.to_ref))
            if err then return nil, err end
            counts.unlinked = counts.unlinked + 1
            edge.active = false
        end
    end
    local unlinked, unlink_err = M.unlink_unnamed(crm_id, record_id, record :: Map, expected, current)
    if not unlinked then return nil, unlink_err end
    counts.unlinked = counts.unlinked + unlinked
    return counts, nil
end

-- unlink_unnamed(...) -> how many edges it retired: each edge whose file the
-- record's field no longer names (files.unnamed) is unlinked; the upload stays.
-- reference.unlinked, not a linked write with active=false: the files
-- automation reads a linked ready edge as a file that arrived late.
function M.unlink_unnamed(crm_id: string, record_id: string, record: Map, expected: { Item }, edges: { Map }): (integer?, error?)
    local dropped, err = M.deps.files.unnamed(crm_id, record, expected, edges)
    if not dropped then return nil, err end
    for _, edge in ipairs(dropped) do
        local _, unlink_err = M.deps.writer.unlink_ref(crm_id, "crm:" .. record_id, files.EDGE_TYPE, trim(edge.to_ref))
        if unlink_err then return nil, unlink_err end
    end
    return #dropped, nil
end

-- Wake reference consumers after either upload outcome; state stays in uploads.
function M.on_upload_complete(args: any): (Map?, error?)
    local input = type(args) == "table" and args or {}
    local params = type(input.params) == "table" and input.params or {}
    if trim(params.crm_id) == "" or trim(params.record_id) == "" or trim(input.upload_id) == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "upload callback without crm_id, record_id or upload_id" })
    end
    local attrs = type(params.attrs) == "table" and params.attrs or {}
    local linked, err = M.link(trim(params.crm_id), trim(params.record_id), trim(input.upload_id), {
        provider = attrs.provider, ref = attrs.ref, attempt = attrs.attempt,
    })
    if not linked then return nil, err end
    return { success = true, changed = true }, nil
end

-- backfill(crm_id, component_id, opts) -> counts over every record of every
-- object type with an attachment field, page by page. A record whose field
-- value the provider cannot parse is counted in errors (the first few named)
-- and the backfill goes on; any other error stops it.
function M.backfill(crm_id: string, component_id: string, opts: any): (Map?, error?)
    local allowed, access_err = M.deps.writer.require_access(crm_id, component.ACCESS.WRITE)
    if not allowed then return nil, access_err end
    local options = type(opts) == "table" and opts or {}
    local types: { string } = {}
    local objects, objects_err = M.deps.reader.internal_objects(crm_id)
    if objects_err then return nil, objects_err end
    for _, object in ipairs(type(objects) == "table" and objects or {}) do
        local object_type = trim(object.type)
        local fields, fields_err = M.deps.files.file_fields(crm_id, object_type)
        if not fields then return nil, fields_err end
        if #fields > 0 and (trim(options.object_type) == "" or trim(options.object_type) == object_type) then
            types[#types + 1] = object_type
        end
    end
    local total: Map = { records = 0, downloaded = 0, failed = 0, skipped = 0, unlinked = 0, errors = 0, error_records = {},
        object_types = types }
    for _, object_type in ipairs(types) do
        local offset = 0
        while true do
            local page, err = M.deps.reader.internal_list_records(crm_id, object_type, { limit = M.BACKFILL_PAGE, offset = offset })
            if not page then return nil, err end
            local rows = type(page.rows) == "table" and page.rows or {}
            for _, record in ipairs(rows) do
                local record_id = trim(record.record_id)
                local counts, download_err = M.download_record(crm_id, record_id, component_id)
                total.records = total.records + 1
                if counts then
                    total.downloaded = total.downloaded + counts.downloaded
                    total.failed = total.failed + counts.failed
                    total.skipped = total.skipped + counts.skipped
                    total.unlinked = total.unlinked + counts.unlinked
                elseif M.deps.files.is_value_error(download_err) then
                    total.errors = total.errors + 1
                    if #total.error_records < M.ERRORS_SHOWN then
                        total.error_records[#total.error_records + 1] = { record_id = record_id, error = detail(download_err) }
                    end
                else
                    return nil, download_err
                end
            end
            if #rows < M.BACKFILL_PAGE then break end
            offset = offset + #rows
        end
    end
    return total, nil
end

return M
