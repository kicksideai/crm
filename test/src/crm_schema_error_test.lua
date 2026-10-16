-- SPDX-License-Identifier: MIT
local sql = require("sql")
local storage = require("storage")
local test = require("test")
local types = require("types")
local uuid = require("uuid")

local function define_tests()
    test.describe("CRM schema database errors", function()
        test.it("preserves a transaction-open failure in the response and apply record", function()
            local db = assert(sql.get(types.db_id()))
            local db_type = assert(db:type())
            local dialect = db_type == sql.type.POSTGRES and "postgres" or "sqlite"
            local crm_id = uuid.v7()
            local cause = "transaction capacity is exhausted"
            local failing_db: any = {
                begin = function() return nil, errors.new({ kind = errors.UNAVAILABLE, message = cause }) end,
                execute = function(_self: any, statement: string, params: any)
                    return db:execute(statement, params)
                end,
            }
            local result, err = storage.ensure(failing_db, dialect, crm_id, {
                version = "begin-error-v1",
                objects = {}, attributes = {}, pipelines = {}, views = {}, policies = {}, merge_config = {},
            })
            local failures = assert(db:query("SELECT error FROM kickside_crm_schema_apply WHERE crm_id=$1", { crm_id }))
            db:release()
            test.is_nil(result)
            test.eq(tostring(err), cause)
            test.is_true(errors.is(err, errors.UNAVAILABLE), "the driver failure keeps its kind")
            test.eq(failures[1].error, cause)
        end)

        test.it("preserves an index creation failure and rolls back the schema", function()
            local db = assert(sql.get(types.db_id()))
            local db_type = assert(db:type())
            local dialect = db_type == sql.type.POSTGRES and "postgres" or "sqlite"
            local crm_id = uuid.v7()
            local cause = "index storage is read-only"
            local intercepted = false
            local failing_db: any = {
                begin = function()
                    local tx = assert(db:begin())
                    return {
                        query = function(_self: any, statement: string, params: any)
                            return tx:query(statement, params)
                        end,
                        execute = function(_self: any, statement: string, params: any)
                            if statement:find("CREATE UNIQUE INDEX", 1, true) then
                                intercepted = true
                                return nil, errors.new({ kind = errors.UNAVAILABLE, message = cause })
                            end
                            return tx:execute(statement, params)
                        end,
                        commit = function() return tx:commit() end,
                        rollback = function() return tx:rollback() end,
                    }
                end,
                execute = function(_self: any, statement: string, params: any)
                    return db:execute(statement, params)
                end,
            }
            local result, err = storage.ensure(failing_db, dialect, crm_id, {
                version = "index-error-v1",
                objects = { { id = "entity", type = "entity", label = "Entity" } },
                attributes = { { id = "entity-email", object_type = "entity", attr = "email",
                    data_type = "email", config = { unique = true } } },
                pipelines = {}, views = {}, policies = {}, merge_config = {},
            })
            local revisions = assert(db:query("SELECT revision FROM kickside_crm_schema_revision WHERE crm_id=$1", { crm_id }))
            local failures = assert(db:query("SELECT error FROM kickside_crm_schema_apply WHERE crm_id=$1", { crm_id }))
            db:release()
            test.is_true(intercepted)
            test.is_nil(result)
            test.eq(tostring(err), cause)
            test.is_true(errors.is(err, errors.UNAVAILABLE), "the driver failure keeps its kind")
            test.eq(#revisions, 0)
            test.eq(failures[1].error, cause)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
