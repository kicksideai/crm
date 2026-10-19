-- Registered CRM agent tools return their published shapes. Seed only through
-- the public create/schema/writer probes, catch the projection up, then call
-- each tool exactly as an agent does.
local actors = require("actors")
local funcs = require("funcs")
local json = require("json")
local security = require("security")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type Map = { [string]: unknown }
type Executor = { call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?) }

local CREATE = "app:create_probe"
local SCHEMA = "app:schema_probe"
local WRITER = "app:writer_probe"

local function map(value: unknown): Map return type(value) == "table" and value :: Map or {} end
local function list(value: unknown): { unknown } return type(value) == "table" and value :: { unknown } or {} end

local function scope(): security.Scope
    return assert(security.new_scope({ assert(security.policy("app:user")) })) :: security.Scope
end

local function call(execute: Executor, tool: string, input: Map): Map
    local raw, err = execute:call(tool, input)
    test.is_nil(err, tostring(err))
    test.eq(type(raw), "table")
    local answer = map(raw)
    test.eq(answer.success, true, tostring(answer.error))
    return answer
end

local function timeline_page(execute: Executor, input: Map): ({ string }, string?)
    local answer = call(execute, "kickside.crm.traits:get_timeline", input)
    local ids: { string } = {}
    for _, raw in ipairs(list(answer.entries)) do ids[#ids + 1] = tostring(map(raw).activity_id) end
    local cursor = answer.next_cursor
    if type(cursor) == "string" then return ids, cursor end
    return ids, nil
end

local function declaration(): Map
    return {
        version = "tool-shapes-v1",
        objects = { { id = "deal", type = "deal", label = "Deal", plural = "Deals" } },
        attributes = {
            { id = "deal-name", object_type = "deal", attr = "name", data_type = "text", config = {} },
            { id = "deal-notes", object_type = "deal", attr = "notes", data_type = "text",
              config = { description = string.rep("λ", 800) } },
        },
        pipelines = { { collection_id = "deals", object_type = "deal", label = "Deals", stages = {
            { stage_id = "new", label = "New" }, { stage_id = "won", label = "Won" },
        } } },
        views = {}, policies = {}, merge_config = {},
    }
end

local function fixture(): (Executor, string)
    local execute = funcs.new():with_actor(actors.make(uuid.v4())):with_scope(scope()) :: Executor
    local created, create_err = execute:call(CREATE, { title = "Tool shapes", idempotency_key = uuid.v4() })
    test.is_nil(create_err, tostring(create_err))
    local crm_id = tostring(map(created).component_id or "")
    test.is_true(crm_id ~= "")
    local _, schema_err = execute:call(SCHEMA, { crm_id = crm_id, operation = "apply", declaration = declaration() })
    test.is_nil(schema_err, tostring(schema_err))

    local long_text = "Résumé 漢字 😀 " .. string.rep("λ", 80)
    local commands: { unknown } = {}
    for index = 1, 3 do
        commands[#commands + 1] = { type = types.EVENTS.RECORD_CREATED, body = {
            record_id = "deal:" .. tostring(index), object_type = "deal",
            values = { name = "Deal " .. tostring(index), notes = long_text .. tostring(index) },
        } }
    end
    commands[#commands + 1] = { type = types.EVENTS.MEMBERSHIP_SET, body = {
        collection_id = "deals", record_id = "deal:1", stage_id = "new", position = 1,
    } }
    commands[#commands + 1] = { type = types.EVENTS.MEMBERSHIP_SET, body = {
        collection_id = "deals", record_id = "deal:2", stage_id = "new", position = 2,
    } }
    commands[#commands + 1] = { type = types.EVENTS.ACTIVITY_LOGGED, body = {
        activity_id = "activity:1", record_id = "deal:1", activity_type = "note", occurred_at = "2026-10-14T12:00:00Z",
        payload = { title = "Résumé", rows = { { label = "漢字", value = "😀" }, { label = "λ", value = "table" } } },
    } }
    commands[#commands + 1] = { type = types.EVENTS.ACTIVITY_LOGGED, body = {
        activity_id = "activity:2", record_id = "deal:1", activity_type = "note", occurred_at = "2026-10-14T11:00:00Z",
        payload = { title = "Second" },
    } }
    local written, write_err = execute:call(WRITER, { crm_id = crm_id, commands = commands })
    test.is_nil(write_err, tostring(write_err))
    test.eq(map(written).ok, true, tostring(map(written).error))
    local caught, catch_err = execute:call(WRITER, { crm_id = crm_id, catch_up = true })
    test.is_nil(catch_err, tostring(catch_err))
    test.eq(map(caught).ok, true, tostring(map(caught).error))
    return execute, crm_id
end

local function define_tests()
    test.describe("CRM agent tool shapes", function()
        test.it("returns tables whose nested fields are read directly", function()
            local execute, crm_id = fixture()
            local page = call(execute, "kickside.crm.traits:list_records", { crm_id = crm_id, object_type = "deal", limit = 2 })
            test.eq(page.total, 3)
            test.eq(page.limit, 2)
            test.eq(page.offset, 0)
            test.eq(type(map(map(list(page.rows)[1]).values).name), "string")
            local second = call(execute, "kickside.crm.traits:list_records", {
                crm_id = crm_id, object_type = "deal", limit = 2, offset = 2,
            })
            test.eq(#list(second.rows), 1)
        end)

        test.it("reads the caller's only CRM when crm_id is omitted", function()
            local execute = fixture()
            local answer = call(execute, "kickside.crm.traits:get_record", { record_id = "deal:1" })
            test.eq(map(map(answer.record).values).name, "Deal 1")
        end)

        test.it("returns summary rows by default, selected values on request, and complete record detail", function()
            local execute, crm_id = fixture()
            local listed = call(execute, "kickside.crm.traits:list_records", { crm_id = crm_id, object_type = "deal", limit = 2 })
            local rows = list(listed.rows)
            test.eq(#rows, 2)
            for _, raw in ipairs(rows) do
                local values = map(map(raw).values)
                test.eq(type(values.name), "string")
                test.is_nil(values.notes)
                test.is_nil(map(raw).associations)
            end
            local selected = call(execute, "kickside.crm.traits:list_records", {
                crm_id = crm_id, object_type = "deal", limit = 1, fields = { "notes" },
            })
            local values = map(map(list(selected.rows)[1]).values)
            test.eq(type(values.notes), "string")
            test.is_nil(values.name)
            local record = map(call(execute, "kickside.crm.traits:get_record", { crm_id = crm_id, record_id = "deal:1" }).record)
            test.eq(record.record_id, "deal:1")
            test.eq(map(record.values).name, "Deal 1")
            test.eq(map(record.values).notes, "Résumé 漢字 😀 " .. string.rep("λ", 80) .. "1")
        end)

        test.it("returns the stage-keyed board and pages the timeline newest first with next_cursor", function()
            local execute, crm_id = fixture()
            local board = map(call(execute, "kickside.crm.traits:get_board", { crm_id = crm_id, collection_id = "deals" }).board)
            local new_lane = map(board.new)
            test.eq(new_lane.total, 2)
            local members = {}
            for _, raw in ipairs(list(new_lane.records)) do members[#members + 1] = tostring(map(raw).record_id) end
            table.sort(members)
            test.eq(table.concat(members, ","), "deal:1,deal:2")
            test.eq(map(board.won).total, 0)

            local entries = list(call(execute, "kickside.crm.traits:get_timeline", {
                crm_id = crm_id, record_id = "deal:1", limit = 1,
            }).entries)
            test.eq(#entries, 1)
            test.eq(map(entries[1]).activity_id, "activity:1")
            test.is_nil(map(entries[1]).payload)
            test.eq(map(entries[1]).title, "Résumé")
            local full_entries = list(call(execute, "kickside.crm.traits:get_timeline", {
                crm_id = crm_id, record_id = "deal:1", limit = 1, fields = { "payload" },
            }).entries)
            test.eq(map(map(full_entries[1]).payload).title, "Résumé")

            local first_ids, first_cursor = timeline_page(execute, { crm_id = crm_id, record_id = "deal:1", limit = 1 })
            test.eq(table.concat(first_ids, ","), "activity:1")
            test.eq(type(first_cursor), "string")
            local second_ids, second_cursor = timeline_page(execute, {
                crm_id = crm_id, record_id = "deal:1", limit = 1, cursor = first_cursor,
            })
            test.eq(table.concat(second_ids, ","), "activity:2")
            test.is_nil(second_cursor)

            local whole_ids, whole_cursor = timeline_page(execute, { crm_id = crm_id, limit = 1 })
            test.eq(table.concat(whole_ids, ","), "activity:1")
            local rest_ids, rest_cursor = timeline_page(execute, { crm_id = crm_id, limit = 1, cursor = whole_cursor })
            test.eq(table.concat(rest_ids, ","), "activity:2")
            test.is_nil(rest_cursor)

            local rejected, rejected_err = execute:call("kickside.crm.traits:get_timeline", { crm_id = crm_id, cursor = "not-a-cursor" })
            test.is_nil(rejected)
            test.is_true(errors.is(rejected_err, errors.INVALID), tostring(rejected_err))

        end)

        test.it("fails with the typed error of a refused write instead of a success-shaped envelope", function()
            local execute, crm_id = fixture()
            local created, create_err = execute:call("kickside.crm.traits:create_record", {
                crm_id = crm_id, object_type = "planet", values = { name = "Mars" },
            })
            test.is_nil(created)
            test.is_true(errors.is(create_err, errors.INVALID), tostring(create_err))
            test.contains(tostring(create_err), "unknown CRM object type: planet")

            local updated, update_err = execute:call("kickside.crm.traits:update_record", {
                crm_id = crm_id, object_type = "deal", record_id = "deal:absent", set = { name = "Ghost" },
            })
            test.is_nil(updated)
            test.is_true(errors.is(update_err, errors.INVALID), tostring(update_err))
            test.contains(tostring(update_err), "record not found")
        end)

        test.it("fails schema.apply against a stale revision with a typed conflict", function()
            local execute, crm_id = fixture()
            local artifact = map(call(execute, "kickside.crm.traits:schema.get", { crm_id = crm_id }).schema)
            local stale, stale_err = execute:call("kickside.crm.traits:schema.apply", {
                crm_id = crm_id, artifact = artifact, expected_revision = "stale-revision",
            })
            test.is_nil(stale)
            test.is_true(errors.is(stale_err, errors.CONFLICT), tostring(stale_err))
            test.eq(tostring(stale_err), "CRM schema revision conflict")
        end)

        test.it("exports the complete CRMConfig artifact that schema.apply accepts back", function()
            local execute, crm_id = fixture()
            local artifact = map(call(execute, "kickside.crm.traits:schema.get", { crm_id = crm_id }).schema)
            test.eq(artifact.kind, "CRMConfig")
            local spec = map(artifact.spec)
            local attributes = {}
            for _, raw in ipairs(list(spec.attributes)) do attributes[tostring(map(raw).attr)] = map(raw) end
            test.not_nil(attributes.name)
            test.eq(map(attributes.notes.config).description, string.rep("λ", 800))
            test.eq(#list(spec.pipelines), 1)

            local applied = call(execute, "kickside.crm.traits:schema.apply", {
                crm_id = crm_id, artifact = artifact, expected_revision = map(artifact.metadata).revision,
            })
            test.not_nil(applied.revision)
            local again = map(call(execute, "kickside.crm.traits:schema.get", { crm_id = crm_id }).schema)
            test.eq((json.encode(again.spec)), (json.encode(spec)))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
