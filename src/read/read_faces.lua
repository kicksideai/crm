-- The two read-only operations this CRM publishes as callable entries.
--
-- Everything else it publishes is an agent tool or a write. That left two reads
-- with no face at all, and both are needed by a module that must be able to
-- install without this one -- so they cannot be reached by importing a library,
-- which is resolved when the entry is created and refuses the whole install
-- where the CRM is absent. They are reached by id and answered when called.
--
--   the alias index, read-only. resolve_record is the canonical resolver and it
--   CREATES the record when the alias is absent, which is right for a caller
--   deciding where something belongs and wrong for a caller deciding whether it
--   belongs anywhere. A meeting is evidence that a conversation happened, never
--   evidence that a record should exist.
--
--   an activity's reference edges, inactive rows included. An edge set is state,
--   not an append log: a contact that moved onto another deal or a roster that
--   shrank must UNLINK what is no longer true, and reconciling needs the edges
--   that are there rather than only the ones the caller wants. Inactive rows are
--   returned because the sink receipts an idempotency key once -- re-linking a
--   restored edge under the key that created it would replay the unlink.
--
-- Both delegate to the access-checked public surfaces, so the answer is decided
-- under the CALLER's own scope and this file adds no authority of its own.
local aliases = require("aliases")
local reader = require("reader")

local M = {}

type UnknownMap = { [string]: unknown }
type AliasLookup = { record_id: string }
type References = { rows: { unknown } }

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return ((value :: string):gsub("^%s*(.-)%s*$", "%1"))
end

-- alias_lookup({ crm_id, object_type, alias_type?, value }) -> { record_id }.
-- An address the index does not carry answers with an empty record_id: an
-- unresolved address is a fact, not a failure, and the caller decides what it
-- means. alias_type defaults to email, which is the only alias a roster has.
function M.alias_lookup(value: unknown): (AliasLookup?, error?)
    if type(value) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "alias lookup input must be an object" }) end
    local args = value :: UnknownMap
    local crm_id = trim(args.crm_id)
    local object_type = trim(args.object_type)
    if crm_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    if object_type == "" then return nil, errors.new({ kind = errors.INVALID, message = "object_type is required" }) end
    local alias_type = trim(args.alias_type)
    if alias_type == "" then alias_type = "email" end

    local record_id, err = aliases.lookup(crm_id, object_type, alias_type, args.value)
    if err then return nil, err end
    if record_id ~= nil and type(record_id) ~= "string" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "CRM alias lookup returned a non-string record id" })
    end
    return { record_id = type(record_id) == "string" and trim(record_id) or "" }, nil
end

-- references({ crm_id, from_ref, include_inactive?, limit?, offset? }) -> { rows }.
-- Rows are the
-- read model's own edge shape; narrowing them to the edge types a caller owns is
-- the caller's decision, because this CRM does not know which edges belong to
-- whom.
function M.references(value: unknown): (References?, error?)
    if type(value) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "references input must be an object" }) end
    local args = value :: UnknownMap
    local crm_id = trim(args.crm_id)
    local from_ref = trim(args.from_ref)
    if crm_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    if from_ref == "" then return nil, errors.new({ kind = errors.INVALID, message = "from_ref is required" }) end

    local rows, err = reader.references(crm_id, from_ref, args.include_inactive ~= false, tonumber(args.limit), tonumber(args.offset))
    if err then return nil, err end
    if type(rows) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "CRM references returned a non-array" })
    end
    return { rows = rows :: { unknown } }, nil
end

return M
