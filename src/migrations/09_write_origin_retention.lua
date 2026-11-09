-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local migration_api = require("migration")

local function upgrade(db)
    local _, err = db:execute([[CREATE INDEX IF NOT EXISTS idx_kickside_crm_write_origin_retention
        ON kickside_crm_write_origin (completed_at, crm_id, provider, connection_id, object_type, target_ref, attr)]])
    if err then error(tostring(err)) end
end

return migration_api.define(function()
    migration("09 write origin retention", function()
        database("postgres", function() up(upgrade) end)
        database("sqlite", function() up(upgrade) end)
    end)
end)
