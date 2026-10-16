-- CRM write-boundary constraints: the thin pre-append enforcement the CRM owns.
-- owns (required identity fields, known attribute types). It is NOT a second ACL or a
-- second automation engine -- record-level access is the component ACL, and richer
-- validation rules (variant-scoped boolean expressions) are a later declarative layer.
-- Blocks BEFORE the event is appended; events are post-facto.
local types = require("types")

local M = {}
type UnknownMap = { [string]: unknown }

local function nonempty(v: unknown): boolean
    return type(v) == "string" and v ~= ""
end

local REFERENCE_KINDS = { record = true, principal = true, component = true }

local EDGE_TYPE_SET: { [string]: boolean } = {}
for _, role in ipairs(types.EDGE_TYPES) do EDGE_TYPE_SET[role] = true end
local REF_KIND_SET: { [string]: boolean } = {}
for _, kind in ipairs(types.REF_KINDS) do REF_KIND_SET[kind] = true end

-- A reference is `kind:tail`. Only the leading kind is a closed token; the tail is an
-- opaque, non-empty identity (record ids and external ids keep their own colons).
local function ref_error(value: unknown, name: string): string?
    if type(value) ~= "string" or value == "" then return name .. " required" end
    local kind, tail = (value :: string):match("^([^:]+):(.+)$")
    if not kind or not tail or tail == "" then return name .. " must be kind:id" end
    if not REF_KIND_SET[kind] then return "unknown " .. name .. " kind: " .. kind end
    return nil
end

local function reference_error(reference: unknown): string?
    if type(reference) ~= "table" then return "reference required" end
    local ref = reference :: UnknownMap
    if not nonempty(ref.kind) then return "reference.kind required" end
    local kind = tostring(ref.kind)
    if not REFERENCE_KINDS[kind] then
        return "unknown reference.kind: " .. kind
    end
    if not nonempty(ref.type) then return "reference.type required" end
    if not nonempty(ref.id) then return "reference.id required" end
    return nil
end

-- Returns an error string to block the write, or nil to allow it.
function M.check(etype: string, value: unknown): string?
    local body: UnknownMap = type(value) == "table" and (value :: UnknownMap) or {}
    local E = types.EVENTS

    -- A sink delivery binds its effect to the payload digest it was applied for.
    if body.delivery ~= nil then
        local delivery: UnknownMap = type(body.delivery) == "table" and (body.delivery :: UnknownMap) or {}
        if not nonempty(delivery.payload_hash) or not nonempty(delivery.outcome) or type(delivery.dest_ref) ~= "table" then
            return "delivery requires payload_hash, outcome and dest_ref"
        end
    end

    if etype == E.RECORD_CREATED or etype == E.RECORD_UPDATED then
        if not nonempty(body.record_id) then return "record_id required" end
        if not nonempty(body.object_type) then return "object_type required" end
        if etype == E.RECORD_UPDATED and type(body.set) ~= "table" and type(body.unset) ~= "table"
            and type(body.set_if_absent) ~= "table" and type(body.append_unique) ~= "table" then
            return "record.updated requires set, set_if_absent, append_unique, or unset"
        end
    elseif etype == E.RECORD_DELETED then
        if not nonempty(body.record_id) or not nonempty(body.object_type) then
            return "record_id and object_type required"
        end

    elseif etype == E.MERGE_SUGGESTED then
        if not nonempty(body.left_id) or not nonempty(body.right_id) then return "left_id and right_id required" end
        if body.left_id == body.right_id then return "left_id and right_id must differ" end
        if not nonempty(body.object_type) then return "object_type required" end

    elseif etype == E.MERGE_DECIDED then
        if not nonempty(body.left_id) or not nonempty(body.right_id) then return "left_id and right_id required" end
        if body.left_id == body.right_id then return "left_id and right_id must differ" end
        if not nonempty(body.object_type) then return "object_type required" end
        if not nonempty(body.decision) then return "decision required" end
        if not nonempty(body.resolution_id) then return "resolution_id required" end
        local d = tostring(body.decision)
        if d ~= "merged" and d ~= "do_not_merge" and d ~= "skipped" then
            return "unknown merge decision: " .. d
        end
        if d == "merged" then
            if not nonempty(body.winner_id) or not nonempty(body.loser_id) then
                return "merged decision requires winner_id and loser_id"
            end
            if body.winner_id == body.loser_id then return "winner_id and loser_id must differ" end
        end
        if body.override ~= nil and type(body.override) ~= "boolean" then
            return "merge override must be a boolean"
        end
        if body.override == true then
            if d ~= "merged" then return "merge override requires decision=merged" end
            if not nonempty(body.reviewer_actor) then return "merge override reviewer_actor required" end
            if not nonempty(body.reason) then return "merge override reason required" end
            if not nonempty(body.prior_decision_ref) then return "merge override prior_decision_ref required" end
        end

    elseif etype == E.RELATION_LINKED or etype == E.RELATION_UNLINKED then
        if not nonempty(body.record_id) or not nonempty(body.object_type) or not nonempty(body.attr) then
            return "record_id, object_type, and attr required"
        end
        local rerr = reference_error(body.reference)
        if rerr then return rerr end
        if body.relation ~= nil and not nonempty(body.relation) then return "relation must be a non-empty string" end

    elseif etype == E.REFERENCE_LINKED or etype == E.REFERENCE_UNLINKED then
        local from_err = ref_error(body.from_ref, "from_ref")
        if from_err then return from_err end
        if not nonempty(body.edge_type) then return "edge_type required" end
        if not EDGE_TYPE_SET[tostring(body.edge_type)] then return "unknown edge_type: " .. tostring(body.edge_type) end
        local to_err = ref_error(body.to_ref, "to_ref")
        if to_err then return to_err end
        if body.attrs ~= nil and type(body.attrs) ~= "table" then return "attrs must be an object" end
        if body.active ~= nil and type(body.active) ~= "boolean" then return "active must be a boolean" end

    elseif etype == E.MEMBERSHIP_SET then
        if not nonempty(body.collection_id) or not nonempty(body.record_id) or not nonempty(body.stage_id) then
            return "collection_id, record_id, stage_id required"
        end

    elseif etype == E.MEMBERSHIP_REMOVED then
        if not nonempty(body.collection_id) or not nonempty(body.record_id) then return "collection_id and record_id required" end

    elseif etype == E.ACTIVITY_LOGGED then
        if not nonempty(body.activity_id) or not nonempty(body.record_id) or not nonempty(body.activity_type) then
            return "activity_id, record_id, activity_type required"
        end

    elseif etype == E.ACTIVITY_DELETED then
        if not nonempty(body.activity_id) and not nonempty(body.external_id) and not nonempty(body.correlation_key) then
            return "activity_id, external_id, or correlation_key required"
        end

    elseif etype == E.AI_ATTRIBUTE_FILLED then
        if not nonempty(body.record_id) or not nonempty(body.object_type) or not nonempty(body.attr) then
            return "record_id, object_type, and attr required"
        end
        if body.value == nil then return "ai attribute fill value required" end

    elseif etype == E.EXTERNAL_WRITE_REQUESTED then
        if not nonempty(body.provider) or not nonempty(body.target_ref) or not nonempty(body.object_type) or not nonempty(body.write_ref) then
            return "external write requested requires provider, target_ref, object_type, and write_ref"
        end
        if type(body.value_hashes) ~= "table" then return "external write requested value_hashes required" end

    elseif etype == E.EXTERNAL_WRITE_SUCCEEDED then
        if not nonempty(body.provider) or not nonempty(body.connection_id) or not nonempty(body.target_ref)
            or not nonempty(body.object_type) or not nonempty(body.write_ref) or not nonempty(body.completed_at) then
            return "external write succeeded requires provider, connection_id, target_ref, object_type, write_ref, and completed_at"
        end
        if type(body.value_hashes) ~= "table" then return "external write succeeded value_hashes required" end
        if type(body.origin) ~= "table" then return "external write succeeded origin required" end

    elseif etype == E.EXTERNAL_WRITE_FAILED then
        if not nonempty(body.provider) or not nonempty(body.target_ref) or not nonempty(body.object_type)
            or not nonempty(body.write_ref) or not nonempty(body.failed_at) then
            return "external write failed requires provider, target_ref, object_type, write_ref, and failed_at"
        end
        if type(body.origin) ~= "table" then return "external write failed origin required" end
    end

    return nil
end

return M
