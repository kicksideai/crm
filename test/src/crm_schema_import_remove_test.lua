-- The portable artifact's explicit-destruction contract. A field's data type
-- never changes in place: the compiler refuses the silent rewrite, and the
-- artifact expresses the migration by naming the old field in spec.remove and
-- declaring its replacement. Removal is intent, never omission.

local funcs = require("funcs")
local security = require("security")
local actors = require("actors")
local schema = require("schema")
local mutation = require("mutation")
local test = require("test")
local uuid = require("uuid")

type UnknownMap = { [string]: unknown }

local function declaration(version: string, website_type: string): UnknownMap
    return {
        version = version,
        objects = { { id = "company", type = "company", label = "Company", plural = "Companies" } },
        attributes = {
            { id = "company-name", object_type = "company", attr = "name", data_type = "text", config = { searchable = true } },
            { id = "company-website", object_type = "company", attr = "website", data_type = website_type, config = {} },
        },
        pipelines = {},
        views = {},
        policies = {},
        merge_config = {},
    }
end

-- A portable artifact assembled the way an operator's tooling would, signed by
-- the module's own seal so the hash contract stays in one place.
local function artifact_for(version: string, website_type: string?, remove: unknown): UnknownMap
    local decl = declaration(version, website_type or "text")
    if website_type == nil then
        -- The removal step ships the artifact WITHOUT the field it removes.
        local kept: { UnknownMap } = {}
        for _, a in ipairs(decl.attributes :: { UnknownMap }) do
            if a.attr ~= "website" then kept[#kept + 1] = a end
        end
        decl.attributes = kept
    end
    for _, o in ipairs(decl.objects :: { UnknownMap }) do o.portableKey = "object/" .. tostring(o.type) end
    for _, a in ipairs(decl.attributes :: { UnknownMap }) do
        a.portableKey = "attribute/" .. tostring(a.object_type) .. "/" .. tostring(a.attr)
    end
    local art: UnknownMap = {
        apiVersion = "kickside.crm/config.v1",
        kind = "CRMConfig",
        metadata = { portableKey = "crm/default", revision = version },
        spec = {
            objectTypes = decl.objects,
            attributes = decl.attributes,
            pipelines = {},
            views = {},
            policies = {},
            mergeConfig = {},
        },
    }
    if remove ~= nil then (art.spec :: UnknownMap).remove = remove end
    local sealed, err = schema.seal(art)
    test.is_nil(err)
    return sealed :: UnknownMap
end

local function define_tests()
    test.describe("CRM choice-typed attributes", function()
        test.it("refuses a select without a vocabulary and one with an unbounded choice", function()
            local crm_id = tostring(uuid.v7())
            local base = declaration("v1", "text")
            local attrs = base.attributes :: { UnknownMap }

            -- No vocabulary: an open value set is a text attribute, never a select.
            attrs[#attrs + 1] = { id = "company-kind", object_type = "company", attr = "kind",
                data_type = "select", config = {} }
            local refused, rerr = mutation.provision(crm_id, base)
            test.is_nil(refused)
            test.contains(tostring(rerr), "requires a non-empty config.choices")

            -- An unbounded choice value would defeat the bounded-index invariant.
            attrs[#attrs] = { id = "company-kind", object_type = "company", attr = "kind",
                data_type = "select", config = { choices = { string.rep("x", 300) } } }
            local refused2, rerr2 = mutation.provision(crm_id, base)
            test.is_nil(refused2)
            test.contains(tostring(rerr2), "within 255 bytes")

            -- A proper closed vocabulary provisions.
            attrs[#attrs] = { id = "company-kind", object_type = "company", attr = "kind",
                data_type = "select", config = { choices = { "startup", "enterprise" } } }
            local ok, perr = mutation.provision(crm_id, base)
            test.is_nil(perr)
            test.not_nil(ok)
        end)
    end)

    test.describe("CRM unchanged portable import", function()
        test.it("preserves revision, source hash and authored version across repeated exports and imports", function()
            for _, version in ipairs({ "authored-v1", false }) do
                local execute = funcs.new():with_actor(actors.make(uuid.v4()))
                    :with_scope(assert(security.new_scope({ assert(security.policy("app:user")) })))
                local created, create_err = execute:call("app:create_probe", { title = "Northwind config", idempotency_key = tostring(uuid.v7()) })
                test.is_nil(create_err)
                local crm_id = tostring((created :: UnknownMap).component_id)
                local base = declaration("authored-v1", "text")
                if version == false then base.version = nil end
                local provisioned, provision_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "apply", declaration = base })
                test.is_nil(provision_err)
                test.not_nil(provisioned)
                for _ = 1, 2 do
                    local before, export_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "export" })
                    test.is_nil(export_err)
                    local metadata = (before :: UnknownMap).metadata :: UnknownMap
                    local imported, import_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "import", artifact = before, expected_revision = metadata.revision })
                    test.is_nil(import_err)
                    test.eq((imported :: UnknownMap).changed, false)
                    test.eq((imported :: UnknownMap).revision, metadata.revision)
                    local after, after_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "export" })
                    test.is_nil(after_err)
                    test.eq(((after :: UnknownMap).metadata :: UnknownMap).revision, metadata.revision)
                    test.eq(((after :: UnknownMap).metadata :: UnknownMap).sourceHash, metadata.sourceHash)
                    local loaded, load_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "load" })
                    test.is_nil(load_err)
                    test.eq((((loaded :: UnknownMap).declaration :: UnknownMap).version), base.version)
                end
            end
        end)
    end)

    test.describe("CRM portable import after removal", function()
        test.it("keeps an unchanged exported state a no-op after an explicit field removal", function()
            local execute = funcs.new():with_actor(actors.make(uuid.v4()))
                :with_scope(assert(security.new_scope({ assert(security.policy("app:user")) })))
            local created, create_err = execute:call("app:create_probe", { title = "Northwind removal", idempotency_key = tostring(uuid.v7()) })
            test.is_nil(create_err)
            local crm_id = tostring((created :: UnknownMap).component_id)
            local applied, apply_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "apply", declaration = declaration("v1", "text") })
            test.is_nil(apply_err)
            test.not_nil(applied)
            local exported, export_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "export" })
            test.is_nil(export_err)
            local artifact = exported :: UnknownMap
            local spec = artifact.spec :: UnknownMap
            local kept = {}
            for _, attr in ipairs(spec.attributes :: { UnknownMap }) do
                if attr.attr ~= "website" then kept[#kept + 1] = attr end
            end
            spec.attributes = kept
            spec.remove = { attributes = { { object_id = "company", field_id = "company-website" } } }
            local sealed, seal_err = schema.seal(artifact)
            test.is_nil(seal_err)
            local removed, removal_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "import", artifact = sealed,
                expected_revision = (artifact.metadata :: UnknownMap).revision })
            test.is_nil(removal_err)
            test.eq((removed :: UnknownMap).changed, true)
            local before, before_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "export" })
            test.is_nil(before_err)
            local metadata = (before :: UnknownMap).metadata :: UnknownMap
            local stale, stale_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "import", artifact = before,
                expected_revision = (artifact.metadata :: UnknownMap).revision })
            test.is_nil(stale)
            test.contains(tostring(stale_err), "CRM schema revision conflict")
            local imported, import_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "import", artifact = before, expected_revision = metadata.revision })
            test.is_nil(import_err)
            test.eq((imported :: UnknownMap).changed, false)
            test.eq((imported :: UnknownMap).revision, metadata.revision)
            local after, after_err = execute:call("app:schema_probe", { crm_id = crm_id, operation = "export" })
            test.is_nil(after_err)
            test.eq(((after :: UnknownMap).metadata :: UnknownMap).sourceHash, metadata.sourceHash)
        end)
    end)

    test.describe("CRM portable artifact removals", function()
        test.it("a type change ships as spec.remove plus the replacement declaration", function()
            local crm_id = tostring(uuid.v7())
            local provisioned, perr = mutation.provision(crm_id, declaration("v1", "text"))
            test.is_nil(perr)
            test.not_nil(provisioned)

            -- Without the removal, the compiler keeps refusing the rewrite.
            local refused, rerr = mutation.import_config(crm_id, artifact_for("v2", "url", nil), nil)
            test.is_nil(refused)
            test.contains(tostring(rerr), "explicit data migration")

            -- The migration is two explicit applies. First the removal: the
            -- artifact ships WITHOUT the field and names it in spec.remove.
            local removed, rem_err = mutation.import_config(crm_id, artifact_for("v2", nil,
                { attributes = { { object_id = "company", field_id = "company-website" } } }), nil)
            test.is_nil(rem_err)
            test.not_nil(removed)

            -- Then the replacement declaration lands as a fresh field.
            local applied, aerr = mutation.import_config(crm_id, artifact_for("v3", "url", nil), nil)
            test.is_nil(aerr)
            test.not_nil(applied)

            -- The stored type is url now: re-importing the same declaration is
            -- a no-op instead of a refused type change.
            local settled, serr = mutation.import_config(crm_id, artifact_for("v4", "url", nil), nil)
            test.is_nil(serr)
            test.not_nil(settled)

        end)

        -- Views and pipelines are declaration rows; their removal follows the
        -- same law -- destruction only by naming, a name resolving to nothing
        -- is an error -- and a removed view stays removed on the next apply
        -- because exports never re-emit remove.
        test.it("removes a named view and refuses a removal that names nothing", function()
            local crm_id = tostring(uuid.v7())
            local base = declaration("v1", "text")
            base.views = { { view_id = "stale-board", name = "Stale", layout = "table", object_type = "company", object_id = "company" } }
            local provisioned, perr = mutation.provision(crm_id, base)
            test.is_nil(perr)
            test.not_nil(provisioned)

            -- Removing a view that does not exist refuses loudly.
            local missing, missing_err = mutation.import_config(crm_id,
                artifact_for("v2", "text", { views = { "no-such-view" } }), nil)
            test.is_nil(missing)
            test.contains(tostring(missing_err), "view removal target not found")

            -- The named removal lands; the artifact ships WITHOUT the view.
            local removed, rem_err = mutation.import_config(crm_id,
                artifact_for("v3", "text", { views = { "stale-board" } }), nil)
            test.is_nil(rem_err)
            test.not_nil(removed)

            -- Re-applying the same viewless artifact is a clean no-op: the view
            -- does not resurrect and nothing asks to remove it twice.
            local settled, serr = mutation.import_config(crm_id, artifact_for("v4", "text", nil), nil)
            test.is_nil(serr)
            test.not_nil(settled)

        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
