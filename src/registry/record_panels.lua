-- Record-panel discovery is declarative: contributing modules publish only
-- crm.record_panel metadata; CRM never imports or names a contributor.
local registry = require("registry")

local M = {}

M.META_TYPE = "crm.record_panel"

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function object_types(value: unknown): { string }
    if type(value) ~= "table" then return {} end
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, item in ipairs(value) do
        local object_type = trim(item)
        if object_type ~= "" and not seen[object_type] then
            seen[object_type] = true
            out[#out + 1] = object_type
        end
    end
    return out
end

local function panel(meta: unknown): { [string]: unknown }?
    if type(meta) ~= "table" then return nil end
    local tag = trim(meta.tag)
    local title = trim(meta.title)
    if tag == "" or title == "" then return nil end
    return {
        tag = tag,
        title = title,
        order = tonumber(meta.order) or 100,
        object_types = object_types(meta.object_types),
    }
end

local function applies_to(panel_row: { [string]: unknown }, object_type: string): boolean
    local types = panel_row.object_types :: { string }
    if #types == 0 then return true end
    for _, declared in ipairs(types) do
        if declared == object_type then return true end
    end
    return false
end

-- from_entries maps registry results to the API shape and keeps the route
-- independently testable against empty and mixed catalogs.
function M.from_entries(entries: unknown, object_type: string): { { [string]: unknown } }
    local out: { { [string]: unknown } } = {}
    for _, entry in ipairs(type(entries) == "table" and entries or {}) do
        local row = panel((entry :: { [string]: unknown }).meta)
        if row and applies_to(row, object_type) then out[#out + 1] = row end
    end
    table.sort(out, function(a, b)
        local a_order = a.order :: number
        local b_order = b.order :: number
        if a_order ~= b_order then return a_order < b_order end
        return (a.tag :: string) < (b.tag :: string)
    end)
    return out
end

-- for_object discovers every accessible contribution through the shared
-- meta-type registry convention, then filters it for the requested CRM type.
function M.for_object(object_type: string): ({ { [string]: unknown } }?, string?)
    local entries, err = registry.find({ ["meta.type"] = M.META_TYPE })
    if err then return nil, tostring(err) end
    return M.from_entries(entries, object_type), nil
end

return M
