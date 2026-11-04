-- Test attachment fetcher (provider "test"): a value is ids separated by ";".
local function parse_refs(args: any): any
    local refs = {}
    for ref in tostring(type(args) == "table" and args.value or ""):gmatch("[^;%s]+") do refs[#refs + 1] = { ref = ref } end
    return { refs = refs }
end

local function fetch_attachment(args: any): any
    return { bytes = "file " .. tostring(args.ref), filename = tostring(args.ref) .. ".txt", content_type = "text/plain" }
end

return { parse_refs = parse_refs, fetch_attachment = fetch_attachment }
