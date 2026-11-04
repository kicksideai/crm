-- Entry points of record file downloads (ATN-98): the automation sink, the
-- upload completion callback, the one-off backfill and the hourly sweep.
local download = require("download")

type Map = { [string]: any }

local function trim(value: any): string
    if type(value) == "number" then value = tostring(value) end
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function failure(code: string, message: any, retriable: boolean, scope: string): Map
    return { success = false, error = { code = code, message = tostring(message), retriable = retriable, scope = scope } }
end

local function refusal(err: any): Map
    if errors.is(err, errors.PERMISSION_DENIED) then return failure("permission_denied", err, false, "item") end
    if errors.is(err, errors.INVALID) or errors.is(err, errors.NOT_FOUND) then return failure("invalid_request", err, false, "item") end
    return failure("provider_unavailable", err, true, "provider")
end

-- write(req) -- kickside.data:writable.write of the record attachments port:
-- download the files the delivered record's attachment fields promise on
-- upsert; delete downloads nothing.
local function write(req: any): Map
    local request = type(req) == "table" and req or {}
    local config = type(request.config) == "table" and request.config or {}
    local input = type(request.input) == "table" and request.input or {}
    local crm_id = trim(config.crm_id)
    local component_id = trim(config.component_id)
    local record_id = (trim(input.record_id):gsub("^crm:", ""))
    local slot = trim(request.map_slot) ~= "" and trim(request.map_slot) or "default"
    local sink_op = trim(request.sink_op)
    if crm_id == "" then return failure("invalid_request", "config.crm_id is required", false, "item") end
    if sink_op ~= "upsert" and sink_op ~= "delete" then
        return failure("invalid_request", "unsupported sink operation: " .. sink_op, false, "item")
    end
    if record_id == "" then return failure("invalid_request", "input.record_id is required", false, "item") end
    local dest_ref = { crm_id = crm_id, record_id = record_id }
    -- A deleted source item downloads nothing; the record's edges stay as they are.
    if sink_op == "delete" then
        return { success = true, result = "noop", dest_ref = dest_ref, dest_refs = { [slot] = { dest_ref = dest_ref } } }
    end

    local counts, err = download.download_record(crm_id, record_id, component_id)
    if not counts then return refusal(err) end
    local result = (counts.downloaded + counts.failed) > 0 and "updated" or "noop"
    return { success = true, result = result, dest_ref = dest_ref, dest_refs = { [slot] = { dest_ref = dest_ref } } }
end

local function on_upload_complete(args: any): (Map?, error?)
    return download.on_upload_complete(args)
end

-- backfill({crm_id, component_id, object_type?}) -> counts.
local function backfill(args: any): (Map?, error?)
    local input = type(args) == "table" and args or {}
    local crm_id = trim(input.crm_id)
    if crm_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    return download.backfill(crm_id, trim(input.component_id), { object_type = input.object_type })
end

-- sweep(req) -- kickside.data:writable.write of the record files sweep port,
-- run by a recurring task: retries failed downloads, expires stuck pending
-- ones and downloads files the automation missed, leaving records younger
-- than download.SWEEP_FRESH_MS to the automation.
local function sweep(req: any): Map
    local request = type(req) == "table" and req or {}
    local config = type(request.config) == "table" and request.config or {}
    local crm_id = trim(config.crm_id)
    if crm_id == "" then return failure("invalid_request", "config.crm_id is required", false, "item") end
    local total, err = download.backfill(crm_id, trim(config.component_id), { fresh_ms = download.SWEEP_FRESH_MS })
    if not total then return refusal(err) end
    local counts = { records = total.records, downloaded = total.downloaded, failed = total.failed, skipped = total.skipped }
    local result = (total.downloaded + total.failed) > 0 and "updated" or "noop"
    return { success = true, result = result, counts = counts }
end

return { write = write, on_upload_complete = on_upload_complete, backfill = backfill, sweep = sweep }
