-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("02 activity reference", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_ref (
                    "crm_id" text NOT NULL,
                    "ref_id" text NOT NULL,
                    "from_ref" text NOT NULL,
                    "edge_type" text NOT NULL,
                    "to_ref" text NOT NULL,
                    "attrs" text NOT NULL DEFAULT '{}'::text,
                    "active" boolean NOT NULL DEFAULT true,
                    "source" text,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_ref_pkey" PRIMARY KEY (crm_id, from_ref, edge_type, to_ref)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_ref_from ON kickside_crm_ref USING btree (crm_id, from_ref, edge_type, active)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_ref_to ON kickside_crm_ref USING btree (crm_id, to_ref, edge_type, active)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_activity_alias (
                    "crm_id" text NOT NULL,
                    "alias" text NOT NULL,
                    "activity_id" text NOT NULL,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_activity_alias_pkey" PRIMARY KEY (crm_id, alias)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_act_alias_activity ON kickside_crm_activity_alias USING btree (crm_id, activity_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_crm_activity_alias")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_ref")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_ref (crm_id TEXT NOT NULL, ref_id TEXT NOT NULL, from_ref TEXT NOT NULL, edge_type TEXT NOT NULL, to_ref TEXT NOT NULL, attrs TEXT NOT NULL DEFAULT '{}', active INTEGER NOT NULL DEFAULT 1, source TEXT, updated_at TEXT NOT NULL, PRIMARY KEY (crm_id, from_ref, edge_type, to_ref))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_activity_alias (crm_id TEXT NOT NULL, alias TEXT NOT NULL, activity_id TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (crm_id, alias))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_ref_from ON kickside_crm_ref(crm_id, from_ref, edge_type, active)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_ref_to ON kickside_crm_ref(crm_id, to_ref, edge_type, active)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_act_alias_activity ON kickside_crm_activity_alias(crm_id, activity_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_crm_activity_alias")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_ref")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
