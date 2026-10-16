local actors = require("actors")
local funcs = require("funcs")
local security = require("security")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

type Map = { [string]: unknown }
type Executor = { call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?) }

local CREATE_PROBE = "app:create_probe"
local SCHEMA_PROBE = "app:schema_probe"
local WRITE_PROBE = "app:writer_probe"
local PRIVACY_PROBE = "app:crm_privacy_probe"

local function map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function actor(id: string): security.Actor
    return actors.make(id)
end

local function scope(): security.Scope
    local rule = assert(security.policy("app:user"))
    return assert(security.new_scope({ rule })) :: security.Scope
end

local function create(execute: Executor): string
    local result, err = execute:call(CREATE_PROBE, {
        idempotency_key = "privacy:" .. uuid.v4(), title = "Private CRM",
    })
    test.is_nil(err)
    local created = map(result)
    local crm_id = tostring(created.component_id or "")
    test.is_true(crm_id ~= "")
    return crm_id
end

local function write(execute: Executor, crm_id: string, commands: { unknown }): Map
    local result, err = execute:call(WRITE_PROBE, { crm_id = crm_id, commands = commands })
    test.is_nil(err)
    return map(result)
end

local function privacy(execute: Executor, args: Map): Map
    local result, err = execute:call(PRIVACY_PROBE, args)
    test.is_nil(err)
    return map(result)
end

local function define_tests()
    test.describe("CRM principal privacy", function()
        test.it("keeps a CRM record unreadable and unwritable to a foreign actor", function()
            local owner = actor(uuid.v4())
            local stranger = actor(uuid.v4())
            local owner_exec = funcs.new():with_actor(owner):with_scope(scope()) :: Executor
            local stranger_exec = funcs.new():with_actor(stranger):with_scope(scope()) :: Executor
            local crm_id = create(owner_exec)
            local record_id = "entity:private-" .. uuid.v4()

            -- The standalone CRM declaration is intentionally empty; contribute
            -- one tiny object through the canonical schema authority before
            -- exercising the public record reader/writer.
            local _, schema_err = owner_exec:call(SCHEMA_PROBE, {
                crm_id = crm_id,
                definition = {
                    object = { id = "entity", type = "entity", label = "Entity", plural = "Entities" },
                    attributes = { { id = "entity-name", object_type = "entity", attr = "name", data_type = "text", config = {} } },
                },
            })
            test.is_nil(schema_err)

            local created = write(owner_exec, crm_id, {
                { type = types.EVENTS.RECORD_CREATED, body = {
                    record_id = record_id, object_type = "entity", values = { name = "owner only" },
                } },
            })
            test.eq(created.ok, true, tostring(created.error))
            local caught_up, catch_err = owner_exec:call(WRITE_PROBE, { crm_id = crm_id, catch_up = true })
            test.is_nil(catch_err)
            test.eq(map(caught_up).ok, true, tostring(map(caught_up).error))

            local foreign_detail = privacy(stranger_exec, {
                op = "get", crm_id = crm_id, record_id = record_id,
            })
            test.is_nil(foreign_detail.value)
            test.not_nil(foreign_detail.error)

            local denied_tool, denied_tool_err = stranger_exec:call("kickside.crm.traits:get_record", {
                crm_id = crm_id, record_id = record_id,
            })
            test.is_nil(denied_tool, "a denied CRM tool must not return tool content")
            test.not_nil(denied_tool_err)
            test.contains(tostring(denied_tool_err), "crm access denied")
            test.is_true(errors.is(denied_tool_err, errors.PERMISSION_DENIED), tostring(denied_tool_err))

            local foreign_list = privacy(stranger_exec, {
                op = "list", crm_id = crm_id, object_type = "entity",
            })
            test.is_nil(foreign_list.value)
            test.not_nil(foreign_list.error)

            local foreign_write = privacy(stranger_exec, {
                op = "update", crm_id = crm_id, record_id = record_id,
                object_type = "entity", set = { name = "attacker" },
            })
            test.is_nil(foreign_write.value)
            test.not_nil(foreign_write.error)

            local owner_detail = privacy(owner_exec, {
                op = "get", crm_id = crm_id, record_id = record_id,
            })
            test.not_nil(owner_detail.value)
            test.is_nil(owner_detail.error)
            local allowed_tool, allowed_tool_err = owner_exec:call("kickside.crm.traits:get_record", {
                crm_id = crm_id, record_id = record_id,
            })
            test.is_nil(allowed_tool_err, tostring(allowed_tool_err))
            test.eq(type(allowed_tool), "table")
            test.eq(allowed_tool.success, true)
            test.eq(allowed_tool.record.values.name, "owner only")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
