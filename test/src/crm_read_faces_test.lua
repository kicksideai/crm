local actors = require("actors")
-- The two read-only faces another module reaches this CRM through.
--
-- Everything the CRM publishes as a callable entry is either an agent tool or a
-- write. That left two reads with no face at all: which record already carries an
-- address, and which reference edges an activity already has. A caller that
-- cannot ask the first has to use resolve_record, which CREATES the record when
-- the alias is absent -- so a module reading to decide whether a call involves a
-- customer would manufacture the customer it was looking for. A caller that
-- cannot ask the second can only append edges, never reconcile them.
--
-- Both are reached by id, from a module that must install without this one, so
-- they are function entries rather than a library: an import is resolved when
-- the entry is created and refuses the whole install where the CRM is absent,
-- and a call is answered when it is made.
--
-- What is proven here is that they read and only read, answer under the
-- CALLER's access rather than the CRM's, and return typed failures through the
-- callable boundary.
local funcs = require("funcs")
local registry = require("registry")
local security = require("security")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type Map = { [string]: unknown }
type Executor = { call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?) }

local CREATE_PROBE = "app:create_probe"
local SCHEMA_PROBE = "app:schema_probe"
local WRITE_PROBE = "app:writer_probe"
local ALIAS_FACE = "kickside.crm.read:alias_lookup"
local REFERENCES_FACE = "kickside.crm.read:references"

local function map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function list(value: unknown): { unknown }
    return type(value) == "table" and (value :: { unknown }) or {}
end

local function actor(id: string): security.Actor
    return actors.make(id)
end

local function scope(): security.Scope
    return assert(security.new_scope({ assert(security.policy("app:user")) })) :: security.Scope
end

local function call(execute: Executor, target: string, args: Map): (unknown?, unknown?)
    return execute:call(target, args)
end

local function create(execute: Executor): string
    local result, err = execute:call(CREATE_PROBE, {
        idempotency_key = "read-faces:" .. uuid.v4(), title = "Read faces CRM",
    })
    test.is_nil(err)
    local crm_id = tostring(map(result).component_id or "")
    test.is_true(crm_id ~= "")
    return crm_id
end

-- A contact object whose email attribute is declared an alias: the alias index
-- is a projection of the write path, so the only honest way to seed it is to
-- write a record through that path.
local function declare_contact(execute: Executor, crm_id: string)
    local _, err = execute:call(SCHEMA_PROBE, {
        crm_id = crm_id,
        definition = {
            object = { id = "contact", type = "contact", label = "Contact", plural = "Contacts" },
            attributes = {
                { id = "contact-name", object_type = "contact", attr = "name", data_type = "text", config = {} },
                { id = "contact-email", object_type = "contact", attr = "email", data_type = "text",
                  config = { alias = "email" } },
            },
        },
    })
    test.is_nil(err)
end

local function write(execute: Executor, crm_id: string, commands: { unknown })
    local result, err = execute:call(WRITE_PROBE, { crm_id = crm_id, commands = commands })
    test.is_nil(err)
    test.eq(map(result).ok, true, tostring(map(result).error))
    local caught_up, catch_err = execute:call(WRITE_PROBE, { crm_id = crm_id, catch_up = true })
    test.is_nil(catch_err)
    test.eq(map(caught_up).ok, true, tostring(map(caught_up).error))
end

local function alias_count(execute: Executor, crm_id: string, address: string): number
    local answer, err = call(execute, ALIAS_FACE, {
        crm_id = crm_id, object_type = "contact", alias_type = "email", value = address,
    })
    test.is_nil(err)
    return tostring(map(answer).record_id or "") ~= "" and 1 or 0
end

local function define_tests()
    test.describe("CRM alias read face", function()
        test.it("resolves an address the index already carries, and creates nothing", function()
            local owner = actor(uuid.v4())
            local execute = funcs.new():with_actor(owner):with_scope(scope()) :: Executor
            local crm_id = create(execute)
            declare_contact(execute, crm_id)

            local record_id = "contact:read-" .. uuid.v4()
            write(execute, crm_id, {
                { type = types.EVENTS.RECORD_CREATED, body = {
                    record_id = record_id, object_type = "contact",
                    values = { name = "Dana Example", email = "dana@acme.test" },
                } },
            })

            local answer, err = call(execute, ALIAS_FACE, {
                crm_id = crm_id, object_type = "contact", alias_type = "email",
                value = "dana@acme.test",
            })
            test.is_nil(err)
            test.eq(tostring(map(answer).record_id), record_id)

            -- An address nobody carries is a fact about the roster, not a
            -- failure -- and asking must not bring a record into existence, which
            -- is the whole reason this face exists beside resolve_record.
            local unknown, unknown_err = call(execute, ALIAS_FACE, {
                crm_id = crm_id, object_type = "contact", alias_type = "email",
                value = "nobody@acme.test",
            })
            test.is_nil(unknown_err)
            test.eq(tostring(map(unknown).record_id), "")
            test.eq(alias_count(execute, crm_id, "nobody@acme.test"), 0,
                "asking about an address created a record for it")
        end)

        test.it("defaults the alias type to email and refuses a call that names no object", function()
            local owner = actor(uuid.v4())
            local execute = funcs.new():with_actor(owner):with_scope(scope()) :: Executor
            local crm_id = create(execute)
            declare_contact(execute, crm_id)

            local record_id = "contact:default-" .. uuid.v4()
            write(execute, crm_id, {
                { type = types.EVENTS.RECORD_CREATED, body = {
                    record_id = record_id, object_type = "contact",
                    values = { name = "Sam Example", email = "sam@acme.test" },
                } },
            })

            local implied, implied_err = call(execute, ALIAS_FACE, {
                crm_id = crm_id, object_type = "contact", value = "sam@acme.test",
            })
            test.is_nil(implied_err)
            test.eq(tostring(map(implied).record_id), record_id)

            local refused, refused_err = call(execute, ALIAS_FACE, { crm_id = crm_id, value = "sam@acme.test" })
            test.is_nil(refused)
            test.is_true(errors.is(refused_err, errors.INVALID))
        end)

        test.it("answers under the caller's own access, not the CRM's", function()
            local owner = actor(uuid.v4())
            local stranger = actor(uuid.v4())
            local owner_exec = funcs.new():with_actor(owner):with_scope(scope()) :: Executor
            local stranger_exec = funcs.new():with_actor(stranger):with_scope(scope()) :: Executor
            local crm_id = create(owner_exec)
            declare_contact(owner_exec, crm_id)
            write(owner_exec, crm_id, {
                { type = types.EVENTS.RECORD_CREATED, body = {
                    record_id = "contact:private-" .. uuid.v4(), object_type = "contact",
                    values = { name = "Private", email = "private@acme.test" },
                } },
            })

            local refused, refused_err = call(stranger_exec, ALIAS_FACE, {
                crm_id = crm_id, object_type = "contact", alias_type = "email",
                value = "private@acme.test",
            })
            test.is_nil(refused, "a stranger read this CRM's alias index")
            test.not_nil(refused_err)
        end)
    end)

    test.describe("CRM reference read face", function()
        test.it("returns the edges an activity carries, including the ones it lost", function()
            local owner = actor(uuid.v4())
            local execute = funcs.new():with_actor(owner):with_scope(scope()) :: Executor
            local crm_id = create(execute)
            declare_contact(execute, crm_id)

            local record_id = "contact:ref-" .. uuid.v4()
            write(execute, crm_id, {
                { type = types.EVENTS.RECORD_CREATED, body = {
                    record_id = record_id, object_type = "contact",
                    values = { name = "Edge Owner", email = "edges@acme.test" },
                } },
            })

            local from_ref = "activity:fireflies:ff-read-" .. uuid.v4()
            write(execute, crm_id, {
                { type = types.EVENTS.REFERENCE_LINKED, body = {
                    from_ref = from_ref, edge_type = "participant", to_ref = "crm:" .. record_id,
                } },
                { type = types.EVENTS.REFERENCE_LINKED, body = {
                    from_ref = from_ref, edge_type = "deal_context", to_ref = "crm:opportunity-3",
                } },
                { type = types.EVENTS.REFERENCE_UNLINKED, body = {
                    from_ref = from_ref, edge_type = "deal_context", to_ref = "crm:opportunity-3",
                } },
            })

            -- Inactive by default: an edge that was unlinked and is wanted again
            -- has to be re-linked under a key carrying its current stamp, because
            -- the sink receipts a key once and a reused one replays the unlink.
            -- A reader that cannot see the dead edge cannot restore it.
            local answer, answer_err = call(execute, REFERENCES_FACE, { crm_id = crm_id, from_ref = from_ref })
            test.is_nil(answer_err)
            local rows = list(map(answer).rows)
            test.eq(#rows, 2)
            local by_edge: { [string]: Map } = {}
            for _, raw in ipairs(rows) do by_edge[tostring(map(raw).edge_type)] = map(raw) end
            test.eq(tostring(map(by_edge.participant).to_ref), "crm:" .. record_id)
            test.is_true(map(by_edge.participant).active == true or map(by_edge.participant).active == 1)
            test.not_nil(by_edge.deal_context, "an unlinked edge was hidden from the reconciler")
            test.is_true(map(by_edge.deal_context).active == false or map(by_edge.deal_context).active == 0)

            local active_only, active_only_err = call(execute, REFERENCES_FACE, {
                crm_id = crm_id, from_ref = from_ref, include_inactive = false,
            })
            test.is_nil(active_only_err)
            test.eq(#list(map(active_only).rows), 1)

            local refused, refused_err = call(execute, REFERENCES_FACE, { crm_id = crm_id })
            test.is_nil(refused)
            test.is_true(errors.is(refused_err, errors.INVALID))
        end)

        test.it("answers under the caller's own access, not the CRM's", function()
            local owner = actor(uuid.v4())
            local stranger = actor(uuid.v4())
            local owner_exec = funcs.new():with_actor(owner):with_scope(scope()) :: Executor
            local stranger_exec = funcs.new():with_actor(stranger):with_scope(scope()) :: Executor
            local crm_id = create(owner_exec)

            local refused, refused_err = call(stranger_exec, REFERENCES_FACE, {
                crm_id = crm_id, from_ref = "activity:fireflies:ff-private",
            })
            test.is_nil(refused, "a stranger read this CRM's reference edges")
            test.not_nil(refused_err)
        end)
    end)

    -- A face nobody is allowed to call is a face that does not exist, and the
    -- consumer of these two runs as an ordinary person: deferred work carries
    -- the frozen identity of whoever authorized it. A host grants a user calls
    -- over the engine's namespaces and nothing under a product one, so the grant
    -- has to travel with the module that publishes the face.
    test.describe("CRM read face reachability", function()
        test.it("ships the grant that lets an ordinary caller ask, attached to the module's user scope", function()
            local policy = registry.get("kickside.crm.security:crm_read_face_access")
            test.not_nil(policy, "the read faces ship no grant, so a plain caller is refused at the probe")

            local rule = map(map(policy).data ~= nil and map(policy).data or policy)
            local resources: { [string]: boolean } = {}
            for _, raw in ipairs(list(map(rule.policy).resources)) do resources[tostring(raw)] = true end
            test.eq(resources[ALIAS_FACE], true)
            test.eq(resources[REFERENCES_FACE], true)
            -- Exactly the two faces. A wildcard here would hand a plain caller
            -- the write entries in the same namespace.
            local count = 0
            for _ in pairs(resources) do count = count + 1 end
            test.eq(count, 2)

            local actions: { [string]: boolean } = {}
            for _, raw in ipairs(list(map(rule.policy).actions)) do actions[tostring(raw)] = true end
            -- The probe and the call, together: a consumer that may call but may
            -- not read the entry cannot tell an absent CRM from a refused one.
            test.eq(actions["registry.get"], true)
            test.eq(actions["funcs.call"], true)

            local requirement = registry.get("kickside.crm.security:user_security_scope")
            test.not_nil(requirement)
            local attached = false
            for _, raw in ipairs(list(map(map(requirement).data ~= nil and map(requirement).data or requirement).targets)) do
                if tostring(map(raw).entry) == "kickside.crm.security:crm_read_face_access" then attached = true end
            end
            test.eq(attached, true, "the grant is declared but never joined to the host's user group")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
