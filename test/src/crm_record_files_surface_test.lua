-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- record.files / record.file_image (ATN-98) through the registered functions a
-- module without a CRM dependency calls, on a real CRM, uploads store and the
-- test provider's attachment.fetcher declaration.
local channel = require("channel")
local actors = require("actors")
local funcs = require("funcs")
local json = require("json")
local security = require("security")
local sql = require("sql")
local test = require("test")
local time = require("time")
local uuid = require("uuid")
local trusted_reader = require("trusted_reader")

type Map = { [string]: unknown }
type Executor = { async: any, call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?) }

local CREATE = "app:create_probe"
local SCHEMA = "app:schema_probe"
local WRITER = "app:writer_probe"
local TOOLS = "kickside.crm.traits:"

local function map(value: unknown): Map return type(value) == "table" and value :: Map or {} end
local function list(value: unknown): { unknown } return type(value) == "table" and value :: { unknown } or {} end

local function executor(): Executor
    local scope = assert(security.new_scope({ assert(security.policy("app:user")) }))
    return funcs.new():with_actor(actors.make(uuid.v4())):with_scope(scope) :: Executor
end

local function declaration(provider: string?): Map
    return {
        version = "record-files-v1",
        objects = { { id = "person", type = "person", label = "Contact", plural = "Contacts" } },
        attributes = {
            { id = "person-name", object_type = "person", attr = "name", data_type = "text", config = {} },
            { id = "person-files", object_type = "person", attr = "file_url", data_type = "text",
                config = { attachment = { provider = provider or "test" } } },
        },
        pipelines = {}, views = {}, policies = {}, merge_config = {},
    }
end

local function call(execute: Executor, tool: string, input: Map): Map
    local raw, err = execute:call(TOOLS .. tool, input)
    test.is_nil(err, tostring(err))
    return map(raw)
end

-- fixture(provider?) -> executor, crm_id, record_id of a person whose file_url
-- holds "11;22", the field marked for provider (default "test").
local function fixture(provider: string?): (Executor, string, string)
    local execute = executor()
    local created, err = execute:call(CREATE, { title = "Files", idempotency_key = uuid.v4() })
    test.is_nil(err, tostring(err))
    local crm_id = tostring(map(created).component_id)
    local _, schema_err = execute:call(SCHEMA, { crm_id = crm_id, operation = "apply", declaration = declaration(provider) })
    test.is_nil(schema_err, tostring(schema_err))
    local person = call(execute, "create_record", { crm_id = crm_id, object_type = "person",
        values = { name = "Ada", file_url = "11; 22" } })
    test.eq(person.success, true, tostring(person.error))
    return execute, crm_id, tostring(person.record_id)
end

local SINK = "kickside.crm.files:attachments_write"
local ON_COMPLETE = "kickside.crm.files:on_upload_complete"
local BACKFILL = "kickside.crm.files:backfill"
local READ_REFERENCES = "kickside.crm.read:references"

-- deliver(...) -- as kickside.sync delivers: sink_op is the source item's op,
-- upsert or delete (kickside/platform/sync/src/round/consumer.lua).
local function deliver(execute: Executor, crm_id: string, record_id: string, sink_op: string?): Map
    local raw, err = execute:call(SINK, { config = { crm_id = crm_id }, sink_op = sink_op or "upsert",
        input = { record_id = "crm:" .. record_id } })
    test.is_nil(err, tostring(err))
    return map(raw)
end

local function files_of(execute: Executor, crm_id: string, record_id: string): { Map }
    local answer = call(execute, "record.files", { crm_id = crm_id, record_ref = record_id })
    test.eq(answer.success, true, tostring(answer.error))
    local out: { Map } = {}
    for _, file in ipairs(list(answer.files)) do out[#out + 1] = map(file) end
    return out
end

-- ready_upload(...) -> the upload id of ref "11" once its download settled.
local function ready_upload(execute: Executor, crm_id: string, record_id: string): string
    deliver(execute, crm_id, record_id)
    for _ = 1, 100 do
        local first = files_of(execute, crm_id, record_id)[1]
        if first.status == "ready" then return tostring(first.upload_id) end
        time.sleep("50ms")
    end
    error("ref 11 never became ready")
end

local function concurrent_deliver(execute: Executor, crm_id: string, record_id: string)
    local pending: { any } = {}
    for _ = 1, 2 do
        local cmd, err = execute:async(SINK, { config = { crm_id = crm_id }, sink_op = "upsert",
            input = { record_id = record_id } })
        test.is_nil(err, tostring(err))
        pending[#pending + 1] = cmd
    end
    for _, cmd in ipairs(pending) do
        local response = cmd:response()
        local deadline = time.after("60s")
        local selected = channel.select({ response:case_receive(), deadline:case_receive() })
        test.eq(selected.channel, response, "delivery times out")
        local payload, err = cmd:result()
        test.is_nil(err, tostring(err))
        test.eq(map(payload:data()).success, true)
    end
end

-- edge_to(...) -> the attrs of the record's active attachment edge to the upload.
local function edge_to(execute: Executor, crm_id: string, record_id: string, upload_id: string): Map
    local raw, err = execute:call(READ_REFERENCES, { crm_id = crm_id, from_ref = "crm:" .. record_id, include_inactive = false })
    test.is_nil(err, tostring(err))
    for _, row in ipairs(list(map(raw).rows)) do
        local edge = map(row)
        if edge.to_ref == "file:" .. upload_id then return map(edge.attrs) end
    end
    return {}
end

-- edges_of(...) -> every attachment edge of the record, inactive ones too, as
-- { upload_id, active, attrs }.
local function edges_of(execute: Executor, crm_id: string, record_id: string): { Map }
    local raw, err = execute:call(READ_REFERENCES, { crm_id = crm_id, from_ref = "crm:" .. record_id, include_inactive = true })
    test.is_nil(err, tostring(err))
    local out: { Map } = {}
    for _, row in ipairs(list(map(raw).rows)) do
        local edge = map(row)
        if edge.edge_type == "attachment" then
            out[#out + 1] = { upload_id = tostring(edge.to_ref):sub(6), active = edge.active, attrs = map(edge.attrs) }
        end
    end
    return out
end

local function linked_events(crm_id: string, upload_id: string): { Map }
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT body FROM kickside_event WHERE thread_id = $1 AND type = $2 ORDER BY seq",
        { crm_id, "kickside.crm.events:reference.linked" })
    db:release()
    test.is_nil(err, tostring(err))
    local out: { Map } = {}
    for _, row in ipairs(rows or {}) do
        local body = type(row.body) == "string" and map(json.decode(row.body)) or map(row.body)
        if body.to_ref == "file:" .. upload_id then out[#out + 1] = body end
    end
    return out
end

-- plant(...) -> the upload id of an attachment edge for ref "11" written as is.
local function plant(execute: Executor, crm_id: string, record_id: string, attrs: Map): string
    local upload_id = uuid.v4()
    local linked, err = execute:call(WRITER, { link_ref = true, crm_id = crm_id,
        from_ref = "crm:" .. record_id, edge_type = "attachment", to_ref = "file:" .. upload_id, attrs = attrs })
    test.is_nil(err, tostring(err))
    test.eq(map(linked).ok, true, tostring(map(linked).error))
    return upload_id
end

-- ref_11(edges, upload_id) -> the old edge to upload_id and the other edges of ref "11".
local function ref_11(edges: { Map }, upload_id: string): (Map, { Map })
    local old: Map = {}
    local others: { Map } = {}
    for _, edge in ipairs(edges) do
        if edge.upload_id == upload_id then old = edge
        elseif map(edge.attrs).ref == "11" then others[#others + 1] = edge end
    end
    return old, others
end

local function define_tests()
    test.describe("CRM record file downloads", function()
        test.it("reads the upload outcome despite a stale pre-ingest failure", function()
            local execute, crm_id, record_id = fixture()
            local upload_id = ready_upload(execute, crm_id, record_id)
            local result, err = execute:call(WRITER, { link_ref = true, crm_id = crm_id,
                from_ref = "crm:" .. record_id, edge_type = "attachment", to_ref = "file:" .. upload_id,
                attrs = { provider = "test", ref = "11", attempt = 1,
                    error = "no_access", error_detail = "file access denied" } })
            test.is_nil(err, tostring(err))
            test.eq(map(result).ok, true)
            for _ = 1, 100 do
                local file = files_of(execute, crm_id, record_id)[1]
                if file.status == "ready" then
                    test.is_nil(file.error)
                    test.eq(file.text, "file 11")
                    return
                end
                time.sleep("50ms")
            end
            error("the stale delivery hides the completed upload")
        end)

        test.it("admits one upload per ref under concurrent deliveries", function()
            local execute, crm_id, record_id = fixture()
            concurrent_deliver(execute, crm_id, record_id)
            test.eq(#edges_of(execute, crm_id, record_id), 2)
            local db = assert(sql.get("app:db"))
            local rows, query_err = db:query("SELECT uuid FROM kickside_uploads WHERE metadata LIKE $1", { "%" .. crm_id .. "%" })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#(rows or {}), 2)
            for _ = 1, 100 do
                local out = files_of(execute, crm_id, record_id)
                if out[1].status == "ready" and out[2].status == "ready" then
                    for _, file in ipairs(out) do
                        test.eq(file.upload_id, (uuid.v5("6ba7b811-9dad-11d1-80b4-00c04fd430c8",
                            table.concat({ crm_id, record_id, "test", tostring(file.ref), "1" }, "\0"))))
                    end
                    for _, edge in ipairs(edges_of(execute, crm_id, record_id)) do
                        test.is_nil(map(edge.attrs).status)
                        test.is_nil(map(edge.attrs).error)
                    end
                    return
                end
                time.sleep("50ms")
            end
            error("concurrent uploads never become ready")
        end)

        test.it("retries a failed upload once and ignores its late callbacks and edges", function()
            local execute, crm_id, record_id = fixture()
            local old_id = ready_upload(execute, crm_id, record_id)
            local db = assert(sql.get("app:db"))
            local _, update_err = db:execute("UPDATE kickside_uploads SET storage_state = 'failed' WHERE uuid = $1", { old_id })
            db:release()
            test.is_nil(update_err, tostring(update_err))
            test.eq(files_of(execute, crm_id, record_id)[1].error, "conversion_failed")
            concurrent_deliver(execute, crm_id, record_id)
            local newest = files_of(execute, crm_id, record_id)[1]
            test.eq(newest.upload_id ~= old_id, true)
            local new_id = newest.upload_id
            test.eq(new_id, (uuid.v5("6ba7b811-9dad-11d1-80b4-00c04fd430c8",
                table.concat({ crm_id, record_id, "test", "11", "2" }, "\0"))))
            local old, others = ref_11(edges_of(execute, crm_id, record_id), old_id)
            test.eq(old.active, false)
            test.eq(#others, 1)
            test.eq(map(others[1].attrs).attempt, 2)
            for _, status in ipairs({ "completed", "error", "completed" }) do
                local answer, err = execute:call(ON_COMPLETE, { upload_id = old_id, status = status,
                    params = { crm_id = crm_id, record_id = record_id, upload_id = old_id,
                        attrs = { provider = "test", ref = "11", attempt = 1 } } })
                test.is_nil(err, tostring(err))
                test.eq(map(answer).changed, true)
                test.eq(files_of(execute, crm_id, record_id)[1].upload_id, new_id)
            end
            -- A stale delivery can relink its own identity, never the newer one.
            local linked, link_err = execute:call(WRITER, { link_ref = true, crm_id = crm_id,
                from_ref = "crm:" .. record_id, edge_type = "attachment", to_ref = "file:" .. old_id,
                attrs = { provider = "test", ref = "11", attempt = 1, status = "ready" } })
            test.is_nil(link_err, tostring(link_err))
            test.eq(map(linked).ok, true)
            test.eq(files_of(execute, crm_id, record_id)[1].upload_id, new_id)
            for _, tool in ipairs({ "record.file_image", "record.file_url" }) do
                local answer = call(execute, tool, { crm_id = crm_id, record_ref = record_id, upload_id = old_id })
                test.eq(answer.success, false)
                test.eq(tostring(answer.error):find("not a file of this record", 1, true) ~= nil, true)
            end
            deliver(execute, crm_id, record_id)
            local retired = ref_11(edges_of(execute, crm_id, record_id), old_id)
            test.eq(retired.active, false)
            local upload_db = assert(sql.get("app:db"))
            local rows, query_err = upload_db:query("SELECT uuid FROM kickside_uploads WHERE metadata LIKE $1",
                { "%" .. crm_id .. "%" })
            upload_db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#(rows or {}), 3, "two initial uploads and one retry")
            local retired_new, retire_err = execute:call(WRITER, { link_ref = true, crm_id = crm_id,
                from_ref = "crm:" .. record_id, edge_type = "attachment", to_ref = "file:" .. tostring(new_id),
                attrs = { provider = "test", ref = "11", attempt = 2 }, active = false })
            test.is_nil(retire_err, tostring(retire_err))
            test.eq(map(retired_new).ok, true)
            local stale_old, stale_err = execute:call(WRITER, { link_ref = true, crm_id = crm_id,
                from_ref = "crm:" .. record_id, edge_type = "attachment", to_ref = "file:" .. old_id,
                attrs = { provider = "test", ref = "11", attempt = 1, status = "ready" } })
            test.is_nil(stale_err, tostring(stale_err))
            test.eq(map(stale_old).ok, true)
            local hidden = files_of(execute, crm_id, record_id)[1]
            test.eq(hidden.status, "pending")
            test.is_nil(hidden.upload_id)
            deliver(execute, crm_id, record_id)
            local latest = files_of(execute, crm_id, record_id)[1]
            test.eq(latest.upload_id, (uuid.v5("6ba7b811-9dad-11d1-80b4-00c04fd430c8",
                table.concat({ crm_id, record_id, "test", "11", "3" }, "\0"))))
        end)

        test.it("refuses an unrelated caller's backfill even when no download is needed", function()
            local _, crm_id = fixture()
            local result, err = executor():call(BACKFILL, { crm_id = crm_id, object_type = "absent" })
            test.is_nil(result)
            test.not_nil(err)
        end)

        test.it("refuses an unrelated caller's delivery before creating uploads", function()
            local _, crm_id, record_id = fixture()
            local result = deliver(executor(), crm_id, record_id)
            local db = assert(sql.get("app:db"))
            local rows, query_err = db:query("SELECT uuid FROM kickside_uploads WHERE metadata LIKE $1", { "%" .. crm_id .. "%" })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#(rows or {}), 0)
            test.eq(result.success, false)
            test.eq(map(result.error).code, "permission_denied")
        end)

        -- The real uploads pipeline owns the state returned by record.files.
        test.it("downloads each promised file once", function()
            local execute, crm_id, record_id = fixture()
            local first = deliver(execute, crm_id, record_id)
            test.eq(first.success, true, tostring(map(first.error).message))
            test.eq(first.result, "updated")

            local downloaded = files_of(execute, crm_id, record_id)
            test.eq(#downloaded, 2)
            for _, file in ipairs(downloaded) do
                test.not_nil(file.upload_id)
                test.eq(file.status == "pending" or file.status == "ready", true, tostring(file.status))
            end
            test.eq(deliver(execute, crm_id, record_id).result, "noop")
            test.eq(deliver(execute, crm_id, record_id, "delete").result, "noop")
            test.eq(#files_of(execute, crm_id, record_id), 2)
        end)

        test.it("wakes consumers on completion and failure with identity attributes only", function()
            local execute, crm_id, record_id = fixture()
            local upload_id = ready_upload(execute, crm_id, record_id)
            local callback = { upload_id = upload_id, status = "completed",
                params = { crm_id = crm_id, record_id = record_id, upload_id = upload_id,
                    attrs = { provider = "test", ref = "11", attempt = 1, status = "ready", error = "stale" } } }
            for _, status in ipairs({ "completed", "completed", "error" }) do
                if status == "error" then
                    local db = assert(sql.get("app:db"))
                    local _, err = db:execute("UPDATE kickside_uploads SET storage_state = 'failed' WHERE uuid = $1", { upload_id })
                    db:release()
                    test.is_nil(err, tostring(err))
                end
                local before = #linked_events(crm_id, upload_id)
                callback.status = status
                local answer, err = execute:call(ON_COMPLETE, callback)
                test.is_nil(err, tostring(err))
                test.eq(map(answer).success, true)
                local events = linked_events(crm_id, upload_id)
                test.eq(#events > before, true, "settlement emits reference.linked")
                local body = events[#events]
                test.eq(body.from_ref, "crm:" .. record_id)
                test.eq(body.edge_type, "attachment")
                local attrs = map(body.attrs)
                test.eq(attrs.provider, "test")
                test.eq(attrs.ref, "11")
                test.eq(attrs.attempt, 1)
                local keys = 0
                for _ in pairs(attrs) do keys = keys + 1 end
                test.eq(keys, 3)
                local file = files_of(execute, crm_id, record_id)[1]
                test.eq(file.upload_id, upload_id)
                test.eq(file.status, status == "error" and "failed" or "ready")
                if status == "error" then test.eq(file.error, "conversion_failed") end
            end
            test.eq(#edges_of(execute, crm_id, record_id), 2)
            test.is_nil(edge_to(execute, crm_id, record_id, upload_id).status)
            test.is_nil(edge_to(execute, crm_id, record_id, upload_id).error)
        end)

        test.it("downloads a failed file again with the next attempt and retires the old edge", function()
            local execute, crm_id, record_id = fixture()
            local old_id = plant(execute, crm_id, record_id, { status = "failed", error = "download_failed",
                provider = "test", ref = "11", attempt = 1, updated_at = "2026-11-04T10:00:00Z" })
            test.eq(deliver(execute, crm_id, record_id).result, "updated")

            local old, others = ref_11(edges_of(execute, crm_id, record_id), old_id)
            test.eq(old.active, false)
            test.eq(#others, 1)
            test.eq(others[1].active, true)
            test.eq(map(others[1].attrs).attempt, 2)
        end)

        test.it("stops downloading a failed file after the last attempt", function()
            local execute, crm_id, record_id = fixture()
            local old_id = plant(execute, crm_id, record_id, { status = "failed", error = "download_failed",
                provider = "test", ref = "11", attempt = 3, updated_at = "2026-11-04T10:00:00Z" })
            deliver(execute, crm_id, record_id)

            local old, others = ref_11(edges_of(execute, crm_id, record_id), old_id)
            test.eq(old.active, true)
            test.eq(#others, 0)
        end)

        test.it("expires a pending edge older than a day and downloads the file again", function()
            local execute, crm_id, record_id = fixture()
            local old_id = plant(execute, crm_id, record_id, { status = "pending",
                provider = "test", ref = "11", attempt = 1, updated_at = "2020-01-01T00:00:00Z" })
            test.eq(deliver(execute, crm_id, record_id).result, "updated")

            local old, others = ref_11(edges_of(execute, crm_id, record_id), old_id)
            test.eq(old.active, false)
            test.eq(map(old.attrs).status, "pending")
            test.is_nil(map(old.attrs).error)
            test.eq(#others, 1)
            test.eq(map(others[1].attrs).attempt, 2)
        end)

        test.it("leaves a young pending edge alone", function()
            local execute, crm_id, record_id = fixture()
            local old_id = plant(execute, crm_id, record_id, { status = "pending",
                provider = "test", ref = "11", attempt = 1, updated_at = os.date("!%Y-%m-%dT%H:%M:%SZ") })
            deliver(execute, crm_id, record_id)

            local old, others = ref_11(edges_of(execute, crm_id, record_id), old_id)
            test.eq(old.active, true)
            test.eq(map(old.attrs).status, "pending")
            test.eq(#others, 0)
        end)

        test.it("downloads nothing again for a file whose duplicate live edge is pending", function()
            local execute, crm_id, record_id = fixture()
            plant(execute, crm_id, record_id, { status = "failed", error = "download_failed",
                provider = "test", ref = "11", attempt = 1, updated_at = "2026-11-04T10:00:00Z" })
            plant(execute, crm_id, record_id, { status = "pending",
                provider = "test", ref = "11", attempt = 1, updated_at = os.date("!%Y-%m-%dT%H:%M:%SZ") })
            deliver(execute, crm_id, record_id)

            local live = 0
            for _, edge in ipairs(edges_of(execute, crm_id, record_id)) do
                if map(edge.attrs).ref == "11" then
                    test.eq(edge.active, true)
                    live = live + 1
                end
            end
            test.eq(live, 2)
        end)

        test.it("records a provider refusal on the edge", function()
            local execute, crm_id, record_id = fixture()
            call(execute, "update_record", { crm_id = crm_id, object_type = "person", record_id = record_id,
                set = { file_url = "403" } })
            deliver(execute, crm_id, record_id)
            local out = files_of(execute, crm_id, record_id)
            test.eq(#out, 1)
            test.eq(out[1].status, "failed")
            test.eq(out[1].error, "no_access")
            test.eq(out[1].error_detail, "file access denied")
        end)

        test.it("fails an archive at once as an unsupported type", function()
            local execute, crm_id, record_id = fixture()
            call(execute, "update_record", { crm_id = crm_id, object_type = "person", record_id = record_id,
                set = { file_url = "zip" } })
            deliver(execute, crm_id, record_id)
            local out = files_of(execute, crm_id, record_id)
            test.eq(#out, 1)
            test.eq(out[1].status, "failed")
            test.eq(out[1].error, "unsupported_type")
            test.eq(deliver(execute, crm_id, record_id).result, "noop")
        end)

        test.it("backfills every record with an attachment field", function()
            local execute, crm_id = fixture()
            call(execute, "create_record", { crm_id = crm_id, object_type = "person", values = { name = "Bo", file_url = "33" } })
            call(execute, "create_record", { crm_id = crm_id, object_type = "person", values = { name = "Cy" } })
            local raw, err = execute:call(BACKFILL, { crm_id = crm_id })
            test.is_nil(err, tostring(err))
            local counts = map(raw)
            test.eq(counts.records, 3)
            test.eq(counts.downloaded, 3)
            test.eq(counts.failed, 0)
            test.eq(counts.errors, 0)
        end)

        test.it("goes on past records whose field value the provider cannot parse", function()
            local execute, crm_id = fixture()
            local bad = call(execute, "create_record", { crm_id = crm_id, object_type = "person",
                values = { name = "Bad", file_url = "bad" } })
            local crash = call(execute, "create_record", { crm_id = crm_id, object_type = "person",
                values = { name = "Crash", file_url = "crash" } })
            call(execute, "create_record", { crm_id = crm_id, object_type = "person", values = { name = "Cy", file_url = "33" } })
            local raw, err = execute:call(BACKFILL, { crm_id = crm_id })
            test.is_nil(err, tostring(err))
            local counts = map(raw)
            test.eq(counts.records, 4)
            test.eq(counts.downloaded, 3)
            test.eq(counts.failed, 0)
            test.eq(counts.errors, 2)
            local named: { [string]: string } = {}
            for _, row in ipairs(list(counts.error_records)) do named[tostring(map(row).record_id)] = tostring(map(row).error) end
            test.not_nil(named[tostring(bad.record_id)])
            test.eq(named[tostring(bad.record_id)]:find("value is too long", 1, true) ~= nil, true, named[tostring(bad.record_id)])
            test.not_nil(named[tostring(crash.record_id)])
        end)

        test.it("stops a backfill when the field's provider declares no fetcher", function()
            local execute, crm_id = fixture("ghost")
            local raw, err = execute:call(BACKFILL, { crm_id = crm_id })
            test.is_nil(raw)
            test.not_nil(err)
            test.eq(tostring(err):find("no attachment fetcher for provider ghost", 1, true) ~= nil, true, tostring(err))
        end)
    end)

    test.describe("CRM record files a field no longer names (#1118)", function()
        local function set_files(execute: Executor, crm_id: string, record_id: string, value: string)
            local answer = call(execute, "update_record", { crm_id = crm_id, object_type = "person",
                record_id = record_id, set = { file_url = value } })
            test.eq(answer.success, true, tostring(answer.error))
        end

        local function upload_of(out: { Map }, ref: string): string?
            for _, file in ipairs(out) do
                if file.ref == ref then return file.upload_id :: string? end
            end
            return nil
        end

        test.it("unlinks the edge of a file taken out of the field and keeps its upload", function()
            local execute, crm_id, record_id = fixture()
            deliver(execute, crm_id, record_id)
            local gone_id = upload_of(files_of(execute, crm_id, record_id), "22")
            test.not_nil(gone_id)

            set_files(execute, crm_id, record_id, "11")
            test.eq(deliver(execute, crm_id, record_id).result, "updated")

            local out = files_of(execute, crm_id, record_id)
            test.eq(#out, 1)
            test.eq(out[1].ref, "11")
            for _, edge in ipairs(edges_of(execute, crm_id, record_id)) do
                if edge.upload_id == gone_id then test.eq(edge.active, false) end
            end
            local kept = trusted_reader.provenance(gone_id :: string)
            test.not_nil(kept)
            test.eq(deliver(execute, crm_id, record_id).result, "noop")
        end)

        test.it("leaves out a file taken out of the field before its edge is unlinked", function()
            local execute, crm_id, record_id = fixture()
            deliver(execute, crm_id, record_id)
            local gone_id = upload_of(files_of(execute, crm_id, record_id), "22")
            set_files(execute, crm_id, record_id, "11")

            local out = files_of(execute, crm_id, record_id)
            test.eq(#out, 1)
            test.eq(out[1].ref, "11")
            local image = call(execute, "record.file_image", { crm_id = crm_id, record_ref = record_id,
                upload_id = gone_id })
            test.eq(image.success, false)
            test.eq(tostring(image.error):find("not a file of this record", 1, true) ~= nil, true, tostring(image.error))
        end)

        test.it("downloads a file put back into the field again", function()
            local execute, crm_id, record_id = fixture()
            deliver(execute, crm_id, record_id)
            local first_id = upload_of(files_of(execute, crm_id, record_id), "22")
            set_files(execute, crm_id, record_id, "11")
            deliver(execute, crm_id, record_id)

            set_files(execute, crm_id, record_id, "11; 22")
            test.eq(files_of(execute, crm_id, record_id)[2].status, "pending")
            test.eq(deliver(execute, crm_id, record_id).result, "updated")
            local again_id = upload_of(files_of(execute, crm_id, record_id), "22")
            test.not_nil(again_id)
            test.eq(again_id ~= first_id, true)
        end)

        test.it("keeps an edge of a provider no field of the record belongs to", function()
            local execute, crm_id, record_id = fixture()
            local other_id = plant(execute, crm_id, record_id, { status = "pending",
                provider = "other", ref = "77", attempt = 1, updated_at = "2026-11-04T09:00:00Z" })
            deliver(execute, crm_id, record_id)

            local out = files_of(execute, crm_id, record_id)
            test.eq(#out, 3)
            test.eq(out[3].upload_id, other_id)
            for _, edge in ipairs(edges_of(execute, crm_id, record_id)) do
                if edge.upload_id == other_id then test.eq(edge.active, true) end
            end
        end)
    end)

    test.describe("CRM record file links (#1115)", function()
        test.it("hands out a short-lived link to a ready file of the record", function()
            local execute, crm_id, record_id = fixture()
            local upload_id = ready_upload(execute, crm_id, record_id)
            local link = call(execute, "record.file_url", { crm_id = crm_id, record_ref = record_id, upload_id = upload_id })
            test.eq(link.success, true, tostring(link.error))
            test.eq(tostring(link.url):find(upload_id, 1, true) ~= nil, true, tostring(link.url))
            test.eq(link.expires_in, 300)
            test.eq(link.filename, "11.txt")
        end)

        test.it("refuses a link to a file taken out of the field", function()
            local execute, crm_id, record_id = fixture()
            local upload_id = ready_upload(execute, crm_id, record_id)
            call(execute, "update_record", { crm_id = crm_id, object_type = "person", record_id = record_id,
                set = { file_url = "22" } })
            local link = call(execute, "record.file_url", { crm_id = crm_id, record_ref = record_id, upload_id = upload_id })
            test.eq(link.success, false)
            test.eq(tostring(link.error):find("not a file of this record", 1, true) ~= nil, true, tostring(link.error))
        end)

        test.it("refuses a link to a caller without access to the CRM", function()
            local execute, crm_id, record_id = fixture()
            local upload_id = ready_upload(execute, crm_id, record_id)
            local link = call(executor(), "record.file_url", { crm_id = crm_id, record_ref = record_id, upload_id = upload_id })
            test.eq(link.success, false)
            test.is_nil(link.url)
        end)

        test.it("refuses a link to a file not downloaded yet", function()
            local execute, crm_id, record_id = fixture()
            local pending_id = plant(execute, crm_id, record_id, { status = "pending",
                provider = "test", ref = "11", attempt = 1, updated_at = "2026-11-04T09:00:00Z" })
            local link = call(execute, "record.file_url", { crm_id = crm_id, record_ref = record_id, upload_id = pending_id })
            test.eq(link.success, false)
        end)
    end)

    test.describe("CRM record files surface", function()
        test.it("lists the files the record's marked field promises as pending", function()
            local execute, crm_id, record_id = fixture()
            local answer = call(execute, "record.files", { crm_id = crm_id, record_ref = "crm:" .. record_id })
            test.eq(answer.success, true, tostring(answer.error))
            local files = list(answer.files)
            test.eq(#files, 2)
            test.eq(map(files[1]).ref, "11")
            test.eq(map(files[1]).provider, "test")
            test.eq(map(files[1]).field, "file_url")
            test.eq(map(files[1]).status, "pending")
            test.eq(map(files[2]).ref, "22")
        end)

        test.it("shows one file for two live edges of one file, the one furthest along", function()
            local execute, crm_id, record_id = fixture()
            plant(execute, crm_id, record_id, { status = "failed", error = "download_failed",
                provider = "test", ref = "11", attempt = 1, updated_at = "2026-11-04T10:00:00Z" })
            local pending_id = plant(execute, crm_id, record_id, { status = "pending",
                provider = "test", ref = "11", attempt = 1, updated_at = "2026-11-04T09:00:00Z" })
            plant(execute, crm_id, record_id, { status = "pending",
                provider = "other", ref = "77", attempt = 1, updated_at = "2026-11-04T09:00:00Z" })
            local later_id = plant(execute, crm_id, record_id, { status = "pending",
                provider = "other", ref = "77", attempt = 1, updated_at = "2026-11-04T11:00:00Z" })

            local files = files_of(execute, crm_id, record_id)
            test.eq(#files, 3)
            test.eq(files[1].ref, "11")
            test.eq(files[1].upload_id, pending_id)
            test.eq(files[1].status, "pending")
            test.eq(files[2].ref, "22")
            test.eq(files[3].ref, "77")
            test.eq(files[3].upload_id, later_id)
        end)

        test.it("never serves a ready edge whose upload does not exist", function()
            local execute, crm_id, record_id = fixture()
            local forged = uuid.v4()
            local linked, link_err = execute:call(WRITER, { link_ref = true, crm_id = crm_id,
                from_ref = "crm:" .. record_id, edge_type = "attachment", to_ref = "file:" .. forged,
                attrs = { status = "ready", provider = "test", ref = "11" } })
            test.is_nil(link_err, tostring(link_err))
            test.eq(map(linked).ok, true, tostring(map(linked).error))

            local answer = call(execute, "record.files", { crm_id = crm_id, record_ref = record_id })
            test.eq(answer.success, true, tostring(answer.error))
            local first = map(list(answer.files)[1])
            test.eq(first.upload_id, forged)
            test.eq(first.status, "pending")
            test.is_nil(first.error)
            test.is_nil(first.text)

            local image = call(execute, "record.file_image", { crm_id = crm_id, record_ref = record_id, upload_id = forged })
            test.eq(image.success, false)
        end)

        test.it("answers a caller without access to the CRM with a refusal", function()
            local _, crm_id, record_id = fixture()
            local answer = call(executor(), "record.files", { crm_id = crm_id, record_ref = record_id })
            test.eq(answer.success, false)
            test.is_nil(answer.files)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
