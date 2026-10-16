-- Native deferred projections resolve the recorded principal through Users.
-- Persist test users and their scope membership before creating their actors.
local sql = require("sql")
local security = require("security")
local M = {}
function M.make(id: string): security.Actor
    local db = assert(sql.get("app:db"))
    local _, user_err = db:execute([[INSERT INTO app_users
        (user_id, email, full_name, password_hash, status)
        VALUES ($1, $2, 'CRM test user', 'test-only', 'active')
        ON CONFLICT (user_id) DO NOTHING]], { id, id .. "@crm.test" })
    local _, group_err = db:execute([[INSERT INTO app_user_groups (user_id, group_id)
        VALUES ($1, 'app.security:crm_test')
        ON CONFLICT (user_id, group_id) DO NOTHING]], { id })
    db:release()
    assert(not user_err, tostring(user_err))
    assert(not group_err, tostring(group_err))
    return security.new_actor(id, {
        user_id = id, status = "active", security_groups = { "app.security:crm_test" },
    })
end
return M
