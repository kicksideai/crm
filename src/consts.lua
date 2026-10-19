-- Stable CRM identifiers and closed domain vocabularies.
local M = {}

M.DB_CONFIG = "kickside.crm.persist:config"
M.THREADS = "kickside.core:threads"
M.PROJECTION_KIND = "kickside.crm:read_model"
M.CRM_IMPL = "kickside.crm.binding:crm"
M.CRM_CLASS = "crm"
M.THREAD_CLASS = "workspace.crm"
M.CONFIG = "kickside.crm.registry:default_config"
M.SETTINGS_CONTRACT = "kickside.settings:settings"
M.SETTINGS_NS = "kickside.crm"
M.SCHEMA_MUTATION_GATE = "kickside.crm.security:schema_mutation_access"

local EVENTS_NS = "kickside.crm.events:"

M.EVENTS = {
    RECORD_CREATED = EVENTS_NS .. "record.created",
    RECORD_UPDATED = EVENTS_NS .. "record.updated",
    RECORD_DELETED = EVENTS_NS .. "record.deleted",
    MERGE_SUGGESTED = EVENTS_NS .. "merge.suggested",
    MERGE_DECIDED = EVENTS_NS .. "merge.decided",
    RELATION_LINKED = EVENTS_NS .. "relation.linked",
    RELATION_UNLINKED = EVENTS_NS .. "relation.unlinked",
    REFERENCE_LINKED = EVENTS_NS .. "reference.linked",
    REFERENCE_UNLINKED = EVENTS_NS .. "reference.unlinked",
    MEMBERSHIP_SET = EVENTS_NS .. "membership.set",
    MEMBERSHIP_REMOVED = EVENTS_NS .. "membership.removed",
    ACTIVITY_LOGGED = EVENTS_NS .. "activity.logged",
    ACTIVITY_DELETED = EVENTS_NS .. "activity.deleted",
    AI_ATTRIBUTE_FILLED = EVENTS_NS .. "ai_attribute.filled",
    EXTERNAL_WRITE_REQUESTED = EVENTS_NS .. "external_write.requested",
    EXTERNAL_WRITE_SUCCEEDED = EVENTS_NS .. "external_write.succeeded",
    EXTERNAL_WRITE_FAILED = EVENTS_NS .. "external_write.failed",
}

M.ATTR_TYPES = {
    "text", "number", "boolean", "date", "time", "datetime", "select", "multi_select",
    "currency", "email", "phone", "url", "relation", "ai",
}

M.LAYOUTS = { "table", "board", "timeline" }

-- Exact-match alias vocabulary a field's config.alias may name; external:<system>
-- names an identifier issued by an external system.
M.ALIAS_TYPES = { "email", "domain", "phone", "linkedin" }

function M.is_alias_type(kind: unknown): boolean
    if type(kind) ~= "string" then return false end
    for _, known in ipairs(M.ALIAS_TYPES) do
        if kind == known then return true end
    end
    return kind:match("^external:[a-z][a-z0-9_.-]*$") ~= nil
end

-- Closed role vocabulary for the generalized reference edge (crm_ref.edge_type).
M.EDGE_TYPES = {
    "deal_context", "participant", "company_context", "owner", "transcript",
    "recording", "knowledge", "document", "attachment", "related",
}

-- Closed kind vocabulary for a reference string (ref = kind:tail). The tail keeps
-- its own colons (record ids and external ids carry them), so only the leading
-- kind segment is a closed token; the remainder is an opaque non-empty identity.
M.REF_KINDS = {
    "crm", "activity", "kb", "kbdoc", "component", "file", "url", "external",
}

-- Prefixes for the two CRM-owned identities a reference can name. Every producer
-- mints them through types.record_ref/types.activity_ref so cascades, constraints,
-- and callers agree on one format.
M.REF_PREFIX = {
    record = "crm:",
    activity = "activity:",
}


return M
