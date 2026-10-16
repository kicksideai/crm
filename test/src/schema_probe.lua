local mutation = require("mutation")
local schema = require("schema")
local contract = require("contract")
local security = require("security")
local types = require("types")

local function run(input: unknown): (unknown?, error?)
    if type(input) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "input is required" }) end
    local request = input :: { [string]: unknown }
    local crm_id = type(request.crm_id) == "string" and request.crm_id or ""
    if crm_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    if request.operation == "apply" then
        return mutation.apply(crm_id, request.declaration, request.expected_revision)
    elseif request.operation == "export" then
        return schema.export_config(crm_id, {})
    elseif request.operation == "import" then
        return mutation.import_config(crm_id, request.artifact, request.expected_revision)
    elseif request.operation == "load" then
        return schema.load(crm_id)
    end
    local threads, open_err = (contract.get("kickside.core:threads") :: any)
        :with_actor(security.actor()):with_scope(security.scope()):open()
    if not threads then return nil, open_err end
    local ensured, thread_err = threads:ensure_thread({ component_id = crm_id, impl_id = types.CRM_IMPL })
    if not ensured then return nil, thread_err end
    local applied, apply_err = mutation.ensure_object_type(crm_id, request.definition, request.expected_revision)
    if not applied then return nil, apply_err end
    local current, load_err = schema.load(crm_id)
    if not current then return nil, load_err end
    return { applied = applied, schema = current }, nil
end

return { run = run }
