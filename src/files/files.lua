-- A record's files (ATN-98): what its attachment fields promise and what the
-- attachment edges hold.
--
-- Fields marked config.attachment = { provider } hold provider file links. The
-- provider's attachment.fetcher declaration names parse_func, which turns a
-- value into file refs without downloading. Each downloaded file is an active
-- attachment edge crm:<record_id> -> file:<upload_id> whose attrs carry
-- provider, ref and status. A file is read only when its upload's provenance
-- (metadata.crm_files) names this CRM, record, provider and ref: an edge alone
-- can be written by anyone with WRITE on the CRM.
--
-- Nothing here checks access; crm.lua and the traits do.
local base64 = require("base64")
local funcs = require("funcs")
local registry = require("registry")
local reader = require("reader_internal")
local trusted = require("trusted_reader")

local M = {}

M.FETCHER_META = "attachment.fetcher"
M.EDGE_TYPE = "attachment"
M.MAX_EDGES = 500
M.DEFAULT_MAX_CHARS = 200000
M.MAX_IMAGE_BYTES = 25 * 1024 * 1024

M.deps = { reader = reader, registry = registry, funcs = funcs, trusted = trusted }

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
    for _, entry in ipairs(type(entries) == "table" and entries or {}) do
        local data = (entry :: any).data or entry
        if trim(data.provider) == provider then
            local found = { fetch_func = trim(data.fetch_func), parse_func = trim(data.parse_func) }
            if found.parse_func == "" or found.fetch_func == "" then
                return nil, invalid("attachment fetcher of " .. provider .. " declares no fetch_func or parse_func")
            end
            return found, nil
        end
    end
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
function M.edges(crm_id: string, record_id: string): ({ Map }?, error?)
    local rows, err = M.deps.reader.internal_references(crm_id, "crm:" .. record_id, false, M.MAX_EDGES, 0)
    if err then return nil, err end
    local out: { Map } = {}
    for _, row in ipairs(type(rows) == "table" and rows or {}) do
        local to_ref = trim(row.to_ref)
        if row.edge_type == M.EDGE_TYPE and row.active == true and to_ref:sub(1, 5) == "file:" then
            out[#out + 1] = row
        end
    end
    return out, nil
end

-- authentic(crm_id, record_id, upload_id, attrs) -> true when the upload was
-- written by this CRM's download for this record and file.
function M.authentic(crm_id: string, record_id: string, upload_id: string, attrs: Map): boolean
    local provenance = M.deps.trusted.provenance(upload_id)
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

-- edge_file(...) -> the file of one edge. A ready upload without a text
-- artifact (NOT_FOUND) has no text; any other read failure is an error, so a
-- caller never reads a storage fault as a file with no text or no image.
local function edge_file(crm_id: string, record_id: string, edge: Map, field: string?, max_chars: number): (Map?, error?)
    local attrs = type(edge.attrs) == "table" and edge.attrs or {}
    local upload_id = trim(edge.to_ref):sub(6)
    local file: Map = {
        upload_id = upload_id, provider = trim(attrs.provider), ref = trim(attrs.ref), field = field,
        filename = attrs.filename, content_type = attrs.content_type, size = attrs.size,
        status = trim(attrs.status) ~= "" and trim(attrs.status) or "pending",
        error = attrs.error, error_detail = attrs.error_detail, updated_at = attrs.updated_at,
        text_truncated = false, text_available = false,
    }
    if file.status ~= "ready" then return file, nil end
    if not M.authentic(crm_id, record_id, upload_id, attrs) then
        file.status, file.error, file.error_detail = "failed", "no_access", "upload provenance does not match this record"
        return file, nil
    end
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

-- A record holds one file per (provider, ref); when two downloads raced and
-- left two live edges for it, the one that got furthest stands for both.
M.STATUS_RANK = { ready = 3, pending = 2, failed = 1 }

-- edge_key(edge) -> "provider\0ref" of an attachment edge.
function M.edge_key(edge: Map): string
    local attrs = type(edge.attrs) == "table" and edge.attrs or {}
    return trim(attrs.provider) .. "\0" .. trim(attrs.ref)
end

-- best_edges(edges) -> { [edge_key]: edge }, the edge of each key with the
-- best status (ready, pending, failed), the later one on a tie.
function M.best_edges(edges: { Map }): { [string]: Map }
    local best: { [string]: Map } = {}
    local function rank(edge: Map): (number, string)
        local attrs = type(edge.attrs) == "table" and edge.attrs or {}
        return M.STATUS_RANK[trim(attrs.status)] or 0, trim(attrs.updated_at)
    end
    for _, edge in ipairs(edges) do
        local key = M.edge_key(edge)
        local held = best[key]
        if not held then
            best[key] = edge
        else
            local r, at = rank(edge)
            local held_r, held_at = rank(held)
            if r > held_r or (r == held_r and at > held_at) then best[key] = edge end
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
        if providers[trim(attrs.provider)] and not named[M.edge_key(edge)] then out[#out + 1] = edge end
    end
    return out, nil
end

-- named_edges(crm_id, record_id) -> the record, what its fields promise and
-- its active edges without those unnamed() drops. No record: no promise, every edge.
local function named_edges(crm_id: string, record_id: string): (Map?, { Expected }?, { Map }?, error?)
    local record = M.deps.reader.internal_get_record(crm_id, record_id)
    local edges, edge_err = M.edges(crm_id, record_id)
    if not edges then return nil, nil, nil, edge_err end
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
function M.record_files(crm_id: string, record_ref: any, opts: any): ({ Map }?, error?)
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

-- record_file_image(crm_id, record_ref, upload_id) -> the original image of
-- one of the record's image files, base64.
function M.record_file_image(crm_id: string, record_ref: any, upload_id: any): (Map?, error?)
    local record_id = M.record_id(record_ref)
    local id = trim(upload_id)
    if record_id == "" or id == "" then return nil, invalid("record_ref and upload_id are required") end
    local _, _, edges, err = named_edges(crm_id, record_id)
    if not edges then return nil, err end
    local edge: Map? = nil
    for _, candidate in ipairs(edges) do
        if trim(candidate.to_ref) == "file:" .. id then edge = candidate; break end
    end
    local attrs = edge and type(edge.attrs) == "table" and edge.attrs or {}
    if not edge or not M.authentic(crm_id, record_id, id, attrs) then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "the upload is not a file of this record" })
    end
    local image = M.deps.trusted.source_image(id)
    if not image then
        return nil, errors.new({ kind = errors.INVALID, message = "the file is not an image", details = { code = "not_an_image" } })
    end
    local bytes, bytes_err = M.deps.trusted.image_bytes(id, image.artifact_id, M.MAX_IMAGE_BYTES)
    if not bytes then return nil, bytes_err end
    return { content_base64 = base64.encode(bytes.bytes), content_type = bytes.content_type, size = bytes.size }, nil
end

return M
