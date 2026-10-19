-- Relation fields carried as record values. record.created values and
-- record.updated set/unset may name declared relation fields; the projection
-- materializes them through the same deferral-aware edge path as relation.linked,
-- so a record and its links land in one event and a required relation can be
-- satisfied at creation.
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

local function apply(crm_id: string)
    local handle, dialect = db()
    local _, err = storage.ensure(handle, dialect, crm_id, {
        version = "relation-values-v1",
        objects = {
            { id = "company-object", type = "company", label = "Company", plural = "Companies" },
            { id = "person-object", type = "person", label = "Person", plural = "People" },
        },
        attributes = {
            { id = "company-name", object_type = "company", attr = "name", data_type = "text", config = {} },
            { id = "person-name", object_type = "person", attr = "name", data_type = "text", config = {} },
            { id = "person-company", object_type = "person", attr = "company", data_type = "relation",
                config = { cardinality = "one", target = { kind = "record", object_type = "company" } } },
            { id = "person-peers", object_type = "person", attr = "peers", data_type = "relation",
                config = { cardinality = "many", target = { kind = "record", object_type = "person" } } },
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
    body.occurred_at = "2026-10-19T12:00:00Z"
    return { type = event_type, body = body }
end

local function company(record_id: string): Event
    return event(types.EVENTS.RECORD_CREATED, {
        object_type = "company", record_id = record_id, values = { name = record_id },
    })
end

local function ref(object_type: string, id: string): TypedRef
    return { kind = "record", type = object_type, id = id }
end

local function person(record_id: string, values: UnknownMap): Event
    values.name = record_id
    return event(types.EVENTS.RECORD_CREATED, { object_type = "person", record_id = record_id, values = values })
end

local function updated(record_id: string, set: UnknownMap, unset: { string }?): Event
    return event(types.EVENTS.RECORD_UPDATED, {
        object_type = "person", record_id = record_id, set = set, unset = unset or {},
    })
end

local function field(crm_id: string, record_id: string, attr: string): unknown
    local handle = db()
    local result, err = storage.field(handle, crm_id, "person", record_id, attr)
    handle:release()
    test.is_nil(err)
    return (result :: FieldResult).value
end

local function ref_ids(value: unknown): { string }
    local ids: { string } = {}
    for _, raw in ipairs(type(value) == "table" and value :: { unknown } or {}) do
        ids[#ids + 1] = (raw :: TypedRef).id
    end
    return ids
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

local function define_tests()
    test.describe("CRM relation fields in record values", function()
        test.it("links a one-valued relation named in record.created values", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, {
                company("company:acme"),
                person("person:ada", { company = ref("company", "company:acme") }),
            }))
            local linked = field(crm_id, "person:ada", "company") :: TypedRef
            test.eq(linked.id, "company:acme")
            test.eq(linked.type, "company")
        end)

        test.it("links a many-valued relation named in record.created values in order", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, {
                person("person:b", {}),
                person("person:c", {}),
                person("person:a", { peers = { ref("person", "person:c"), ref("person", "person:b") } }),
            }))
            local ids = ref_ids(field(crm_id, "person:a", "peers"))
            test.eq(#ids, 2)
            test.eq(ids[1], "person:c")
            test.eq(ids[2], "person:b")
        end)

        test.it("parks a created relation whose target arrives later and drains it on materialization", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { person("person:ada", { company = ref("company", "company:later") }) }))
            test.is_nil(field(crm_id, "person:ada", "company"))
            test.eq(pending_count(crm_id), 1)
            test.is_nil(project(crm_id, { company("company:later") }))
            test.eq((field(crm_id, "person:ada", "company") :: TypedRef).id, "company:later")
            test.eq(pending_count(crm_id), 0)
        end)

        test.it("replaces a relation named in record.updated set", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, {
                person("person:b", {}),
                person("person:c", {}),
                person("person:d", {}),
                person("person:a", { peers = { ref("person", "person:b"), ref("person", "person:c") } }),
            }))
            test.is_nil(project(crm_id, { updated("person:a", { peers = { ref("person", "person:d") } }) }))
            local ids = ref_ids(field(crm_id, "person:a", "peers"))
            test.eq(#ids, 1)
            test.eq(ids[1], "person:d")
        end)

        test.it("clears a relation named in record.updated unset", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, {
                company("company:acme"),
                person("person:ada", { company = ref("company", "company:acme") }),
            }))
            test.is_nil(project(crm_id, { updated("person:ada", {}, { "company" }) }))
            test.is_nil(field(crm_id, "person:ada", "company"))
        end)

        test.it("keeps scalar values when a relation is set in the same update", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { company("company:acme"), person("person:ada", {}) }))
            test.is_nil(project(crm_id, {
                updated("person:ada", { name = "Ada Lovelace", company = ref("company", "company:acme") }),
            }))
            local handle = db()
            local name, err = storage.field(handle, crm_id, "person", "person:ada", "name")
            handle:release()
            test.is_nil(err)
            test.eq((name :: FieldResult).value, "Ada Lovelace")
            test.eq((field(crm_id, "person:ada", "company") :: TypedRef).id, "company:acme")
        end)

        test.it("fails an undeclared value field", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            local err = project(crm_id, { person("person:ada", { planet = "Mars" }) })
            test.not_nil(err)
            test.contains(tostring(err), "planet")
        end)

        test.it("fails a relation value whose target exists with another object type", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            test.is_nil(project(crm_id, { person("person:b", {}) }))
            local err = project(crm_id, { person("person:a", { company = ref("company", "person:b") }) })
            test.contains(tostring(err), "object type mismatch")
            test.eq(pending_count(crm_id), 0)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
