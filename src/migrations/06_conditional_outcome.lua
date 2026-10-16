-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("06 conditional outcome", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_conditional_outcome (
                    "crm_id" text NOT NULL,
                    "external_source" text NOT NULL,
                    "external_id" text NOT NULL,
                    "outcomes" text NOT NULL,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_conditional_outcome_pkey" PRIMARY KEY (crm_id, external_source, external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_crm_conditional_outcome")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_conditional_outcome (crm_id TEXT NOT NULL, external_source TEXT NOT NULL, external_id TEXT NOT NULL, outcomes TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (crm_id, external_source, external_id))
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_crm_conditional_outcome")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
