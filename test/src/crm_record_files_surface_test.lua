-- record.files / record.file_image (ATN-98) through the registered functions a
-- module without a CRM dependency calls, on a real CRM, uploads store and the
-- test provider's attachment.fetcher declaration.
local actors = require("actors")
local funcs = require("funcs")
local security = require("security")
local test = require("test")
local uuid = require("uuid")
local download = require("download")
local read_model = require("read_model")

type Map = { [string]: unknown }
type Executor = { call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?) }

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

local function declaration(): Map
    return {
        version = "record-files-v1",
        objects = { { id = "person", type = "person", label = "Contact", plural = "Contacts" } },
        attributes = {
            { id = "person-name", object_type = "person", attr = "name", data_type = "text", config = {} },
            { id = "person-files", object_type = "person", attr = "file_url", data_type = "text",
                config = { attachment = { provider = "test" } } },
        },
        pipelines = {}, views = {}, policies = {}, merge_config = {},
    }
end

local function call(execute: Executor, tool: string, input: Map): Map
    local raw, err = execute:call(TOOLS .. tool, input)
    test.is_nil(err, tostring(err))
    return map(raw)
end

-- fixture() -> executor, crm_id, record_id of a person whose file_url holds "11;22".
local function fixture(): (Executor, string, string)
    local execute = executor()
    local created, err = execute:call(CREATE, { title = "Files", idempotency_key = uuid.v4() })
    test.is_nil(err, tostring(err))
    local crm_id = tostring(map(created).component_id)
    local _, schema_err = execute:call(SCHEMA, { crm_id = crm_id, operation = "apply", declaration = declaration() })
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
local SWEEP = "kickside.crm.files:sweep_write"

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
        -- The uploads pipeline runs for real here and settles a download's edge
        -- from its own completion callback, so the edge may already be ready.
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

        -- A pending edge to an upload id the pipeline never saw: only this
        -- test's callback settles it.
        test.it("settles a pending edge from the upload callback once", function()
            local execute, crm_id, record_id = fixture()
            local upload_id = uuid.v4()
            local attrs = { provider = "test", ref = "11", attempt = 1 }
            local linked, link_err = execute:call(WRITER, { link_ref = true, crm_id = crm_id,
                from_ref = "crm:" .. record_id, edge_type = "attachment", to_ref = "file:" .. upload_id,
                attrs = { status = "pending", provider = "test", ref = "11", attempt = 1 } })
            test.is_nil(link_err, tostring(link_err))
            test.eq(map(linked).ok, true, tostring(map(linked).error))

            local callback = {
                upload_id = upload_id, status = "completed", mime_type = "text/plain", size = 7,
                metadata = { filename = "11.txt" },
                params = { crm_id = crm_id, record_id = record_id, attrs = attrs },
            }
            local settled, err = execute:call(ON_COMPLETE, callback)
            test.is_nil(err, tostring(err))
            test.eq(map(settled).changed, true)

            local edge = edge_to(execute, crm_id, record_id, upload_id)
            test.eq(edge.status, "ready")
            test.eq(edge.filename, "11.txt")
            test.eq(edge.content_type, "text/plain")
            test.is_nil(edge.error, tostring(edge.error_detail))

            test.eq(map(execute:call(ON_COMPLETE, callback)).changed, false)
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
            test.eq(map(old.attrs).status, "failed")
            test.eq(map(old.attrs).error, "expired")
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

        test.it("sweeps a fresh record: retries its failed file and leaves its first download to the automation", function()
            local execute, crm_id, record_id = fixture()
            local old_id = plant(execute, crm_id, record_id, { status = "failed", error = "no_access",
                provider = "test", ref = "11", attempt = 1, updated_at = "2026-11-04T10:00:00Z" })
            local raw, err = execute:call(SWEEP, { config = { crm_id = crm_id }, sink_op = "upsert", input = {} })
            test.is_nil(err, tostring(err))
            local answer = map(raw)
            test.eq(answer.success, true, tostring(map(answer.error).message))
            test.eq(answer.result, "updated")
            test.eq(map(answer.counts).records, 1)
            test.eq(map(answer.counts).downloaded, 1)
            test.eq(map(answer.counts).skipped, 1)

            local edges = edges_of(execute, crm_id, record_id)
            local old, others = ref_11(edges, old_id)
            test.eq(old.active, false)
            test.eq(map(others[1].attrs).attempt, 2)
            for _, edge in ipairs(edges) do test.eq(map(edge.attrs).ref ~= "22", true, "ref 22 was downloaded") end
        end)

        test.it("refuses a sweep without a CRM", function()
            local raw = map(executor():call(SWEEP, { config = {}, sink_op = "upsert", input = {} }))
            test.eq(raw.success, false)
            test.eq(map(raw.error).code, "invalid_request")
        end)

        test.it("reads a record's creation time for the sweep's age gate", function()
            local _, crm_id, record_id = fixture()
            local record, err = read_model.internal_get_record(crm_id, record_id)
            test.is_nil(err, tostring(err))
            test.eq(download.too_fresh(map(record), 0), false)
            test.eq(download.too_fresh(map(record), download.SWEEP_FRESH_MS), true)
            test.eq(download.too_fresh(map(record), nil), false)
            test.eq(download.too_fresh({}, 0), true)
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

        test.it("ignores a callback for an upload the record does not hold", function()
            local execute, crm_id, record_id = fixture()
            local answer = map(execute:call(ON_COMPLETE, {
                upload_id = uuid.v4(), status = "completed",
                params = { crm_id = crm_id, record_id = record_id, attrs = { provider = "test", ref = "11" } },
            }))
            test.eq(answer.changed, false)
            test.eq(files_of(execute, crm_id, record_id)[1].status, "pending")
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

        test.it("refuses a ready edge to an upload this CRM did not write", function()
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
            test.eq(first.status, "failed")
            test.eq(first.error, "no_access")
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
