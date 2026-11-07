-- SPDX-License-Identifier: MIT
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local f = require("fixture")

type Map = { [string]: unknown }

local map, list = f.map, f.list
local error_text, request, call_sink, query = f.error_text, f.request, f.call_sink, f.query

-- A person schema with an email identity key and a company relation: the shape a
-- CRM synced from a source that merges its contacts holds.
local PEOPLE_SCHEMA: Map = {
    version = "sink-merge-test-v1",
    objects = {
        { id = "person", type = "person", label = "Person", plural = "People" },
        { id = "company", type = "company", label = "Company", plural = "Companies" },
    },
    attributes = {
        { id = "person_name", object_type = "person", attr = "name", data_type = "text", config = { required = true } },
        { id = "person_email", object_type = "person", attr = "email", data_type = "text", config = { alias = "email" } },
        { id = "person_title", object_type = "person", attr = "title", data_type = "text", config = {} },
        { id = "person_company", object_type = "person", attr = "company", data_type = "relation",
            config = { cardinality = "one", target = { kind = "record", object_type = "company" } } },
        { id = "company_name", object_type = "company", attr = "name", data_type = "text", config = { required = true } },
    },
}

-- The people schema with the email field configured as each case needs it.
local function people_schema(email_config: Map): Map
    local schema: Map = {
        version = PEOPLE_SCHEMA.version, objects = PEOPLE_SCHEMA.objects, attributes = {},
    }
    local attributes = schema.attributes :: { Map }
    for _, raw in ipairs(PEOPLE_SCHEMA.attributes :: { Map }) do
        local attribute: Map = {}
        for key, value in pairs(raw) do attribute[key] = value end
        if attribute.attr == "email" and attribute.object_type == "person" then attribute.config = email_config end
        attributes[#attributes + 1] = attribute
    end
    return schema
end

local function emails_owned(crm_id: string): { string }
    local rows = query("SELECT record_id FROM kickside_crm_alias WHERE crm_id = $1 AND object_scope = 'person' AND alias_type = 'email'"
        .. " ORDER BY record_id", { crm_id })
    local owners: { string } = {}
    for _, row in ipairs(rows) do owners[#owners + 1] = tostring(row.record_id) end
    return owners
end

local function person(record_id: string, values: Map, merged: { string }?): Map
    return { kind = "record", object_type = "person", record_id = record_id, values = values, merged_record_ids = merged }
end

local function stored(crm_id: string, object_type: string, record_id: string): Map?
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local row, err = storage.get(db, crm_id, object_type, record_id)
    db:release()
    test.is_nil(err)
    if row == nil then return nil end
    return map(map(row).values)
end

local function relation_table(crm_id: string): string
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local relation, err = storage.reference(db, crm_id, "person", "company")
    db:release()
    test.is_nil(err)
    return tostring(map(relation).relation_table)
end

local function alias_owner(crm_id: string): string
    local rows = query("SELECT record_id FROM kickside_crm_alias WHERE crm_id = $1 AND object_scope = 'person' AND alias_type = 'email'",
        { crm_id })
    test.eq(#rows, 1)
    return tostring(rows[1].record_id)
end

-- Two people a source later merges: the first holds the survivor's email, a
-- company link and an activity; the second holds a title the survivor lacks.
local function seed_predecessors(crm_id: string, execute: f.Executor)
    local company = call_sink(execute, request(crm_id, "company:1", {
        kind = "record", object_type = "company", record_id = "company:1", values = { name = "Acme" },
    }))
    test.eq(company.success, true, error_text(company))
    local first = call_sink(execute, request(crm_id, "person:1", person("person:1", { name = "Pat", email = "pat@example.com" })))
    test.eq(first.success, true, error_text(first))
    local second = call_sink(execute, request(crm_id, "person:2", person("person:2", { name = "Pat L", title = "CTO" })))
    test.eq(second.success, true, error_text(second))
    local linked = call_sink(execute, request(crm_id, "person:1:company", {
        kind = "relation", object_type = "person", record_id = "person:1", attr = "company",
        reference = { kind = "record", type = "company", id = "company:1" },
    }))
    test.eq(linked.success, true, error_text(linked))
    local logged = call_sink(execute, request(crm_id, "meeting:1", {
        kind = "activity", activity_id = "meeting:1", record_id = "person:1", activity_type = "meeting",
        occurred_at = "2026-08-24T10:00:00Z", source = "fixture",
    }))
    test.eq(logged.success, true, error_text(logged))
end

local function define()
    test.describe("CRM writable sink merged records", function()
        test.it("merges the records a survivor absorbed into it and keeps their history", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            seed_predecessors(crm_id, execute)

            local survivor = call_sink(execute, request(crm_id, "person:3",
                person("person:3", { name = "Pat Lee", email = "pat@example.com" }, { "person:1", "person:2" })))
            test.eq(survivor.success, true, error_text(survivor))
            test.eq(survivor.dest_ref.record_id, "person:3")

            local values = assert(stored(crm_id, "person", "person:3"))
            test.eq(values.name, "Pat Lee")
            test.eq(values.email, "pat@example.com")
            test.eq(values.title, "CTO")
            test.is_nil(stored(crm_id, "person", "person:1"))
            test.is_nil(stored(crm_id, "person", "person:2"))
            test.eq(alias_owner(crm_id), "person:3")

            local relations = query("SELECT source_id, target_id FROM " .. relation_table(crm_id)
                .. " WHERE crm_id = $1", { crm_id })
            test.eq(#relations, 1)
            test.eq(relations[1].source_id, "person:3")
            test.eq(relations[1].target_id, "company:1")
            local activities = query("SELECT record_id FROM kickside_crm_activity WHERE crm_id = $1 AND activity_id = $2",
                { crm_id, "meeting:1" })
            test.eq(#activities, 1)
            test.eq(activities[1].record_id, "person:3")

            local resolutions = query([[SELECT winner_id, loser_id, decision FROM kickside_crm_merge_resolution
                WHERE crm_id = $1 ORDER BY loser_id]], { crm_id })
            test.eq(#resolutions, 2)
            test.eq(resolutions[1].winner_id, "person:3")
            test.eq(resolutions[1].loser_id, "person:1")
            test.eq(resolutions[1].decision, "merged")
            test.eq(resolutions[2].loser_id, "person:2")
        end)

        test.it("releases the writes that waited on the survivor", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            seed_predecessors(crm_id, execute)
            local association = request(crm_id, "person:3:company", {
                kind = "relation", object_type = "person", record_id = "person:3", attr = "company",
                reference = { kind = "record", type = "company", id = "company:1" },
            })
            local blocked = call_sink(execute, association)
            test.eq(blocked.success, false)
            test.eq(blocked.error.code, "dependency_missing")

            local survivor = call_sink(execute, request(crm_id, "person:3",
                person("person:3", { name = "Pat Lee", email = "pat@example.com" }, { "person:1" })))
            test.eq(survivor.success, true, error_text(survivor))
            test.eq(list(survivor.dependencies_available)[1], blocked.error.dependency_key)

            local redelivered = call_sink(execute, association)
            test.eq(redelivered.success, true, error_text(redelivered))
        end)

        test.it("answers a redelivered survivor from its receipt", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            seed_predecessors(crm_id, execute)
            local delivery = request(crm_id, "person:3",
                person("person:3", { name = "Pat Lee", email = "pat@example.com" }, { "person:1", "person:2" }))
            local first = call_sink(execute, delivery)
            test.eq(first.success, true, error_text(first))
            local events = f.event_count(crm_id)
            local replayed = call_sink(execute, delivery)
            test.eq(replayed.success, true, error_text(replayed))
            test.eq(replayed.result, first.result)
            test.eq(f.event_count(crm_id), events)
        end)

        test.it("writes a record whose absorbed records are absent exactly like a plain one", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            local plain = call_sink(execute, request(crm_id, "person:7", person("person:7", { name = "Sam", email = "pat@example.com" })))
            test.eq(plain.success, true, error_text(plain))
            test.eq(plain.result, "created")
            test.eq(f.event_count(crm_id), 1)

            local absent = call_sink(execute, request(crm_id, "person:8",
                person("person:8", { name = "Kim" }, { "person:98", "person:99" })))
            test.eq(absent.success, true, error_text(absent))
            test.eq(absent.result, "created")
            test.eq(f.event_count(crm_id), 2)
            test.eq(#query("SELECT 1 FROM kickside_crm_merge_resolution WHERE crm_id = $1", { crm_id }), 0)
        end)

        test.it("refuses an absorbed record of another object type", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            seed_predecessors(crm_id, execute)
            local events = f.event_count(crm_id)
            local refused = call_sink(execute, request(crm_id, "person:3",
                person("person:3", { name = "Pat Lee" }, { "company:1" })))
            test.eq(refused.success, false)
            test.eq(refused.error.code, "invalid_request")
            test.eq(f.event_count(crm_id), events)
        end)

        for _, case in ipairs({
            { name = "a unique email", config = { alias = "email", unique = true } },
            { name = "a required email", config = { alias = "email", required = true } },
        }) do
            test.it("takes over " .. case.name .. " a predecessor holds", function()
                local crm_id, execute = f.crm(people_schema(case.config :: Map))
                local first = call_sink(execute, request(crm_id, "person:1",
                    person("person:1", { name = "Pat", email = "pat@example.com" })))
                test.eq(first.success, true, error_text(first))
                local survivor = call_sink(execute, request(crm_id, "person:3",
                    person("person:3", { name = "Pat Lee", email = "pat@example.com" }, { "person:1" })))
                test.eq(survivor.success, true, error_text(survivor))
                test.eq(map(stored(crm_id, "person", "person:3")).email, "pat@example.com")
                test.is_nil(stored(crm_id, "person", "person:1"))
                test.eq(table.concat(emails_owned(crm_id), ","), "person:3")
            end)
        end

        test.it("answers a delivery whose effect is durable but whose receipt is missing without merging again", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            seed_predecessors(crm_id, execute)
            local delivery = request(crm_id, "person:3",
                person("person:3", { name = "Pat Lee", email = "pat@example.com" }, { "person:1", "person:2" }))
            local first = call_sink(execute, delivery)
            test.eq(first.success, true, error_text(first))
            local events = f.event_count(crm_id)
            f.exec("DELETE FROM kickside_crm_sink_receipt WHERE crm_id = $1 AND idempotency_key = $2", { crm_id, "person:3" })

            local retried = call_sink(execute, delivery)
            test.eq(retried.success, true, error_text(retried))
            test.eq(retried.result, first.result)
            test.eq(f.event_count(crm_id), events)
            test.eq(#query("SELECT 1 FROM kickside_crm_merge_resolution WHERE crm_id = $1", { crm_id }), 2)
        end)

        test.it("refuses a changed replay of a delivery before merging anything", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            seed_predecessors(crm_id, execute)
            local first = call_sink(execute, request(crm_id, "person:3",
                person("person:3", { name = "Pat Lee", email = "pat@example.com" }, { "person:1" })))
            test.eq(first.success, true, error_text(first))
            f.exec("DELETE FROM kickside_crm_sink_receipt WHERE crm_id = $1 AND idempotency_key = $2", { crm_id, "person:3" })
            local events = f.event_count(crm_id)

            local changed = call_sink(execute, request(crm_id, "person:3",
                person("person:3", { name = "Pat Lee", email = "pat@example.com" }, { "person:1", "person:2" })))
            test.eq(changed.success, false)
            test.eq(changed.error.code, "idempotency_conflict")
            test.eq(f.event_count(crm_id), events)
            test.not_nil(stored(crm_id, "person", "person:2"))
        end)

        test.it("leaves every predecessor in place when a merged-away identity belongs to another record", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            seed_predecessors(crm_id, execute)
            local elsewhere = call_sink(execute, request(crm_id, "person:9",
                person("person:9", { name = "Pat Elsewhere" }, { "person:1" })))
            test.eq(elsewhere.success, true, error_text(elsewhere))
            local events = f.event_count(crm_id)

            local survivor = call_sink(execute, request(crm_id, "person:3",
                person("person:3", { name = "Pat Lee", email = "pat@example.com" }, { "person:1", "person:2" })))
            test.eq(survivor.success, false)
            test.eq(survivor.error.code, "invalid_request")
            test.eq(f.event_count(crm_id), events)
            test.not_nil(stored(crm_id, "person", "person:2"))
            test.is_nil(stored(crm_id, "person", "person:3"))
            test.eq(table.concat(emails_owned(crm_id), ","), "person:9")
        end)

        for _, order in ipairs({ { "person:a", "person:b" }, { "person:b", "person:a" } }) do
            test.it("keeps the email of every predecessor when absorbing " .. table.concat(order, " then "), function()
                local crm_id, execute = f.crm(PEOPLE_SCHEMA)
                for id, email in pairs({ ["person:a"] = "a@example.com", ["person:b"] = "b@example.com" }) do
                    local seeded = call_sink(execute, request(crm_id, id, person(id, { name = id, email = email })))
                    test.eq(seeded.success, true, error_text(seeded))
                end
                local survivor = call_sink(execute, request(crm_id, "person:3",
                    person("person:3", { name = "Pat", email = "b@example.com" }, order)))
                test.eq(survivor.success, true, error_text(survivor))
                test.eq(map(stored(crm_id, "person", "person:3")).email, "b@example.com")
                test.eq(table.concat(emails_owned(crm_id), ","), "person:3,person:3")
            end)
        end

        test.it("keeps the merges of record ids that share a separator apart", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            for _, id in ipairs({ "n:o", "o" }) do
                local seeded = call_sink(execute, request(crm_id, id, person(id, { name = id })))
                test.eq(seeded.success, true, error_text(seeded))
            end
            local first = call_sink(execute, request(crm_id, "m", person("m", { name = "M" }, { "n:o" })))
            test.eq(first.success, true, error_text(first))
            local second = call_sink(execute, request(crm_id, "m:n", person("m:n", { name = "MN" }, { "o" })))
            test.eq(second.success, true, error_text(second))
            local resolutions = query("SELECT winner_id, loser_id FROM kickside_crm_merge_resolution WHERE crm_id = $1 ORDER BY winner_id",
                { crm_id })
            test.eq(#resolutions, 2)
            test.eq(resolutions[1].winner_id, "m")
            test.eq(resolutions[1].loser_id, "n:o")
            test.eq(resolutions[2].winner_id, "m:n")
            test.eq(resolutions[2].loser_id, "o")
        end)

        test.it("merges a predecessor recreated after an earlier merge into the same survivor again", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            for round = 1, 2 do
                local seeded = call_sink(execute, request(crm_id, "person:1:" .. round, person("person:1", { name = "Pat" })))
                test.eq(seeded.success, true, error_text(seeded))
                local survivor = call_sink(execute, request(crm_id, "person:3:" .. round,
                    person("person:3", { name = "Pat Lee" }, { "person:1" })))
                test.eq(survivor.success, true, error_text(survivor))
                test.is_nil(stored(crm_id, "person", "person:1"))
            end
            test.eq(#query("SELECT 1 FROM kickside_crm_merge_resolution WHERE crm_id = $1 AND loser_id = $2",
                { crm_id, "person:1" }), 2)
        end)

        test.it("keeps a predecessor's email after the survivor's email changes", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            local first = call_sink(execute, request(crm_id, "person:1",
                person("person:1", { name = "Pat", email = "a@example.com" })))
            test.eq(first.success, true, error_text(first))
            local survivor = call_sink(execute, request(crm_id, "person:3:v1",
                person("person:3", { name = "Pat", email = "a@example.com" }, { "person:1" })))
            test.eq(survivor.success, true, error_text(survivor))
            local changed = call_sink(execute, request(crm_id, "person:3:v2",
                person("person:3", { name = "Pat", email = "b@example.com" })))
            test.eq(changed.success, true, error_text(changed))
            test.eq(map(stored(crm_id, "person", "person:3")).email, "b@example.com")
            test.eq(table.concat(emails_owned(crm_id), ","), "person:3,person:3")
            local reservations = query("SELECT record_id FROM kickside_crm_alias_reservation WHERE crm_id = $1 AND object_scope = 'person'",
                { crm_id })
            test.eq(#reservations, 2)
        end)

        test.it("accepts merged_record_ids only as a string array on a record upsert", function()
            local crm_id, execute = f.crm(PEOPLE_SCHEMA)
            local scalar = call_sink(execute, request(crm_id, "person:4", {
                kind = "record", object_type = "person", record_id = "person:4", values = { name = "A" },
                merged_record_ids = "person:1",
            }))
            test.eq(scalar.success, false)
            test.eq(scalar.error.code, "invalid_request")
            local update = call_sink(execute, request(crm_id, "person:4:update", {
                kind = "record", object_type = "person", record_id = "person:4", set = { name = "A" },
                merged_record_ids = { "person:1" },
            }, "update"))
            test.eq(update.success, false)
            test.eq(update.error.code, "invalid_request")
            test.eq(f.event_count(crm_id), 0)
        end)
    end)
end

return { run = test.run_cases(define) }
