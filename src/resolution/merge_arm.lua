local writer = require("writer")
local types = require("types")

local M = {}

local RESUME_TARGET = "kickside.blocks:resume"
local MAX_SNAPSHOT_VALUES = 10

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local function copy_map(v: any): any
    local out = {}
    if type(v) == "table" then
        for k, value in pairs(v :: any) do out[k] = value end
    end
    return out
end

local function snapshot_scalar(value: any): any
    local t = type(value)
    if t == "string" then
        local s = trim(value)
        return s ~= "" and s or nil
    end
    if t == "number" or t == "boolean" then return value end
    return nil
end

local function snapshot_record(reader_mod: any, crm_id: string, object_type: string, record_id: string): (any?, error?)
    local id = trim(record_id)
    local snapshot = { id = id, object_type = trim(object_type), values = {} }
    if trim(crm_id) == "" or id == "" then return snapshot, nil end
    local rec, record_err = (reader_mod :: any).get_record(crm_id, id)
    if record_err then return nil, record_err end
    if type(rec) ~= "table" then return nil, errors.new({ kind = errors.NOT_FOUND, message = "merge review record not found: " .. id }) end

    local rec_object_type = trim((rec :: any).object_type)
    if rec_object_type ~= "" then snapshot.object_type = rec_object_type end
    if snapshot.object_type ~= object_type then
        return nil, errors.new({ kind = errors.INVALID, message = "merge review record object type mismatch: " .. id })
    end

    local attributes, attr_err = (reader_mod :: any).attributes(crm_id, snapshot.object_type)
    if attr_err then return nil, attr_err end
    local count = 0
    for _, definition in ipairs(type(attributes) == "table" and attributes or {}) do
        if count >= MAX_SNAPSHOT_VALUES then break end
        local attr = trim((definition :: any).attr)
        local scalar = snapshot_scalar(type((rec :: any).values) == "table" and (rec :: any).values[attr] or nil)
        if attr ~= "" and scalar ~= nil then
            snapshot.values[attr] = scalar
            count = count + 1
        end
    end
    return snapshot, nil
end

local function mod(name: string): any
    if name == "writer" then return writer end
    if name == "types" then return types end
    return require(name)
end

local function snapshot_context(emit: any): (any?, error?)
    local context = type((emit :: any).context) == "table" and copy_map((emit :: any).context) or {}
    local reader_mod = mod("reader")
    local crm_id = trim((emit :: any).crm_id)
    local object_type = trim((emit :: any).object_type)
    local left, left_err = snapshot_record(reader_mod, crm_id, object_type, trim((emit :: any).left_id))
    if left_err then return nil, left_err end
    local right, right_err = snapshot_record(reader_mod, crm_id, object_type, trim((emit :: any).right_id))
    if right_err then return nil, right_err end
    context.left = left
    context.right = right
    return context, nil
end

local function actor_id(): (string?, error?)
    local security = mod("security")
    local actor = (security :: any).actor()
    if not actor then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "authenticated merge reviewer is required" }) end
    local resolved = trim((actor :: any):id())
    if resolved == "" then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "authenticated merge reviewer id is required" }) end
    return resolved, nil
end

local function signal_context(args: any): (string, string, string, string)
    local a = type(args) == "table" and args or {}
    local run_context = type((a :: any).run_context) == "table" and (a :: any).run_context or {}
    local dataflow_id = trim((a :: any).dataflow_id)
    local signal_id = trim((a :: any).signal_id)
    local workflow_id = trim((run_context :: any).workflow_id)
    local run_id = trim((run_context :: any).run_id)
    return dataflow_id, signal_id, workflow_id, run_id
end

local function block_input(args: any): any
    local a = type(args) == "table" and args or {}
    return type((a :: any).input) == "table" and copy_map((a :: any).input) or {}
end

local function metadata_for(args: any): (any?, error?)
    local dataflow_id, signal_id, workflow_id, run_id = signal_context(args)
    local input = block_input(args)
    local metadata = {}
    metadata.crm_id = trim((input :: any).crm_id)
    metadata.object_type = trim((input :: any).object_type)
    metadata.left_id = trim((input :: any).left_id)
    metadata.right_id = trim((input :: any).right_id)
    metadata.confidence = tonumber((input :: any).confidence) or 0
    metadata.reason = trim((input :: any).reason)
    metadata.evidence = type((input :: any).evidence) == "table" and (input :: any).evidence or nil
    metadata.evidence_hash = trim((input :: any).evidence_hash)
    if metadata.evidence_hash == "" and metadata.evidence ~= nil then
        metadata.evidence_hash = mod("suggest").evidence_hash(metadata.evidence)
    end
    local context, context_err = snapshot_context(input)
    if context_err then return nil, context_err end
    metadata.context = context
    metadata.workflow_id = workflow_id
    metadata.run_id = run_id
    metadata.dataflow_id = dataflow_id
    metadata.signal_id = signal_id
    return metadata, nil
end

local function item_id_for(metadata: any): string
    local dataflow_id = trim((metadata :: any).dataflow_id)
    local signal_id = trim((metadata :: any).signal_id)
    if dataflow_id ~= "" and signal_id ~= "" then
        return "crm-merge-review:" .. dataflow_id .. ":" .. signal_id
    end
    return "crm-merge-review:" .. trim((metadata :: any).crm_id) .. ":" .. trim((metadata :: any).left_id) .. ":" .. trim((metadata :: any).right_id)
end

local function item_title(metadata: any): string
    local object_type = trim((metadata :: any).object_type)
    if object_type == "" then object_type = "record" end
    return "Review possible duplicate " .. object_type
end

local function item_content(metadata: any): string
    local parts = {
        "Possible duplicate CRM records need review.",
        "Left: " .. trim((metadata :: any).left_id),
        "Right: " .. trim((metadata :: any).right_id),
    }
    local confidence = tonumber((metadata :: any).confidence)
    if confidence then parts[#parts + 1] = "Confidence: " .. tostring(confidence) end
    local reason = trim((metadata :: any).reason)
    if reason ~= "" then parts[#parts + 1] = "Reason: " .. reason end
    return table.concat(parts, "\n")
end

local function item_params(args: any): (any?, error?)
    local metadata, metadata_err = metadata_for(args)
    if metadata_err then return nil, metadata_err end
    local id = item_id_for(metadata)
    local a = type(args) == "table" and args or {}
    local config = type((a :: any).config) == "table" and (a :: any).config or {}
    local priority = trim((config :: any).priority)
    if priority == "" then priority = "normal" end
    return {
        id = id,
        item_type = "crm_merge_review",
        title = item_title(metadata),
        content = item_content(metadata),
        priority = priority,
        metadata = metadata,
        source_id = id,
        trace_context = {
            trace_id = "crm-merge:" .. (trim((metadata :: any).run_id) ~= "" and trim((metadata :: any).run_id) or trim((metadata :: any).dataflow_id)),
            run_id = trim((metadata :: any).run_id) ~= "" and trim((metadata :: any).run_id) or trim((metadata :: any).dataflow_id),
            correlation_key = trim((metadata :: any).signal_id),
        },
    }, nil
end

function M.preview_block(args: any): (any?, error?)
    return item_params(args)
end

function M.arm_block(args: any): (any?, error?)
    local dataflow_id, signal_id = signal_context(args)
    if dataflow_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "dataflow_id is required" }) end
    if signal_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "signal_id is required" }) end
    local params, params_err = item_params(args)
    if params_err then return nil, params_err end
    local inbox_writer = mod("inbox_writer")
    return (inbox_writer :: any).create(params)
end

local function item_metadata(args: any): any
    local a = type(args) == "table" and args or {}
    local item = type((a :: any).item) == "table" and (a :: any).item or {}
    return type((item :: any).metadata) == "table" and (item :: any).metadata or {}
end

local function item_type(args: any): string
    local a = type(args) == "table" and args or {}
    local item = type((a :: any).item) == "table" and (a :: any).item or {}
    return trim((item :: any).item_type)
end

local function form(args: any): any
    local a = type(args) == "table" and args or {}
    return type((a :: any).form) == "table" and (a :: any).form or {}
end

local function normalized_action(args: any): string
    local a = type(args) == "table" and args or {}
    return trim((a :: any).action)
end

local function pair_from_metadata(metadata: any): (string, string)
    return trim((metadata :: any).left_id), trim((metadata :: any).right_id)
end

local function merge_pair(metadata: any, f: any): (string?, string?, string?)
    local left_id, right_id = pair_from_metadata(metadata)
    local winner = trim((f :: any).winner_id)
    local loser = trim((f :: any).loser_id)
    if winner == "" then winner = left_id end
    if loser == "" then loser = winner == left_id and right_id or left_id end
    if winner == "" or loser == "" then return nil, nil, "winner_id and loser_id are required" end
    if winner == loser then return nil, nil, "winner_id and loser_id must differ" end
    local exact_pair = (winner == left_id and loser == right_id) or (winner == right_id and loser == left_id)
    if not exact_pair then return nil, nil, "winner_id and loser_id must be the reviewed record pair" end
    return winner, loser, nil
end

local function decision_value(action: string): string?
    if action == "merged" or action == "do_not_merge" or action == "skipped" then return action end
    return nil
end

local function item_id(args: any): string
    local a = type(args) == "table" and args or {}
    local id = trim((a :: any).item_id)
    if id ~= "" then return id end
    local item = type((a :: any).item) == "table" and (a :: any).item or {}
    id = trim((item :: any).id)
    if id ~= "" then return id end
    return item_id_for(item_metadata(args))
end

local function append_resolution(crm_writer: any, crm_id: string, metadata: any, action: string, f: any,
    resolved_by: string, id: string, winner_id: string?, loser_id: string?): (boolean?, error?, any?)
    local left_id, right_id = pair_from_metadata(metadata)
    local body = {
        left_id = left_id,
        right_id = right_id,
        object_type = trim((metadata :: any).object_type),
        decision = decision_value(action),
        confidence = tonumber((metadata :: any).confidence) or nil,
        reason = trim((metadata :: any).reason) ~= "" and trim((metadata :: any).reason) or ("review:" .. action),
        resolved_by = resolved_by,
        note = trim((f :: any).note) ~= "" and trim((f :: any).note) or nil,
        winner_id = winner_id,
        loser_id = loser_id,
        resolution_id = "resolve:" .. id,
    }
    local evidence_hash = trim((metadata :: any).evidence_hash)
    if evidence_hash ~= "" then body.evidence_hash = evidence_hash end
    if body.decision == nil then return nil, errors.new({ kind = errors.INVALID, message = "unknown merge review action: " .. action }) end
    local commands: any = { {
        type = types.EVENTS.MERGE_DECIDED,
        body = body,
        external = {
            external_source = "kickside.crm.merge_review",
            external_id = "resolve:" .. id,
            external_version = "1",
        },
    } }
    local ok, err, checkpoint = crm_writer.append(crm_id, commands, { trusted_ingress = true })
    return ok :: boolean?, err :: error?, checkpoint
end

local function resume_block(metadata: any, action: string, winner_id: string?, loser_id: string?, note: string?): (any?, error?)
    local dataflow_id = trim((metadata :: any).dataflow_id)
    local signal_id = trim((metadata :: any).signal_id)
    if dataflow_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "merge review has no dataflow_id" }) end
    if signal_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "merge review has no signal_id" }) end
    local funcs = mod("funcs")
    local executor, executor_err = (funcs :: any).new()
    if executor_err then return nil, errors.wrap(executor_err, "Block resume unavailable") end
    if not executor then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "Block resume unavailable" }) end
    local security = mod("security")
    local actor = (security :: any).actor()
    local scope = (security :: any).scope()
    if not actor or not scope then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "Block resume requires the resolution execution identity" }) end
    return (executor :: any):with_actor(actor):with_scope(scope):call(RESUME_TARGET, {
        dataflow_id = dataflow_id,
        signal_id = signal_id,
        payload = {
            decision = action,
            winner_id = winner_id,
            loser_id = loser_id,
            note = note,
        },
    })
end

local function appended_seq(result: any): number?
    if type(result) ~= "table" then return nil end
    return tonumber((result :: any).max_seq)
end

local function verify_resolution(crm_writer: any, crm_id: string, resolution_id: string, action: string,
    winner_id: string?, loser_id: string?, result: any): (any?, error?)
    local checkpoint, checkpoint_err = (crm_writer :: any).catch_up_read_model(crm_id, appended_seq(result))
    if not checkpoint then return nil, checkpoint_err end
    local reader = mod("reader")
    local row, read_err = (reader :: any).merge_resolution(crm_id, resolution_id)
    if read_err then return nil, read_err end
    if type(row) ~= "table" or trim((row :: any).resolution_id) ~= resolution_id then
        return nil, errors.new({ kind = errors.INTERNAL, message = "merge resolution did not materialize" })
    end
    if trim((row :: any).decision) ~= action then return nil, errors.new({ kind = errors.CONFLICT, message = "this review already committed a different decision" }) end
    if action == "merged" and (trim((row :: any).winner_id) ~= trim(winner_id)
        or trim((row :: any).loser_id) ~= trim(loser_id)) then
        return nil, errors.new({ kind = errors.CONFLICT, message = "this review already committed a different merge orientation" })
    end
    return row, nil
end

local function preflight_write(crm_writer: any, crm_id: string): (boolean?, error?)
    local component = mod("component")
    local ok, err = (crm_writer :: any).require_access(crm_id, (component :: any).ACCESS.WRITE)
    if not ok then return nil, err end
    return true, nil
end

-- Inbox treats this explicit shape as a client-correctable refusal. Any ordinary
-- nil,error below is operational and deliberately retains best-effort resolution.
local function refusal(code: string, message: string): (any, nil)
    return { refusal = { code = code, message = message } }, nil
end

local function validate_merge(args: any): (any?, error?)
    local metadata = item_metadata(args)
    if item_type(args) ~= "crm_merge_review" then return nil, errors.new({ kind = errors.INVALID, message = "invalid CRM merge review item type" }) end
    local crm_id = trim((metadata :: any).crm_id)
    if crm_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    local object_type = trim((metadata :: any).object_type)
    if object_type == "" then return nil, errors.new({ kind = errors.INVALID, message = "object_type is required" }) end
    local left_id, right_id = pair_from_metadata(metadata)
    if left_id == "" or right_id == "" or left_id == right_id then
        return nil, errors.new({ kind = errors.INVALID, message = "merge review requires two distinct record ids" })
    end
    local action = normalized_action(args)
    if not decision_value(action) then return refusal("merge_action_invalid", "unknown merge review action: " .. tostring(action)) end
    local f = form(args)
    local crm_writer = mod("writer")
    if not crm_writer then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "crm writer unavailable" }) end
    local allowed, aerr = preflight_write(crm_writer, crm_id)
    if not allowed then return nil, aerr end
    local id = item_id(args)
    if id == "" then return nil, errors.new({ kind = errors.INVALID, message = "merge review item id is required" }) end
    if id ~= item_id_for(metadata) then return nil, errors.new({ kind = errors.INVALID, message = "merge review item id does not match metadata" }) end
    if trim((metadata :: any).dataflow_id) == "" or trim((metadata :: any).signal_id) == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "merge review requires durable dataflow_id and signal_id" })
    end
    local reviewer, reviewer_err = actor_id()
    if reviewer_err then return nil, reviewer_err end

    local reader = mod("reader")
    local left, left_err = (reader :: any).get_record(crm_id, left_id)
    if left_err then return nil, left_err end
    local right, right_err = (reader :: any).get_record(crm_id, right_id)
    if right_err then return nil, right_err end
    if type(left) ~= "table" or type(right) ~= "table" then return nil, errors.new({ kind = errors.NOT_FOUND, message = "reviewed CRM records no longer exist" }) end
    if trim((left :: any).object_type) ~= object_type or trim((right :: any).object_type) ~= object_type then
        return nil, errors.new({ kind = errors.INVALID, message = "reviewed CRM records no longer match the review object type" })
    end
    local winner_id: string? = nil
    local loser_id: string? = nil

    if action == "merged" then
        local w, l, perr = merge_pair(metadata, f)
        if perr then return refusal("merge_pair_invalid", perr) end
        winner_id, loser_id = w, l
    end

    return {
        metadata = metadata,
        crm_id = crm_id,
        object_type = object_type,
        action = action,
        form = f,
        writer = crm_writer,
        item_id = id,
        winner_id = winner_id,
        loser_id = loser_id,
        reviewer = reviewer,
    }, nil
end

function M.validate_merge_resolution(args: any): (any?, error?)
    local validated, err = validate_merge(args)
    if err or (type(validated) == "table" and (validated :: any).refusal) then return validated, err end
    return { ok = true }, nil
end

function M.merge_on_resolve(args: any): (any?, error?)
    local validated, validation_err = validate_merge(args)
    if validation_err or (type(validated) == "table" and (validated :: any).refusal) then
        return validated, validation_err
    end
    local metadata = (validated :: any).metadata
    local crm_id = (validated :: any).crm_id :: string
    local action = (validated :: any).action :: string
    local f = (validated :: any).form
    local crm_writer = (validated :: any).writer
    local id = (validated :: any).item_id :: string
    local winner_id: string? = trim((validated :: any).winner_id)
    local loser_id: string? = trim((validated :: any).loser_id)
    if winner_id == "" then winner_id = nil end
    if loser_id == "" then loser_id = nil end

    local reviewer = (validated :: any).reviewer :: string
    local ok, derr, result = append_resolution(crm_writer, crm_id, metadata, action, f, reviewer, id, winner_id, loser_id)
    if not ok then return nil, derr end
    local committed, verify_err = verify_resolution(crm_writer, crm_id, "resolve:" .. id, action, winner_id, loser_id, result)
    if verify_err then return nil, verify_err end

    local resumed, rerr = resume_block(metadata, action, winner_id, loser_id, trim((committed :: any).note))
    if rerr then return nil, rerr end
    return { ok = true, resume = resumed }, nil
end

return M
