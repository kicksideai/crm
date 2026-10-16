local actors = require("actors")
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")
local channel = require("channel")
local time = require("time")

type Map = { [string]: unknown }

local function setup(): (string, any)
    local crm_id = uuid.v7()
    local actor = actors.make(uuid.v4())
    local scope = assert(security.new_scope({ assert(security.policy("app:user")) }))
    local threads = assert(contract.get(types.THREADS)):with_actor(actor):with_scope(scope):open()
    local _, thread_err = threads:ensure_thread({
        component_id = crm_id, impl_id = types.CRM_IMPL, thread_class = types.THREAD_CLASS,
    })
    test.is_nil(thread_err)
    local db = assert(sql.get(types.db_id())) :: sql.DB
    local _, schema_err = storage.ensure(db, db:type(), crm_id, {
        version = "raw-v1",
        objects = { { id = "entity", type = "entity", label = "Entity", plural = "Entities" } },
        attributes = {
            { id = "name", object_type = "entity", attr = "name", data_type = "text", config = {} },
            { id = "email", object_type = "entity", attr = "email", data_type = "email", config = { alias = "email" } },
        },
        pipelines = {}, views = {}, policies = {}, merge_config = {},
    })
    db:release()
    test.is_nil(schema_err)
    return crm_id, funcs.new():with_actor(actor):with_scope(scope)
end

local function define_tests()
    test.describe("CRM durable read after write", function()
        test.it("Resolve Block returns a committed checkpoint for creates and updates", function()
            local crm_id, execute = setup()
            local record_id = nil
            for index = 1, 2 do
                local output, err = execute:call("kickside.crm.resolution:block_resolve", {
                    config = { crm_id = crm_id },
                    input = { object_type = "entity", match = { alias_type = "email", alias_value = "block@northwind.example" },
                        values = { name = "Resolved " .. tostring(index) } },
                })
                test.is_nil(err)
                test.not_nil(output)
                local result = output :: Map
                test.eq(result.created, index == 1)
                local record = result.record :: Map
                if record_id then test.eq(record.record_id, record_id) end
                record_id = record.record_id
                local checkpoint = result.checkpoint :: Map
                test.not_nil(checkpoint, "Resolve Block lacks projection checkpoint")
                local receipt = result.receipt :: Map
                test.eq(checkpoint.crm_id, crm_id)
                test.eq(checkpoint.appended_seq, receipt.appended_seq)
                test.eq(checkpoint.target_seq, receipt.appended_seq)
                test.eq(checkpoint.last_seq, checkpoint.projected_seq)
                test.is_true(tonumber(checkpoint.projected_seq) >= tonumber(receipt.appended_seq))
                local db = assert(sql.get(types.db_id())) :: sql.DB
                local persisted, read_err = storage.get(db, crm_id, "entity", tostring(record_id))
                db:release()
                test.is_nil(read_err)
                test.eq(((persisted :: Map).values :: Map).name, "Resolved " .. tostring(index))
            end
        end)

        test.it("creates then immediately applies 40 times with background projection initially parked", function()
            local crm_id, execute = setup()
            local result, err = execute:call("app:crm_read_after_write_probe", {
                crm_id = crm_id, prefix = "parked", park = true, iterations = 40,
            })
            test.is_nil(err)
            test.eq((result :: Map).ok, true, tostring((result :: Map).error))
        end)

        test.it("refuses success when the projection cannot commit the appended create", function()
            local crm_id, execute = setup()
            local db = assert(sql.get(types.db_id())) :: sql.DB
            local _, pause_err = db:execute("UPDATE kickside_projection_cursor SET status = 'paused' WHERE thread_id = $1", { crm_id })
            test.is_nil(pause_err)
            local result, err = execute:call("app:writer_probe", {
                crm_id = crm_id,
                commands = { { type = types.EVENTS.RECORD_CREATED,
                    body = { record_id = "blocked", object_type = "entity", values = { name = "blocked" } } } },
            })
            test.is_nil(err)
            test.eq((result :: Map).ok, false)
            test.is_true(tostring((result :: Map).error):find("projection", 1, true) ~= nil)
            local rows, query_err = db:query("SELECT COUNT(*) AS count FROM kickside_event WHERE thread_id = $1", { crm_id })
            test.is_nil(query_err)
            test.eq(tonumber(rows[1].count), 1)
            db:release()
        end)

        test.it("creates then immediately applies under eight concurrent writers, 320 records", function()
            local crm_id, execute = setup()
            local pending: { any } = {}
            for worker = 1, 8 do
                local cmd, err = execute:async("app:crm_read_after_write_probe", {
                    crm_id = crm_id, prefix = "worker:" .. tostring(worker), iterations = 40,
                })
                test.is_nil(err)
                pending[#pending + 1] = cmd
            end
            for _, cmd in ipairs(pending) do
                local response = cmd:response()
                local deadline = time.after("90s")
                local selected = channel.select({ response:case_receive(), deadline:case_receive() })
                test.is_false(selected.channel == deadline, "concurrent writer timed out")
                local payload, err = cmd:result()
                test.is_nil(err)
                local result = payload:data()
                test.eq((result :: Map).ok, true, tostring((result :: Map).error))
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
