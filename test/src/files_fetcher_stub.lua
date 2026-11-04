-- Test attachment fetcher (provider "test"): a value is ids separated by ";".
-- parse_refs({value}) -> refs split on ";" and spaces; "bad" is refused the
-- way HubSpot refuses a value over 64 KB, "crash" raises.
local function parse_refs(args: any): any
    local value = tostring(type(args) == "table" and args.value or "")
    if value == "bad" then return { error = "value is too long" } end
    if value == "crash" then error("parse_refs crashed") end
    local refs = {}
    for ref in tostring(type(args) == "table" and args.value or ""):gmatch("[^;%s]+") do refs[#refs + 1] = { ref = ref } end
    return { refs = refs }
end

local function fetch_attachment(args: any): any
    if tostring(args.ref) == "403" then return { error = "no_access: file access denied" } end
    if tostring(args.ref) == "zip" then
        return { bytes = "PK\3\4 archive", filename = "bundle.zip", content_type = "application/zip" }
    end
    return { bytes = "file " .. tostring(args.ref), filename = tostring(args.ref) .. ".txt", content_type = "text/plain" }
end

return { parse_refs = parse_refs, fetch_attachment = fetch_attachment }
