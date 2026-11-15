-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local env = require("env")
local normalize = require("normalize")
local configuration = require("configuration")
return {run = test.run_cases(function()
    test.describe("alias key configuration", function()
        test.it("resolves the configured variable once while hashing stored aliases", function()
            local id = uuid.v4()
            local previous = env.get("ENCRYPTION_KEY")
            assert(env.set("ENCRYPTION_KEY", string.rep("ab", 32)))
            local db = assert(sql.get("app:db"))
            assert(db:execute([[INSERT INTO kickside_crm_alias_secret
                (crm_id,key_version,secret_encrypted,created_at,updated_at)
                VALUES($1,'v1',$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]],
                {id,"AAECAwQFBgcICQoLUyh1LT1kFis3XCr6Culd0daQBjitBgrg2Ta47RK0ftfZPjfFJBD+ziRQrUlYHUiI"}))
            for _ = 1, 2 do
                local value, err = normalize.hash("key-owner@example.test", id, db)
                test.is_nil(err, tostring(err))
                test.eq(value, "MWUwZWYyZjZjZTBmMGQ4OGFhYzEyNDUyNmE1YTU4M2NkYjRjNDAyOGYwMTQxOTZjMTg5YzA5MTQyZDUyYTVhMQ==")
            end
            assert(db:execute("DELETE FROM kickside_crm_alias_secret WHERE crm_id=$1", {id}))
            db:release()
            assert(env.set("ENCRYPTION_KEY", previous))
            test.eq(configuration.reads, 1, "resolve configuration once per worker")
        end)
    end)
end)}
