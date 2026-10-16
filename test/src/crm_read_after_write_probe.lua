-- Runs the real command path repeatedly; no catch-up, sleep, or retry between
-- create and update. Parking the background slot makes the old race deterministic:
-- only the writer's explicit projection barrier can wake this slot.
local writer = require("writer")
local storage = require("storage")
local sql = require("sql")
local types = require("types")

local M = {}
type Map = { [string]: unknown }

function M.run(input: Map): Map
    local crm_id = tostring(input.crm_id)
    local db = assert(sql.get(types.db_id())) :: sql.DB
    for iteration = 1, tonumber(input.iterations) or 40 do
        if input.park == true and iteration == 1 then
            local rows, err = db:query([[UPDATE kickside_job
                SET wake_enabled = FALSE, scheduled_at = NULL
                WHERE id = (SELECT job_id FROM kickside_projection_cursor
                    WHERE thread_id = $1) AND status = 'pending'
                RETURNING id]], { crm_id })
            if err or not rows or #rows ~= 1 then
                db:release()
                return { ok = false, error = "failed to park idle projection: " .. tostring(err) }
            end
        end
        local record_id = tostring(input.prefix) .. ":" .. tostring(iteration)
        local created, create_err = writer.create_record(crm_id, record_id, "entity", { name = "created" })
        if not created then db:release(); return { ok = false, error = create_err } end
        local updated, update_err = writer.append(crm_id, { {
            type = types.EVENTS.RECORD_UPDATED,
            body = { record_id = record_id, object_type = "entity", set = { name = "updated" } },
        } })
        if not updated then db:release(); return { ok = false, error = update_err, iteration = iteration } end
        local record, read_err = storage.get(db, crm_id, "entity", record_id)
        if read_err or not record or ((record :: Map).values :: Map).name ~= "updated" then
            db:release()
            return { ok = false, error = read_err or "update returned before durable record was visible", iteration = iteration }
        end
    end
    db:release()
    return { ok = true, iterations = input.iterations or 40 }
end

return M
