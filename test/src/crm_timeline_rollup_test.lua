-- A record's chronology covers the records it is connected to. A call is logged
-- against the person who took it or the deal it belongs to; the company is where
-- that history is read, and it holds no activity row of its own. One relation hop
-- in either direction is what the record page answers with.
local materializer = require("materializer")
local read_model = require("read_model")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type UnknownMap = { [string]: unknown }
type Event = { type: string, body: UnknownMap }

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

-- Company, person and deal, connected the way a seller's CRM connects them: the
-- person and the deal each name their company, and the deal names its people.
local function apply(crm_id: string)
    local handle, dialect = db()
    local _, err = storage.ensure(handle, dialect, crm_id, {
        version = "timeline-rollup-v1",
        objects = {
            { id = "company", type = "company", label = "Company", plural = "Companies" },
            { id = "person", type = "person", label = "Person", plural = "People" },
            { id = "deal", type = "deal", label = "Deal", plural = "Deals" },
        },
        attributes = {
            { id = "company-name", object_type = "company", attr = "name", data_type = "text", config = {} },
            { id = "person-name", object_type = "person", attr = "name", data_type = "text", config = {} },
            { id = "deal-name", object_type = "deal", attr = "name", data_type = "text", config = {} },
            { id = "person-company", object_type = "person", attr = "company", data_type = "relation",
                config = { cardinality = "one", target = { kind = "record", object_type = "company" } } },
            { id = "deal-company", object_type = "deal", attr = "company", data_type = "relation",
                config = { cardinality = "one", target = { kind = "record", object_type = "company" } } },
            { id = "deal-contacts", object_type = "deal", attr = "contacts", data_type = "relation",
                config = { cardinality = "many", target = { kind = "record", object_type = "person" } } },
        },
        pipelines = {}, views = {}, policies = {}, merge_config = {},
    })
    handle:release()
    test.is_nil(err)
end

local function seed(crm_id: string, record_id: string, object_type: string)
    local handle = db()
    local _, err = storage.upsert(handle, crm_id, object_type,
        { record_id = record_id, values = { name = record_id } })
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
    body.occurred_at = "2026-08-18T12:00:00Z"
    return { type = event_type, body = body }
end

local function activity(body: UnknownMap): Event
    return event(types.EVENTS.ACTIVITY_LOGGED, body)
end

local function link(record_id: string, object_type: string, attr: string, target_type: string, target_id: string): Event
    return event(types.EVENTS.RELATION_LINKED, {
        record_id = record_id, object_type = object_type, attr = attr,
        reference = { kind = "record", type = target_type, id = target_id },
    })
end

local function timeline(crm_id: string, record_id: string): { UnknownMap }
    local rows, err = read_model.internal_timeline(crm_id, record_id)
    test.is_nil(err)
    return type(rows) == "table" and rows :: { UnknownMap } or {}
end

-- The chronology's contents as one comparable line, ordered so the assertion
-- states what is present rather than what order the rows arrived in.
local function ids(rows: { UnknownMap }): string
    local out: { string } = {}
    for _, row in ipairs(rows) do out[#out + 1] = tostring(row.activity_id) end
    table.sort(out)
    return table.concat(out, ",")
end

local function define_tests()
    test.describe("CRM timeline relation roll-up", function()
        test.it("reads a person's call on the company that person belongs to", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "company:acme", "company")
            seed(crm_id, "person:ada", "person")

            test.is_nil(project(crm_id, {
                link("person:ada", "person", "company", "company", "company:acme"),
                activity({
                    activity_id = "call:ada", record_id = "person:ada", activity_type = "call",
                    source = "hubspot", external_id = "hubspot:call:ada",
                }),
            }))

            test.eq(ids(timeline(crm_id, "company:acme")), "call:ada")
            test.eq(ids(timeline(crm_id, "person:ada")), "call:ada")
        end)

        test.it("reads a deal's meeting on the company and on the deal's people", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "company:acme", "company")
            seed(crm_id, "person:ada", "person")
            seed(crm_id, "deal:renewal", "deal")

            test.is_nil(project(crm_id, {
                link("deal:renewal", "deal", "company", "company", "company:acme"),
                link("deal:renewal", "deal", "contacts", "person", "person:ada"),
                activity({
                    activity_id = "meeting:renewal", record_id = "deal:renewal", activity_type = "meeting",
                    source = "fireflies", external_id = "fireflies:renewal",
                }),
            }))

            test.eq(ids(timeline(crm_id, "company:acme")), "meeting:renewal")
            test.eq(ids(timeline(crm_id, "person:ada")), "meeting:renewal")
            test.eq(ids(timeline(crm_id, "deal:renewal")), "meeting:renewal")
        end)

        test.it("gathers every connected record's history once, in one chronology", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "company:acme", "company")
            seed(crm_id, "person:ada", "person")
            seed(crm_id, "deal:renewal", "deal")

            test.is_nil(project(crm_id, {
                link("person:ada", "person", "company", "company", "company:acme"),
                link("deal:renewal", "deal", "company", "company", "company:acme"),
                link("deal:renewal", "deal", "contacts", "person", "person:ada"),
                activity({ activity_id = "call:ada", record_id = "person:ada", activity_type = "call",
                    source = "hubspot", external_id = "hubspot:call:ada" }),
                activity({ activity_id = "meeting:renewal", record_id = "deal:renewal", activity_type = "meeting",
                    source = "fireflies", external_id = "fireflies:renewal" }),
                activity({ activity_id = "note:acme", record_id = "company:acme", activity_type = "note",
                    source = "hubspot", external_id = "hubspot:note:acme" }),
            }))

            -- The deal reaches the person both directly and through the company; the
            -- chronology still lists each activity once.
            test.eq(ids(timeline(crm_id, "company:acme")), "call:ada,meeting:renewal,note:acme")
        end)

        test.it("stops at one hop: an unconnected company keeps its own chronology", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "company:acme", "company")
            seed(crm_id, "company:other", "company")
            seed(crm_id, "person:ada", "person")

            test.is_nil(project(crm_id, {
                link("person:ada", "person", "company", "company", "company:acme"),
                activity({ activity_id = "call:ada", record_id = "person:ada", activity_type = "call",
                    source = "hubspot", external_id = "hubspot:call:ada" }),
            }))

            test.eq(#timeline(crm_id, "company:other"), 0)
        end)

        test.it("drops a rolled-up activity when the relation that carried it is unlinked", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "company:acme", "company")
            seed(crm_id, "person:ada", "person")

            test.is_nil(project(crm_id, {
                link("person:ada", "person", "company", "company", "company:acme"),
                activity({ activity_id = "call:ada", record_id = "person:ada", activity_type = "call",
                    source = "hubspot", external_id = "hubspot:call:ada" }),
            }))
            test.eq(#timeline(crm_id, "company:acme"), 1)

            test.is_nil(project(crm_id, {
                event(types.EVENTS.RELATION_UNLINKED, {
                    record_id = "person:ada", object_type = "person", attr = "company",
                    reference = { kind = "record", type = "company", id = "company:acme" },
                }),
            }))
            test.eq(#timeline(crm_id, "company:acme"), 0)
            test.eq(#timeline(crm_id, "person:ada"), 1)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
