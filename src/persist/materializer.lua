-- CRM event materializer. Record data is materialized through the compiled typed
-- storage facade; this module owns only the small, fixed support projections.
local hash = require("hash")
local json = require("json")
local storage = require("storage")
local aliases = require("aliases")
local types = require("types")
local sql = require("sql")

local M = {}
local EV = types.EVENTS

type UnknownMap = { [string]: unknown }
type Executor = sql.DB | sql.Transaction
type SqlParams = { unknown }
type ProjectionEvent = {
    type: string,
    body: UnknownMap,
}
type RecordLocator = {
    object_type: string?,
}
type StoredRecord = {
    values: UnknownMap?,
}
type CountRow = {
    n: unknown,
}

function M.open_db(): (sql.DB?, error?)
    local db, err = sql.get(types.db_id())
    if err then return nil, err end
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "CRM database unavailable" }) end
    return db, nil
end

local function execute(db: Executor, statement: string, params: SqlParams?): error?
    local _, err = db:execute(statement, params or {})
    if err then return err end
    return nil
end

local function query_one(db: Executor, statement: string, params: SqlParams?): (UnknownMap?, error?)
    local rows, err = db:query(statement, params or {})
    if err then return nil, err end
    if type(rows) ~= "table" or rows[1] == nil then return nil, nil end
    if type(rows[1]) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM SQL query returned a non-object row" }) end
    return rows[1] :: UnknownMap, nil
end

local function encode(value: unknown): (string?, error?)
    local encoded, err = json.encode(value)
    if err then return nil, err end
    return encoded, nil
end

local function required_string(value: unknown, name: string): (string?, error?)
    if type(value) ~= "string" or value == "" then return nil, errors.new({ kind = errors.INVALID, message = name .. " is required" }) end
    return value :: string, nil
end

local function body_for(event: unknown): (ProjectionEvent?, error?)
    if type(event) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "CRM projection event must be an object" }) end
    local candidate = event :: UnknownMap
    if type(candidate.type) ~= "string" or candidate.type == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "CRM projection event type is required" })
    end
    if type(candidate.body) ~= "table" then
        return nil, errors.new({ kind = errors.INVALID, message = "CRM projection event body must be an object" })
    end
    return candidate :: ProjectionEvent, nil
end

local function occurred_at(body: UnknownMap): (string?, error?)
    return required_string(body.occurred_at, "occurred_at")
end

local function sorted_pair(left: string, right: string): (string, string)
    if left <= right then return left, right end
    return right, left
end

local function ref_identity(from_ref: string, edge_type: string, to_ref: string): string
    return tostring(hash.sha256(from_ref .. "\0" .. edge_type .. "\0" .. to_ref))
end

-- Repoint every edge naming one identity onto another. The natural key is
-- (crm_id, from_ref, edge_type, to_ref), so an edge the target already carries is
-- dropped before the update, and ref_id is reminted from the new key.
local function repoint_refs(db: Executor, crm_id: string, column: string,
    old_ref: string, new_ref: string, at: string): error?
    if old_ref == new_ref then return nil end
    local other = column == "from_ref" and "to_ref" or "from_ref"
    local err = execute(db, "DELETE FROM kickside_crm_ref WHERE crm_id = $1 AND " .. column .. " = $2"
        .. " AND (edge_type, " .. other .. ") IN (SELECT edge_type, " .. other
        .. " FROM kickside_crm_ref WHERE crm_id = $1 AND " .. column .. " = $3)",
        { crm_id, old_ref, new_ref })
    if err then return err end
    local rows, query_err = db:query("SELECT edge_type, " .. other .. " AS other_ref FROM kickside_crm_ref"
        .. " WHERE crm_id = $1 AND " .. column .. " = $2", { crm_id, old_ref })
    if query_err then return query_err end
    for _, row in ipairs(type(rows) == "table" and rows :: { UnknownMap } or {}) do
        local edge_type = tostring(row.edge_type)
        local other_ref = tostring(row.other_ref)
        local from_ref = column == "from_ref" and new_ref or other_ref
        local to_ref = column == "from_ref" and other_ref or new_ref
        err = execute(db, "UPDATE kickside_crm_ref SET " .. column .. " = $1, ref_id = $2, updated_at = $3"
            .. " WHERE crm_id = $4 AND " .. column .. " = $5 AND edge_type = $6 AND " .. other .. " = $7",
            { new_ref, ref_identity(from_ref, edge_type, to_ref), at, crm_id, old_ref, edge_type, other_ref })
        if err then return err end
    end
    return nil
end

local function require_record(db: Executor, crm_id: string, record_id: string, object_type: string?): error?
    local locator, err = storage.locate(db, crm_id, record_id)
    if err then return err end
    if not locator then return errors.new({ kind = errors.NOT_FOUND, message = "CRM record does not exist: " .. record_id }) end
    if object_type and (locator :: RecordLocator).object_type ~= object_type then
        return errors.new({ kind = errors.INVALID, message = "CRM record object type mismatch: " .. record_id })
    end
    return nil
end

-- A conditional decision must be readable after the fold, by whoever delivered
-- the event: the row is keyed by the event's own external identity. An event
-- carrying no identity (a direct projection, a test fold) takes its decision
-- without recording it -- there is no caller to answer.
local function record_conditional_outcomes(db: Executor, crm_id: string, envelope: UnknownMap?,
    outcomes: UnknownMap, at: string): error?
    local source = envelope and (envelope :: UnknownMap).external_source or nil
    local identity = envelope and (envelope :: UnknownMap).external_id or nil
    if type(source) ~= "string" or source == "" then return nil end
    if type(identity) ~= "string" or identity == "" then return nil end
    local encoded, encode_err = encode(outcomes)
    if not encoded then return encode_err end
    return execute(db, [[
        INSERT INTO kickside_crm_conditional_outcome (crm_id, external_source, external_id, outcomes, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (crm_id, external_source, external_id) DO UPDATE SET
            outcomes = excluded.outcomes,
            updated_at = excluded.updated_at
    ]], { crm_id, source, identity, encoded, at })
end

local function project_record(db: Executor, crm_id: string, body: UnknownMap, update: boolean,
    envelope: UnknownMap?): error?
    local record_id, err = required_string(body.record_id, "record_id")
    if err then return err end
    local object_type
    object_type, err = required_string(body.object_type, "object_type")
    if err then return err end
    local at
    at, err = occurred_at(body)
    if err then return err end

    local values = update and body.set or body.values
    if values == nil then values = {} end
    if type(values) ~= "table" then return errors.new({ kind = errors.INVALID, message = (update and "set" or "values") .. " must be an object" }) end
    local unset = update and body.unset or {}
    if unset == nil then unset = {} end
    if type(unset) ~= "table" then return errors.new({ kind = errors.INVALID, message = "unset must be an array" }) end
    if update then
        err = require_record(db, crm_id, record_id :: string, object_type :: string)
        if err then return err end
    end

    local before
    before, err = storage.get(db, crm_id, object_type :: string, record_id :: string)
    if err then return err end
    -- Conditional operations are decided HERE, against the record's state in
    -- this event's own fold order: replaying the event re-evaluates against the
    -- same prior state, so the answer is deterministic, and concurrent writers
    -- serialize through the event sequence instead of racing a caller's read.
    local set_if_absent = update and body.set_if_absent or nil
    local append_unique = update and body.append_unique or nil
    if type(set_if_absent) == "table" or type(append_unique) == "table" then
        local current = before and (before :: StoredRecord).values or {}
        local merged: UnknownMap = {}
        local outcomes: UnknownMap = {}
        for attr, value in pairs(values :: UnknownMap) do merged[attr] = value end
        for attr, value in pairs(type(set_if_absent) == "table" and (set_if_absent :: UnknownMap) or {}) do
            local held = (current :: UnknownMap)[attr]
            local empty = held == nil or held == ""
                or (type(held) == "table" and next(held :: UnknownMap) == nil)
            if empty then merged[attr] = value end
            outcomes[attr] = empty and "written" or "kept_existing"
        end
        for attr, value in pairs(type(append_unique) == "table" and (append_unique :: UnknownMap) or {}) do
            local union: { unknown } = {}
            local seen: { [string]: boolean } = {}
            local held = (current :: UnknownMap)[attr]
            for _, item in ipairs(type(held) == "table" and (held :: { unknown }) or {}) do
                local key = tostring(item)
                if not seen[key] then seen[key] = true; union[#union + 1] = item end
            end
            local added = false
            for _, item in ipairs(type(value) == "table" and (value :: { unknown }) or {}) do
                local key = tostring(item)
                if not seen[key] then seen[key] = true; union[#union + 1] = item; added = true end
            end
            merged[attr] = union
            outcomes[attr] = added and "written" or "kept_existing"
        end
        values = merged
        err = record_conditional_outcomes(db, crm_id, envelope, outcomes, at :: string)
        if err then return err end
    end
    local after, storage_err = storage.upsert(db, crm_id, object_type :: string, {
        record_id = record_id,
        values = values,
        unset = unset,
        created_at = update and nil or at,
        updated_at = at,
    })
    if storage_err then return storage_err end
    return aliases.project(db, crm_id, object_type :: string, record_id :: string,
        before and (before :: StoredRecord).values or {}, after and (after :: StoredRecord).values or {}, at :: string)
end

local function project_delete(db: Executor, crm_id: string, body: UnknownMap): error?
    local record_id, err = required_string(body.record_id, "record_id")
    if err then return err end
    local object_type
    object_type, err = required_string(body.object_type, "object_type")
    if err then return err end
    local _, storage_err = storage.cleanup_record(db, crm_id, object_type :: string, record_id :: string)
    if storage_err then return storage_err end
    err = execute(db, "DELETE FROM kickside_crm_collection_membership WHERE crm_id = $1 AND record_id = $2", { crm_id, record_id })
    if err then return err end
    -- Reference edges name identities, so they cascade with every identity the record
    -- owns: the record itself and the activities that go with it.
    local owned_activities = "SELECT activity_id FROM kickside_crm_activity"
        .. " WHERE crm_id = $1 AND (record_id = $2 OR participant_record_id = $2)"
    local owned_activity_refs = "SELECT '" .. types.REF_PREFIX.activity .. "' || activity_id"
        .. " FROM kickside_crm_activity WHERE crm_id = $1 AND (record_id = $3 OR participant_record_id = $3)"
    err = execute(db, "DELETE FROM kickside_crm_ref WHERE crm_id = $1 AND (from_ref = $2 OR to_ref = $2"
        .. " OR from_ref IN (" .. owned_activity_refs .. ") OR to_ref IN (" .. owned_activity_refs .. "))",
        { crm_id, types.record_ref(record_id :: string), record_id })
    if err then return err end
    err = execute(db, "DELETE FROM kickside_crm_activity_alias WHERE crm_id = $1"
        .. " AND activity_id IN (" .. owned_activities .. ")", { crm_id, record_id })
    if err then return err end
    err = execute(db, "DELETE FROM kickside_crm_activity WHERE crm_id = $1 AND (record_id = $2 OR participant_record_id = $2)", { crm_id, record_id })
    if err then return err end
    err = execute(db, "DELETE FROM kickside_crm_alias WHERE crm_id = $1 AND record_id = $2", { crm_id, record_id })
    if err then return err end
    return execute(db, "DELETE FROM kickside_crm_alias_reservation WHERE crm_id = $1 AND record_id = $2", { crm_id, record_id })
end

local function project_merge_suggestion(db: Executor, crm_id: string, body: UnknownMap): error?
    local left, err = required_string(body.left_id, "left_id")
    if err then return err end
    local right
    right, err = required_string(body.right_id, "right_id")
    if err then return err end
    if left == right then return errors.new({ kind = errors.INVALID, message = "merge candidate ids must differ" }) end
    local object_type
    object_type, err = required_string(body.object_type, "object_type")
    if err then return err end
    local at
    at, err = occurred_at(body)
    if err then return err end
    left, right = sorted_pair(left :: string, right :: string)
    local existing
    existing, err = query_one(db, [[
        SELECT decision FROM kickside_crm_merge_decision
        WHERE crm_id = $1 AND left_id = $2 AND right_id = $3
    ]], { crm_id, left, right })
    if err then return err end
    if existing and existing.decision ~= "pending" then return nil end
    err = require_record(db, crm_id, left :: string, object_type :: string)
    if err then return err end
    err = require_record(db, crm_id, right :: string, object_type :: string)
    if err then return err end
    return execute(db, [[
        INSERT INTO kickside_crm_merge_decision
            (crm_id, left_id, right_id, object_type, decision, confidence, reason, evidence_hash, updated_at)
        VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8)
        ON CONFLICT (crm_id, left_id, right_id) DO UPDATE SET
            object_type = excluded.object_type,
            confidence = excluded.confidence,
            reason = excluded.reason,
            evidence_hash = excluded.evidence_hash,
            updated_at = excluded.updated_at
        WHERE kickside_crm_merge_decision.decision = 'pending'
    ]], { crm_id, left, right, object_type, tonumber(body.confidence), body.reason,
        body.evidence_hash or "", at })
end

local function same_nullable(left: unknown, right: unknown): boolean
    if left == nil or right == nil then return left == nil and right == nil end
    return tostring(left) == tostring(right)
end

local function verify_resolution(row: UnknownMap?, expected: UnknownMap): error?
    if not row then return errors.new({ kind = errors.INVALID, message = "merge resolution receipt was not persisted" }) end
    for _, key in ipairs({ "left_id", "right_id", "object_type", "decision", "winner_id", "loser_id", "note", "resolved_by", "resolved_at" }) do
        if not same_nullable(row[key], expected[key]) then
            return errors.new({ kind = errors.INVALID, message = "resolution_id already belongs to a different merge decision" })
        end
    end
    return nil
end

local function transfer_merge_support(db: Executor, crm_id: string, winner_id: string, loser_id: string, at: string): error?
    local err = execute(db, [[
        DELETE FROM kickside_crm_collection_membership
        WHERE crm_id = $1 AND record_id = $2
          AND collection_id IN (
              SELECT collection_id FROM kickside_crm_collection_membership
              WHERE crm_id = $1 AND record_id = $3
          )
    ]], { crm_id, loser_id, winner_id })
    if err then return err end
    err = execute(db, "UPDATE kickside_crm_collection_membership SET record_id = $1, updated_at = $2 WHERE crm_id = $3 AND record_id = $4",
        { winner_id, at, crm_id, loser_id })
    if err then return err end
    err = execute(db, "UPDATE kickside_crm_activity SET record_id = $1 WHERE crm_id = $2 AND record_id = $3",
        { winner_id, crm_id, loser_id })
    if err then return err end
    err = execute(db, "UPDATE kickside_crm_activity SET participant_record_id = $1 WHERE crm_id = $2 AND participant_record_id = $3",
        { winner_id, crm_id, loser_id })
    if err then return err end
    err = execute(db, "UPDATE kickside_crm_alias SET record_id = $1, updated_at = $2 WHERE crm_id = $3 AND record_id = $4",
        { winner_id, at, crm_id, loser_id })
    if err then return err end
    err = execute(db, "UPDATE kickside_crm_alias_reservation SET record_id = $1 WHERE crm_id = $2 AND record_id = $3",
        { winner_id, crm_id, loser_id })
    if err then return err end
    local loser_ref, winner_ref = types.record_ref(loser_id), types.record_ref(winner_id)
    err = repoint_refs(db, crm_id, "from_ref", loser_ref, winner_ref, at)
    if err then return err end
    return repoint_refs(db, crm_id, "to_ref", loser_ref, winner_ref, at)
end

local function project_merge_decision(db: Executor, crm_id: string, body: UnknownMap): error?
    local resolution_id, err = required_string(body.resolution_id, "resolution_id")
    if err then return err end
    local left
    left, err = required_string(body.left_id, "left_id")
    if err then return err end
    local right
    right, err = required_string(body.right_id, "right_id")
    if err then return err end
    if left == right then return errors.new({ kind = errors.INVALID, message = "merge candidate ids must differ" }) end
    local object_type
    object_type, err = required_string(body.object_type, "object_type")
    if err then return err end
    local decision
    decision, err = required_string(body.decision, "decision")
    if err then return err end
    if decision ~= "merged" and decision ~= "do_not_merge" and decision ~= "skipped" then
        return errors.new({ kind = errors.INVALID, message = "merge.decided requires a final decision" })
    end
    local at
    at, err = occurred_at(body)
    if err then return err end
    local resolved_at = body.resolved_at
    if resolved_at == nil then resolved_at = at end
    if type(resolved_at) ~= "string" or resolved_at == "" then return errors.new({ kind = errors.INVALID, message = "resolved_at must be a non-empty string" }) end
    left, right = sorted_pair(left :: string, right :: string)

    local winner_id = body.winner_id
    local loser_id = body.loser_id
    if decision == "merged" then
        winner_id, err = required_string(winner_id, "winner_id")
        if err then return err end
        loser_id, err = required_string(loser_id, "loser_id")
        if err then return err end
        if winner_id == loser_id then return errors.new({ kind = errors.INVALID, message = "winner and loser must differ" }) end
        local pair = { [left :: string] = true, [right :: string] = true }
        if not pair[winner_id :: string] or not pair[loser_id :: string] then
            return errors.new({ kind = errors.INVALID, message = "winner and loser must be the reviewed pair" })
        end
    elseif winner_id ~= nil or loser_id ~= nil then
        return errors.new({ kind = errors.INVALID, message = "winner_id and loser_id are only valid for a merged decision" })
    end

    local expected = {
        left_id = left, right_id = right, object_type = object_type, decision = decision,
        winner_id = winner_id, loser_id = loser_id, note = body.note,
        resolved_by = body.resolved_by, resolved_at = resolved_at,
    }
    local receipt
    receipt, err = query_one(db, [[
        SELECT left_id, right_id, object_type, decision, winner_id, loser_id, note, resolved_by, resolved_at
        FROM kickside_crm_merge_resolution
        WHERE crm_id = $1 AND resolution_id = $2
    ]], { crm_id, resolution_id })
    if err then return err end
    if receipt then return verify_resolution(receipt, expected) end

    err = require_record(db, crm_id, left :: string, object_type :: string)
    if err then return err end
    err = require_record(db, crm_id, right :: string, object_type :: string)
    if err then return err end

    err = execute(db, [[
        INSERT INTO kickside_crm_merge_resolution
            (crm_id, resolution_id, left_id, right_id, object_type, decision, winner_id, loser_id, note, resolved_by, resolved_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (crm_id, resolution_id) DO NOTHING
    ]], { crm_id, resolution_id, left, right, object_type, decision, winner_id, loser_id,
        body.note, body.resolved_by, resolved_at })
    if err then return err end
    receipt, err = query_one(db, [[
        SELECT left_id, right_id, object_type, decision, winner_id, loser_id, note, resolved_by, resolved_at
        FROM kickside_crm_merge_resolution
        WHERE crm_id = $1 AND resolution_id = $2
    ]], { crm_id, resolution_id })
    if err then return err end
    err = verify_resolution(receipt, expected)
    if err then return err end

    err = execute(db, [[
        INSERT INTO kickside_crm_merge_decision
            (crm_id, left_id, right_id, object_type, decision, confidence, reason, evidence_hash,
             resolution_id, winner_id, loser_id, resolved_by, resolved_at, override,
             override_reviewed_by, override_reason, override_prior_decision_ref, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (crm_id, left_id, right_id) DO UPDATE SET
            object_type = excluded.object_type,
            decision = excluded.decision,
            confidence = excluded.confidence,
            reason = excluded.reason,
            evidence_hash = excluded.evidence_hash,
            resolution_id = excluded.resolution_id,
            winner_id = excluded.winner_id,
            loser_id = excluded.loser_id,
            resolved_by = excluded.resolved_by,
            resolved_at = excluded.resolved_at,
            override = excluded.override,
            override_reviewed_by = excluded.override_reviewed_by,
            override_reason = excluded.override_reason,
            override_prior_decision_ref = excluded.override_prior_decision_ref,
            updated_at = excluded.updated_at
    ]], { crm_id, left, right, object_type, decision, tonumber(body.confidence), body.reason,
        body.evidence_hash or "", resolution_id, winner_id, loser_id, body.resolved_by,
        resolved_at, body.override == true, body.reviewer_actor, body.reason,
        body.prior_decision_ref, at })
    if err then return err end

    if decision == "merged" then
        local _, merge_err = storage.merge(
            db,
            crm_id,
            object_type :: string,
            winner_id :: string,
            loser_id :: string,
            at :: string
        )
        if merge_err then return merge_err end
        return transfer_merge_support(db, crm_id, winner_id :: string, loser_id :: string, at :: string)
    end
    return nil
end

local function project_relation(db: Executor, crm_id: string, body: UnknownMap, linked: boolean): error?
    local record_id, err = required_string(body.record_id, "record_id")
    if err then return err end
    local object_type
    object_type, err = required_string(body.object_type, "object_type")
    if err then return err end
    local attr
    attr, err = required_string(body.attr, "attr")
    if err then return err end
    if type(body.reference) ~= "table" then return errors.new({ kind = errors.INVALID, message = "reference is required" }) end
    local _, storage_err
    if linked then
        _, storage_err = storage.link(db, crm_id, object_type :: string, record_id :: string, attr :: string, body.reference)
    else
        _, storage_err = storage.unlink(db, crm_id, object_type :: string, record_id :: string, attr :: string, body.reference)
    end
    return storage_err
end

local function project_membership(db: Executor, crm_id: string, body: UnknownMap, present: boolean): error?
    local collection_id, err = required_string(body.collection_id, "collection_id")
    if err then return err end
    local record_id
    record_id, err = required_string(body.record_id, "record_id")
    if err then return err end
    if not present then
        return execute(db, "DELETE FROM kickside_crm_collection_membership WHERE crm_id = $1 AND collection_id = $2 AND record_id = $3",
            { crm_id, collection_id, record_id })
    end
    err = require_record(db, crm_id, record_id :: string)
    if err then return err end
    local stage_id
    stage_id, err = required_string(body.stage_id, "stage_id")
    if err then return err end
    local at
    at, err = occurred_at(body)
    if err then return err end
    return execute(db, [[
        INSERT INTO kickside_crm_collection_membership
            (crm_id, collection_id, record_id, stage_id, position, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (crm_id, collection_id, record_id) DO UPDATE SET
            stage_id = excluded.stage_id,
            position = excluded.position,
            updated_at = excluded.updated_at
    ]], { crm_id, collection_id, record_id, stage_id, tonumber(body.position) or 0, at })
end

-- One real event (HubSpot meeting engagement, HubSpot call engagement, Fireflies
-- transcript) converges onto a single activity row. external_id is the primary
-- convergence key; correlation_key is the fallback for sources that do not share an
-- external id. The first source to create the row establishes its stable activity_id;
-- later sources with the same external_id or correlation_key update that same row, and
-- the alias index answers for the identities that row absorbed along the way. A
-- delivery whose identities answer to more than one held row names those rows as one
-- real event: the row the index ranks first survives and the others fold into it.
local function converged_activity_rows(db: Executor, crm_id: string, activity_id: string,
    external_id: unknown, correlation_key: unknown): (string?, { string }?, error?)
    local held, err = storage.held_activities(db, crm_id, activity_id, external_id, correlation_key)
    if err then return nil, nil, err end
    local rows = held :: { string }
    local absorbed: { string } = {}
    for index = 2, #rows do absorbed[#absorbed + 1] = rows[index] end
    return rows[1] or activity_id, absorbed, nil
end

local function optional_string(value: unknown): unknown
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

-- A converged delivery gives up its own activity identity to the surviving row. The
-- alias index remembers every identity that delivery carried, and edges already
-- minted against it follow the row, so a reference resolves whatever order the
-- sources arrive in.
local function absorb_activity_identity(db: Executor, crm_id: string, absorbed_id: string,
    target_id: string, identities: { unknown }, at: string): error?
    local err = execute(db, "UPDATE kickside_crm_activity_alias SET activity_id = $1, updated_at = $2"
        .. " WHERE crm_id = $3 AND activity_id = $4", { target_id, at, crm_id, absorbed_id })
    if err then return err end
    for _, identity in ipairs(identities) do
        err = execute(db, [[
            INSERT INTO kickside_crm_activity_alias (crm_id, alias, activity_id, updated_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (crm_id, alias) DO UPDATE SET
                activity_id = excluded.activity_id,
                updated_at = excluded.updated_at
        ]], { crm_id, identity, target_id, at })
        if err then return err end
    end
    local absorbed_ref, target_ref = types.activity_ref(absorbed_id), types.activity_ref(target_id)
    err = repoint_refs(db, crm_id, "from_ref", absorbed_ref, target_ref, at)
    if err then return err end
    return repoint_refs(db, crm_id, "to_ref", absorbed_ref, target_ref, at)
end

local function object_type_of(db: Executor, crm_id: string, record_id: string): (string?, error?)
    local locator, err = storage.locate(db, crm_id, record_id)
    if err then return nil, err end
    if not locator then return nil, nil end
    return optional_string((locator :: RecordLocator).object_type) :: string?, nil
end

-- The denormalized pointer the timeline keys on. The anchor objects are the
-- ones the applied schema gives a pipeline: a delivery carrying one upgrades a
-- contact pointer, and every other later delivery keeps the pointer the row
-- already converged on.
local function anchored_record_id(db: Executor, crm_id: string, existing: unknown,
    incoming: string): (string?, error?)
    if type(existing) ~= "string" or existing == "" or existing == incoming then return incoming, nil end
    local anchors, err = storage.pipeline_object_types(db, crm_id)
    if err then return nil, err end
    local anchored = anchors :: { [string]: boolean }
    local incoming_type
    incoming_type, err = object_type_of(db, crm_id, incoming)
    if err then return nil, err end
    if incoming_type == nil or not anchored[incoming_type :: string] then return existing :: string, nil end
    local existing_type
    existing_type, err = object_type_of(db, crm_id, existing :: string)
    if err then return nil, err end
    if existing_type ~= nil and anchored[existing_type :: string] then return existing :: string, nil end
    return incoming, nil
end

-- Payload is the long tail every source contributes to. A delivery overwrites only
-- the keys it carries; the keys another source wrote stay.
local function merged_payload(stored: unknown, incoming: unknown): (string?, error?)
    local merged: UnknownMap = {}
    if type(stored) == "string" and stored ~= "" then
        local decoded, decode_err = json.decode(stored :: string)
        if decode_err then return nil, decode_err end
        if type(decoded) == "table" then
            for key, value in pairs(decoded :: UnknownMap) do merged[key] = value end
        end
    end
    if type(incoming) == "table" then
        for key, value in pairs(incoming :: UnknownMap) do merged[key] = value end
    end
    return encode(merged)
end

local function optional_integer(value: unknown): unknown
    local n = tonumber(value)
    if n == nil then return nil end
    return math.floor(n)
end

-- A held row a delivery revealed as the surviving row's real event folds into it
-- under the same rules a converging delivery follows: the survivor keeps its
-- identity, label, and every value it holds, the absorbed row fills what the
-- survivor lacks, and its payload keys stay under the survivor's. The absorbed row
-- goes first so its convergence keys are free for the survivor to carry; its
-- identities, aliases, and edges then follow the survivor.
local function fold_activity_row(db: Executor, crm_id: string, absorbed_id: string,
    target_id: string, at: string): error?
    local absorbed, err = query_one(db, [[
        SELECT record_id, actor, participant_record_id, due_at, source, external_id, correlation_key,
               direction, duration_sec, outcome, recording_url, has_transcript, payload
        FROM kickside_crm_activity WHERE crm_id = $1 AND activity_id = $2
    ]], { crm_id, absorbed_id })
    if err then return err end
    local folded = absorbed :: UnknownMap
    local survivor
    survivor, err = query_one(db, "SELECT record_id, payload FROM kickside_crm_activity WHERE crm_id = $1 AND activity_id = $2",
        { crm_id, target_id })
    if err then return err end
    local kept = survivor :: UnknownMap
    local anchored
    anchored, err = anchored_record_id(db, crm_id, kept.record_id, tostring(folded.record_id))
    if err then return err end
    local kept_payload, decode_err = json.decode(tostring(kept.payload or "{}"))
    if decode_err then return decode_err end
    local payload
    payload, err = merged_payload(folded.payload, kept_payload)
    if err then return err end
    err = execute(db, "DELETE FROM kickside_crm_activity WHERE crm_id = $1 AND activity_id = $2",
        { crm_id, absorbed_id })
    if err then return err end
    err = execute(db, [[
        UPDATE kickside_crm_activity SET
            record_id = $1,
            actor = COALESCE(actor, $2),
            participant_record_id = COALESCE(participant_record_id, $3),
            due_at = COALESCE(due_at, $4),
            source = COALESCE(source, $5),
            external_id = COALESCE(external_id, $6),
            correlation_key = COALESCE(correlation_key, $7),
            direction = COALESCE(direction, $8),
            duration_sec = COALESCE(duration_sec, $9),
            outcome = COALESCE(outcome, $10),
            recording_url = COALESCE(recording_url, $11),
            has_transcript = (has_transcript OR $12),
            payload = $13
        WHERE crm_id = $14 AND activity_id = $15
    ]], { anchored, folded.actor, folded.participant_record_id, folded.due_at, folded.source,
        folded.external_id, folded.correlation_key, folded.direction, optional_integer(folded.duration_sec),
        folded.outcome, folded.recording_url, folded.has_transcript == true or folded.has_transcript == 1,
        payload, crm_id, target_id })
    if err then return err end
    local identities: { unknown } = { absorbed_id }
    if optional_string(folded.external_id) ~= nil then identities[#identities + 1] = folded.external_id end
    if optional_string(folded.correlation_key) ~= nil then identities[#identities + 1] = folded.correlation_key end
    return absorb_activity_identity(db, crm_id, absorbed_id, target_id, identities, at)
end

local function project_activity(db: Executor, crm_id: string, body: UnknownMap): error?
    local activity_id, err = required_string(body.activity_id, "activity_id")
    if err then return err end
    local record_id
    record_id, err = required_string(body.record_id, "record_id")
    if err then return err end
    err = require_record(db, crm_id, record_id :: string)
    if err then return err end
    local activity_type
    activity_type, err = required_string(body.activity_type, "activity_type")
    if err then return err end
    local at
    at, err = occurred_at(body)
    if err then return err end
    if body.participant_record_id ~= nil then
        local participant_id
        participant_id, err = required_string(body.participant_record_id, "participant_record_id")
        if err then return err end
        err = require_record(db, crm_id, participant_id :: string)
        if err then return err end
    end
    local external_id = optional_string(body.external_id)
    local correlation_key = optional_string(body.correlation_key)
    local target_id, absorbed, resolve_err = converged_activity_rows(db, crm_id, activity_id :: string,
        external_id, correlation_key)
    if resolve_err then return resolve_err end
    for _, absorbed_id in ipairs(absorbed :: { string }) do
        err = fold_activity_row(db, crm_id, absorbed_id, target_id :: string, at :: string)
        if err then return err end
    end

    -- The row the delivery converges on decides what its fields mean: a first write
    -- establishes them, a later one fills what is missing and never demotes what is there.
    local stored
    stored, err = query_one(db, "SELECT record_id, payload FROM kickside_crm_activity WHERE crm_id = $1 AND activity_id = $2",
        { crm_id, target_id })
    if err then return err end
    local anchored
    anchored, err = anchored_record_id(db, crm_id, stored and stored.record_id or nil, record_id :: string)
    if err then return err end
    local payload
    payload, err = merged_payload(stored and stored.payload or nil, body.payload)
    if err then return err end

    err = execute(db, [[
        INSERT INTO kickside_crm_activity
            (crm_id, activity_id, record_id, activity_type, occurred_at, actor, participant_record_id, due_at, done,
             source, external_id, correlation_key, direction, duration_sec, outcome, recording_url, has_transcript, payload)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (crm_id, activity_id) DO UPDATE SET
            record_id = excluded.record_id,
            -- activity_type is what the first source called the event; convergence
            -- adds detail to that row, it never re-labels it.
            occurred_at = excluded.occurred_at,
            actor = excluded.actor,
            participant_record_id = excluded.participant_record_id,
            due_at = excluded.due_at,
            done = excluded.done,
            source = COALESCE(excluded.source, kickside_crm_activity.source),
            external_id = COALESCE(kickside_crm_activity.external_id, excluded.external_id),
            correlation_key = COALESCE(kickside_crm_activity.correlation_key, excluded.correlation_key),
            direction = COALESCE(excluded.direction, kickside_crm_activity.direction),
            duration_sec = COALESCE(excluded.duration_sec, kickside_crm_activity.duration_sec),
            outcome = COALESCE(excluded.outcome, kickside_crm_activity.outcome),
            recording_url = COALESCE(excluded.recording_url, kickside_crm_activity.recording_url),
            has_transcript = (kickside_crm_activity.has_transcript OR excluded.has_transcript),
            payload = excluded.payload
    ]], { crm_id, target_id, anchored, activity_type, at, body.actor,
        body.participant_record_id, body.due_at, body.done == true,
        optional_string(body.source), external_id, correlation_key,
        optional_string(body.direction), optional_integer(body.duration_sec),
        optional_string(body.outcome), optional_string(body.recording_url),
        body.has_transcript == true, payload })
    if err then return err end
    if target_id == activity_id then return nil end
    local identities: { unknown } = { activity_id }
    if external_id ~= nil then identities[#identities + 1] = external_id end
    if correlation_key ~= nil then identities[#identities + 1] = correlation_key end
    return absorb_activity_identity(db, crm_id, activity_id :: string, target_id :: string, identities, at :: string)
end

-- A delete addresses whatever identity the source still holds; the convergence
-- index resolves it to the surviving row. A row this CRM no longer holds is
-- already in the state the event asks for, so an unresolved identity is a
-- settled no-op, never an error.
local function project_activity_delete(db: Executor, crm_id: string, body: UnknownMap): error?
    local target_id, err = storage.locate_activity(db, crm_id,
        optional_string(body.activity_id), optional_string(body.external_id), optional_string(body.correlation_key))
    if err then return err end
    if target_id == nil then return nil end
    local ref = types.activity_ref(target_id :: string)
    err = execute(db, "DELETE FROM kickside_crm_ref WHERE crm_id = $1 AND (from_ref = $2 OR to_ref = $2)",
        { crm_id, ref })
    if err then return err end
    err = execute(db, "DELETE FROM kickside_crm_activity_alias WHERE crm_id = $1 AND activity_id = $2",
        { crm_id, target_id })
    if err then return err end
    return execute(db, "DELETE FROM kickside_crm_activity WHERE crm_id = $1 AND activity_id = $2",
        { crm_id, target_id })
end

-- A source mints an activity reference against its own delivery identity, and
-- convergence may have folded that identity into another row. Resolve the reference
-- onto the surviving activity: the row that carries the identity, the row that
-- absorbed it, or the row that shares its external identity. An identity no row
-- carries yet stays as minted -- the delivery that creates it absorbs the edge.
local function resolved_ref(db: Executor, crm_id: string, ref: string): (string, error?)
    local tail = types.activity_ref_tail(ref)
    if tail == nil then return ref, nil end
    local row, err = query_one(db,
        "SELECT activity_id FROM kickside_crm_activity WHERE crm_id = $1 AND activity_id = $2", { crm_id, tail })
    if err then return ref, err end
    if row then return ref, nil end
    row, err = query_one(db,
        "SELECT activity_id FROM kickside_crm_activity_alias WHERE crm_id = $1 AND alias = $2", { crm_id, tail })
    if err then return ref, err end
    if row then return types.activity_ref(tostring(row.activity_id)), nil end
    for _, column in ipairs({ "external_id", "correlation_key" }) do
        row, err = query_one(db, "SELECT activity_id FROM kickside_crm_activity WHERE crm_id = $1 AND "
            .. column .. " = $2", { crm_id, tail })
        if err then return ref, err end
        if row then return types.activity_ref(tostring(row.activity_id)), nil end
    end
    return ref, nil
end

-- The generalized reference edge: the loose cross-kind plane linking a record or
-- activity to another record, an activity, a KB, a document, a component, a file, a
-- URL, or an external system. Natural key is (crm_id, from_ref, edge_type, to_ref);
-- unlink is a soft delete that clears active without dropping the row.
local function project_reference(db: Executor, crm_id: string, body: UnknownMap, linked: boolean): error?
    local from_ref, err = required_string(body.from_ref, "from_ref")
    if err then return err end
    local edge_type
    edge_type, err = required_string(body.edge_type, "edge_type")
    if err then return err end
    local to_ref
    to_ref, err = required_string(body.to_ref, "to_ref")
    if err then return err end
    local at
    at, err = occurred_at(body)
    if err then return err end
    from_ref, err = resolved_ref(db, crm_id, from_ref :: string)
    if err then return err end
    to_ref, err = resolved_ref(db, crm_id, to_ref :: string)
    if err then return err end
    -- attrs is bound as NULL exactly when the event carries none, so a delivery that
    -- does not restate them keeps what the linking source recorded.
    local attrs: unknown = nil
    if type(body.attrs) == "table" then
        attrs, err = encode(body.attrs)
        if err then return err end
    end
    local source = optional_string(body.source)
    if linked then
        return execute(db, [[
            INSERT INTO kickside_crm_ref
                (crm_id, ref_id, from_ref, edge_type, to_ref, attrs, active, source, updated_at)
            VALUES ($1, $2, $3, $4, $5, COALESCE($6, '{}'), $7, $8, $9)
            ON CONFLICT (crm_id, from_ref, edge_type, to_ref) DO UPDATE SET
                ref_id = excluded.ref_id,
                attrs = COALESCE($6, kickside_crm_ref.attrs),
                active = excluded.active,
                source = COALESCE(excluded.source, kickside_crm_ref.source),
                updated_at = excluded.updated_at
        ]], { crm_id, ref_identity(from_ref :: string, edge_type :: string, to_ref :: string),
            from_ref, edge_type, to_ref, attrs, body.active ~= false, source, at })
    end
    -- Soft delete: an existing edge loses active and keeps its attrs and the
    -- provenance of the source that linked it. An edge that was never linked leaves
    -- no row behind.
    return execute(db, [[
        UPDATE kickside_crm_ref SET active = $1, updated_at = $2
        WHERE crm_id = $3 AND from_ref = $4 AND edge_type = $5 AND to_ref = $6
    ]], { false, at, crm_id, from_ref, edge_type, to_ref })
end

local function project_ai_value(db: Executor, crm_id: string, body: UnknownMap): error?
    local record_id, err = required_string(body.record_id, "record_id")
    if err then return err end
    local object_type
    object_type, err = required_string(body.object_type, "object_type")
    if err then return err end
    local attr
    attr, err = required_string(body.attr, "attr")
    if err then return err end
    if body.value == nil then return errors.new({ kind = errors.INVALID, message = "value is required" }) end
    err = require_record(db, crm_id, record_id :: string, object_type :: string)
    if err then return err end
    local at
    at, err = occurred_at(body)
    if err then return err end
    local values = { [attr :: string] = body.value }
    local _, storage_err = storage.upsert(db, crm_id, object_type :: string, {
        record_id = record_id,
        values = values,
        updated_at = at,
    })
    return storage_err
end

local function project_external_write(db: Executor, crm_id: string, body: UnknownMap): error?
    local provider, err = required_string(body.provider, "provider")
    if err then return err end
    local connection_id
    connection_id, err = required_string(body.connection_id, "connection_id")
    if err then return err end
    local target_ref
    target_ref, err = required_string(body.target_ref, "target_ref")
    if err then return err end
    local object_type
    object_type, err = required_string(body.object_type, "object_type")
    if err then return err end
    local write_ref
    write_ref, err = required_string(body.write_ref, "write_ref")
    if err then return err end
    local completed_at
    completed_at, err = required_string(body.completed_at, "completed_at")
    if err then return err end
    if type(body.value_hashes) ~= "table" then return errors.new({ kind = errors.INVALID, message = "value_hashes must be an object" }) end
    if type(body.origin) ~= "table" then return errors.new({ kind = errors.INVALID, message = "origin must be an object" }) end
    local value_hashes = body.value_hashes :: UnknownMap
    local origin
    origin, err = encode(body.origin)
    if err then return err end
    for attr, value_hash in pairs(value_hashes) do
        if type(attr) ~= "string" or attr == "" or type(value_hash) ~= "string" or value_hash == "" then
            return errors.new({ kind = errors.INVALID, message = "value_hashes must map non-empty field names to non-empty hashes" })
        end
        err = execute(db, [[
            INSERT INTO kickside_crm_write_origin
                (crm_id, provider, connection_id, object_type, target_ref, attr, value_hash, write_ref, completed_at, origin)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (crm_id, provider, connection_id, object_type, target_ref, attr) DO UPDATE SET
                value_hash = excluded.value_hash,
                write_ref = excluded.write_ref,
                completed_at = excluded.completed_at,
                origin = excluded.origin
        ]], { crm_id, provider, connection_id, object_type, target_ref, attr, value_hash, write_ref, completed_at, origin })
        if err then return err end
    end
    return nil
end

local function apply(db: Executor, crm_id: string, raw_event: unknown): error?
    local event, err = body_for(raw_event)
    if err then return err end
    local typed_event = event :: ProjectionEvent
    local body = typed_event.body
    local event_type = typed_event.type
    local envelope: UnknownMap = {
        external_source = (raw_event :: UnknownMap).external_source,
        external_id = (raw_event :: UnknownMap).external_id,
    }
    if event_type == EV.RECORD_CREATED then return project_record(db, crm_id, body, false, envelope) end
    if event_type == EV.RECORD_UPDATED then return project_record(db, crm_id, body, true, envelope) end
    if event_type == EV.RECORD_DELETED then return project_delete(db, crm_id, body) end
    if event_type == EV.MERGE_SUGGESTED then return project_merge_suggestion(db, crm_id, body) end
    if event_type == EV.MERGE_DECIDED then return project_merge_decision(db, crm_id, body) end
    if event_type == EV.RELATION_LINKED then return project_relation(db, crm_id, body, true) end
    if event_type == EV.RELATION_UNLINKED then return project_relation(db, crm_id, body, false) end
    if event_type == EV.REFERENCE_LINKED then return project_reference(db, crm_id, body, true) end
    if event_type == EV.REFERENCE_UNLINKED then return project_reference(db, crm_id, body, false) end
    if event_type == EV.MEMBERSHIP_SET then return project_membership(db, crm_id, body, true) end
    if event_type == EV.MEMBERSHIP_REMOVED then return project_membership(db, crm_id, body, false) end
    if event_type == EV.ACTIVITY_LOGGED then return project_activity(db, crm_id, body) end
    if event_type == EV.ACTIVITY_DELETED then return project_activity_delete(db, crm_id, body) end
    if event_type == EV.AI_ATTRIBUTE_FILLED then return project_ai_value(db, crm_id, body) end
    if event_type == EV.EXTERNAL_WRITE_SUCCEEDED then return project_external_write(db, crm_id, body) end
    if event_type == EV.EXTERNAL_WRITE_REQUESTED or event_type == EV.EXTERNAL_WRITE_FAILED then return nil end
    return errors.new({ kind = errors.INVALID, message = "unknown CRM event type: " .. tostring(event_type) })
end

function M.project_events(db: Executor, crm_id: string, events: unknown): error?
    if type(crm_id) ~= "string" or crm_id == "" then return errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    if type(events) ~= "table" then return errors.new({ kind = errors.INVALID, message = "events must be an array" }) end
    for index, event in ipairs(events :: { unknown }) do
        local err = apply(db, crm_id, event)
        if err then return errors.wrap(err, "CRM projection event " .. tostring(index) .. " failed") end
    end
    return nil
end

function M.counters(db: Executor, crm_id: string): (UnknownMap?, error?)
    local due, err = query_one(db, [[
        SELECT COUNT(*) AS n
        FROM kickside_crm_activity
        WHERE crm_id = $1 AND done = $2 AND due_at IS NOT NULL AND due_at <= $3
    ]], { crm_id, false, types.now() })
    if err then return nil, err end
    local records
    records, err = query_one(db, "SELECT COUNT(*) AS n FROM kickside_crm_record_locator WHERE crm_id = $1", { crm_id })
    if err then return nil, err end
    return {
        follow_ups_due = tonumber(due and (due :: CountRow).n) or 0,
        record_count = tonumber(records and (records :: CountRow).n) or 0,
    }, nil
end

return M
