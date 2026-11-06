-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local time = require("time")
local M = {}

function M.await(id: string): (boolean, error?)
    for _ = 1, 1000 do
        local db = assert(sql.get("app:db"))
        local rows, read_err = db:query([[SELECT c.component_id,j.status FROM kickside_job j
            LEFT JOIN kickside_components c ON CAST(c.component_id AS TEXT)=j.owner_id
            WHERE j.owner_kind='component' AND j.owner_id=$1 AND j.job_type='kickside.component:delete_worker']], {id})
        assert(db:release())
        if read_err then return false, read_err end
        if rows[1] and rows[1].component_id == nil and rows[1].status == "done" then return true, nil end
        time.sleep("10ms")
    end
    return false, errors.new({kind = errors.TIMEOUT, message = "component deletion does not finish"})
end

return M
