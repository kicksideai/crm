local actors = require("actors")
local registry = require("registry")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local contract = require("block_contract")
local lower = require("block_lower")
local test = require("test")

type Map = { [string]: unknown }
type List = {unknown}
type Created = { component_id: unknown }
type Preview = { priority: unknown, metadata: unknown }

local RESOLVE = "kickside.crm.blocks:resolve"
local MERGE_REVIEW = "kickside.crm.blocks:merge_review"
local CREATE_PROBE = "app:create_probe"
local BLOCK_PROBE = "app:block_probe"

local function actor(id: string): security.Actor
    return actors.make(id)
end

local function scope(): security.Scope
    local rule = assert(security.policy("app:user"))
    return assert(security.new_scope({ rule }))
end

local function map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function list(value: unknown): List
    return type(value) == "table" and (value :: List) or {}
end

local function entry(id: string): Map
    local value, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(value, id .. " is missing")
    return map(value)
end

local function define_tests()
    test.describe("CRM Blocks", function()
        test.it("declares the picker row id under the canonical crm_id config field", function()
            local block = map(map(entry(RESOLVE).data).block)
            local config = map(block.config)
            local fields = map(config.properties)
            local field = map(fields.crm_id)
            test.eq(field.picker, "wc-component-picker")
            test.eq(field.value_field, "id")
            test.is_nil(fields.thread_id)
            test.is_nil(contract.validate_instance(entry(RESOLVE), { crm_id = "crm-1" }))
            test.not_nil(contract.validate_instance(entry(RESOLVE), { thread_id = "crm-1" }))
        end)

        test.it("publishes exact valid function and wait Blocks", function()
            local resolve = entry(RESOLVE)
            local review = entry(MERGE_REVIEW)
            test.is_nil(contract.validate(resolve))
            test.is_nil(contract.validate(review))
            test.eq(map(resolve.meta).type, "kickside.block")
            test.eq(map(resolve.meta).title, "Resolve CRM record")
            test.eq(map(review.meta).type, "kickside.block")
            test.eq(map(review.meta).title, "Review CRM record merge")

            local resolve_plan, resolve_err = lower.plan(resolve, { config = { crm_id = "crm-1" } })
            test.is_nil(resolve_err)
            test.eq(map(resolve_plan).node_type, "userspace.dataflow.node.func:node")
            test.eq(map(map(resolve_plan).config).func_id, "kickside.crm.resolution:block_resolve")

            local review_plan, review_err = lower.plan(review, { config = { priority = "high", timeout = "30m" } })
            test.is_nil(review_err)
            test.eq(map(review_plan).node_type, "kickside.blocks:await")
            test.eq(map(map(review_plan).config).arm_id, "kickside.crm.resolution:merge_arm")
            test.eq(map(map(review_plan).config).block_config.timeout, "30m")
        end)

        test.it("owns declaration routes and rejects incomplete instance config", function()
            local resolve = entry(RESOLVE)
            local review = entry(MERGE_REVIEW)
            test.not_nil(contract.validate_instance(resolve, {}))
            test.is_nil(contract.validate_instance(resolve, { crm_id = "crm-1" }))
            test.is_nil(contract.validate_instance(review, {}))

            local ports = list(map(map(review.data).block).ports)
            test.eq(map(ports[1]).id, "merged")
            test.eq(map(ports[2]).id, "do_not_merge")
            test.eq(map(ports[3]).id, "skipped")
            test.eq(map(ports[4]).id, "failed")
            test.eq(#ports, 4)
        end)

        test.it("consumes the exact headless Block arm envelope", function()
            local execute = funcs.new():with_actor(actor(uuid.v4())):with_scope(scope())
            local created, create_err = execute:call(CREATE_PROBE, {
                idempotency_key = "crm-block:" .. uuid.v4(),
                title = "Block contract CRM",
            })
            test.is_nil(create_err)
            test.not_nil(created)

            local preview, preview_err = execute:call(BLOCK_PROBE, {
                crm_id = (created :: Created).component_id,
            })
            test.is_nil(preview_err)
            test.not_nil(preview)
            local typed_preview = preview :: Preview
            test.eq(typed_preview.priority, "high")
            local metadata = map(typed_preview.metadata)
            test.eq(metadata.dataflow_id, "df:block-contract")
            test.eq(metadata.signal_id, "signal:block-contract")
            test.eq(metadata.workflow_id, "workflow:block-contract")
            test.eq(metadata.run_id, "run:block-contract")
            test.eq(metadata.crm_id, (created :: Created).component_id)
            local context = map(metadata.context)
            local left = map(context.left)
            local right = map(context.right)
            test.eq(left.id, "entity:left")
            test.eq(map(left.values).name, "Left")
            test.eq(right.id, "entity:right")
            test.eq(map(right.values).name, "Right")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
