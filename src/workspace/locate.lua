-- The CRMs a caller can read, and the canonical rule that picks one: an explicit
-- id, otherwise the caller's only readable CRM. Several readable CRMs with no
-- explicit id is an ambiguity the caller resolves; none is a missing CRM.
local component = require("component")
local types = require("types")

local M = {}

type ComponentMeta = { label: unknown?, title: unknown?, name: unknown? }
type ComponentRow = { component_id: unknown?, meta: unknown? }
type Located = { crm_id: string, label: string }

local function trim(v: unknown): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

function M.label(row: unknown): string
    local typed: ComponentRow = type(row) == "table" and (row :: ComponentRow) or {}
    local meta: ComponentMeta = type(typed.meta) == "table" and (typed.meta :: ComponentMeta) or {}
    local label = trim(meta.label)
    if label == "" then label = trim(meta.title) end
    if label == "" then label = trim(meta.name) end
    if label == "" then label = "CRM" end
    return label
end

-- readable lists the CRMs the caller can read, oldest first.
function M.readable(): ({ Located }?, error?)
    local rows, err = component.query({
        impl_ids = { types.CRM_IMPL },
        access_mask = component.ACCESS.READ,
        include = { meta = true },
        order_by = { field = "created_at", direction = "ASC" },
        limit = 50,
    })
    if err then return nil, errors.wrap(err, "CRM component lookup failed") end
    local out: { Located } = {}
    for _, row in ipairs(type(rows) == "table" and rows :: { ComponentRow } or {}) do
        local id = trim(row.component_id)
        if id ~= "" then out[#out + 1] = { crm_id = id, label = M.label(row) } end
    end
    return out, nil
end

-- resolve answers the CRM a request addresses: the explicit id when one is
-- given, otherwise the caller's only readable CRM.
function M.resolve(explicit: unknown): (string?, error?)
    local id = trim(explicit)
    if id ~= "" then return id, nil end
    local crms, err = M.readable()
    if not crms then return nil, err end
    if #crms == 1 then return crms[1].crm_id, nil end
    if #crms == 0 then
        return nil, errors.new({ kind = errors.NOT_FOUND, message = "no CRM is available; create one with CRMCreate" })
    end
    local named: { string } = {}
    for _, crm in ipairs(crms) do named[#named + 1] = crm.crm_id .. " (" .. crm.label .. ")" end
    return nil, errors.new({ kind = errors.CONFLICT,
        message = "several CRMs are available; pass crm_id as one of: " .. table.concat(named, ", ") })
end

return M
