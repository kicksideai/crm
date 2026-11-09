-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local migration_api = require("migration")

local function upgrade(db)
    local _, err = db:execute([[DELETE FROM kickside_crm_conditional_outcome
        WHERE NOT EXISTS (SELECT 1 FROM kickside_crm_schema_revision s
            WHERE s.crm_id = kickside_crm_conditional_outcome.crm_id)]])
    if err then error(tostring(err)) end
end

return migration_api.define(function()
    migration("10 orphan conditional outcomes", function()
        database("postgres", function() up(upgrade) end)
        database("sqlite", function() up(upgrade) end)
    end)
end)
