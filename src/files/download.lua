-- Downloading a record's files (ATN-98) and the upload completion hook.
--
-- For each (provider, ref) a record's attachment fields promise, the CRM picks
-- an upload id, writes a pending attachment edge crm:<record> -> file:<upload>,
-- and hands the provider ref to kickside.uploads:attachment_ingest with an
-- upload completion token and provenance metadata.crm_files. When uploads
-- finishes processing, on_upload_complete turns the edge ready or failed; the
-- edge write is the reference.linked event consumers wake on.
--
-- Writes need WRITE on the CRM from the running identity: the download
-- automation's owner, and the same identity frozen into the token.
local security = require("security")
local time = require("time")
local uuid = require("uuid")
local writer = require("writer")
local files = require("files")
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
-- The hourly sweep leaves a record's first downloads to the download
-- automation while the record is this young, so both never fetch one file.
M.SWEEP_FRESH_MS = 15 * 60 * 1000

-- Errors worth another download: the file may come later or access may return.
M.RETRYABLE = { download_failed = true, no_access = true, expired = true }

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

local function copy(source: Map?, extra: Map): Map
    local out: Map = {}
    for key, value in pairs(source or {}) do out[key] = value end
    for key, value in pairs(extra) do out[key] = value end
    return out
end

-- link(crm_id, record_id, upload_id, attrs, active) -> writes the whole edge;
-- attrs replace the stored ones, so every write carries all of them.
function M.link(crm_id: string, record_id: string, upload_id: string, attrs: Map, active: boolean?): (boolean?, error?)
    attrs.updated_at = now()
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
        if M.FETCH_CODES[provider_code] then return provider_code, provider_detail end
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

-- too_fresh(record, fresh_ms) -> true when fresh_ms is set and the record was
-- created less than fresh_ms ago; an unreadable created_at counts as fresh.
function M.too_fresh(record: Map, fresh_ms: any): boolean
    local limit = tonumber(fresh_ms)
    if limit == nil then return false end
    local age = age_ms(record.created_at)
    return age == nil or age < limit
end

-- Files the uploads pipeline keeps but never converts nor reports back on: an
-- archive is unpacked into parts and its own completion callback never comes.
M.UNSUPPORTED_TYPES = { ["application/zip"] = true, ["application/x-zip-compressed"] = true }
M.UNSUPPORTED_EXTENSIONS = { zip = true }

-- unsupported_type(content_type, filename) -> true for a file Leads cannot read,
-- by the uploaded content type or by the file name's extension.
function M.unsupported_type(content_type: any, filename: any): boolean
    if M.UNSUPPORTED_TYPES[trim(content_type):lower()] then return true end
    local ext = trim(filename):lower():match("%.([%w]+)$")
    return ext ~= nil and M.UNSUPPORTED_EXTENSIONS[ext] == true
end

-- fetch(crm_id, record_id, item, component_id, attempt) -> "downloaded" or
-- "failed". The pending edge is written before the download, so a record's
-- files show the upload id at once.
function M.fetch(crm_id: string, record_id: string, item: Item, component_id: string, attempt: integer): (string?, error?)
    local actor = security.actor()
    if not actor then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "no actor to download as" }) end
    local identity, capture_err = M.deps.identity.capture()
    if not identity then return nil, capture_err end
    local row, row_err = M.deps.identity.to_row(identity)
    if not row then return nil, row_err end

    local upload_id = uuid.v4()
    local attrs: Map = { provider = item.provider, ref = item.ref, attempt = attempt }
    local token, token_err = M.deps.tokens.pack({
        upload_id = upload_id,
        function_id = M.ON_COMPLETE,
        on_error_id = M.ON_COMPLETE,
        actor_id = row.actor_id,
        actor_context = row.actor_context,
        params = { crm_id = crm_id, record_id = record_id, upload_id = upload_id, attrs = attrs },
    })
    if token_err then return nil, errors.new({ kind = errors.INTERNAL, message = "upload token: " .. tostring(token_err) }) end

    local linked, link_err = M.link(crm_id, record_id, upload_id, copy(attrs, { status = "pending" }))
    if not linked then return nil, link_err end

    local upload, ingest_err = M.deps.ingest.ingest({
        ref = item.ref, source = item.provider, component_id = component_id, actor_id = actor:id(),
        metadata = {
            __upload_token = token,
            crm_files = { crm_id = crm_id, record_id = record_id, provider = item.provider, ref = item.ref },
        },
    })
    if upload then
        local metadata = type(upload.metadata) == "table" and upload.metadata or {}
        if not M.unsupported_type(upload.mime_type, metadata.filename) then return "downloaded", nil end
        local _, type_err = M.link(crm_id, record_id, upload_id, copy(attrs, {
            status = "failed", error = "unsupported_type", error_detail = "file type is not supported",
            content_type = upload.mime_type, filename = trim(metadata.filename) ~= "" and trim(metadata.filename) or nil,
        }))
        if type_err then return nil, type_err end
        return "failed", nil
    end
    local code, why = M.error_code(tostring(ingest_err))
    local _, fail_err = M.link(crm_id, record_id, upload_id,
        copy(attrs, { status = "failed", error = code, error_detail = detail(why) }))
    if fail_err then return nil, fail_err end
    return "failed", nil
end

-- download_record(crm_id, record_id, component_id, opts) -> counts. Per
-- expected file: no edge -> download, unless opts.fresh_ms is set and the
-- record is younger; ready or young pending -> skip; pending older than the
-- token lifetime -> failed/expired; failed with a retryable code and attempts
-- left -> the old edge is cleared and the file downloaded again.
function M.download_record(crm_id: string, record_id: string, component_id: string, opts: Map?): (Counts?, error?)
    local counts: Counts = { downloaded = 0, failed = 0, skipped = 0, unlinked = 0 }
    local record, read_err = M.deps.reader.internal_get_record(crm_id, record_id)
    if read_err then return nil, read_err end
    if not record then return counts, nil end
    local too_fresh = M.too_fresh(record :: Map, (opts or {}).fresh_ms)
    local expected, expected_err = M.deps.files.expected(crm_id, record :: Map)
    if not expected then return nil, expected_err end
    local edges, edge_err = M.deps.files.edges(crm_id, record_id)
    if not edges then return nil, edge_err end
    local by_key = M.deps.files.best_edges(edges)

    for _, item in ipairs(expected) do
        local edge = by_key[item.provider .. "\0" .. item.ref]
        local attempt = 1
        local go = edge == nil and not too_fresh
        if edge then
            local attrs = type(edge.attrs) == "table" and edge.attrs or {}
            local upload_id = trim(edge.to_ref):sub(6)
            local status = trim(attrs.status)
            local tries = math.floor(tonumber(attrs.attempt) or 1)
            if status == "pending" then
                local age = age_ms(attrs.updated_at)
                if age and age > M.PENDING_TTL_MS then
                    local _, err = M.link(crm_id, record_id, upload_id,
                        copy(attrs, { status = "failed", error = "expired", error_detail = "no completion within 24 h" }))
                    if err then return nil, err end
                    status, attrs = "failed", copy(attrs, { status = "failed", error = "expired" })
                end
            end
            if status == "failed" and M.RETRYABLE[trim(attrs.error)] and tries < M.MAX_ATTEMPTS then
                local _, err = M.link(crm_id, record_id, upload_id, copy(attrs, {}), false)
                if err then return nil, err end
                go, attempt = true, tries + 1
            end
        end
        if go then
            local outcome, err = M.fetch(crm_id, record_id, item, component_id, attempt)
            if not outcome then return nil, err end
            if outcome == "downloaded" then counts.downloaded = counts.downloaded + 1 else counts.failed = counts.failed + 1 end
        else
            counts.skipped = counts.skipped + 1
        end
    end
    local unlinked, unlink_err = M.unlink_unnamed(crm_id, record_id, record :: Map, expected, edges)
    if not unlinked then return nil, unlink_err end
    counts.unlinked = unlinked
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

-- on_upload_complete(args) -- the uploads completion callback, run as the
-- download's identity: the edge turns ready, or failed/conversion_failed.
-- A repeat with the edge already in that final state, or a callback for an
-- edge a retry cleared, writes nothing.
function M.on_upload_complete(args: any): (Map?, error?)
    local input = type(args) == "table" and args or {}
    local params = type(input.params) == "table" and input.params or {}
    local crm_id, record_id = trim(params.crm_id), trim(params.record_id)
    local upload_id = trim(input.upload_id)
    if crm_id == "" or record_id == "" or upload_id == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "upload callback without crm_id, record_id or upload_id" })
    end
    local ok = input.status == "completed"
    local metadata = type(input.metadata) == "table" and input.metadata or {}
    local attrs = copy(type(params.attrs) == "table" and params.attrs or {}, {
        status = ok and "ready" or "failed",
        content_type = input.mime_type,
        size = tonumber(input.size),
        filename = trim(metadata.filename) ~= "" and trim(metadata.filename) or nil,
    })
    if not ok then
        attrs.error = "conversion_failed"
        attrs.error_detail = detail(input.error)
    end

    -- Only the live edge of this upload is written: a late callback for an
    -- upload a retry already replaced must not bring its edge back.
    local edges, edge_err = M.deps.files.edges(crm_id, record_id)
    if not edges then return nil, edge_err end
    local live: Map? = nil
    for _, edge in ipairs(edges) do
        if trim(edge.to_ref) == "file:" .. upload_id then live = edge; break end
    end
    if not live then return { success = true, changed = false }, nil end
    local current = type(live.attrs) == "table" and live.attrs or {}
    if trim(current.status) == attrs.status then return { success = true, changed = false }, nil end
    local linked, err = M.link(crm_id, record_id, upload_id, attrs)
    if not linked then return nil, err end
    return { success = true, changed = true }, nil
end

-- backfill(crm_id, component_id, opts) -> counts over every record of every
-- object type with an attachment field, page by page. A record whose field
-- value the provider cannot parse is counted in errors (the first few named)
-- and the backfill goes on; any other error stops it.
function M.backfill(crm_id: string, component_id: string, opts: any): (Map?, error?)
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
                local counts, download_err = M.download_record(crm_id, record_id, component_id,
                    { fresh_ms = options.fresh_ms })
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
