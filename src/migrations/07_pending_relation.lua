-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("07 pending relation", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_pending_relation (
                    "crm_id" text NOT NULL,
                    "source_object_type" text NOT NULL,
                    "source_id" text NOT NULL,
                    "attr" text NOT NULL,
                    "target_ref_json" text NOT NULL,
                    "target_id" text,
                    "linked" boolean NOT NULL,
                    "ordinal" integer NOT NULL DEFAULT 0,
                    "dedup_key" text NOT NULL,
                    "created_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_pending_relation_pkey" PRIMARY KEY (crm_id, source_id, attr, target_ref_json, linked)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_pending_source ON kickside_crm_pending_relation USING btree (crm_id, source_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_pending_target ON kickside_crm_pending_relation USING btree (crm_id, target_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_crm_pending_relation")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_pending_relation (crm_id TEXT NOT NULL, source_object_type TEXT NOT NULL, source_id TEXT NOT NULL, attr TEXT NOT NULL, target_ref_json TEXT NOT NULL, target_id TEXT, linked INTEGER NOT NULL, ordinal INTEGER NOT NULL DEFAULT 0, dedup_key TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (crm_id, source_id, attr, target_ref_json, linked))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_pending_source ON kickside_crm_pending_relation(crm_id, source_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_crm_pending_target ON kickside_crm_pending_relation(crm_id, target_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_crm_pending_relation")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
