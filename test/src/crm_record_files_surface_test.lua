-- record.files / record.file_image (ATN-98) through the registered functions a
-- module without a CRM dependency calls, on a real CRM, uploads store and the
-- test provider's attachment.fetcher declaration.
local actors = require("actors")
local funcs = require("funcs")
local security = require("security")
local test = require("test")
local uuid = require("uuid")

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

local function deliver(execute: Executor, crm_id: string, record_id: string): Map
    local raw, err = execute:call(SINK, { config = { crm_id = crm_id }, sink_op = "download",
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

local function define_tests()
    test.describe("CRM record file downloads", function()
        test.it("downloads each promised file once and settles it from the upload callback", function()
            local execute, crm_id, record_id = fixture()
            local first = deliver(execute, crm_id, record_id)
            test.eq(first.success, true, tostring(map(first.error).message))
            test.eq(first.result, "updated")

            local pending = files_of(execute, crm_id, record_id)
            test.eq(#pending, 2)
            test.eq(pending[1].status, "pending")
            test.not_nil(pending[1].upload_id)
            test.eq(deliver(execute, crm_id, record_id).result, "noop")

            local settled, err = execute:call(ON_COMPLETE, {
                upload_id = pending[1].upload_id, status = "completed", mime_type = "text/plain", size = 7,
                metadata = { filename = "11.txt" },
                params = { crm_id = crm_id, record_id = record_id, attrs = { provider = "test", ref = "11", attempt = 1 } },
            })
            test.is_nil(err, tostring(err))
            test.eq(map(settled).changed, true)

            local ready = files_of(execute, crm_id, record_id)
            test.eq(ready[1].status, "ready")
            test.eq(ready[1].filename, "11.txt")
            test.eq(ready[1].content_type, "text/plain")
            test.is_nil(ready[1].error, tostring(ready[1].error_detail))

            local again = map(execute:call(ON_COMPLETE, {
                upload_id = pending[1].upload_id, status = "completed", mime_type = "text/plain", size = 7,
                params = { crm_id = crm_id, record_id = record_id, attrs = { provider = "test", ref = "11", attempt = 1 } },
            }))
            test.eq(again.changed, false)
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
