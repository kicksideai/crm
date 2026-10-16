-- Which caller may resolve the CRM's database, and what a refusal says.
--
-- The CRM reads a registry entry to learn which SQL resource it runs on, and
-- that read happens under the CALLER's own scope. A host grants an authenticated
-- user registry reads over the engine's namespaces and nothing under a product
-- one, so unless this module ships the grant itself, every request from a person
-- who is not an administrator is refused at the first query -- and the wildcard
-- policy the rest of this suite runs under would never show it.
--
-- The second property is the message. A refusal reported as a missing
-- configuration sends an operator to edit settings that are already correct, so
-- the two answers must not collapse into one sentence.
local funcs = require("funcs")
local security = require("security")
local test = require("test")
local types = require("types")

local PROBE = "app:db_id_probe"
local SURFACE_PROBE = "app:surface_probe"

type Map = { [string]: unknown }

local function map(value: unknown): Map
    return type(value) == "table" and (value :: Map) or {}
end

-- The scope a plain user carries: the module's own policies and the runtime
-- primitives a host grants, with no wildcard and no administrator group.
local function plain_scope(policy_ids: { string }): security.Scope
    local policies: { any } = {}
    for _, id in ipairs(policy_ids) do
        policies[#policies + 1] = assert(security.policy(id), id)
    end
    return assert(security.new_scope(policies)) :: security.Scope
end

local function resolve_as(policy_ids: { string }): Map
    local result, err = funcs.new()
        :with_actor(security.new_actor("80000000-0000-4000-8000-000000000001", {
            user_id = "80000000-0000-4000-8000-000000000001", status = "active",
            security_groups = { "app.security:user" },
        }))
        :with_scope(plain_scope(policy_ids))
        :call(PROBE, {})
    test.is_nil(err)
    return map(result)
end

local WITH_CONFIG: { string } = {
    "app:plain_user.registry",
    "app:plain_user.data",
    "kickside.crm.security:crm_config_read",
}
local WITH_SURFACES: { string } = {
    "app:plain_user.registry",
    "app:plain_user.data",
    "kickside.crm.security:crm_surface_discovery",
}

local function discover_as(policy_ids: { string }, input: Map): Map
    local result, err = funcs.new()
        :with_actor(security.new_actor("80000000-0000-4000-8000-000000000001", {
            user_id = "80000000-0000-4000-8000-000000000001", status = "active",
            security_groups = { "app.security:user" },
        }))
        :with_scope(plain_scope(policy_ids))
        :call(SURFACE_PROBE, input)
    test.is_nil(err)
    return map(result)
end

local function list(value: unknown): { unknown }
    return type(value) == "table" and (value :: { unknown }) or {}
end
local WITHOUT_CONFIG: { string } = { "app:plain_user.registry", "app:plain_user.data" }

local function define_tests()
    test.describe("CRM database resolution for a plain user", function()
        test.it("resolves the database when the module's own config grant is in scope", function()
            local answer = resolve_as(WITH_CONFIG)
            test.eq(answer.ok, true, tostring(answer.error))
            test.eq(answer.db_id, "app:db")
        end)

        test.it("names a refused read a permission failure, never a missing configuration", function()
            local answer = resolve_as(WITHOUT_CONFIG)
            test.eq(answer.ok, false, "a caller with no configuration grant resolved the CRM database")
            local message = tostring(answer.error)
            test.is_true(message:find("not configured", 1, true) == nil,
                "a refused registry read reported itself as a missing configuration: " .. message)
            test.is_true(message:find("not allowed", 1, true) ~= nil,
                "a refused registry read did not name the refusal: " .. message)
        end)

        -- The third answer, and the one the two above cannot reach: a registry
        -- that has no such entry. That is not a scope this caller is missing --
        -- it is the same thing as an entry carrying no db_id, namely that nobody
        -- configured the CRM's database. Reporting it as an unreadable entry
        -- sends an operator to widen a grant that was never the problem.
        test.it("reads a missing entry as unconfigured rather than as an unreadable one", function()
            -- The seam is restored before anything is asserted, so a failing
            -- expectation cannot leave a stub registry behind for the suite.
            local restore = types._registry
            types._registry = { get = function(_id: string): (any, any)
                return nil, errors.new({
                    message = "entry not found: " .. tostring(types.DB_CONFIG),
                    kind = errors.NOT_FOUND,
                })
            end }
            local ok, result = pcall(function(): string return types.db_id() end)
            types._registry = restore

            test.is_false(ok, "a registry with no configuration entry resolved a database anyway")
            local message = tostring(result)
            test.is_true(message:find("not configured", 1, true) ~= nil, message)
            test.is_true(message:find("could not be read", 1, true) == nil,
                "a missing entry reported itself as a failed read: " .. message)
        end)
    end)

    -- The shell's navigation and its by-tag component lookup are registry reads
    -- made under the CALLER, and the engine filters every result of a find
    -- through registry.get on that entry. An announced surface a caller may not
    -- read is a surface that does not exist for them: no nav entry, and a direct
    -- route that renders "surface not available".
    test.describe("CRM surfaces a plain user can discover", function()
        test.it("finds the navigation entry the shell renders", function()
            local answer = discover_as(WITH_SURFACES, { meta_type = "ui.nav_item" })
            test.eq(answer.ok, true, tostring(answer.error))
            local found = false
            for _, raw in ipairs(list(answer.ids)) do
                if tostring(raw) == "kickside.crm.surface:nav_item" then found = true end
            end
            test.is_true(found, "the CRM navigation entry is invisible to a plain user")
        end)

        test.it("reads the user-facing views, and not the administration surfaces", function()
            for _, entry_id in ipairs({
                "kickside.crm.surface:surface_view",
                "kickside.crm.surface:record_picker_view",
                "kickside.crm.surface:merge_review_view",
            }) do
                local answer = discover_as(WITH_SURFACES, { entry_id = entry_id })
                test.eq(answer.ok, true, entry_id .. ": " .. tostring(answer.error))
            end

            -- Administration is an administrator's surface. Discovering it would
            -- render a settings tab whose every endpoint then refuses the caller.
            for _, entry_id in ipairs({
                "kickside.crm.surface:settings_view",
                "kickside.crm.surface:settings_tab",
                "kickside.crm.persist:repo",
            }) do
                local answer = discover_as(WITH_SURFACES, { entry_id = entry_id })
                test.eq(answer.ok, false, entry_id .. " was opened by the surface grant")
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
