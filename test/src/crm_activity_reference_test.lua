-- Projection contract for the extended activity row and the generalized reference
-- edge: source convergence with no duplicate rows, natural-key reference upsert,
-- soft-delete unlink, and the read-model exposure of a record's references.
local json = require("json")
local materializer = require("materializer")
local read_model = require("read_model")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type UnknownMap = { [string]: unknown }
type Event = { type: string, body: UnknownMap }
type ActivityRow = {
    activity_id: unknown,
    record_id: unknown,
    activity_type: unknown,
    payload: unknown,
    external_id: unknown,
    correlation_key: unknown,
    direction: unknown,
    duration_sec: unknown,
    outcome: unknown,
    recording_url: unknown,
    has_transcript: unknown,
    source: unknown,
}
type AliasRow = {
    alias: unknown,
    activity_id: unknown,
}
type RefRow = {
    ref_id: unknown,
    from_ref: unknown,
    edge_type: unknown,
    to_ref: unknown,
    attrs: unknown,
    active: unknown,
    source: unknown,
}

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

-- The deal object owns the schema's only pipeline: pipeline ownership is what
-- makes an object type the timeline anchor, so every anchor-upgrade case in
-- this suite is exercising that declaration, not a vocabulary constant.
local function apply(crm_id: string)
    local handle, dialect = db()
    local _, err = storage.ensure(handle, dialect, crm_id, {
        version = "activity-ref-v1",
        objects = {
            { id = "deal", type = "deal", label = "Deal", plural = "Deals" },
            { id = "contact", type = "contact", label = "Contact", plural = "Contacts" },
        },
        attributes = {
            { id = "deal-name", object_type = "deal", attr = "name", data_type = "text", config = {} },
            { id = "contact-name", object_type = "contact", attr = "name", data_type = "text", config = {} },
        },
        pipelines = { { collection_id = "deal_pipeline", object_type = "deal", label = "Deals", stages = {} } },
        views = {}, policies = {}, merge_config = {},
    })
    handle:release()
    test.is_nil(err)
end

local function seed(crm_id: string, record_id: string, object_type: string?)
    local handle = db()
    local _, err = storage.upsert(handle, crm_id, object_type or "deal",
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
    body.occurred_at = "2026-08-12T12:00:00Z"
    return { type = event_type, body = body }
end

local function activity_rows(crm_id: string): { ActivityRow }
    local handle = db()
    local rows, err = handle:query([[
        SELECT activity_id, record_id, activity_type, payload, external_id, correlation_key,
               direction, duration_sec, outcome, recording_url, has_transcript, source
        FROM kickside_crm_activity WHERE crm_id = $1 ORDER BY activity_id
    ]], { crm_id })
    handle:release()
    test.is_nil(err)
    return type(rows) == "table" and rows :: { ActivityRow } or {}
end

local function alias_rows(crm_id: string): { AliasRow }
    local handle = db()
    local rows, err = handle:query(
        "SELECT alias, activity_id FROM kickside_crm_activity_alias WHERE crm_id = $1 ORDER BY alias", { crm_id })
    handle:release()
    test.is_nil(err)
    return type(rows) == "table" and rows :: { AliasRow } or {}
end

local function ref_rows(crm_id: string): { RefRow }
    local handle = db()
    local rows, err = handle:query([[
        SELECT ref_id, from_ref, edge_type, to_ref, attrs, active, source
        FROM kickside_crm_ref WHERE crm_id = $1 ORDER BY from_ref, edge_type, to_ref
    ]], { crm_id })
    handle:release()
    test.is_nil(err)
    return type(rows) == "table" and rows :: { RefRow } or {}
end

local function truthy(value: unknown): boolean
    return value == true or value == 1
end

local function payload_of(row: ActivityRow): UnknownMap
    local decoded, err = json.decode(tostring(row.payload))
    test.is_nil(err)
    return type(decoded) == "table" and decoded :: UnknownMap or {}
end

local function activity(body: UnknownMap): Event
    return event(types.EVENTS.ACTIVITY_LOGGED, body)
end

local function link(from_ref: string, edge_type: string, to_ref: string, extra: UnknownMap?): Event
    local body: UnknownMap = { from_ref = from_ref, edge_type = edge_type, to_ref = to_ref }
    for key, value in pairs(extra or {}) do body[key] = value end
    return event(types.EVENTS.REFERENCE_LINKED, body)
end

local function unlink(from_ref: string, edge_type: string, to_ref: string, extra: UnknownMap?): Event
    local body: UnknownMap = { from_ref = from_ref, edge_type = edge_type, to_ref = to_ref }
    for key, value in pairs(extra or {}) do body[key] = value end
    return event(types.EVENTS.REFERENCE_UNLINKED, body)
end

local function define_tests()
    test.describe("CRM activity convergence and reference edge", function()
        test.it("converges duplicate activity deliveries onto one row by external_id", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:1")

            test.is_nil(project(crm_id, {
                event(types.EVENTS.ACTIVITY_LOGGED, {
                    activity_id = "act:hubspot-meeting",
                    record_id = "deal:1",
                    activity_type = "meeting",
                    source = "hubspot",
                    external_id = "hubspot:meeting:123",
                    direction = "in",
                    duration_sec = 1800,
                }),
            }))
            test.is_nil(project(crm_id, {
                event(types.EVENTS.ACTIVITY_LOGGED, {
                    activity_id = "act:hubspot-call",
                    record_id = "deal:1",
                    activity_type = "call",
                    source = "fireflies",
                    external_id = "hubspot:meeting:123",
                    has_transcript = true,
                    recording_url = "https://rec.example/abc",
                }),
            }))

            local rows = activity_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].activity_id, "act:hubspot-meeting")
            test.eq(rows[1].external_id, "hubspot:meeting:123")
            test.is_true(truthy(rows[1].has_transcript))
            test.eq(rows[1].recording_url, "https://rec.example/abc")
            test.eq(tonumber(rows[1].duration_sec), 1800)
        end)

        test.it("converges across sources by correlation_key and merges transcript flags", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:2")

            test.is_nil(project(crm_id, {
                event(types.EVENTS.ACTIVITY_LOGGED, {
                    activity_id = "act:call",
                    record_id = "deal:2",
                    activity_type = "call",
                    source = "hubspot",
                    external_id = "hubspot:call:9",
                    correlation_key = "fireflies:abc",
                    direction = "out",
                    duration_sec = 600,
                    has_transcript = false,
                }),
            }))
            test.is_nil(project(crm_id, {
                event(types.EVENTS.ACTIVITY_LOGGED, {
                    activity_id = "act:transcript",
                    record_id = "deal:2",
                    activity_type = "meeting",
                    source = "fireflies",
                    external_id = "fireflies:abc-native",
                    correlation_key = "fireflies:abc",
                    has_transcript = true,
                    recording_url = "https://rec.example/xyz",
                }),
            }))

            local rows = activity_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].activity_id, "act:call")
            -- external_id is stable first-write-wins; convergence never flips identity.
            test.eq(rows[1].external_id, "hubspot:call:9")
            test.eq(rows[1].correlation_key, "fireflies:abc")
            test.is_true(truthy(rows[1].has_transcript))
            test.eq(rows[1].recording_url, "https://rec.example/xyz")
            test.eq(tonumber(rows[1].duration_sec), 600)
            test.eq(rows[1].direction, "out")
        end)

        test.it("folds reference edges with natural-key upsert and soft-delete unlink", function()
            local crm_id = tostring(uuid.v7())
            local from_ref = "crm:deal:deal:3"
            local to_ref = "kbdoc:client-kb:doc-1"

            test.is_nil(project(crm_id, {
                event(types.EVENTS.REFERENCE_LINKED, {
                    from_ref = from_ref, edge_type = "transcript", to_ref = to_ref,
                    attrs = { minutes = 30 }, source = "fireflies",
                }),
            }))
            local first = ref_rows(crm_id)
            test.eq(#first, 1)
            test.is_true(truthy(first[1].active))
            test.eq(first[1].edge_type, "transcript")

            -- Re-link with new attrs is an upsert on the natural key, not a new row.
            test.is_nil(project(crm_id, {
                event(types.EVENTS.REFERENCE_LINKED, {
                    from_ref = from_ref, edge_type = "transcript", to_ref = to_ref,
                    attrs = { minutes = 45 },
                }),
            }))
            local upserted = ref_rows(crm_id)
            test.eq(#upserted, 1)
            test.eq(upserted[1].ref_id, first[1].ref_id)

            -- Unlink is a soft delete: the row stays, active clears, attrs preserved.
            test.is_nil(project(crm_id, {
                event(types.EVENTS.REFERENCE_UNLINKED, {
                    from_ref = from_ref, edge_type = "transcript", to_ref = to_ref,
                }),
            }))
            local unlinked = ref_rows(crm_id)
            test.eq(#unlinked, 1)
            test.is_false(truthy(unlinked[1].active))

            -- Re-link reactivates the same edge.
            test.is_nil(project(crm_id, {
                event(types.EVENTS.REFERENCE_LINKED, {
                    from_ref = from_ref, edge_type = "transcript", to_ref = to_ref,
                }),
            }))
            local relinked = ref_rows(crm_id)
            test.eq(#relinked, 1)
            test.is_true(truthy(relinked[1].active))
        end)

        test.it("pages outbound and inbound reference sets with a stable tie order", function()
            local crm_id = tostring(uuid.v7())
            local events = {}
            for index = 1, 6 do
                events[#events + 1] = link("source", "edge", "target:" .. tostring(index))
                events[#events + 1] = link("source:" .. tostring(index), "edge", "target")
            end
            test.is_nil(project(crm_id, events))
            for _, query in ipairs({{kind = "references", from_ref = "source"},
                {kind = "inbound_references", to_ref = "target"}}) do
                query.limit = 2
                local first, first_err = read_model.internal_query(crm_id, query)
                test.is_nil(first_err)
                test.eq(#first, 2)
                query.offset = 2
                local second, second_err = read_model.internal_query(crm_id, query)
                test.is_nil(second_err)
                test.eq(#second, 2)
                local seen = {}
                for _, row in ipairs(first) do seen[row.ref_id] = true end
                for _, row in ipairs(second) do test.is_nil(seen[row.ref_id]) end
                query.offset = 6
                local final, final_err = read_model.internal_query(crm_id, query)
                test.is_nil(final_err)
                test.eq(#final, 0)
            end
            local direct, direct_err = read_model.internal_references(crm_id, "source", false, 2, 2)
            test.is_nil(direct_err)
            test.eq(#direct, 2)
            local inbound, inbound_err = read_model.internal_inbound_references(crm_id, "target", false, 2, 2)
            test.is_nil(inbound_err)
            test.eq(#inbound, 2)
        end)

        test.it("lists a source's outbound references and a target's inbound references", function()
            local crm_id = tostring(uuid.v7())
            local deal_ref = "crm:deal:deal:4"
            local kb_doc = "kbdoc:client-kb:doc-9"

            test.is_nil(project(crm_id, {
                event(types.EVENTS.REFERENCE_LINKED, {
                    from_ref = deal_ref, edge_type = "transcript", to_ref = kb_doc,
                }),
                event(types.EVENTS.REFERENCE_LINKED, {
                    from_ref = deal_ref, edge_type = "knowledge", to_ref = "kb:client-kb",
                }),
            }))

            local outbound, out_err = read_model.internal_references(crm_id, deal_ref)
            test.is_nil(out_err)
            test.eq(#(outbound or {}), 2)

            local inbound, in_err = read_model.internal_inbound_references(crm_id, kb_doc)
            test.is_nil(in_err)
            test.eq(#(inbound or {}), 1)
            local edge = (inbound or {})[1] :: UnknownMap
            test.eq(edge.from_ref, deal_ref)
            test.eq(edge.edge_type, "transcript")

            -- A soft-deleted edge drops from the default active surface but is reachable
            -- with include_inactive.
            test.is_nil(project(crm_id, {
                event(types.EVENTS.REFERENCE_UNLINKED, {
                    from_ref = deal_ref, edge_type = "knowledge", to_ref = "kb:client-kb",
                }),
            }))
            local active_only, active_err = read_model.internal_references(crm_id, deal_ref)
            test.is_nil(active_err)
            test.eq(#(active_only or {}), 1)
            local with_inactive, inactive_err = read_model.internal_references(crm_id, deal_ref, true)
            test.is_nil(inactive_err)
            test.eq(#(with_inactive or {}), 2)
        end)

        test.it("dispatches references queries with active and include_inactive semantics", function()
            local crm_id = tostring(uuid.v7())
            local from_ref = "crm:person:northwind"
            local to_ref = "crm:company:northwind"
            test.is_nil(project(crm_id, { link(from_ref, "company_context", to_ref) }))
            local linked, linked_err = read_model.internal_query(crm_id, { kind = "references", from_ref = from_ref })
            test.is_nil(linked_err)
            test.eq(#(linked :: { UnknownMap }), 1)
            test.eq((linked :: { UnknownMap })[1].to_ref, to_ref)
            test.eq((linked :: { UnknownMap })[1].active, true)
            test.is_nil(project(crm_id, { unlink(from_ref, "company_context", to_ref) }))
            local active, active_err = read_model.internal_query(crm_id, { kind = "references", from_ref = from_ref, include_inactive = false })
            test.is_nil(active_err)
            test.eq(#(active :: { UnknownMap }), 0)
            local all, all_err = read_model.internal_query(crm_id, { kind = "references", from_ref = from_ref, include_inactive = true })
            test.is_nil(all_err)
            test.eq(#(all :: { UnknownMap }), 1)
            test.eq((all :: { UnknownMap })[1].to_ref, to_ref)
            test.eq((all :: { UnknownMap })[1].active, false)
            local isolated, isolated_err = read_model.internal_query(tostring(uuid.v7()), { kind = "references", from_ref = from_ref, include_inactive = true })
            test.is_nil(isolated_err)
            test.eq(#(isolated :: { UnknownMap }), 0)
        end)

        test.it("keeps reference attrs and provenance that a later delivery does not restate", function()
            local crm_id = tostring(uuid.v7())
            local from_ref = types.record_ref("deal:attrs")
            local to_ref = "kbdoc:client-kb:doc-attrs"

            test.is_nil(project(crm_id, {
                link(from_ref, "transcript", to_ref, { attrs = { minutes = 30, title = "Kickoff" }, source = "fireflies" }),
            }))
            test.is_nil(project(crm_id, { link(from_ref, "transcript", to_ref) }))

            local kept, kept_err = read_model.internal_references(crm_id, from_ref)
            test.is_nil(kept_err)
            test.eq(#(kept or {}), 1)
            local edge = (kept or {})[1] :: UnknownMap
            test.eq((edge.attrs :: UnknownMap).title, "Kickoff")
            test.eq(tonumber((edge.attrs :: UnknownMap).minutes), 30)
            test.eq(edge.source, "fireflies")

            -- A delivery that restates attrs replaces them.
            test.is_nil(project(crm_id, { link(from_ref, "transcript", to_ref, { attrs = { minutes = 45 } }) }))
            local restated = read_model.internal_references(crm_id, from_ref)
            test.eq(tonumber(((restated or {})[1] :: UnknownMap).attrs.minutes), 45)
            test.is_nil(((restated or {})[1] :: UnknownMap).attrs.title)

            -- Unlink clears active and rewrites neither the attrs nor the linking source.
            test.is_nil(project(crm_id, { unlink(from_ref, "transcript", to_ref, { source = "hubspot" }) }))
            local closed = read_model.internal_references(crm_id, from_ref, true)
            test.eq(#(closed or {}), 1)
            local closed_edge = (closed or {})[1] :: UnknownMap
            test.is_false(truthy(closed_edge.active))
            test.eq(tonumber((closed_edge.attrs :: UnknownMap).minutes), 45)
            test.eq(closed_edge.source, "fireflies")
        end)

        test.it("leaves no row behind when an edge that was never linked is unlinked", function()
            local crm_id = tostring(uuid.v7())
            test.is_nil(project(crm_id, {
                unlink(types.record_ref("deal:phantom"), "knowledge", "kb:never-linked"),
            }))
            test.eq(#ref_rows(crm_id), 0)
        end)

        test.it("keeps the deal pointer, the first label, and every source's payload keys", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:anchor")
            seed(crm_id, "contact:anchor", "contact")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:hubspot", record_id = "deal:anchor", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meeting:anchor",
                    payload = { title = "Quarterly review", body_text = "agenda" },
                }),
            }))
            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:fireflies", record_id = "contact:anchor", activity_type = "call",
                    source = "fireflies", external_id = "hubspot:meeting:anchor", has_transcript = true,
                    payload = { transcript_url = "https://transcript.example/1" },
                }),
            }))

            local rows = activity_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].record_id, "deal:anchor")
            test.eq(rows[1].activity_type, "meeting")
            local payload = payload_of(rows[1])
            test.eq(payload.title, "Quarterly review")
            test.eq(payload.body_text, "agenda")
            test.eq(payload.transcript_url, "https://transcript.example/1")
        end)

        test.it("upgrades a contact pointer when a deal-scoped delivery converges", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:upgrade")
            seed(crm_id, "contact:upgrade", "contact")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:contact-first", record_id = "contact:upgrade", activity_type = "call",
                    source = "fireflies", correlation_key = "evt:upgrade",
                }),
            }))
            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:deal-second", record_id = "deal:upgrade", activity_type = "meeting",
                    source = "hubspot", correlation_key = "evt:upgrade",
                }),
            }))

            local rows = activity_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].activity_id, "act:contact-first")
            test.eq(rows[1].record_id, "deal:upgrade")
            test.eq(rows[1].activity_type, "call")
        end)

        test.it("anchors on whatever object type the applied schema gives a pipeline", function()
            local crm_id = tostring(uuid.v7())
            local handle, dialect = db()
            local _, err = storage.ensure(handle, dialect, crm_id, {
                version = "anchor-v1",
                objects = {
                    { id = "opportunity", type = "opportunity", label = "Opportunity", plural = "Opportunities" },
                    { id = "person", type = "person", label = "Person", plural = "People" },
                },
                attributes = {
                    { id = "opp-name", object_type = "opportunity", attr = "name", data_type = "text", config = {} },
                    { id = "person-name", object_type = "person", attr = "name", data_type = "text", config = {} },
                },
                pipelines = { { collection_id = "opps", object_type = "opportunity", label = "Deals", stages = {} } },
                views = {}, policies = {}, merge_config = {},
            })
            handle:release()
            test.is_nil(err)
            seed(crm_id, "opportunity:won", "opportunity")
            seed(crm_id, "person:ada", "person")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:person-first", record_id = "person:ada", activity_type = "call",
                    source = "fireflies", correlation_key = "evt:anchor",
                }),
                activity({
                    activity_id = "act:opp-second", record_id = "opportunity:won", activity_type = "meeting",
                    source = "hubspot", correlation_key = "evt:anchor",
                }),
            }))

            local rows = activity_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].record_id, "opportunity:won")
        end)

        test.it("resolves an edge minted against an activity identity convergence absorbed", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:edge")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "hubspot:meeting:edge", record_id = "deal:edge", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meeting:edge", correlation_key = "evt:edge",
                }),
            }))
            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "fireflies:edge", record_id = "deal:edge", activity_type = "call",
                    source = "fireflies", external_id = "fireflies:edge", correlation_key = "evt:edge",
                    has_transcript = true,
                }),
            }))
            test.eq(#activity_rows(crm_id), 1)

            -- The meetings path mints its edge against its own activity identity.
            test.is_nil(project(crm_id, {
                link(types.activity_ref("fireflies:edge"), "transcript", "kbdoc:client-kb:transcript-edge"),
            }))

            local rows = ref_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].from_ref, types.activity_ref("hubspot:meeting:edge"))
            local outbound = read_model.internal_references(crm_id, types.activity_ref("hubspot:meeting:edge"))
            test.eq(#(outbound or {}), 1)
        end)

        test.it("repoints an edge that named an activity before the activity converged", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:late")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "hubspot:meeting:late", record_id = "deal:late", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meeting:late", correlation_key = "evt:late",
                }),
            }))
            -- The edge arrives before the delivery that owns its activity identity.
            test.is_nil(project(crm_id, {
                link(types.activity_ref("fireflies:late"), "transcript", "kbdoc:client-kb:transcript-late"),
            }))
            test.eq(ref_rows(crm_id)[1].from_ref, types.activity_ref("fireflies:late"))

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "fireflies:late", record_id = "deal:late", activity_type = "call",
                    source = "fireflies", external_id = "fireflies:late", correlation_key = "evt:late",
                }),
            }))

            local rows = ref_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].from_ref, types.activity_ref("hubspot:meeting:late"))
            local aliases = alias_rows(crm_id)
            test.eq(#aliases, 2)
            for _, row in ipairs(aliases) do test.eq(row.activity_id, "hubspot:meeting:late") end
        end)

        test.it("keeps a redelivery of an absorbed identity on the surviving row", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:redeliver")

            local fireflies = {
                activity_id = "fireflies:redeliver", record_id = "deal:redeliver", activity_type = "call",
                source = "fireflies", external_id = "fireflies:redeliver", correlation_key = "evt:redeliver",
            }
            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "hubspot:meeting:redeliver", record_id = "deal:redeliver", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meeting:redeliver", correlation_key = "evt:redeliver",
                }),
            }))
            test.is_nil(project(crm_id, { activity(fireflies) }))
            -- The same source delivers its event again carrying only the identity the
            -- surviving row absorbed; the alias index still resolves it to one row.
            test.is_nil(project(crm_id, { activity({
                activity_id = fireflies.activity_id, record_id = fireflies.record_id,
                activity_type = fireflies.activity_type, source = fireflies.source,
            }) }))

            local rows = activity_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].activity_id, "hubspot:meeting:redeliver")
            test.eq(rows[1].external_id, "hubspot:meeting:redeliver")
        end)

        test.it("converges two held rows when a delivery names both as one real event", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "contact:held")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "hubspot:meetings:held", record_id = "contact:held", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meetings:held", duration_sec = 1800,
                    payload = { title = "Discovery" },
                }),
                activity({
                    activity_id = "fireflies:held", record_id = "contact:held", activity_type = "call",
                    source = "fireflies", external_id = "fireflies:held", correlation_key = "evt:held",
                    has_transcript = true, recording_url = "https://rec.example/held",
                    payload = { transcript_url = "https://transcript.example/held" },
                }),
                link(types.activity_ref("fireflies:held"), "transcript", "kbdoc:client-kb:transcript-held"),
            }))
            test.eq(#activity_rows(crm_id), 2)

            -- The meetings source re-logs its own activity carrying the correlation key
            -- the transcript row already holds: both rows are the same real event.
            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "hubspot:meetings:held", record_id = "contact:held", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meetings:held", correlation_key = "evt:held",
                    payload = { title = "Discovery call" },
                }),
            }))

            local rows = activity_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].activity_id, "hubspot:meetings:held")
            test.eq(rows[1].external_id, "hubspot:meetings:held")
            test.eq(rows[1].correlation_key, "evt:held")
            test.eq(rows[1].activity_type, "meeting")
            test.is_true(truthy(rows[1].has_transcript))
            test.eq(rows[1].recording_url, "https://rec.example/held")
            test.eq(tonumber(rows[1].duration_sec), 1800)
            local payload = payload_of(rows[1])
            test.eq(payload.title, "Discovery call")
            test.eq(payload.transcript_url, "https://transcript.example/held")

            local aliases = alias_rows(crm_id)
            test.eq(#aliases, 2)
            test.eq(aliases[1].alias, "evt:held")
            test.eq(aliases[2].alias, "fireflies:held")
            for _, row in ipairs(aliases) do test.eq(row.activity_id, "hubspot:meetings:held") end
            local refs = ref_rows(crm_id)
            test.eq(#refs, 1)
            test.eq(refs[1].from_ref, types.activity_ref("hubspot:meetings:held"))

            -- Every identity either row answered to now names the surviving row.
            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "fireflies:held", record_id = "contact:held", activity_type = "call",
                    source = "fireflies", external_id = "fireflies:held", correlation_key = "evt:held",
                    has_transcript = true,
                }),
            }))
            test.eq(#activity_rows(crm_id), 1)
            test.is_nil(project(crm_id, {
                event(types.EVENTS.ACTIVITY_DELETED, { external_id = "fireflies:held" }),
            }))
            test.eq(#activity_rows(crm_id), 0)
            test.eq(#alias_rows(crm_id), 0)
            test.eq(#ref_rows(crm_id), 0)
        end)

        test.it("absorbs the row a delivery's own id names into the row its external id names", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:own")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:manual-own", record_id = "deal:own", activity_type = "note",
                    source = "manual", payload = { note = "prep" },
                }),
                activity({
                    activity_id = "hubspot:meetings:own", record_id = "deal:own", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meetings:own",
                }),
                activity({
                    activity_id = "act:manual-own", record_id = "deal:own", activity_type = "note",
                    source = "manual", external_id = "hubspot:meetings:own",
                }),
            }))

            local rows = activity_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].activity_id, "hubspot:meetings:own")
            test.eq(rows[1].activity_type, "meeting")
            test.eq(payload_of(rows[1]).note, "prep")
            local aliases = alias_rows(crm_id)
            test.eq(#aliases, 2)
            test.eq(aliases[1].alias, "act:manual-own")
            for _, row in ipairs(aliases) do test.eq(row.activity_id, "hubspot:meetings:own") end
        end)

        test.it("surfaces a reference-linked activity on the linked record's timeline", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "contact:primary", "contact")
            seed(crm_id, "contact:guest", "contact")
            seed(crm_id, "contact:silent", "contact")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "fireflies:mtg", record_id = "contact:primary", activity_type = "meeting",
                    source = "fireflies", external_id = "fireflies:mtg",
                }),
                link(types.activity_ref("fireflies:mtg"), "participant", types.record_ref("contact:guest")),
            }))

            -- The participant sees the meeting even though the activity keys on the primary contact.
            local guest, guest_err = read_model.internal_timeline(crm_id, "contact:guest")
            test.is_nil(guest_err)
            test.eq(#(guest or {}), 1)
            test.eq(((guest or {})[1] :: UnknownMap).activity_id, "fireflies:mtg")

            -- The keyed record keeps its timeline.
            local primary = read_model.internal_timeline(crm_id, "contact:primary")
            test.eq(#(primary or {}), 1)

            -- A record nothing references stays empty.
            local silent = read_model.internal_timeline(crm_id, "contact:silent")
            test.eq(#(silent or {}), 0)
        end)

        test.it("lists an activity once when the viewed record is both keyed and referenced", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "contact:both", "contact")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "fireflies:self", record_id = "contact:both", activity_type = "meeting",
                    source = "fireflies", external_id = "fireflies:self",
                }),
                link(types.activity_ref("fireflies:self"), "participant", types.record_ref("contact:both")),
            }))

            local rows, err = read_model.internal_timeline(crm_id, "contact:both")
            test.is_nil(err)
            test.eq(#(rows or {}), 1)
        end)

        test.it("keeps a reference-linked activity off the timeline once the edge is unlinked", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "contact:host", "contact")
            seed(crm_id, "contact:left", "contact")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "fireflies:gone", record_id = "contact:host", activity_type = "meeting",
                    source = "fireflies", external_id = "fireflies:gone",
                }),
                link(types.activity_ref("fireflies:gone"), "participant", types.record_ref("contact:left")),
            }))
            test.eq(#(read_model.internal_timeline(crm_id, "contact:left") or {}), 1)

            test.is_nil(project(crm_id, {
                unlink(types.activity_ref("fireflies:gone"), "participant", types.record_ref("contact:left")),
            }))
            test.eq(#(read_model.internal_timeline(crm_id, "contact:left") or {}), 0)
        end)

        test.it("cascades reference edges and activity aliases when a record is deleted", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:gone")
            seed(crm_id, "deal:kept")
            local gone_ref = types.record_ref("deal:gone")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:gone", record_id = "deal:gone", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meeting:gone",
                }),
                activity({
                    activity_id = "act:gone-second", record_id = "deal:gone", activity_type = "call",
                    source = "fireflies", external_id = "hubspot:meeting:gone",
                }),
                link(gone_ref, "knowledge", "kb:client-kb"),
                link("external:hubspot:deal:gone", "related", gone_ref),
                link(types.activity_ref("act:gone"), "transcript", "kbdoc:client-kb:doc-gone"),
                link(types.record_ref("deal:kept"), "knowledge", "kb:client-kb"),
            }))
            test.eq(#ref_rows(crm_id), 4)
            test.eq(#alias_rows(crm_id), 2)

            test.is_nil(project(crm_id, {
                event(types.EVENTS.RECORD_DELETED, { record_id = "deal:gone", object_type = "deal" }),
            }))

            local rows = ref_rows(crm_id)
            test.eq(#rows, 1)
            test.eq(rows[1].from_ref, types.record_ref("deal:kept"))
            test.eq(#alias_rows(crm_id), 0)
            test.eq(#activity_rows(crm_id), 0)
        end)

        test.it("repoints reference edges from the merge loser onto the winner", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:winner")
            seed(crm_id, "deal:loser")
            local winner_ref = types.record_ref("deal:winner")
            local loser_ref = types.record_ref("deal:loser")

            test.is_nil(project(crm_id, {
                link(winner_ref, "knowledge", "kb:client-kb"),
                link(loser_ref, "knowledge", "kb:client-kb"),
                link(loser_ref, "transcript", "kbdoc:client-kb:doc-loser"),
                link("external:hubspot:deal:loser", "related", loser_ref),
            }))
            test.eq(#ref_rows(crm_id), 4)

            test.is_nil(project(crm_id, {
                event(types.EVENTS.MERGE_DECIDED, {
                    resolution_id = "resolution:refs", left_id = "deal:winner", right_id = "deal:loser",
                    object_type = "deal", decision = "merged", winner_id = "deal:winner",
                    loser_id = "deal:loser", resolved_by = "user:reviewer", resolved_at = "2026-08-12T12:00:00Z",
                }),
            }))

            local rows = ref_rows(crm_id)
            test.eq(#rows, 3)
            for _, row in ipairs(rows) do
                test.is_false(row.from_ref == loser_ref)
                test.is_false(row.to_ref == loser_ref)
            end
            local inbound = read_model.internal_inbound_references(crm_id, winner_ref)
            test.eq(#(inbound or {}), 1)

            -- Repointed edges carry the identity of their new natural key: re-linking one
            -- folds onto the same row with the same ref_id.
            local moved = ref_rows(crm_id)
            test.is_nil(project(crm_id, { link(winner_ref, "transcript", "kbdoc:client-kb:doc-loser") }))
            local relinked = ref_rows(crm_id)
            test.eq(#relinked, 3)
            for index, row in ipairs(relinked) do test.eq(row.ref_id, moved[index].ref_id) end
        end)

        test.it("activity.deleted removes the row, its aliases, and its anchored edges", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:gone")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:hubspot-gone", record_id = "deal:gone", activity_type = "meeting",
                    source = "hubspot", external_id = "hubspot:meeting:900",
                }),
                activity({
                    activity_id = "act:fireflies-gone", record_id = "deal:gone", activity_type = "meeting",
                    source = "fireflies", external_id = "hubspot:meeting:900", correlation_key = "cal:gone",
                }),
                link("activity:act:hubspot-gone", "generated_from", "kb:transcripts"),
            }))
            test.eq(#activity_rows(crm_id), 1)

            test.is_nil(project(crm_id, {
                event(types.EVENTS.ACTIVITY_DELETED, { external_id = "hubspot:meeting:900" }),
            }))
            test.eq(#activity_rows(crm_id), 0)
            test.eq(#alias_rows(crm_id), 0)
            test.eq(#ref_rows(crm_id), 0)
        end)

        test.it("activity.deleted resolves an identity the surviving row absorbed", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:absorbed")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:first", record_id = "deal:absorbed", activity_type = "call",
                    source = "hubspot", external_id = "hubspot:call:31",
                }),
                activity({
                    activity_id = "act:second", record_id = "deal:absorbed", activity_type = "call",
                    source = "fireflies", external_id = "hubspot:call:31", correlation_key = "cal:31",
                }),
            }))
            test.eq(#activity_rows(crm_id), 1)

            test.is_nil(project(crm_id, {
                event(types.EVENTS.ACTIVITY_DELETED, { activity_id = "act:second" }),
            }))
            test.eq(#activity_rows(crm_id), 0)
            test.eq(#alias_rows(crm_id), 0)
        end)

        test.it("activity.deleted for an identity this CRM never held changes nothing", function()
            local crm_id = tostring(uuid.v7())
            apply(crm_id)
            seed(crm_id, "deal:held")

            test.is_nil(project(crm_id, {
                activity({
                    activity_id = "act:held", record_id = "deal:held", activity_type = "note",
                    source = "hubspot", external_id = "hubspot:note:1",
                }),
            }))
            test.is_nil(project(crm_id, {
                event(types.EVENTS.ACTIVITY_DELETED, { external_id = "hubspot:note:404" }),
            }))
            test.eq(#activity_rows(crm_id), 1)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
