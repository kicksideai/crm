-- The CRM agent surface an MCP client or agent works through: locating or
-- creating a CRM, authoring its schema, and writing records with their links.
-- Every call goes through the registered tool exactly as an agent makes it.
local actors = require("actors")
local funcs = require("funcs")
local json = require("json")
local registry = require("registry")
local security = require("security")
local test = require("test")
local uuid = require("uuid")

type Map = { [string]: unknown }
type Executor = { call: (self: Executor, target: string, input: Map) -> (unknown?, unknown?) }
type ToolEntry = { meta: { input_schema: string } }

local CREATE = "app:create_probe"
local SCHEMA = "app:schema_probe"
local TOOLS = "kickside.crm.traits:"

local function map(value: unknown): Map return type(value) == "table" and value :: Map or {} end
local function list(value: unknown): { unknown } return type(value) == "table" and value :: { unknown } or {} end

local function scope(): security.Scope
    return assert(security.new_scope({ assert(security.policy("app:user")) })) :: security.Scope
end

local function executor(): Executor
    return funcs.new():with_actor(actors.make(uuid.v4())):with_scope(scope()) :: Executor
end

local function call(execute: Executor, tool: string, input: Map): Map
    local raw, err = execute:call(TOOLS .. tool, input)
    test.is_nil(err, tostring(err))
    local answer = map(raw)
    test.eq(answer.success, true, tostring(answer.error))
    return answer
end

local function declaration(): Map
    return {
        version = "agent-surface-v1",
        objects = {
            { id = "company", type = "company", label = "Company", plural = "Companies" },
            { id = "person", type = "person", label = "Contact", plural = "Contacts" },
        },
        attributes = {
            { id = "company-name", object_type = "company", attr = "name", data_type = "text", config = { required = true } },
            { id = "person-name", object_type = "person", attr = "name", data_type = "text", config = { required = true } },
            { id = "person-company", object_type = "person", attr = "company", data_type = "relation",
                config = { required = true, cardinality = "one", target = { kind = "record", object_type = "company" } } },
        },
        pipelines = { { collection_id = "contacts", object_type = "person", label = "Contacts", stages = {
            { stage_id = "new", label = "New" }, { stage_id = "met", label = "Met" },
        } } },
        views = {}, policies = {}, merge_config = {},
    }
end

local function create_crm(execute: Executor, title: string): string
    local created, err = execute:call(CREATE, { title = title, idempotency_key = uuid.v4() })
    test.is_nil(err, tostring(err))
    local crm_id = tostring(map(created).component_id or "")
    test.is_true(crm_id ~= "")
    return crm_id
end

local function fixture(): (Executor, string)
    local execute = executor()
    local crm_id = create_crm(execute, "Agent surface")
    local _, schema_err = execute:call(SCHEMA, { crm_id = crm_id, operation = "apply", declaration = declaration() })
    test.is_nil(schema_err, tostring(schema_err))
    return execute, crm_id
end

local function company_ref(id: string): Map
    return { kind = "record", type = "company", id = id }
end

local function input_properties(tool: string): Map
    local entry, err = registry.get(TOOLS .. tool)
    test.is_nil(err, tostring(err))
    local decoded, decode_err = json.decode((entry :: ToolEntry).meta.input_schema)
    test.is_nil(decode_err, tostring(decode_err))
    return map(map(decoded).properties)
end

local function define_tests()
    test.describe("CRM agent surface: locating a CRM", function()
        test.it("works on the caller's only CRM when crm_id is omitted", function()
            local execute, crm_id = fixture()
            local page = call(execute, "list_records", { object_type = "company" })
            test.eq(page.total, 0)
            local created = call(execute, "create_record", { object_type = "company", values = { name = "Acme" } })
            local record = map(call(execute, "get_record", { crm_id = crm_id, record_id = tostring(created.record_id) }).record)
            test.eq(map(record.values).name, "Acme")
        end)

        test.it("names each readable CRM when crm_id is omitted and several exist", function()
            local execute = executor()
            local first = create_crm(execute, "Sales")
            local second = create_crm(execute, "Hiring")
            local raw, err = execute:call(TOOLS .. "list_records", { object_type = "company" })
            test.is_nil(err, tostring(err))
            local answer = map(raw)
            test.eq(answer.success, false)
            test.contains(tostring(answer.error), first)
            test.contains(tostring(answer.error), second)
            test.contains(tostring(answer.error), "Hiring")
        end)

        test.it("points to CRMCreate when the caller has no CRM", function()
            local raw, err = executor():call(TOOLS .. "list_records", { object_type = "company" })
            test.is_nil(err, tostring(err))
            local answer = map(raw)
            test.eq(answer.success, false)
            test.contains(tostring(answer.error), "CRMCreate")
        end)

        test.it("lists the CRMs the caller can read", function()
            local execute = executor()
            local crm_id = create_crm(execute, "Deal flow")
            local crms = list(call(execute, "list_crms", {}).crms)
            test.eq(#crms, 1)
            test.eq(map(crms[1]).crm_id, crm_id)
            test.eq(map(crms[1]).title, "Deal flow")
        end)

        test.it("creates a CRM once per idempotency key", function()
            local execute = executor()
            local created = call(execute, "create_crm", { title = "Deal flow", idempotency_key = "deal-flow" })
            test.eq(created.title, "Deal flow")
            test.eq(created.replayed, false)
            local again = call(execute, "create_crm", { title = "Deal flow", idempotency_key = "deal-flow" })
            test.eq(again.crm_id, created.crm_id)
            test.eq(again.replayed, true)
            test.eq(#list(call(execute, "list_crms", {}).crms), 1)
        end)
    end)

    test.describe("CRM agent surface: schema authoring", function()
        test.it("applies an agent-authored declaration that carries no source hash", function()
            local execute = fixture()
            local artifact = map(call(execute, "schema.get", {}).schema)
            local metadata = map(artifact.metadata)
            metadata.sourceHash = nil
            artifact.serialized = nil
            local spec = map(artifact.spec)
            local attributes = list(spec.attributes)
            attributes[#attributes + 1] = {
                portableKey = "attribute/company/website", object_type = "company", attr = "website",
                data_type = "text", label = "Website", config = {},
            }
            local applied = call(execute, "schema.apply", { artifact = artifact, expected_revision = metadata.revision })
            test.eq(applied.changed, true)
            local again = map(call(execute, "schema.get", {}).schema)
            local found = false
            for _, raw in ipairs(list(map(again.spec).attributes)) do
                if map(raw).attr == "website" then found = true end
            end
            test.is_true(found)
        end)

        test.it("refuses a field alias the CRM cannot match on", function()
            local execute = fixture()
            local artifact = map(call(execute, "schema.get", {}).schema)
            local attributes = list(map(artifact.spec).attributes)
            attributes[#attributes + 1] = {
                portableKey = "attribute/company/website", object_type = "company", attr = "website",
                data_type = "url", label = "Website", config = { alias = "website" },
            }
            local applied, err = execute:call(TOOLS .. "schema.apply", { artifact = artifact })
            test.is_nil(applied)
            test.contains(tostring(err), "unsupported alias type: website")
        end)

        test.it("accepts each alias type the CRM matches on", function()
            local execute = fixture()
            local artifact = map(call(execute, "schema.get", {}).schema)
            local attributes = list(map(artifact.spec).attributes)
            for _, alias in ipairs({ "email", "domain", "phone", "linkedin", "external:hubspot" }) do
                local attr = "alias_" .. alias:gsub("[^%w]", "_")
                attributes[#attributes + 1] = {
                    portableKey = "attribute/company/" .. attr, object_type = "company", attr = attr,
                    data_type = "text", label = attr, config = { alias = alias },
                }
            end
            call(execute, "schema.apply", { artifact = artifact })
        end)

        test.it("declares every argument schema.apply reads", function()
            local properties = input_properties("schema.apply")
            test.not_nil(properties.artifact)
            test.not_nil(properties.expected_revision)
        end)
    end)

    test.describe("CRM agent surface: records with links", function()
        test.it("generates record ids prefixed with the object type", function()
            local execute = fixture()
            local created = call(execute, "create_record", { object_type = "company", values = { name = "Acme" } })
            test.eq(tostring(created.record_id):sub(1, 8), "company:")
        end)

        test.it("creates a record with its required relation in one call", function()
            local execute, crm_id = fixture()
            local company = call(execute, "create_record", { object_type = "company", values = { name = "Acme" } })
            local person = call(execute, "create_record", { object_type = "person", values = {
                name = "Ada", company = company_ref(tostring(company.record_id)),
            } })
            local record = map(call(execute, "get_record", { crm_id = crm_id, record_id = tostring(person.record_id) }).record)
            test.eq(map(list(map(record.values).company)[1]).id, company.record_id)
        end)

        test.it("refuses a record whose required relation is missing", function()
            local execute = fixture()
            local created, err = execute:call(TOOLS .. "create_record", { object_type = "person", values = { name = "Ada" } })
            test.is_nil(created)
            test.contains(tostring(err), "required")
        end)

        test.it("creates related records in one batch, linking to records earlier in the batch", function()
            local execute = fixture()
            local result = call(execute, "create_records", { records = {
                { object_type = "company", record_id = "company:acme", values = { name = "Acme" } },
                { object_type = "person", values = { name = "Ada", company = company_ref("company:acme") } },
                { object_type = "person", values = { name = "Grace", company = company_ref("company:acme") } },
            } })
            local ids = list(result.record_ids)
            test.eq(#ids, 3)
            test.eq(ids[1], "company:acme")
            test.eq(tostring(ids[2]):sub(1, 7), "person:")
            local person = map(call(execute, "get_record", { record_id = tostring(ids[3]) }).record)
            test.eq(map(list(map(person.values).company)[1]).id, "company:acme")
            test.eq(call(execute, "list_records", { object_type = "person" }).total, 2)
        end)

        test.it("writes nothing from a batch that holds one invalid record", function()
            local execute = fixture()
            local result, err = execute:call(TOOLS .. "create_records", { records = {
                { object_type = "company", values = { name = "Acme" } },
                { object_type = "person", values = { name = "Orphan" } },
            } })
            test.is_nil(result)
            test.contains(tostring(err), "required")
            test.eq(call(execute, "list_records", { object_type = "company" }).total, 0)
        end)

        test.it("declares every argument create_records reads", function()
            local properties = input_properties("create_records")
            test.not_nil(properties.records)
            test.not_nil(properties.crm_id)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
