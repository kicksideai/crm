local funcs = require("funcs")
local registry = require("registry")
local sql = require("sql")
local channel = require("channel")
local ctx = require("ctx")
local uuid = require("uuid")
local time = require("time")

local function apply(entry)
    for attempt = 1, 3 do
        local snapshot = assert(registry.snapshot())
        local changes = snapshot:changes()
        changes:update(entry)
        local applied, err = changes:apply()
        if applied then return end
        if tostring(err) ~= "registry moved since the plan was computed" or attempt == 3 then
            error(err)
        end
    end
end

local function execute(db: sql.DB, statement: string)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

local function supervise(input)
    local events = process.events()
    assert(process.monitor(input.owner))
    assert(process.send(input.owner, input.reply, { kind = "started", pid = tostring(process.pid()) }))
    local original = assert(registry.get(input.database))
    local isolated = assert(registry.get(input.isolated))
    local schema_name = "database_fixture_" .. uuid.v4():gsub("-", "")
    local admin = nil
    local schema_created = false
    local changed = false
    local command = nil
    local owner_exits = false
    local result = nil
    local ok, failure = xpcall(function()
        if isolated.kind == "db.sql.postgres" then
            admin = assert(sql.get(input.isolated))
            execute(admin, 'CREATE SCHEMA "' .. schema_name .. '"')
            schema_created = true
            isolated.data.options = isolated.data.options or {}
            isolated.data.options.search_path = schema_name
        end
        isolated.id = input.database
        apply(isolated)
        changed = true
        input.context.database_fixture_pid = tostring(process.pid())
        command = assert(funcs.new():with_context(input.context):async(input.target, input.args))
        while true do
            local selected = channel.select({ command:response():case_receive(), events:case_receive() })
            if selected.channel == command:response() then
                local payload, err = command:result()
                if err then error(tostring(err)) end
                result = payload:data()
                break
            end
            local event = selected.value
            if event.kind == process.event.EXIT and tostring(event.from) == input.owner then
                owner_exits = true
                assert(command:cancel())
                local settled = channel.select({ command:response():case_receive(), time.after("5s"):case_receive() })
                assert(settled.channel == command:response(), "isolated database command does not settle after cancellation")
                break
            end
        end
    end, function(err) return tostring(err) end)
    local clean, cleanup_failure = xpcall(function()
        if changed then apply(original) end
        if admin then
            if schema_created then execute(admin, 'DROP SCHEMA "' .. schema_name .. '" CASCADE') end
            admin:release()
        end
    end, function(err) return tostring(err) end)
    if not clean then error(tostring(failure or "") .. " cleanup: " .. tostring(cleanup_failure)) end
    if not ok then error(failure) end
    if not owner_exits then
        assert(process.send(input.owner, input.reply, { kind = "result", value = result }))
    end
end

local function run(input)
    local reply = "fixture.database." .. uuid.v4()
    local mailbox = process.listen(reply, { message = true })
    local events = process.events()
    local pid = assert(process.spawn_monitored("app:isolated_database_owner", "app:processes", {
        owner = tostring(process.pid()), reply = reply, context = assert(ctx.all()), args = input.args,
        target = input.target, database = input.database, isolated = input.isolated,
    }))
    local started = mailbox:receive():payload():data()
    assert(started.kind == "started", "database fixture start acknowledgment is invalid")
    assert(started.pid == pid, "database fixture acknowledgment names a different process")
    local result = nil
    while true do
        local selected = channel.select({ mailbox:case_receive(), events:case_receive() })
        if selected.channel == mailbox then result = selected.value:payload():data().value end
        if selected.channel == events and selected.value.kind == process.event.EXIT
            and tostring(selected.value.from) == pid then
            if selected.value.result and selected.value.result.error then error(tostring(selected.value.result.error)) end
            if not result then
                local received = channel.select({ mailbox:case_receive(), time.after("5s"):case_receive() })
                assert(received.channel == mailbox, "isolated database owner exits without a result")
                result = received.value:payload():data().value
            end
            process.unlisten(mailbox)
            assert(result, "isolated database owner sends no result")
            return result
        end
    end
end

return { run = run, supervise = supervise, apply = apply }
