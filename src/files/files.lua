-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- A record's files (ATN-98): what its attachment fields promise and what the
-- attachment edges hold.
--
-- Fields marked config.attachment = { provider } hold provider file links. The
-- provider's attachment.fetcher declaration names parse_func, which turns a
-- value into file refs without downloading. Each downloaded file is an active
-- attachment edge crm:<record_id> -> file:<upload_id> whose attrs carry
-- provider, ref and attempt. A file is read only when its upload's provenance
-- (metadata.crm_files) names this CRM, record, provider and ref: an edge alone
-- can be written by anyone with WRITE on the CRM.
--
-- Nothing here checks access; crm.lua and the traits do.
local base64 = require("base64")
local funcs = require("funcs")
local registry = require("registry")
local reader = require("reader_internal")
local trusted = require("trusted_reader")
local uploads = require("uploads")

local M = {}

M.FETCHER_META = "attachment.fetcher"
M.EDGE_TYPE = "attachment"
M.EDGE_PAGE = 500
M.DEFAULT_MAX_CHARS = 200000
M.MAX_IMAGE_BYTES = 25 * 1024 * 1024
-- How long a link record_file_url hands out stays good, in seconds (#1115).
M.URL_TTL_SECONDS = 300

M.deps = { reader = reader, registry = registry, funcs = funcs, trusted = trusted, uploads = uploads }

type Map = { [string]: any }
type FileField = { attr: string, provider: string }
type Expected = { provider: string, ref: string, field: string }
type Fetcher = { fetch_func: string, parse_func: string }

local function trim(value: any): string
    if type(value) == "number" then value = tostring(value) end
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function invalid(message: string): error
    return errors.new({ kind = errors.INVALID, message = message })
end

-- A record's own field value the provider could not parse: one record's
-- problem, not the CRM's or the provider setup's.
M.RECORD_VALUE = "record_value"

local function value_error(message: string): error
    return errors.new({ kind = errors.INVALID, message = message, details = { code = M.RECORD_VALUE } })
end

-- is_value_error(err) -> true for an error value_error made.
function M.is_value_error(err: any): boolean
    if not errors.is(err, errors.INVALID) then return false end
    local detail = err:details()
    return type(detail) == "table" and detail.code == M.RECORD_VALUE
end

-- record_id(record_ref) -> the record id without the crm: prefix.
function M.record_id(record_ref: any): string
    return (trim(record_ref):gsub("^crm:", ""))
end

-- file_fields(crm_id, object_type) -> the attributes marked as attachment
-- fields, in schema order.
function M.file_fields(crm_id: string, object_type: string): ({ FileField }?, error?)
    local attributes, err = M.deps.reader.internal_attributes(crm_id, object_type)
    if err then return nil, err end
    local out: { FileField } = {}
    for _, raw in ipairs(type(attributes) == "table" and attributes or {}) do
        local config = type(raw.config) == "table" and raw.config or {}
        local mark = type(config.attachment) == "table" and config.attachment or nil
        local provider = mark and trim(mark.provider) or ""
        if provider ~= "" and trim(raw.object_type) == object_type then
            out[#out + 1] = { attr = trim(raw.attr), provider = provider }
        end
    end
    return out, nil
end

-- fetcher(provider) -> the provider's attachment.fetcher functions.
function M.fetcher(provider: string): (Fetcher?, error?)
    local entries, err = M.deps.registry.find({ [".kind"] = "registry.entry", ["meta.type"] = M.FETCHER_META })
    if err then return nil, err end
    if type(entries) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "attachment fetcher registry returned invalid data" }) end
    local found: Fetcher? = nil
    for _, entry in ipairs(entries) do
        local data = (entry :: any).data or entry
        if trim(data.provider) == provider then
            local candidate = { fetch_func = trim(data.fetch_func), parse_func = trim(data.parse_func) }
            if candidate.parse_func == "" or candidate.fetch_func == "" then
                return nil, invalid("attachment fetcher of " .. provider .. " declares no fetch_func or parse_func")
            end
            if found and (found.fetch_func ~= candidate.fetch_func or found.parse_func ~= candidate.parse_func) then
                return nil, invalid("multiple attachment fetchers declared for provider " .. provider)
            end
            found = candidate
        end
    end
    if found then return found, nil end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "no attachment fetcher for provider " .. provider })
end

-- parse(provider, value) -> the file refs in the value, in order.
function M.parse(provider: string, value: any): ({ string }?, error?)
    if trim(value) == "" then return {}, nil end
    local fetcher, err = M.fetcher(provider)
    if not fetcher then return nil, err end
    local result, call_err = M.deps.funcs.call(fetcher.parse_func, { value = value })
    if call_err then return nil, value_error("parse_func failed: " .. tostring(call_err)) end
    if type(result) ~= "table" then return nil, value_error("parse_func returned no refs") end
    if trim(result.error) ~= "" then return nil, value_error("parse_func: " .. trim(result.error)) end
    local refs: { string } = {}
    for _, item in ipairs(type(result.refs) == "table" and result.refs or {}) do
        local ref = trim(type(item) == "table" and item.ref or nil)
        if ref ~= "" then refs[#refs + 1] = ref end
    end
    return refs, nil
end

-- expected(crm_id, record) -> every (provider, ref) the record's attachment
-- fields promise, in field order and value order, without duplicates.
function M.expected(crm_id: string, record: Map): ({ Expected }?, error?)
    local fields, err = M.file_fields(crm_id, trim(record.object_type))
    if not fields then return nil, err end
    local values = type(record.values) == "table" and record.values or {}
    local out: { Expected } = {}
    local seen: { [string]: boolean } = {}
    for _, field in ipairs(fields) do
        local refs, parse_err = M.parse(field.provider, values[field.attr])
        if not refs then return nil, parse_err end
        for _, ref in ipairs(refs) do
            local key = field.provider .. "\0" .. ref
            if not seen[key] then
                seen[key] = true
                out[#out + 1] = { provider = field.provider, ref = ref, field = field.attr }
            end
        end
    end
    return out, nil
end

-- edges(crm_id, record_id) -> the record's active attachment edges to files,
-- newest first.
function M.edges(crm_id: string, record_id: string, include_inactive: boolean?): ({ Map }?, error?)
    local out: { Map } = {}
    local offset = 0
    while true do
        local rows, err = M.deps.reader.internal_references(crm_id, "crm:" .. record_id, include_inactive == true, M.EDGE_PAGE, offset)
        if err then return nil, err end
        for _, row in ipairs(rows or {}) do
            local to_ref = trim(row.to_ref)
            if row.edge_type == M.EDGE_TYPE and (include_inactive == true or row.active == true) and to_ref:sub(1, 5) == "file:" then
                out[#out + 1] = row
            end
        end
        if #(rows or {}) < M.EDGE_PAGE then break end
        offset = offset + #rows
    end
    return out, nil
end

-- authentic(crm_id, record_id, upload_id, attrs) -> true when the upload was
-- written by this CRM's download for this record and file.
function M.authentic(crm_id: string, record_id: string, upload_id: string, attrs: Map): (boolean, error?)
    local provenance, err = M.deps.trusted.provenance(upload_id)
    if err then
        if errors.is(err, errors.NOT_FOUND) then return false, nil end
        return false, err
    end
    local origin = provenance and type(provenance.crm_files) == "table" and provenance.crm_files or nil
    return origin ~= nil
        and trim(origin.crm_id) == crm_id
        and trim(origin.record_id) == record_id
        and trim(origin.provider) == trim(attrs.provider)
        and trim(origin.ref) == trim(attrs.ref)
end

local function pending_file(item: Expected): Map
    return { provider = item.provider, ref = item.ref, field = item.field, status = "pending",
        text_truncated = false, text_available = false }
end

-- Uploads owns lifecycle state. Edge errors apply only before an upload exists.
function M.state(crm_id: string, record_id: string, edge: Map): (Map?, error?)
    local attrs = type(edge.attrs) == "table" and edge.attrs or {}
    local upload_id = trim(edge.to_ref):sub(6)
    local file: Map = { upload_id = upload_id, provider = trim(attrs.provider), ref = trim(attrs.ref),
        status = "pending", updated_at = attrs.updated_at }
    local info, info_err = M.deps.trusted.info(upload_id)
    if info_err and not errors.is(info_err, errors.NOT_FOUND) then return nil, info_err end
    if not info then
        if trim(attrs.error) ~= "" then
            file.status, file.error, file.error_detail = "failed", attrs.error, attrs.error_detail
        end
        return file, nil
    end
    local authentic, provenance_err = M.authentic(crm_id, record_id, upload_id, attrs)
    if provenance_err then return nil, provenance_err end
    if not authentic then
        file.status, file.error, file.error_detail = "failed", "no_access", "upload provenance does not match this record"
        return file, nil
    end
    file.filename, file.content_type, file.size = info.filename, info.mime_type, info.size
    file.updated_at = info.created_at
    if M.unsupported_type(info.mime_type, info.filename) then
        file.status, file.error, file.error_detail = "failed", "unsupported_type", "file type is not supported"
    elseif info.status == "completed" then
        file.status = "ready"
    elseif info.status == "failed" then
        file.status, file.error, file.error_detail = "failed", "conversion_failed", "file processing failed"
    end
    return file, nil
end

function M.unsupported_type(content_type: any, filename: any): boolean
    local mime = trim(content_type):lower()
    return mime == "application/zip" or mime == "application/x-zip-compressed"
        or trim(filename):lower():match("%.zip$") ~= nil
end

local function edge_file(crm_id: string, record_id: string, edge: Map, field: string?, max_chars: number): (Map?, error?)
    local file, state_err = M.state(crm_id, record_id, edge)
    if not file then return nil, state_err end
    local upload_id = file.upload_id
    file.field, file.text_truncated, file.text_available = field, false, false
    if file.status ~= "ready" then return file, nil end
    local text, text_err = M.deps.trusted.primary_text(upload_id, max_chars)
    if text_err and not errors.is(text_err, errors.NOT_FOUND) then
        return nil, errors.new({ kind = errors.INTERNAL, message = "file text of upload " .. upload_id .. ": " .. tostring(text_err) })
    end
    if text then
        file.text, file.text_chars, file.text_truncated, file.text_available = text.text, text.chars, text.truncated, true
        local meta = type(text.metadata) == "table" and text.metadata or {}
        file.pages = tonumber(meta.pages or meta.page_count)
    end
    local image, image_err = M.deps.trusted.source_image(upload_id)
    if image_err then
        return nil, errors.new({ kind = errors.INTERNAL, message = "file image of upload " .. upload_id .. ": " .. tostring(image_err) })
    end
    if image then file.image = image end
    return file, nil
end

-- Status breaks ties between legacy edges of the same attempt.
M.STATUS_RANK = { ready = 3, pending = 2, failed = 1 }

-- edge_key(edge) -> "provider\0ref" of an attachment edge.
function M.edge_key(edge: Map): string
    local attrs = type(edge.attrs) == "table" and edge.attrs or {}
    return trim(attrs.provider) .. "\0" .. trim(attrs.ref)
end

-- best_edges(edges) -> { [edge_key]: edge }, the edge of each key with the
-- newest attempt. Live edges, legacy status and time break equal-attempt ties.
function M.best_edges(edges: { Map }): { [string]: Map }
    local best: { [string]: Map } = {}
    local function rank(edge: Map): (number, number, number, string)
        local attrs = type(edge.attrs) == "table" and edge.attrs or {}
        return tonumber(attrs.attempt) or 1, edge.active == false and 0 or 1, M.STATUS_RANK[trim(attrs.status)] or 0, trim(attrs.updated_at)
    end
    for _, edge in ipairs(edges) do
        local key = M.edge_key(edge)
        local held = best[key]
        if not held then
            best[key] = edge
        else
            local attempt, active, r, at = rank(edge)
            local held_attempt, held_active, held_r, held_at = rank(held)
            if attempt > held_attempt or (attempt == held_attempt and
                (active > held_active or (active == held_active and
                    (r > held_r or (r == held_r and at > held_at))))) then best[key] = edge end
        end
    end
    return best
end

-- unnamed(crm_id, record, expected, edges) -> the edges whose file the field
-- no longer names: an edge of a provider one of the record's marked fields
-- belongs to stands only while that field names its file (Максим 04.11, #1118).
-- An edge of any other provider was linked otherwise and stays.
function M.unnamed(crm_id: string, record: Map, expected: { Expected }, edges: { Map }): ({ Map }?, error?)
    local fields, err = M.file_fields(crm_id, trim(record.object_type))
    if not fields then return nil, err end
    local providers: { [string]: boolean } = {}
    for _, field in ipairs(fields) do providers[field.provider] = true end
    local named: { [string]: boolean } = {}
    for _, item in ipairs(expected) do named[item.provider .. "\0" .. item.ref] = true end
    local out: { Map } = {}
    for _, edge in ipairs(edges) do
        local attrs = type(edge.attrs) == "table" and edge.attrs or {}
        if edge.active ~= false and providers[trim(attrs.provider)] and not named[M.edge_key(edge)] then out[#out + 1] = edge end
    end
    return out, nil
end

-- named_edges(crm_id, record_id) -> the record, what its fields promise and
-- its active edges without those unnamed() drops. No record: no promise, every edge.
local function named_edges(crm_id: string, record_id: string): (Map?, { Expected }?, { Map }?, error?)
    local record, record_err = M.deps.reader.internal_get_record(crm_id, record_id)
    if record_err then return nil, nil, nil, record_err end
    local history, edge_err = M.edges(crm_id, record_id, true)
    if not history then return nil, nil, nil, edge_err end
    local newest = M.best_edges(history)
    local edges: { Map } = {}
    for _, edge in ipairs(history) do
        if edge.active ~= false and newest[M.edge_key(edge)] == edge then edges[#edges + 1] = edge end
    end
    if not record then return nil, {}, edges, nil end
    local expected, err = M.expected(crm_id, record :: Map)
    if not expected then return nil, nil, nil, err end
    local dropped, drop_err = M.unnamed(crm_id, record :: Map, expected, edges)
    if not dropped then return nil, nil, nil, drop_err end
    local gone: { [Map]: boolean } = {}
    for _, edge in ipairs(dropped) do gone[edge] = true end
    local kept: { Map } = {}
    for _, edge in ipairs(edges) do
        if not gone[edge] then kept[#kept + 1] = edge end
    end
    return record :: Map, expected, kept, nil
end

-- record_files(crm_id, record_ref, opts) -> the record's files: every
-- expected file (pending until its edge exists), then edges linked otherwise.
function M.record_files(crm_id: string, record_ref: any, opts: any?): ({ Map }?, error?)
    local record_id = M.record_id(record_ref)
    if record_id == "" then return nil, invalid("record_ref is required") end
    local options = type(opts) == "table" and opts or {}
    local max_chars = math.floor(tonumber(options.max_chars) or M.DEFAULT_MAX_CHARS)

    local _, found, kept, err = named_edges(crm_id, record_id)
    if not kept then return nil, err end
    local expected = found :: { Expected }
    local edges = kept :: { Map }

    local by_key = M.best_edges(edges)

    local out: { Map } = {}
    local used: { [Map]: boolean } = {}
    for _, item in ipairs(expected) do
        local edge = by_key[item.provider .. "\0" .. item.ref]
        if edge then
            used[edge] = true
            local file, err = edge_file(crm_id, record_id, edge, item.field, max_chars)
            if not file then return nil, err end
            out[#out + 1] = file
        else
            out[#out + 1] = pending_file(item)
        end
    end
    for _, edge in ipairs(edges) do
        if not used[edge] and by_key[M.edge_key(edge)] == edge then
            local file, err = edge_file(crm_id, record_id, edge, nil, max_chars)
            if not file then return nil, err end
            out[#out + 1] = file
        end
    end
    return out, nil
end

-- owned_file(crm_id, record_ref, upload_id) -> (upload id, edge attrs) of one
-- of the record's files: an edge the record's field still names whose upload
-- this CRM wrote for it. Anything else is PERMISSION_DENIED.
local function owned_file(crm_id: string, record_ref: any, upload_id: any): (string?, Map?, error?)
    local record_id = M.record_id(record_ref)
    local id = trim(upload_id)
    if record_id == "" or id == "" then return nil, nil, invalid("record_ref and upload_id are required") end
    local _, _, edges, err = named_edges(crm_id, record_id)
    if not edges then return nil, nil, err end
    local edge: Map? = nil
    for _, candidate in ipairs(edges) do
        if trim(candidate.to_ref) == "file:" .. id then edge = candidate; break end
    end
    local attrs = edge and type(edge.attrs) == "table" and edge.attrs or {}
    local authentic, provenance_err = false, nil
    if edge then authentic, provenance_err = M.authentic(crm_id, record_id, id, attrs) end
    if provenance_err then return nil, nil, provenance_err end
    if not edge or not authentic then
        return nil, nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "the upload is not a file of this record" })
    end
    local state, state_err = M.state(crm_id, record_id, edge :: Map)
    if not state then return nil, nil, state_err end
    return id, state, nil
end

-- record_file_url(crm_id, record_ref, upload_id) -> { url, expires_in,
-- filename, content_type }: a link to the original of one of the record's
-- ready files, good for URL_TTL_SECONDS (#1115). uploads.delivery_url leaves
-- the access check to its caller: owned_file is it.
function M.record_file_url(crm_id: string, record_ref: any, upload_id: any): (Map?, error?)
    local id, attrs, err = owned_file(crm_id, record_ref, upload_id)
    if not id then return nil, err end
    local file = attrs :: Map
    if trim(file.status) ~= "ready" then
        return nil, errors.new({ kind = errors.INVALID, message = "the file is not downloaded yet", details = { code = "not_ready" } })
    end
    local url, url_err = M.deps.uploads.delivery_url(id, { expires_in = M.URL_TTL_SECONDS })
    if not url then return nil, url_err end
    return { url = url, expires_in = M.URL_TTL_SECONDS, filename = file.filename, content_type = file.content_type }, nil
end

-- record_file_image(crm_id, record_ref, upload_id) -> the original image of
-- one of the record's image files, base64.
function M.record_file_image(crm_id: string, record_ref: any, upload_id: any): (Map?, error?)
    local id, _, err = owned_file(crm_id, record_ref, upload_id)
    if not id then return nil, err end
    local image, image_err = M.deps.trusted.source_image(id)
    if image_err then return nil, image_err end
    if not image then
        return nil, errors.new({ kind = errors.INVALID, message = "the file is not an image", details = { code = "not_an_image" } })
    end
    local bytes, bytes_err = M.deps.trusted.image_bytes(id, image.artifact_id, M.MAX_IMAGE_BYTES)
    if not bytes then return nil, bytes_err end
    return { content_base64 = base64.encode(bytes.bytes), content_type = bytes.content_type, size = bytes.size }, nil
end

return M
