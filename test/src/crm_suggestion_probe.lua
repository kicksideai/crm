local mutation = require("mutation")
local writer = require("writer")
local resolve = require("resolve")
local merge_arm = require("merge_arm")

local M = {}

function M.run(args: any): (any?, error?)
    local crm_id = args.crm_id
    local applied, apply_err = mutation.apply(crm_id, {
        version = "suggestion-output-v1",
        objects = { { id = "entity-object", type = "entity", label = "Entity", plural = "Entities" } },
        attributes = {
            { id = "entity-name", object_type = "entity", attr = "name", data_type = "text", config = {} },
            { id = "entity-email", object_type = "entity", attr = "email", data_type = "email", config = { alias = "email" } },
        },
        pipelines = {}, views = {}, policies = {},
        merge_config = { objects = { entity = {
            thresholds = { ignore_below = 0.5, review_at = 0.5 },
            patterns = { { kind = "value_exact", attr = "name", weight = 1, reason = "same_name" } },
        } } },
    }, nil)
    if not applied then return nil, apply_err end
    for _, id in ipairs({ "left", "right" }) do
        local ok, err = writer.create_record(crm_id, "entity:" .. id, "entity", {
            name = "Matching name", email = id .. "@example.test",
        })
        if not ok then return nil, err end
    end
    local output, resolve_err = resolve.resolve_block({
        config = { crm_id = crm_id },
        input = { object_type = "entity", match = { alias_type = "email", alias_value = "left@example.test" },
            values = { name = "Matching name" } },
    })
    if resolve_err then return nil, resolve_err end
    local suggestion = output.merge_suggestions[1]
    if not suggestion then return { output = output }, nil end
    local input = { crm_id = crm_id }
    for key, value in pairs(suggestion) do input[key] = value end
    local preview, preview_err = merge_arm.preview_block({ input = input, config = {} })
    if preview_err then return nil, preview_err end
    return { output = output, preview = preview }, nil
end

return M
