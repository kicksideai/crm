local runner = require("runner")
local json = require("json")
local sql = require("sql")
local write_counter = require("write_counter")

local function run()
    local migrations = runner.setup("app:db")
    local result = migrations:run()
    if type(result) ~= "table" or result.status ~= "complete" then
        error("test migrations failed: "
            .. json.encode(result), 0)
    end
    local db = assert(sql.get("app:db")) :: sql.DB
    write_counter.install(db)
    db:release()
    return true
end

return { run = run }
