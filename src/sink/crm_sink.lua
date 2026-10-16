local component = require("component")
local ctx = require("ctx")
local hash = require("hash")
local json = require("json")
local sql = require("sql")
local storage = require("storage")
local types = require("types")
local writer = require("writer")
local commands = require("sink_commands")
local sink_receipts = require("sink_receipts")

local M = {}

type UnknownMap = { [string]: unknown }
type DynamicTable = { [string | number]: unknown }
type ErrorResponse = {
    success: boolean,
    error: {
        code: string,
        message: string,
        retriable: boolean,
        scope: string,
        dependency_key: string?,
    },
}
type SuccessResponse = {
    success: boolean,
    result: unknown,
    dest_ref: UnknownMap,
}
type Command = {
    type: string,
    body: UnknownMap,
    external: UnknownMap?,
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function response_error(code: string, message: unknown, retriable: boolean, scope: string): ErrorResponse
    return {
        success = false,
        error = {
            code = code,
            message = tostring(message),
            retriable = retriable,
            scope = scope,
        },
    }
end

-- append_failure answers a refused write as the item's own failure and a
-- dependency or storage failure as a retriable provider failure.
local function append_failure(err: error): ErrorResponse
    if errors.is(err, errors.PERMISSION_DENIED) then
        return response_error("permission_denied", err, false, "item")
    end
    if errors.is(err, errors.INVALID) or errors.is(err, errors.NOT_FOUND) or errors.is(err, errors.CONFLICT) then
        return response_error("invalid_request", err, false, "item")
    end
    return response_error("provider_unavailable", err, true, "provider")
end

local function validation_error(message: string): ErrorResponse
    return response_error("invalid_request", message, false, "item")
end

local function idempotency_conflict(): ErrorResponse
    return response_error("conflict", "sink idempotency conflict", false, "item")
end

local function stable(value: unknown): string
    local value_type = type(value)
    if value == nil then return "null" end
    if value_type == "boolean" then return value and "true" or "false" end
    if value_type == "number" then return tostring(value) end
    if value_type == "string" then
        local encoded, err = json.encode(value)
        if err then error(err, 0) end
        return encoded
    end
    if value_type ~= "table" then error("sink request contains unsupported value type: " .. value_type, 0) end

    local source = value :: DynamicTable
    local count, array = 0, true
    for key in pairs(source) do
        count = count + 1
        if type(key) ~= "number" or key % 1 ~= 0 or key < 1 then array = false end
    end
    if array then
        for index = 1, count do if source[index] == nil then array = false; break end end
    end
    if array then
        local parts = {}
        for index = 1, count do parts[#parts + 1] = stable(source[index]) end
        return "[" .. table.concat(parts, ",") .. "]"
    end

    local keys = {}
    for key in pairs(source) do
        if type(key) ~= "string" then error("sink request object keys must be strings", 0) end
        keys[#keys + 1] = key
    end
    table.sort(keys)
    local parts = {}
    for _, key in ipairs(keys) do parts[#parts + 1] = stable(key) .. ":" .. stable(source[key]) end
    return "{" .. table.concat(parts, ",") .. "}"
end

local function payload_hash(config: UnknownMap, input: UnknownMap, operation: string, dest_ref: unknown): (string?, string?)
    local ok, encoded = pcall(stable, { config = config, input = input, operation = operation, dest_ref = dest_ref })
    if not ok then return nil, tostring(encoded) end
    return tostring(hash.sha256(encoded)), nil
end

local function open_db(): (sql.DB?, string?)
    local db, err = sql.get(types.db_id())
    if not db then return nil, tostring(err or "crm: app:db unavailable") end
    return db, nil
end

local function decode_dest_ref(value: unknown): (UnknownMap?, unknown?)
    if type(value) ~= "string" then return nil, "sink receipt dest_ref must be a JSON object" end
    local decoded, err = json.decode(value)
    if err then return nil, err end
    if type(decoded) ~= "table" or not value:match("^%s*{") then
        return nil, "sink receipt dest_ref must be a JSON object"
    end
    return decoded :: UnknownMap, nil
end

-- The committed receipt of this effect, or nil before its first delivery. A receipt
-- recorded for another payload under the same key is a conflict.
local function replay(crm_id: string, origin: string, operation: string, idempotency_key: string, digest: string): (SuccessResponse?, ErrorResponse?)
    local db, db_err = open_db()
    if not db then return nil, response_error("provider_unavailable", db_err, true, "provider") end
    local receipt, receipt_err = sink_receipts.read(db, crm_id, origin, operation, idempotency_key)
    db:release()
    if receipt_err then return nil, response_error("provider_unavailable", receipt_err, true, "provider") end
    if not receipt then return nil, nil end
    if receipt.payload_hash ~= digest then return nil, idempotency_conflict() end
    local dest_ref, decode_err = decode_dest_ref(receipt.dest_ref)
    if decode_err then return nil, response_error("provider_error", decode_err, false, "provider") end
    return { success = true, result = receipt.outcome, dest_ref = dest_ref :: UnknownMap }, nil
end

-- Records the receipt once its effect is durable. A concurrent delivery of the same
-- effect may have committed first; its receipt answers if it names this payload.
local function commit_receipt(crm_id: string, origin: string, operation: string, idempotency_key: string, digest: string,
    outcome: string, dest_ref: UnknownMap): (boolean?, ErrorResponse?)
    local encoded, encode_err = json.encode(dest_ref)
    if encode_err then return nil, response_error("provider_error", encode_err, true, "provider") end
    local db, db_err = open_db()
    if not db then return nil, response_error("provider_unavailable", db_err, true, "provider") end
    local stored, commit_err = sink_receipts.commit(db, crm_id, {
        origin = origin, sink_op = operation, idempotency_key = idempotency_key, payload_hash = digest,
        outcome = outcome, dest_ref = encoded, completed_at = types.now(),
    })
    db:release()
    if commit_err or not stored then return nil, response_error("provider_error", commit_err, true, "provider") end
    if stored.payload_hash ~= digest then return nil, idempotency_conflict() end
    return true, nil
end

-- Create-vs-update resolves on the record itself, not on delivery history: sources
-- re-identify a changed item with a new item_key per version, so a redelivery
-- legitimately arrives with no dest_ref for a record that already exists. A
-- crash-window replay of this delivery never reaches here: it is answered from its
-- durable event first.
local function record_exists(crm_id: string, record_id: string): (boolean?, ErrorResponse?)
    local db, db_err = open_db()
    if not db then return nil, response_error("provider_unavailable", db_err, true, "provider") end
    local existing, locate_err = storage.locate(db, crm_id, record_id)
    db:release()
    if locate_err then return nil, response_error("provider_unavailable", locate_err, true, "provider") end
    return existing ~= nil, nil
end

-- The delivery an effect's durable event records: the payload digest it was
-- applied for and the answer it gave. The event is appended atomically with the
-- effect, so a delivery whose receipt is missing is answered from here, and only
-- for the payload the effect was applied for.
type Delivery = { payload_hash: string, outcome: string, dest_ref: UnknownMap, seq: number? }

local function recover_delivery(crm_id: string, external: UnknownMap, candidate_types: { string },
    digest: string): (Delivery?, ErrorResponse?)
    local durable, durable_err = writer.durable_event(crm_id, external, candidate_types)
    if durable_err then return nil, response_error("provider_unavailable", durable_err, true, "provider") end
    if not durable then return nil, nil end
    local body = type(durable.body) == "table" and durable.body :: UnknownMap or {}
    local recorded = type(body.delivery) == "table" and body.delivery :: UnknownMap or nil
    if not recorded or type(recorded.payload_hash) ~= "string" then
        return nil, response_error("conflict",
            "the durable effect of this delivery records no payload digest to bind it to", false, "item")
    end
    if recorded.payload_hash ~= digest then return nil, idempotency_conflict() end
    return {
        payload_hash = recorded.payload_hash :: string,
        outcome = tostring(recorded.outcome),
        dest_ref = type(recorded.dest_ref) == "table" and recorded.dest_ref :: UnknownMap or {},
        seq = tonumber(durable.seq),
    }, nil
end

-- These kinds all name a record the delete must resolve against, and the domain
-- refuses the command when it is missing. A destination that does not hold the
-- record is already in the state the delivery asks for, so the delete has
-- converged; answering noop settles it instead of failing the item on every pass.
local DELETE_NEEDS_RECORD: { [string]: boolean } = { record = true, relation = true, membership = true }
local function delete_target_absent(crm_id: string, input: UnknownMap): (boolean?, ErrorResponse?)
    local kind = trim(input.kind)
    if kind == "activity" then
        local db, db_err = open_db()
        if not db then return nil, response_error("provider_unavailable", db_err, true, "provider") end
        local found, locate_err = storage.locate_activity(db, crm_id,
            commands.optional_input(input, "activity_id"), commands.optional_input(input, "external_id"),
            commands.optional_input(input, "correlation_key"))
        db:release()
        if locate_err then return nil, response_error("provider_unavailable", locate_err, true, "provider") end
        return found == nil, nil
    end
    if not DELETE_NEEDS_RECORD[kind] then return false, nil end
    local record_id = trim(input.record_id)
    if record_id == "" then return false, nil end
    local db, db_err = open_db()
    if not db then return nil, response_error("provider_unavailable", db_err, true, "provider") end
    local existing, locate_err = storage.locate(db, crm_id, record_id)
    db:release()
    if locate_err then return nil, response_error("provider_unavailable", locate_err, true, "provider") end
    return existing == nil, nil
end

function M.write(req: unknown): UnknownMap
    if type(req) ~= "table" then return validation_error("request must be an object") end
    local request = req :: UnknownMap
    local config = type(request.config) == "table" and request.config :: UnknownMap or nil
    local input = type(request.input) == "table" and request.input :: UnknownMap or nil
    if not config then return validation_error("config is required") end
    if not input then return validation_error("input is required") end
    local crm_id = trim(config.crm_id)
    if crm_id == "" then return validation_error("config.crm_id is required") end
    local operation = trim(request.sink_op)
    if operation == "" then return validation_error("sink_op is required") end
    local idempotency_key = trim(request.idempotency_key)
    if idempotency_key == "" then return validation_error("idempotency_key is required") end
    -- idempotency_key identifies the source item, which two syncs reading one
    -- source share; origin identifies the writer, so their receipts stay apart.
    local origin = trim(request.origin)
    if origin == "" then return validation_error("origin is required: the writing sync's automation id") end
    -- A sync delete carries no transform output: its target is the destination
    -- this sink wrote, which the receipt's dest_ref names.
    if operation == "delete" and next(input) == nil then
        local derived, derive_err = commands.delete_input(crm_id, request.dest_ref)
        if not derived then return validation_error(derive_err :: string) end
        input = derived
    end
    if trim(input.kind) == "" then return validation_error("input.kind is required") end
    local shape_err = commands.validate_shape(config, input)
    if shape_err then return validation_error(shape_err) end
    local provenance, provenance_err = commands.validate_provenance(input)
    if provenance_err then return validation_error(provenance_err) end
    local allowed, access_err = writer.require_access(crm_id, component.ACCESS.WRITE)
    if not allowed then return response_error("permission_denied", access_err, false, "item") end
    local digest, digest_err = payload_hash(config, input, operation, request.dest_ref)
    if not digest then return validation_error(digest_err :: string) end
    -- The sync's writable ABI reads dest_refs as a map keyed by the delivery's
    -- map_slot: that map is what the destination bookkeeping stores per item.
    -- The bare dest_ref stays alongside for callers that address a single ref.
    local map_slot = trim(request.map_slot)
    if map_slot == "" then map_slot = "default" end
    -- A landed record answers to the dependency key other writes may be
    -- blocked on; the delivery carries it so the caller can release them.
    local announced: { string } = {}
    if trim(input.kind) == "record" and operation ~= "delete" then
        announced[1] = writer.record_dependency_key(crm_id, trim(input.record_id))
    end
    local function delivered(outcome_value: unknown, ref: UnknownMap): UnknownMap
        local out: UnknownMap = {
            success = true,
            result = outcome_value,
            dest_ref = ref,
            dest_refs = { [map_slot] = { dest_ref = ref } },
        }
        if #announced > 0 then out.dependencies_available = announced end
        return out
    end
    local prior, replay_err = replay(crm_id, origin, operation, idempotency_key, digest)
    if replay_err then return replay_err end
    if prior then return delivered(prior.result, prior.dest_ref) end

    local command_input: UnknownMap = {}
    for key, value in pairs(input) do
        if key ~= "provenance" then command_input[key] = value end
    end
    command_input._crm_id = crm_id
    if operation == "upsert" and trim(input.kind) == "record" then
        local values, values_err = commands.mapped_fields(config, input.values, "values")
        if not values then return validation_error(values_err :: string) end
        command_input.values = values
    elseif operation == "update" and trim(input.kind) == "record" and input.set ~= nil then
        local set, set_err = commands.mapped_fields(config, input.set, "set")
        if not set then return validation_error(set_err :: string) end
        command_input.set = set
    end
    if operation == "update" and trim(input.kind) == "record" and input.set_if_absent ~= nil then
        local conditional, conditional_err = commands.mapped_fields(config, input.set_if_absent, "set_if_absent")
        if not conditional then return validation_error(conditional_err :: string) end
        command_input.set_if_absent = conditional
    end
    if operation == "update" and trim(input.kind) == "record" and input.append_unique ~= nil then
        local appended, append_err = commands.mapped_fields(config, input.append_unique, "append_unique")
        if not appended then return validation_error(append_err :: string) end
        command_input.append_unique = appended
    end
    if operation == "update" and trim(input.kind) == "record" and input.unset ~= nil then
        local unset, unset_err = commands.mapped_unset(config, input.unset)
        if not unset then return validation_error(unset_err :: string) end
        command_input.unset = unset
    end
    if operation == "upsert" and trim(input.kind) == "record"
        and request.dest_ref == nil and trim(input.record_id) ~= "" then
        local update_shape, shape_err = record_exists(crm_id, trim(input.record_id))
        if shape_err then return shape_err end
        command_input._update_shape = update_shape
    end
    local command, outcome, dest_ref, command_err = commands.command_for(operation, command_input, request.dest_ref)
    if not command then return validation_error(command_err :: string) end
    if provenance ~= nil and type((command :: Command).body) == "table" then
        ((command :: Command).body :: UnknownMap).provenance = provenance
    end
    command.external = writer.sink_external(origin, operation, idempotency_key)
    -- A record upsert appended either shape; every other delivery has one.
    local candidates = { (command :: Command).type }
    if operation == "upsert" and trim(input.kind) == "record" then
        candidates = { types.EVENTS.RECORD_CREATED, types.EVENTS.RECORD_UPDATED }
    end
    local deadline = trim(ctx.get("deadline"))
    -- The receipt is missing but the effect may be durable: answer what it recorded.
    local recovered, recover_err = recover_delivery(crm_id, command.external :: UnknownMap, candidates, digest)
    if recover_err then return recover_err end
    -- Checked once the delivery is known to be well formed, so a malformed delete
    -- still reports why rather than converging on a record it never named. No
    -- effect is applied, so no receipt is retained: a redelivery re-derives the
    -- same answer from the destination itself.
    if operation == "delete" then
        local absent, absent_err = delete_target_absent(crm_id, input)
        if absent_err then return absent_err end
        if absent and not recovered then return { success = true, result = "noop" } end
    end
    if recovered then
        local projected, projection_err = writer.catch_up_read_model(crm_id, recovered.seq, deadline ~= "" and deadline or nil)
        if not projected then return response_error("provider_unavailable", projection_err, true, "provider") end
        local _, receipt_err = commit_receipt(crm_id, origin, operation, idempotency_key, digest,
            recovered.outcome, recovered.dest_ref)
        if receipt_err then return receipt_err end
        return delivered(recovered.outcome, recovered.dest_ref)
    end
    ((command :: Command).body :: UnknownMap).delivery = { payload_hash = digest, outcome = outcome, dest_ref = dest_ref }
    local _, append_err, append_result = writer.append(crm_id, { command })
    if append_err then
        -- A write blocked on a record that does not exist yet is a dependency,
        -- retriable once that record lands, and the key names exactly which.
        local detail = append_err:details()
        if type(detail) == "table" and trim((detail :: UnknownMap).code) == "dependency_missing" then
            local blocked = response_error("dependency_missing", append_err, true, "item")
            local blocked_error = blocked.error :: UnknownMap
            blocked_error.dependency_key = (detail :: UnknownMap).dependency_key
            return blocked
        end
        return append_failure(append_err)
    end
    local append_seq: number? = nil
    if type(append_result) == "table" then append_seq = tonumber((append_result :: UnknownMap).max_seq) end
    -- A sync round opens the sink with its work deadline; the projection wait
    -- ends there with a retriable failure, inside the round's own deadline.
    local projected, projection_err = writer.catch_up_read_model(crm_id, append_seq, deadline ~= "" and deadline or nil)
    if not projected then return response_error("provider_unavailable", projection_err, true, "provider") end
    -- A concurrent delivery under this identity appended first: its effect stands,
    -- and answers this one only if it was applied for this payload.
    if type(append_result) == "table" and (tonumber((append_result :: UnknownMap).duplicates) or 0) > 0 then
        local winner, winner_err = recover_delivery(crm_id, command.external :: UnknownMap, candidates, digest)
        if winner_err then return winner_err end
        if not winner then return response_error("provider_error", "a duplicate append left no durable event", true, "provider") end
        outcome, dest_ref = winner.outcome, winner.dest_ref
    end

    local _, receipt_err = commit_receipt(crm_id, origin, operation, idempotency_key, digest, outcome :: string, dest_ref)
    if receipt_err then return receipt_err end
    return delivered(outcome, dest_ref)
end

function M.list_keys(req: unknown): UnknownMap
    if type(req) ~= "table" then return validation_error("config is required") end
    local request = req :: UnknownMap
    if type(request.config) ~= "table" then return validation_error("config is required") end
    local config = request.config :: UnknownMap
    local crm_id = trim(config.crm_id)
    if crm_id == "" then return validation_error("config.crm_id is required") end
    local allowed, access_err = writer.require_access(crm_id, component.ACCESS.READ)
    if not allowed then return response_error("permission_denied", access_err, false, "item") end
    -- Reconcile deletes every key this listing returns that its source no longer
    -- has, so an unscoped or silently truncated listing destroys records. The
    -- origin argument names the asking sync, and the cursor pages the rest.
    local origin = trim(request.origin)
    if origin == "" then return validation_error("origin is required: the asking sync's automation id") end
    local limit = math.max(1, math.min(math.floor(tonumber(request.limit) or 500), 500))
    local cursor = trim(request.cursor)
    local db, db_err = open_db()
    if not db then return response_error("provider_unavailable", db_err, true, "provider") end
    local page, query_err = sink_receipts.list(db, crm_id, origin, cursor, limit)
    db:release()
    if query_err or not page then return response_error("provider_unavailable", query_err, true, "provider") end
    local keys: { UnknownMap } = {}
    for _, row in ipairs(page.rows) do
        local dest_ref, decode_err = decode_dest_ref(row.dest_ref)
        if decode_err then return response_error("provider_error", decode_err, false, "provider") end
        keys[#keys + 1] = { item_key = row.idempotency_key, dest_ref = dest_ref }
    end
    return { success = true, keys = keys, next_cursor = page.next_cursor, has_more = page.has_more }
end

return M
