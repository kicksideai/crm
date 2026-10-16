local component = require("component")
local writer = require("writer")

local M = {}

type Map = { [string]: unknown }
type Service = {
    register: (self: Service, request: Map) -> (unknown?, unknown?),
}
type Result = { ok: boolean, error: unknown?, result: unknown? }

function M.run(value: unknown): Result
    local input: Map = type(value) == "table" and value :: Map or {}
    if input.register_target == true then
        local raw_service, service_err = component.get_service()
        if not raw_service then return { ok = false, error = tostring(service_err) } end
        if type(raw_service) ~= "table" and type(raw_service) ~= "userdata" then
            return { ok = false, error = "component service has invalid type" }
        end
        local service = raw_service :: Service
        local result, err = service:register({
            impl_id = input.impl_id,
            meta = { class = input.class, title = "Reference target" },
        })
        return { ok = type(result) == "table" and (result :: Map).success == true, error = err, result = result }
    end
    if input.catch_up == true then
        local result, err = writer.catch_up_read_model(tostring(input.crm_id or ""))
        return { ok = result ~= nil, error = err, result = result }
    end
    if input.delete_activity == true then
        local ok, err = writer.delete_activity(tostring(input.crm_id or ""), input.identity)
        return { ok = ok == true, error = err }
    end
    local ok, err, result = writer.append(tostring(input.crm_id or ""), input.commands)
    return { ok = ok == true, error = err, result = result }
end

return M
