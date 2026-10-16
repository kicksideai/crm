local aliases = require("aliases")
local materializer = require("materializer")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")
local write_origin = require("write_origin")

type UnknownMap = { [string]: unknown }
type UnknownList = { unknown }
type Attribute = {
    id: string,
    object_type: string,
    attr: string,
    data_type: string,
    config: UnknownMap,
}
type ObjectDeclaration = { id: string, type: string, label: string, plural: string? }
type Declaration = {
    version: string,
    objects: { ObjectDeclaration },
    attributes: { Attribute },
    pipelines: UnknownList,
    views: UnknownList,
    policies: UnknownList,
    merge_config: UnknownMap,
    remove: UnknownMap?,
}
type Record = { record_id: string, values: UnknownMap }
type SchemaObject = { table_name: string?, relations: { [string]: unknown } }
type SchemaDeclaration = {
    version: string,
    pipelines: UnknownList,
    views: UnknownList,
    policies: UnknownList,
    merge_config: UnknownMap,
}
type Schema = {
    revision: unknown,
    source_hash: unknown,
    declaration: SchemaDeclaration,
    objects: { [string]: SchemaObject },
}
type ApplyResult = { changed: boolean }
type ListResult = { total: number, rows: { Record } }
type TypedRef = { kind: string, type: string, id: string }
type FieldResult = { value: unknown }
type RelationEdge = { source: TypedRef, target: TypedRef }
type Related = { incoming: { RelationEdge } }
type RelationGroups = { [string]: { outgoing: { RelationEdge }, incoming: { RelationEdge } } }
type WriteOrigin = { found: boolean, write_ref: string? }
type AliasClaim = { record_id: string, state: string, won: boolean }
type Event = { type: string, body: UnknownMap }

local function require_map(value: unknown, name: string): UnknownMap
    if type(value) ~= "table" then error(name .. " must be a table", 0) end
    return value :: UnknownMap
end

local function require_list(value: unknown, name: string): UnknownList
    local list = require_map(value, name)
    return list :: UnknownList
end

local function require_string(value: unknown, name: string): string
    if type(value) ~= "string" then error(name .. " must be a string", 0) end
    return value
end

local function require_number(value: unknown, name: string): number
    if type(value) ~= "number" then error(name .. " must be a number", 0) end
    return value
end

local function require_boolean(value: unknown, name: string): boolean
    if type(value) ~= "boolean" then error(name .. " must be a boolean", 0) end
    return value
end

local function require_record(value: unknown): Record
    local map = require_map(value, "record")
    return {
        record_id = require_string(map.record_id, "record.record_id"),
        values = require_map(map.values, "record.values"),
    }
end

local function require_schema(value: unknown): Schema
    local map = require_map(value, "schema")
    local declaration = require_map(map.declaration, "schema.declaration")
    return {
        revision = map.revision,
        source_hash = map.source_hash,
        declaration = {
            version = require_string(declaration.version, "schema.declaration.version"),
            pipelines = require_list(declaration.pipelines, "schema.declaration.pipelines"),
            views = require_list(declaration.views, "schema.declaration.views"),
            policies = require_list(declaration.policies, "schema.declaration.policies"),
            merge_config = require_map(declaration.merge_config, "schema.declaration.merge_config"),
        },
        objects = require_map(map.objects, "schema.objects") :: { [string]: SchemaObject },
    }
end

local function require_apply_result(value: unknown): ApplyResult
    local map = require_map(value, "schema apply result")
    return { changed = require_boolean(map.changed, "schema apply result.changed") }
end

local function require_list_result(value: unknown): ListResult
    local map = require_map(value, "record list")
    local rows: { Record } = {}
    for _, raw_row in ipairs(require_list(map.rows, "record list.rows")) do
        rows[#rows + 1] = require_record(raw_row)
    end
    return { total = require_number(map.total, "record list.total"), rows = rows }
end

local function require_ref(value: unknown, name: string): TypedRef
    local map = require_map(value, name)
    return {
        kind = require_string(map.kind, name .. ".kind"),
        type = require_string(map.type, name .. ".type"),
        id = require_string(map.id, name .. ".id"),
    }
end

local function require_refs(value: unknown, name: string): { TypedRef }
    local refs: { TypedRef } = {}
    for _, raw_ref in ipairs(require_list(value, name)) do
        refs[#refs + 1] = require_ref(raw_ref, name .. " item")
    end
    return refs
end

local function require_field(value: unknown): FieldResult
    return { value = require_map(value, "field").value }
end

local function require_related(value: unknown): Related
    local map = require_map(value, "related")
    local incoming = require_list(map.incoming, "related.incoming")
    local edges: { RelationEdge } = {}
    for _, item in ipairs(incoming) do
        local edge = require_map(item, "related edge")
        edges[#edges + 1] = {
            source = require_ref(edge.source, "related edge.source"),
            target = require_ref(edge.target, "related edge.target"),
        }
    end
    return { incoming = edges }
end

local function require_relation_groups(value: unknown): RelationGroups
    local map = require_map(value, "related records")
    local groups: RelationGroups = {}
    for record_id, raw_group in pairs(map) do
        local group = require_map(raw_group, "relation group")
        local function edges(raw: unknown, name: string): { RelationEdge }
            local output: { RelationEdge } = {}
            for _, raw_edge in ipairs(require_list(raw, name)) do
                local edge = require_map(raw_edge, name .. " edge")
                output[#output + 1] = {
                    source = require_ref(edge.source, name .. " edge.source"),
                    target = require_ref(edge.target, name .. " edge.target"),
                }
            end
            return output
        end
        groups[record_id] = { outgoing = edges(group.outgoing, "relation group.outgoing"), incoming = edges(group.incoming, "relation group.incoming") }
    end
    return groups
end

local function require_write_origin(value: unknown): WriteOrigin
    local map = require_map(value, "write origin")
    local write_ref = map.write_ref
    return {
        found = require_boolean(map.found, "write origin.found"),
        write_ref = type(write_ref) == "string" and write_ref or nil,
    }
end

local function require_alias_claim(value: unknown): AliasClaim
    local map = require_map(value, "alias claim")
    return {
        record_id = require_string(map.record_id, "alias claim.record_id"),
        state = require_string(map.state, "alias claim.state"),
        won = require_boolean(map.won, "alias claim.won"),
    }
end

local function db(): (sql.DB, string)
    local handle, err = sql.get(types.db_id())
    if err then error(tostring(err), 0) end
    local db_type, type_err = handle:type()
    if type_err then handle:release(); error(tostring(type_err), 0) end
    if db_type == sql.type.SQLITE then return handle, "sqlite" end
    if db_type == sql.type.POSTGRES then return handle, "postgres" end
    handle:release()
    error("unsupported test database", 0)
end

local function declaration(version: string, name_attr: string?): Declaration
    return {
        version = version,
        objects = { { id = "entity-object", type = "entity", label = "Entity", plural = "Entities" } },
        attributes = {
            {
                id = "entity-name",
                object_type = "entity",
                attr = name_attr or "name",
                data_type = "text",
                config = { searchable = true },
            },
            {
                id = "entity-email",
                object_type = "entity",
                attr = "email",
                data_type = "email",
                config = { alias = "email", searchable = true },
            },
            {
                id = "entity-score",
                object_type = "entity",
                attr = "score",
                data_type = "number",
                config = { indexed = true },
            },
            {
                id = "entity-active",
                object_type = "entity",
                attr = "active",
                data_type = "boolean",
                config = {},
            },
            {
                id = "entity-parent",
                object_type = "entity",
                attr = "parent",
                data_type = "relation",
                config = {
                    cardinality = "one",
                    target = { kind = "record", object_type = "entity" },
                },
            },
            {
                id = "entity-peers",
                object_type = "entity",
                attr = "peers",
                data_type = "relation",
                config = {
                    cardinality = "many",
                    target = { kind = "record", object_type = "entity" },
                },
            },
        },
        pipelines = {},
        views = {},
        policies = {},
        merge_config = {},
    }
end

local function relation_declaration(version: string): Declaration
    return {
        version = version,
        objects = {
            { id = "company-object", type = "company", label = "Company" },
            { id = "contact-object", type = "contact", label = "Contact" },
        },
        attributes = {
            { id = "company-name", object_type = "company", attr = "name", data_type = "text", config = { searchable = true } },
            { id = "contact-name", object_type = "contact", attr = "name", data_type = "text", config = { searchable = true } },
            { id = "contact-company", object_type = "contact", attr = "company", data_type = "relation",
                config = { cardinality = "one", target = { kind = "record", object_type = "company" } } },
        },
        pipelines = { { collection_id = "company_pipeline", object_type = "company", label = "Company pipeline", stages = {} } },
        views = { { view_id = "company_table", object_type = "company", name = "Companies", layout = "table" } },
        policies = { { key = "retained", value = true } },
        merge_config = { auto_merge = false },
    }
end

local function unique_declaration(version: string, enabled: boolean): Declaration
    local wanted = declaration(version)
    for _, field in ipairs(wanted.attributes) do
        if field.attr == "email" then field.config.unique = enabled end
    end
    return wanted
end

local function wide_declaration(): Declaration
    local wanted = {
        version = "wide-v1",
        objects = { { id = "wide-object", type = "wide", label = "Wide" } },
        attributes = {},
        pipelines = {},
        views = {},
        policies = {},
        merge_config = {},
    }
    for index = 1, 300 do
        wanted.attributes[#wanted.attributes + 1] = {
            id = string.format("wide-field-%03d", index),
            object_type = "wide",
            attr = string.format("field_%03d", index),
            data_type = "text",
            config = { searchable = false },
        }
    end
    return wanted
end

local function apply(crm_id: string, wanted: Declaration): ApplyResult
    local handle, dialect = db()
    local result, err = storage.ensure(handle, dialect, crm_id, wanted)
    handle:release()
    test.is_nil(err)
    test.not_nil(result)
    return require_apply_result(result)
end

local function project(crm_id: string, events: { Event }): error?
    local handle = db()
    local tx, begin_err = handle:begin()
    if begin_err then handle:release(); return begin_err end
    local err = materializer.project_events(tx, crm_id, events)
    if err then tx:rollback(); handle:release(); return err end
    local _, commit_err = tx:commit()
    if commit_err then tx:rollback(); handle:release(); return commit_err end
    handle:release()
    return nil
end

local function event(event_type: string, body: UnknownMap): Event
    body.occurred_at = "2026-07-24T12:00:00Z"
    return { type = event_type, body = body }
end

local function define_tests()
    test.describe("Typed CRM lifecycle", function()
        -- An alias is owned by exactly one live record. A write that loses the
        -- email to its owner must leave no claim behind, or every later write of
        -- that email under any other record id is refused forever.
        test.it("a refused alias claim leaves no reservation and the email stays claimable by its owner", function()
            local crm_id = tostring(uuid.v7())
            local handle, dialect = db()
            local _, schema_err = storage.ensure(handle, dialect, crm_id, {
                version = "alias-claim-v1",
                objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } },
                attributes = {
                    { id = "name", object_type = "entity", attr = "name", data_type = "text", config = { required = true } },
                    { id = "email", object_type = "entity", attr = "email", data_type = "email", config = { alias = "email", searchable = true } },
                },
            })
            handle:release()
            test.is_nil(schema_err)

            test.is_nil(project(crm_id, { event(types.EVENTS.RECORD_CREATED, {
                object_type = "entity", record_id = "entity:owner", values = { name = "Owner", email = "shared@example.test" },
            }) }))
            local refused = project(crm_id, { event(types.EVENTS.RECORD_CREATED, {
                object_type = "entity", record_id = "entity:loser", values = { name = "Loser", email = "shared@example.test" },
            }) })
            test.not_nil(refused, "a second record cannot take a claimed email")

            handle = db()
            local reservations, reservations_err = handle:query([[
                SELECT record_id FROM kickside_crm_alias_reservation WHERE crm_id = $1 AND alias_type = 'email' ORDER BY record_id
            ]], { crm_id })
            handle:release()
            test.is_nil(reservations_err)
            test.eq(#reservations, 1, "the refused claim leaves no reservation behind")
            test.eq(reservations[1].record_id, "entity:owner")

            -- The owner releases the email; the other record claims it cleanly.
            test.is_nil(project(crm_id, { event(types.EVENTS.RECORD_DELETED, { object_type = "entity", record_id = "entity:owner" }) }))
            test.is_nil(project(crm_id, { event(types.EVENTS.RECORD_CREATED, {
                object_type = "entity", record_id = "entity:loser", values = { name = "Loser", email = "shared@example.test" },
            }) }))
            handle = db()
            local owner_rows, owner_err = handle:query([[
                SELECT record_id FROM kickside_crm_alias WHERE crm_id = $1 AND alias_type = 'email'
            ]], { crm_id })
            handle:release()
            test.is_nil(owner_err)
            test.eq(#owner_rows, 1)
            test.eq(owner_rows[1].record_id, "entity:loser")
        end)

        -- A reservation is a claim by a record that is about to exist. When that
        -- record never materialized (its append or projection failed) the claim
        -- is stale: it must not refuse the next claimant. A claim by a live alias
        -- owner still wins.
        test.it("a stale reservation left by a record that never materialized yields to the next claimant", function()
            local crm_id = tostring(uuid.v7())
            local handle, dialect = db()
            local _, schema_err = storage.ensure(handle, dialect, crm_id, {
                version = "alias-stale-v1",
                objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } },
                attributes = {
                    { id = "name", object_type = "entity", attr = "name", data_type = "text", config = { required = true } },
                    { id = "email", object_type = "entity", attr = "email", data_type = "email", config = { alias = "email", searchable = true } },
                },
            })
            test.is_nil(schema_err)
            -- The ghost's claim was committed by a projection whose record is
            -- gone (its object storage was replaced underneath it).
            local ghost, ghost_err = aliases.internal_reserve(handle, crm_id, "entity", "email", "stale@example.test", "entity:ghost")
            test.is_nil(ghost_err)
            test.eq((ghost :: any).record_id, "entity:ghost")
            local _, mark_err = handle:execute([[
                UPDATE kickside_crm_alias_reservation SET state = 'committed' WHERE crm_id = $1 AND record_id = $2
            ]], { crm_id, "entity:ghost" })
            test.is_nil(mark_err)
            local real, real_err = aliases.internal_reserve(handle, crm_id, "entity", "email", "stale@example.test", "entity:real")
            test.is_nil(real_err)
            test.eq((real :: any).record_id, "entity:real", "a stale committed claim yields")
            test.is_true((real :: any).won)
            -- A pending claim is a record still landing: it keeps blocking.
            local landing, landing_err = aliases.internal_reserve(handle, crm_id, "entity", "email", "landing@example.test", "entity:landing")
            test.is_nil(landing_err)
            test.eq((landing :: any).record_id, "entity:landing")
            local blocked, blocked_err = aliases.internal_reserve(handle, crm_id, "entity", "email", "landing@example.test", "entity:late")
            test.is_nil(blocked_err)
            test.eq((blocked :: any).record_id, "entity:landing", "a pending claim keeps blocking")
            handle:release()

            -- A live owner keeps its alias against every other claimant.
            test.is_nil(project(crm_id, { event(types.EVENTS.RECORD_CREATED, {
                object_type = "entity", record_id = "entity:owner", values = { name = "Owner", email = "owned@example.test" },
            }) }))
            handle = db()
            local other, other_err = aliases.internal_reserve(handle, crm_id, "entity", "email", "owned@example.test", "entity:other")
            handle:release()
            test.is_nil(other_err)
            test.eq((other :: any).record_id, "entity:owner")
            test.is_true(not (other :: any).won)
        end)

        test.it("applies, edits, and rolls schema back without losing records", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, declaration("v1"))
            local handle = db()
            local created, create_err = storage.upsert(handle, crm_id, "entity", {
                record_id = "entity:one",
                values = { name = "Primary Record", email = "primary@example.test", score = 9 },
            })
            test.is_nil(create_err)
            test.eq(require_record(created).values.name, "Primary Record")
            handle:release()

            apply(crm_id, declaration("v2", "display_name"))
            handle = db()
            local renamed, rename_err = storage.get(handle, crm_id, "entity", "entity:one")
            test.is_nil(rename_err)
            test.eq(require_record(renamed).values.display_name, "Primary Record")
            handle:release()

            apply(crm_id, declaration("v1"))
            handle = db()
            local restored, restore_err = storage.get(handle, crm_id, "entity", "entity:one")
            test.is_nil(restore_err)
            test.eq(require_record(restored).values.name, "Primary Record")
            local schema, schema_err = storage.load_schema(handle, crm_id)
            test.is_nil(schema_err)
            local current_schema = require_schema(schema)
            test.eq(current_schema.declaration.version, "v1")
            test.eq(current_schema.revision, current_schema.source_hash)
            handle:release()
        end)

        test.it("keeps the prior schema atomic when an edit is invalid", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, declaration("atomic-v1"))
            local before_handle = db()
            local before_schema, before_err = storage.load_schema(before_handle, crm_id)
            before_handle:release()
            test.is_nil(before_err)
            local invalid = declaration("atomic-v2")
            invalid.attributes[#invalid.attributes + 1] = {
                id = "duplicate-name",
                object_type = "entity",
                attr = "name",
                data_type = "text",
                config = {},
            }
            local handle, dialect = db()
            local result, apply_err = storage.ensure(handle, dialect, crm_id, invalid)
            test.is_nil(result)
            test.not_nil(apply_err)
            local schema, schema_err = storage.load_schema(handle, crm_id)
            test.is_nil(schema_err)
            test.eq(require_schema(schema).revision, require_schema(before_schema).revision)
            test.eq(require_schema(schema).declaration.version, "atomic-v1")
            handle:release()
        end)

        test.it("uses one physical value column per declared scalar field", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, wide_declaration())
            local handle = db()
            local record, write_err = storage.upsert(handle, crm_id, "wide", {
                record_id = "wide:one",
                values = { field_001 = "first", field_300 = "last" },
            })
            handle:release()
            test.is_nil(write_err)
            local written = require_record(record)
            test.eq(written.values.field_001, "first")
            test.eq(written.values.field_300, "last")
        end)

        test.it("enforces unique scalar fields through compile, write, update, and removal", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, unique_declaration("unique-v1", false))
            local handle, dialect = db()
            for _, row in ipairs({
                { record_id = "entity:one", values = { name = "One", email = "shared@example.test" } },
                { record_id = "entity:two", values = { name = "Two", email = "shared@example.test" } },
                { record_id = "entity:nil-one", values = { name = "Nil one" } },
                { record_id = "entity:nil-two", values = { name = "Nil two" } },
            }) do
                local _, write_err = storage.upsert(handle, crm_id, "entity", row)
                test.is_nil(write_err)
            end

            local blocked, blocked_err = storage.ensure(handle, dialect, crm_id,
                unique_declaration("unique-v2", true))
            test.is_nil(blocked)
            test.eq(tostring(blocked_err), "CRM unique field conflict: entity.email")
            test.is_true(errors.is(blocked_err, errors.CONFLICT))
            local prior, prior_err = storage.load_schema(handle, crm_id)
            test.is_nil(prior_err)
            test.eq(require_schema(prior).declaration.version, "unique-v1")

            local _, repair_err = storage.upsert(handle, crm_id, "entity", {
                record_id = "entity:two", values = { email = "two@example.test" },
            })
            test.is_nil(repair_err)
            local enabled, enabled_err = storage.ensure(handle, dialect, crm_id,
                unique_declaration("unique-v2", true))
            test.is_nil(enabled_err)
            test.not_nil(enabled)

            local _, create_conflict = storage.upsert(handle, crm_id, "entity", {
                record_id = "entity:three", values = { name = "Three", email = "shared@example.test" },
            })
            test.eq(tostring(create_conflict), "CRM unique field conflict: entity.email")
            test.is_true(errors.is(create_conflict, errors.CONFLICT))
            local orphan, orphan_err = storage.locate(handle, crm_id, "entity:three")
            test.is_nil(orphan_err)
            test.is_nil(orphan)
            local _, update_conflict = storage.upsert(handle, crm_id, "entity", {
                record_id = "entity:two", values = { email = "shared@example.test" },
            })
            test.eq(tostring(update_conflict), "CRM unique field conflict: entity.email")
            test.is_true(errors.is(update_conflict, errors.CONFLICT))

            local removed = unique_declaration("unique-v3", true)
            removed.remove = { attributes = { { object_id = "entity-object", field_id = "entity-email" } } }
            local removed_result, removed_err = storage.ensure(handle, dialect, crm_id, removed)
            test.is_nil(removed_err)
            test.not_nil(removed_result)
            local readded, readd_err = storage.ensure(handle, dialect, crm_id,
                unique_declaration("unique-v4", false))
            test.is_nil(readd_err)
            test.not_nil(readded)
            local _, duplicate_allowed = storage.upsert(handle, crm_id, "entity", {
                record_id = "entity:two", values = { email = "shared@example.test" },
            })
            test.is_nil(duplicate_allowed)
            handle:release()
        end)

        test.it("requires explicit destructive edits and rejects dangling relation targets", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, relation_declaration("delete-v1"))
            local handle, dialect = db()
            local _, company_err = storage.upsert(handle, crm_id, "company", {
                record_id = "company:acme", values = { name = "Acme" },
            })
            local _, contact_err = storage.upsert(handle, crm_id, "contact", {
                record_id = "contact:primary", values = { name = "Primary Record" },
            })
            test.is_nil(company_err); test.is_nil(contact_err)
            local _, link_err = storage.link(handle, crm_id, "contact", "contact:primary", "company",
                { kind = "record", type = "company", id = "company:acme" })
            test.is_nil(link_err)

            local blocked = relation_declaration("delete-v2")
            blocked.remove = { objects = { { object_id = "company-object" } } }
            local blocked_result, blocked_err = storage.ensure(handle, dialect, crm_id, blocked)
            test.is_nil(blocked_result)
            test.not_nil(blocked_err)
            test.is_true(tostring(blocked_err):find("contact.company", 1, true) ~= nil)
            local unchanged, unchanged_err = storage.load_schema(handle, crm_id)
            test.is_nil(unchanged_err)
            local unchanged_schema = require_schema(unchanged)
            local initial_revision = unchanged_schema.revision
            test.not_nil(unchanged_schema.objects.company)
            local contact_schema = unchanged_schema.objects.contact
            test.not_nil(contact_schema)
            if not contact_schema then error("contact schema is missing", 0) end
            test.not_nil(contact_schema.relations.company)

            local wanted = relation_declaration("delete-v2")
            wanted.remove = {
                attributes = { { object_id = "contact-object", field_id = "contact-company" } },
                objects = { { object_id = "company-object" } },
                declarations = {
                    { kind = "pipeline", id = "company_pipeline" },
                    { kind = "view", id = "company_table" },
                },
            }
            local applied, apply_err = storage.ensure(handle, dialect, crm_id, wanted)
            test.is_nil(apply_err)
            test.eq(require_apply_result(applied).changed, true)
            local current, current_err = storage.load_schema(handle, crm_id)
            test.is_nil(current_err)
            local current_schema = require_schema(current)
            test.is_nil(current_schema.objects.company)
            local current_contact = current_schema.objects.contact
            test.not_nil(current_contact)
            if not current_contact then error("contact schema is missing", 0) end
            test.is_nil(current_contact.relations.company)
            test.eq(#current_schema.declaration.pipelines, 0)
            test.eq(#current_schema.declaration.views, 0)
            test.eq(require_boolean(current_schema.declaration.merge_config.auto_merge, "merge_config.auto_merge"), false)
            test.eq(#current_schema.declaration.policies, 1)
            local removed, locate_err = storage.locate(handle, crm_id, "company:acme")
            test.is_nil(locate_err); test.is_nil(removed)

            local replay, replay_err = storage.ensure(handle, dialect, crm_id, wanted, initial_revision)
            test.is_nil(replay_err)
            test.eq(require_apply_result(replay).changed, false)
            local stale = relation_declaration("delete-v3")
            stale.objects[2].label = "Changed contact"
            local stale_result, stale_err = storage.ensure(handle, dialect, crm_id, stale, initial_revision)
            test.is_nil(stale_result)
            test.eq(tostring(stale_err), "CRM schema revision conflict")
            test.is_true(errors.is(stale_err, errors.CONFLICT))
            handle:release()
        end)

        test.it("supports typed CRUD, SQLite FTS, and one-valued relations", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, declaration("crud-v1"))
            local handle = db()
            for _, row in ipairs({
                { record_id = "entity:a", values = { name = "Searchable Record", email = "searchable@example.test", score = 10, active = true } },
                { record_id = "entity:b", values = { name = "Secondary Record", email = "secondary@example.test", score = 8 } },
                { record_id = "entity:c", values = { name = "Tertiary Record", email = "tertiary@example.test", score = 7 } },
                { record_id = "entity:d", values = { name = "No Score", email = "none@example.test" } },
            }) do
                local _, err = storage.upsert(handle, crm_id, "entity", row)
                test.is_nil(err)
            end
            local updated, update_err = storage.update(handle, crm_id, "entity", {
                record_id = "entity:a",
                values = { score = 11 },
                unset = { "email" },
            })
            test.is_nil(update_err)
            local updated_record = require_record(updated)
            test.eq(updated_record.values.score, 11)
            test.is_nil(updated_record.values.email)
            test.eq(updated_record.values.active, true)

            local found, search_err = storage.list(handle, crm_id, "entity", { search = "Searchable" })
            test.is_nil(search_err)
            local found_records = require_list_result(found)
            test.eq(found_records.total, 1)
            test.eq(found_records.rows[1].record_id, "entity:a")
            -- A seller types the start of a name, not its dictionary form:
            -- every search token matches as a prefix.
            local prefixed, prefix_err = storage.list(handle, crm_id, "entity", { search = "Searc" })
            test.is_nil(prefix_err)
            local prefix_records = require_list_result(prefixed)
            test.eq(prefix_records.total, 1)
            test.eq(prefix_records.rows[1].record_id, "entity:a")
            -- A term that survives sanitization as nothing matches nothing,
            -- never everything.
            local quoted, quoted_err = storage.list(handle, crm_id, "entity", { search = '"' })
            test.is_nil(quoted_err)
            test.eq(require_list_result(quoted).total, 0)
            local operators, operators_err = storage.list(handle, crm_id, "entity", { search = "&|!():*" })
            test.is_nil(operators_err)
            test.eq(require_list_result(operators).total, 0)

            local ordered, ordered_err = storage.list(handle, crm_id, "entity", {
                sort = { attr = "score", dir = "asc" }, limit = 10,
            })
            test.is_nil(ordered_err)
            local ordered_records = require_list_result(ordered)
            test.eq(ordered_records.rows[#ordered_records.rows].record_id, "entity:d")

            local linked, link_err = storage.link(handle, crm_id, "entity", "entity:a", "parent",
                { kind = "record", type = "entity", id = "entity:b" })
            test.is_nil(link_err)
            test.eq(linked, true)
            linked, link_err = storage.link(handle, crm_id, "entity", "entity:a", "parent",
                { kind = "record", type = "entity", id = "entity:c" })
            test.is_nil(link_err)
            test.eq(linked, true)
            local parent, parent_err = storage.field(handle, crm_id, "entity", "entity:a", "parent")
            test.is_nil(parent_err)
            test.eq(require_ref(require_field(parent).value, "parent field").id, "entity:c")
            local related_many, related_many_err = storage.related_many(handle, crm_id, { "entity:a", "entity:c" })
            test.is_nil(related_many_err)
            local related_groups = require_relation_groups(related_many)
            test.eq(#related_groups["entity:a"].outgoing, 1)
            test.eq(related_groups["entity:a"].outgoing[1].target.id, "entity:c")
            test.eq(#related_groups["entity:c"].incoming, 1)
            test.eq(related_groups["entity:c"].incoming[1].source.id, "entity:a")

            local deleted, delete_err = storage.delete(handle, crm_id, "entity", "entity:b")
            test.is_nil(delete_err)
            test.eq(deleted, true)
            local missing, missing_err = storage.get(handle, crm_id, "entity", "entity:b")
            test.is_nil(missing_err)
            test.is_nil(missing)
            handle:release()
        end)

        test.it("isolates external-write echoes by connection and object type", function()
            local crm_id = tostring(uuid.v7())
            local completed_at = tostring(os.date("!%Y-%m-%dT%H:%M:%SZ"))
            local shared = {
                provider = "hubspot",
                target_ref = "provider-record:shared",
                completed_at = completed_at,
                origin = {},
            }
            test.is_nil(project(crm_id, {
                event(types.EVENTS.EXTERNAL_WRITE_SUCCEEDED, {
                    provider = shared.provider,
                    connection_id = "connection:a",
                    object_type = "contact",
                    target_ref = shared.target_ref,
                    value_hashes = { email = write_origin.value_hash("a@example.test") },
                    write_ref = "write:a",
                    completed_at = shared.completed_at,
                    origin = shared.origin,
                }),
                event(types.EVENTS.EXTERNAL_WRITE_SUCCEEDED, {
                    provider = shared.provider,
                    connection_id = "connection:b",
                    object_type = "contact",
                    target_ref = shared.target_ref,
                    value_hashes = { email = write_origin.value_hash("b@example.test") },
                    write_ref = "write:b",
                    completed_at = shared.completed_at,
                    origin = shared.origin,
                }),
                event(types.EVENTS.EXTERNAL_WRITE_SUCCEEDED, {
                    provider = shared.provider,
                    connection_id = "connection:a",
                    object_type = "company",
                    target_ref = shared.target_ref,
                    value_hashes = { email = write_origin.value_hash("c@example.test") },
                    write_ref = "write:c",
                    completed_at = shared.completed_at,
                    origin = shared.origin,
                }),
            }))

            local handle = db()
            local rows, rows_err = handle:query([[
                SELECT connection_id, object_type, write_ref
                FROM kickside_crm_write_origin
                WHERE crm_id = $1 AND provider = $2 AND target_ref = $3 AND attr = $4
                ORDER BY connection_id, object_type
            ]], { crm_id, shared.provider, shared.target_ref, "email" })
            handle:release()
            test.is_nil(rows_err)
            test.eq(#rows, 3)

            local connection_a, lookup_err = write_origin.lookup(
                crm_id, shared.provider, "connection:a", "contact", shared.target_ref, "email")
            test.is_nil(lookup_err)
            test.eq(require_write_origin(connection_a).write_ref, "write:a")
            local connection_b
            connection_b, lookup_err = write_origin.lookup(
                crm_id, shared.provider, "connection:b", "contact", shared.target_ref, "email")
            test.is_nil(lookup_err)
            test.eq(require_write_origin(connection_b).write_ref, "write:b")
            local company
            company, lookup_err = write_origin.lookup(
                crm_id, shared.provider, "connection:a", "company", shared.target_ref, "email")
            test.is_nil(lookup_err)
            test.eq(require_write_origin(company).write_ref, "write:c")

            local matched, match_err = write_origin.matches(
                crm_id, shared.provider, "connection:a", "contact", shared.target_ref, "email", "a@example.test")
            test.is_nil(match_err)
            test.eq(require_write_origin(matched).write_ref, "write:a")
            matched, match_err = write_origin.matches(
                crm_id, shared.provider, "connection:a", "contact", shared.target_ref, "email", "b@example.test")
            test.is_nil(match_err)
            test.is_nil(matched)
            local missing
            missing, lookup_err = write_origin.lookup(
                crm_id, shared.provider, "connection:missing", "contact", shared.target_ref, "email")
            test.is_nil(lookup_err)
            test.eq(require_write_origin(missing).found, false)
            missing, lookup_err = write_origin.lookup(
                crm_id, shared.provider, "", "contact", shared.target_ref, "email")
            test.is_nil(missing)
            test.eq(lookup_err, "connection_id is required")
        end)

        test.it("makes merge resolution replay-safe and rejects conflicts and self-edges", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, declaration("merge-v1"))
            test.is_nil(project(crm_id, {
                event(types.EVENTS.RECORD_CREATED, {
                    record_id = "entity:winner",
                    object_type = "entity",
                    values = { name = "Winner" },
                }),
                event(types.EVENTS.RECORD_CREATED, {
                    record_id = "entity:loser",
                    object_type = "entity",
                    values = { name = "Loser", email = "loser@example.test", score = 4 },
                }),
                event(types.EVENTS.RECORD_CREATED, {
                    record_id = "entity:third",
                    object_type = "entity",
                    values = { name = "Third" },
                }),
                event(types.EVENTS.RECORD_CREATED, {
                    record_id = "entity:fourth",
                    object_type = "entity",
                    values = { name = "Fourth" },
                }),
            }))

            local handle = db()
            for _, edge in ipairs({
                { "entity:winner", "peers", "entity:third" },
                { "entity:loser", "peers", "entity:third" },
                { "entity:loser", "peers", "entity:fourth" },
                { "entity:loser", "peers", "entity:winner" },
                { "entity:third", "peers", "entity:loser" },
                { "entity:fourth", "peers", "entity:loser" },
                { "entity:fourth", "peers", "entity:winner" },
                { "entity:winner", "parent", "entity:loser" },
                { "entity:loser", "parent", "entity:third" },
            }) do
                local _, link_err = storage.link(handle, crm_id, "entity", edge[1], edge[2], {
                    kind = "record",
                    type = "entity",
                    id = edge[3],
                })
                test.is_nil(link_err)
            end
            handle:release()

            test.is_nil(project(crm_id, {
                event(types.EVENTS.MEMBERSHIP_SET, {
                    collection_id = "pipeline:shared",
                    record_id = "entity:winner",
                    stage_id = "stage:winner",
                }),
                event(types.EVENTS.MEMBERSHIP_SET, {
                    collection_id = "pipeline:shared",
                    record_id = "entity:loser",
                    stage_id = "stage:loser",
                }),
                event(types.EVENTS.MEMBERSHIP_SET, {
                    collection_id = "pipeline:loser-only",
                    record_id = "entity:loser",
                    stage_id = "stage:transfer",
                }),
                event(types.EVENTS.ACTIVITY_LOGGED, {
                    activity_id = "activity:owned",
                    record_id = "entity:loser",
                    participant_record_id = "entity:winner",
                    activity_type = "note",
                }),
                event(types.EVENTS.ACTIVITY_LOGGED, {
                    activity_id = "activity:participant",
                    record_id = "entity:third",
                    participant_record_id = "entity:loser",
                    activity_type = "meeting",
                }),
            }))

            local merged = event(types.EVENTS.MERGE_DECIDED, {
                resolution_id = "resolution:one",
                left_id = "entity:loser",
                right_id = "entity:winner",
                object_type = "entity",
                decision = "merged",
                winner_id = "entity:winner",
                loser_id = "entity:loser",
                resolved_by = "user:reviewer",
                resolved_at = "2026-07-24T12:00:00Z",
            })
            test.is_nil(project(crm_id, { merged }))
            test.is_nil(project(crm_id, { merged }))

            handle = db()
            local winner, winner_read_err = storage.get(handle, crm_id, "entity", "entity:winner")
            local loser, loser_read_err = storage.get(handle, crm_id, "entity", "entity:loser")
            handle:release()
            test.is_nil(winner_read_err)
            test.is_nil(loser_read_err)
            local winner_record = require_record(winner)
            test.eq(winner_record.values.name, "Winner")
            test.eq(winner_record.values.email, "loser@example.test")
            test.eq(winner_record.values.score, 4)
            test.is_nil(loser)

            handle = db()
            local parent, parent_err = storage.field(handle, crm_id, "entity", "entity:winner", "parent")
            local peers, peers_err = storage.field(handle, crm_id, "entity", "entity:winner", "peers")
            local related, related_err = storage.related(handle, crm_id, "entity:winner")
            local memberships, memberships_err = handle:query([[
                SELECT collection_id, stage_id FROM kickside_crm_collection_membership
                WHERE crm_id = $1 AND record_id = $2 ORDER BY collection_id
            ]], { crm_id, "entity:winner" })
            local activities, activities_err = handle:query([[
                SELECT activity_id, record_id, participant_record_id FROM kickside_crm_activity
                WHERE crm_id = $1 ORDER BY activity_id
            ]], { crm_id })
            local aliases_rows, aliases_err = handle:query([[
                SELECT record_id FROM kickside_crm_alias
                WHERE crm_id = $1 AND alias_type = 'email'
            ]], { crm_id })
            local reservations, reservations_err = handle:query([[
                SELECT record_id FROM kickside_crm_alias_reservation
                WHERE crm_id = $1 AND alias_type = 'email'
            ]], { crm_id })
            handle:release()
            test.is_nil(parent_err)
            test.is_nil(peers_err)
            test.is_nil(related_err)
            test.is_nil(memberships_err)
            test.is_nil(activities_err)
            test.is_nil(aliases_err)
            test.is_nil(reservations_err)
            test.eq(require_ref(require_field(parent).value, "parent field").id, "entity:third")
            local peer_refs = require_refs(require_field(peers).value, "peers field")
            test.eq(#peer_refs, 2)
            test.eq(peer_refs[1].id, "entity:third")
            test.eq(peer_refs[2].id, "entity:fourth")
            local related_records = require_related(related)
            test.eq(#related_records.incoming, 2)
            for _, edge in ipairs(related_records.incoming) do
                test.is_true(edge.source.id ~= "entity:winner")
                test.eq(edge.target.id, "entity:winner")
            end
            test.eq(#memberships, 2)
            test.eq(memberships[1].collection_id, "pipeline:loser-only")
            test.eq(memberships[1].stage_id, "stage:transfer")
            test.eq(memberships[2].collection_id, "pipeline:shared")
            test.eq(memberships[2].stage_id, "stage:winner")
            test.eq(activities[1].record_id, "entity:winner")
            test.eq(activities[1].participant_record_id, "entity:winner")
            test.eq(activities[2].record_id, "entity:third")
            test.eq(activities[2].participant_record_id, "entity:winner")
            test.eq(#aliases_rows, 1)
            test.eq(aliases_rows[1].record_id, "entity:winner")
            test.eq(#reservations, 1)
            test.eq(reservations[1].record_id, "entity:winner")

            local conflict = event(types.EVENTS.MERGE_DECIDED, {
                resolution_id = "resolution:one",
                left_id = "entity:loser",
                right_id = "entity:winner",
                object_type = "entity",
                decision = "do_not_merge",
                resolved_by = "user:reviewer",
                resolved_at = "2026-07-24T12:00:00Z",
            })
            local conflict_err = project(crm_id, { conflict })
            test.is_true(tostring(conflict_err):find("different merge decision", 1, true) ~= nil)

            local self_edge = event(types.EVENTS.MERGE_DECIDED, {
                resolution_id = "resolution:self",
                left_id = "entity:winner",
                right_id = "entity:winner",
                object_type = "entity",
                decision = "do_not_merge",
                resolved_by = "user:reviewer",
            })
            local self_err = project(crm_id, { self_edge })
            test.is_true(tostring(self_err):find("must differ", 1, true) ~= nil)
        end)

        test.it("keeps alias claims durable across storage reopen until projection commits ownership", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, declaration("alias-v1"))
            local handle = db()
            local claim, claim_err = aliases.internal_reserve(handle, crm_id, "entity", "email",
                "Record@One.example.test", "entity:reserved")
            test.is_nil(claim_err)
            local initial_claim = require_alias_claim(claim)
            test.eq(initial_claim.state, "pending")
            test.eq(initial_claim.won, true)
            local retry, retry_err = aliases.internal_reserve(handle, crm_id, "entity", "email",
                "record@one.example.test", "entity:other")
            handle:release()
            test.is_nil(retry_err)
            local retry_claim = require_alias_claim(retry)
            test.eq(retry_claim.record_id, "entity:reserved")
            test.eq(retry_claim.won, false)
            test.eq(retry_claim.state, "pending")

            local create_err = project(crm_id, { event(types.EVENTS.RECORD_CREATED, {
                record_id = "entity:reserved",
                object_type = "entity",
                values = { name = "Reserved Record", email = "record@one.example.test" },
            }) })
            test.is_nil(create_err)
            handle = db()
            local rows, row_err = handle:query([[
                SELECT state FROM kickside_crm_alias_reservation
                WHERE crm_id = $1 AND object_scope = 'entity' AND alias_type = 'email'
            ]], { crm_id })
            test.is_nil(row_err)
            test.eq(require_string(require_map(rows[1], "alias reservation row").state, "alias reservation state"), "committed")
            local owner, lookup_err = aliases.internal_lookup(
                handle, crm_id, "entity", "email", "RECORD@ONE.example.test")
            handle:release()
            test.is_nil(lookup_err)
            test.eq(owner, "entity:reserved")
        end)

        test.it("rejects an unprovisioned teardown and preserves another CRM's data", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id, declaration("teardown-v1"))
            local handle = db()
            local created, create_err = storage.upsert(handle, crm_id, "entity", {
                record_id = "entity:preserved",
                values = { name = "Preserved", email = "preserved@example.test" },
            })
            test.is_nil(create_err)
            test.eq(require_record(created).values.name, "Preserved")

            local destroyed, destroy_err = storage.destroy_crm(handle, tostring(uuid.v7()))
            test.is_nil(destroyed)
            test.is_true(tostring(destroy_err):find("CRM schema is not applied:", 1, true) ~= nil)

            local preserved, read_err = storage.get(handle, crm_id, "entity", "entity:preserved")
            handle:release()
            test.is_nil(read_err)
            test.eq(require_record(preserved).values.name, "Preserved")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
