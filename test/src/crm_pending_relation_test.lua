-- Ordering-deferral contract for the relation fold. A relation.linked whose source
-- or target record has not been materialized yet -- the record.created arrives later
-- in the same seq-ordered stream -- is parked in kickside_crm_pending_relation
-- rather than failing the fold, and the record-materialization path drains it once
-- both endpoints hold. Genuine relation errors (unknown relation, malformed
-- reference, a type mismatch on a record that exists) still fail, never defer.
local materializer = require("materializer")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type UnknownMap = { [string]: unknown }
type Event = { type: string, body: UnknownMap }
type TypedRef = { kind: string, type: string, id: string }
type FieldResult = { value: unknown }

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

-- entity is self-referential: parent is a one-valued relation, peers a many-valued
-- one, so both cardinalities exercise the same deferral path.
local function apply(crm_id: string)
    local handle, dialect = db()
    local _, err = storage.ensure(handle, dialect, crm_id, {
        version = "pending-relation-v1",
        objects = { { id = "entity-object", type = "entity", label = "Entity", plural = "Entities" } },
        attributes = {
            { id = "entity-name", object_type = "entity", attr = "name", data_type = "text", config = { searchable = true } },
            { id = "entity-parent", object_type = "entity", attr = "parent", data_type = "relation",
                config = { cardinality = "one", target = { kind = "record", object_type = "entity" } } },
            { id = "entity-peers", object_type = "entity", attr = "peers", data_type = "relation",
                config = { cardinality = "many", target = { kind = "record", object_type = "entity" } } },
        },
        pipelines = {}, views = {}, policies = {}, merge_config = {},
    })
    handle:release()
    test.is_nil(err)
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
    body.occurred_at = "2026-08-30T12:00:00Z"
    return { type = event_type, body = body }
end

local function created(record_id: string): Event
    return event(types.EVENTS.RECORD_CREATED, {
        object_type = "entity", record_id = record_id, values = { name = record_id },
    })
end

local function linked(source_id: string, attr: string, target_id: string): Event
    return event(types.EVENTS.RELATION_LINKED, {
        object_type = "entity", record_id = source_id, attr = attr,
        reference = { kind = "record", type = "entity", id = target_id },
    })
end

local function unlinked(source_id: string, attr: string, target_id: string): Event
    return event(types.EVENTS.RELATION_UNLINKED, {
        object_type = "entity", record_id = source_id, attr = attr,
        reference = { kind = "record", type = "entity", id = target_id },
    })
end

local function pending_count(crm_id: string): number
    local handle = db()
    local rows, err = handle:query(
        "SELECT COUNT(*) AS n FROM kickside_crm_pending_relation WHERE crm_id = $1", { crm_id })
    handle:release()
    if err then error(tostring(err), 0) end
    local list = type(rows) == "table" and rows :: { UnknownMap } or {}
    return tonumber(list[1] and list[1].n) or 0
end

local function field(crm_id: string, source_id: string, attr: string): unknown
    local handle = db()
    local result, err = storage.field(handle, crm_id, "entity", source_id, attr)
    handle:release()
    test.is_nil(err)
    return (result :: FieldResult).value
end

local function ref_ids(value: unknown): { string }
    local ids: { string } = {}
    for _, raw in ipairs(type(value) == "table" and value :: { unknown } or {}) do
        local ref = raw :: TypedRef
        ids[#ids + 1] = ref.id
    end
    return ids
end

local function define_tests()
    test.describe("CRM relation ordering deferral", function()
        test.it("parks a link whose target record does not exist yet and advances the fold", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { created("entity:a") }))
            -- entity:z is not materialized: the link parks, the fold does not fail.
            test.is_nil(project(crm_id, { linked("entity:a", "peers", "entity:z") }))
            test.eq(pending_count(crm_id), 1)
            test.eq(#ref_ids(field(crm_id, "entity:a", "peers")), 0)
        end)

        test.it("applies the parked link once the target record is materialized", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { created("entity:a") }))
            test.is_nil(project(crm_id, { linked("entity:a", "peers", "entity:z") }))
            test.eq(pending_count(crm_id), 1)
            test.is_nil(project(crm_id, { created("entity:z") }))
            test.eq(pending_count(crm_id), 0)
            local ids = ref_ids(field(crm_id, "entity:a", "peers"))
            test.eq(#ids, 1)
            test.eq(ids[1], "entity:z")
        end)

        test.it("parks and applies a one-valued link whose target arrives later", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { created("entity:a") }))
            test.is_nil(project(crm_id, { linked("entity:a", "parent", "entity:w") }))
            test.eq(pending_count(crm_id), 1)
            test.is_nil(project(crm_id, { created("entity:w") }))
            test.eq(pending_count(crm_id), 0)
            local parent = field(crm_id, "entity:a", "parent") :: TypedRef
            test.eq(parent.id, "entity:w")
        end)

        test.it("parks a link whose source record does not exist yet and applies it on materialization", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { created("entity:a") }))
            -- entity:ghost (the source) is absent; the target exists.
            test.is_nil(project(crm_id, { linked("entity:ghost", "peers", "entity:a") }))
            test.eq(pending_count(crm_id), 1)
            test.is_nil(project(crm_id, { created("entity:ghost") }))
            test.eq(pending_count(crm_id), 0)
            local ids = ref_ids(field(crm_id, "entity:ghost", "peers"))
            test.eq(#ids, 1)
            test.eq(ids[1], "entity:a")
        end)

        test.it("dedups a re-delivered defer and lands the edge exactly once", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { created("entity:a") }))
            test.is_nil(project(crm_id, { linked("entity:a", "peers", "entity:z") }))
            -- Replaying the same parked link upserts on its natural key: one row.
            test.is_nil(project(crm_id, { linked("entity:a", "peers", "entity:z") }))
            test.eq(pending_count(crm_id), 1)
            test.is_nil(project(crm_id, { created("entity:z") }))
            test.eq(pending_count(crm_id), 0)
            -- Replaying the materialization drains a clean table: the edge stays single.
            test.is_nil(project(crm_id, { created("entity:z") }))
            local ids = ref_ids(field(crm_id, "entity:a", "peers"))
            test.eq(#ids, 1)
            test.eq(ids[1], "entity:z")
            test.eq(pending_count(crm_id), 0)
        end)

        test.it("cancels a parked link with a later parked unlink drained in arrival order", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { created("entity:a") }))
            test.is_nil(project(crm_id, { linked("entity:a", "peers", "entity:z") }))
            test.is_nil(project(crm_id, { unlinked("entity:a", "peers", "entity:z") }))
            -- A link and an unlink of the same edge coexist as two parked rows.
            test.eq(pending_count(crm_id), 2)
            test.is_nil(project(crm_id, { created("entity:z") }))
            test.eq(pending_count(crm_id), 0)
            -- Drained in arrival order the unlink follows the link: no edge remains.
            test.eq(#ref_ids(field(crm_id, "entity:a", "peers")), 0)
        end)

        test.it("fails an unknown relation instead of deferring it", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { created("entity:a") }))
            local err = project(crm_id, { event(types.EVENTS.RELATION_LINKED, {
                object_type = "entity", record_id = "entity:a", attr = "nonexistent",
                reference = { kind = "record", type = "entity", id = "entity:z" },
            }) })
            test.is_true(tostring(err):find("unknown CRM relation", 1, true) ~= nil)
            test.eq(pending_count(crm_id), 0)
        end)

        test.it("fails a malformed reference instead of deferring it", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { created("entity:a") }))
            local err = project(crm_id, { event(types.EVENTS.RELATION_LINKED, {
                object_type = "entity", record_id = "entity:a", attr = "peers",
                reference = { kind = "record", type = "entity" },
            }) })
            test.not_nil(err)
            test.eq(pending_count(crm_id), 0)
        end)

        test.it("fails a target type mismatch on a record that exists instead of deferring it", function()
            local crm_id = tostring(uuid.v7())
            local handle, dialect = db()
            local _, schema_err = storage.ensure(handle, dialect, crm_id, {
                version = "pending-mismatch-v1",
                objects = {
                    { id = "company-object", type = "company", label = "Company" },
                    { id = "contact-object", type = "contact", label = "Contact" },
                },
                attributes = {
                    { id = "company-name", object_type = "company", attr = "name", data_type = "text", config = {} },
                    { id = "contact-name", object_type = "contact", attr = "name", data_type = "text", config = {} },
                    { id = "contact-company", object_type = "contact", attr = "company", data_type = "relation",
                        config = { cardinality = "one", target = { kind = "record", object_type = "company" } } },
                },
                pipelines = {}, views = {}, policies = {}, merge_config = {},
            })
            handle:release()
            test.is_nil(schema_err)
            test.is_nil(project(crm_id, {
                event(types.EVENTS.RECORD_CREATED, { object_type = "contact", record_id = "contact:primary", values = { name = "Primary" } }),
                event(types.EVENTS.RECORD_CREATED, { object_type = "contact", record_id = "contact:other", values = { name = "Other" } }),
            }))
            -- The target exists but is a contact, not the company the relation declares:
            -- a real error, so the fold fails rather than parking it.
            local err = project(crm_id, { event(types.EVENTS.RELATION_LINKED, {
                object_type = "contact", record_id = "contact:primary", attr = "company",
                reference = { kind = "record", type = "company", id = "contact:other" },
            }) })
            test.is_true(tostring(err):find("object type mismatch", 1, true) ~= nil)
            test.eq(pending_count(crm_id), 0)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
