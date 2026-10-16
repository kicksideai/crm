local actors = require("actors")
-- Contract for the schema authority boundary: callers dispatch commands, one
-- actor performs the DDL, and optimistic revisions remain authoritative.

local funcs = require("funcs")
local mutation = require("mutation")
local security = require("security")
local test = require("test")
local uuid = require("uuid")

type UnknownMap = { [string]: unknown }
type SchemaState = { revision: unknown }
type LoadedSchema = {
    declaration: {
        pipelines: {UnknownMap},
        views: {UnknownMap},
    },
}
type SchemaProbeResult = { schema: LoadedSchema }

local function declaration(version: string, attr: string): UnknownMap
    return {
        version = version,
        objects = { { id = "company", type = "company", label = "Company", plural = "Companies" } },
        attributes = {
            { id = "company-" .. attr, object_type = "company", attr = attr, data_type = "text", config = { searchable = true } },
        },
        pipelines = {},
        views = {},
        policies = {},
        merge_config = {},
    }
end

local function actor(id: string): security.Actor
    return actors.make(id)
end

local function scope(): unknown
    return security.new_scope({ assert(security.policy("app:user")) })
end

local function define_tests()
    test.describe("CRM schema authority", function()
        test.it("applies repeated provisioning in order", function()
            local crm_id = tostring(uuid.v7())
            local first, first_err = mutation.provision(crm_id, declaration("v1", "name"))
            test.is_nil(first_err)
            test.not_nil(first)

            local second, second_err = mutation.provision(crm_id, declaration("v2", "display_name"))
            test.is_nil(second_err)
            test.not_nil(second)
            test.neq((first :: SchemaState).revision, (second :: SchemaState).revision)
        end)

        test.it("merges an object's fields, pipeline, and default view as one contribution", function()
            local crm_id = tostring(uuid.v7())
            local provisioned, provision_err = mutation.provision(crm_id, declaration("v1", "name"))
            test.is_nil(provision_err)
            test.not_nil(provisioned)

            local execute = funcs.new():with_actor(actor(crm_id)):with_scope(scope())
            local result, ensure_err = execute:call("app:schema_probe", {
                crm_id = crm_id,
                definition = {
                    object = { id = "opportunity", type = "opportunity", label = "Opportunity", plural = "Opportunities" },
                    attributes = {
                        { id = "opportunity-name", object_type = "opportunity", attr = "name", data_type = "text" },
                        { id = "opportunity-stage", object_type = "opportunity", attr = "stage", data_type = "select",
                            config = { choices = { "qualified", "won" } } },
                    },
                    pipelines = { {
                        collection_id = "opportunity_pipeline",
                        object_type = "opportunity",
                        label = "Opportunity pipeline",
                        stages = {
                            { stage_id = "qualified", label = "Qualified" },
                            { stage_id = "won", label = "Won" },
                        },
                    } },
                    views = { {
                        view_id = "opportunity_board",
                        object_type = "opportunity",
                        label = "Pipeline",
                        layout = "board",
                        collection_id = "opportunity_pipeline",
                    } },
                },
            })
            test.is_nil(ensure_err)
            test.not_nil(result)

            local loaded = (result :: SchemaProbeResult).schema
            test.eq(#loaded.declaration.pipelines, 1)
            test.eq(loaded.declaration.pipelines[1].collection_id, "opportunity_pipeline")
            test.eq(#loaded.declaration.views, 1)
            test.eq(loaded.declaration.views[1].view_id, "opportunity_board")
        end)

        test.it("applies a declaration and refuses a stale expected revision", function()
            local crm_id = tostring(uuid.v7())
            local provisioned, provision_err = mutation.provision(crm_id, declaration("v1", "name"))
            test.is_nil(provision_err)
            local base = (provisioned :: SchemaState).revision

            local applied, apply_err = mutation.apply(crm_id, declaration("v2", "display_name"), base)
            test.is_nil(apply_err)
            test.neq((applied :: SchemaState).revision, base)

            local stale, stale_err = mutation.apply(crm_id, declaration("v3", "title"), base)
            test.is_nil(stale)
            test.contains(tostring(stale_err), "CRM schema revision conflict")

            local unchanged, unchanged_err = mutation.apply(crm_id, declaration("v2", "display_name"), nil)
            test.is_nil(unchanged_err)
            test.eq((unchanged :: SchemaState).revision, (applied :: SchemaState).revision)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
