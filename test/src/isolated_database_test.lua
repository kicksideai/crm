local test = require("test")
local isolated = require("isolated")
local channel = require("channel")
local registry = require("registry")
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")
local ctx = require("ctx")

local function blocked(args)
    assert(process.send(args.reply_pid, args.reply, { guardian = assert(ctx.get("database_fixture_pid")) }))
    channel.new():receive()
end

local function define()
    local plan_fixture = require("plan_fixture")
    local plan_registry = require("plan_registry")
    test.describe("Isolated database fixture registry plans", function()
        test.it("replans a stale registry snapshot before applying the fixture entry", function()
            plan_registry.reset({ "registry moved since the plan was computed" })
            local entry = { id = "app:db" }
            local ok, err = pcall(plan_fixture.apply, entry)
            test.is_true(ok, tostring(err))
            test.eq(plan_registry.snapshots(), 2)
            test.eq(plan_registry.updates(), 2)
            test.eq(plan_registry.entry(), entry)
        end)

        test.it("surfaces unrelated apply errors without replanning", function()
            plan_registry.reset({ "registry write refused" })
            local ok, err = pcall(plan_fixture.apply, { id = "app:db" })
            test.is_false(ok)
            test.is_true(tostring(err):find("registry write refused", 1, true) ~= nil)
            test.eq(plan_registry.snapshots(), 1)
        end)

        test.it("stops after three stale registry plans", function()
            plan_registry.reset({ "registry moved since the plan was computed",
                "registry moved since the plan was computed", "registry moved since the plan was computed" })
            local ok, err = pcall(plan_fixture.apply, { id = "app:db" })
            test.is_false(ok)
            test.is_true(tostring(err):find("registry moved since the plan was computed", 1, true) ~= nil)
            test.eq(plan_registry.snapshots(), 3)
            test.is_nil(plan_registry.entry())
        end)
    end)

    test.describe("Isolated database fixture lifetime", function()
        test.it("restores shared storage and drops private schema after its entry exits", function()
            local original = assert(registry.get("app:db"))
            local reply = "fixture.cancellation." .. uuid.v4()
            local mailbox = process.listen(reply, { message = true })
            local events = process.events()
            local owner = assert(process.spawn_monitored("app:isolated_database_cancellation_owner", "app:processes", {
                target = "app:isolated_database_blocked", database = "app:db", isolated = "app:schema_fault_db",
                args = { reply_pid = tostring(process.pid()), reply = reply },
            }))
            local ready = channel.select({ mailbox:case_receive(), time.after("5s"):case_receive() })
            test.eq(ready.channel, mailbox, "private database fixture never starts")
            local guardian = ready.value:payload():data().guardian
            test.is_true(assert(process.monitor(guardian)))
            local private = assert(registry.get("app:db"))
            test.is_true(private.data.file ~= original.data.file or private.data.database ~= original.data.database
                or private.data.options.search_path ~= original.data.options.search_path)
            assert(process.terminate(owner))
            local deadline = time.after("5s")
            while true do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                test.eq(selected.channel, events, "private database cleanup never exits")
                local event = selected.value
                if event.kind == process.event.EXIT and tostring(event.from) == guardian then
                    test.is_nil(event.result and event.result.error)
                    break
                end
            end
            process.unlisten(mailbox)
            local restored = assert(registry.get("app:db"))
            test.eq(restored.kind, original.kind)
            test.eq(restored.data.file, original.data.file)
            test.eq(restored.data.database, original.data.database)
            if original.kind == "db.sql.postgres" then
                local db = assert(sql.get("app:schema_fault_db"))
                local rows, err = db:query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1", { private.data.options.search_path })
                db:release()
                test.is_nil(err)
                test.eq(#rows, 0, "entry cancellation leaves a private schema behind")
            end
        end)
    end)
end

return { run = test.run_cases(define), blocked = blocked }
