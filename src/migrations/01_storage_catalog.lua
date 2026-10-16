-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 storage catalog", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_revision (
                    "crm_id" text NOT NULL,
                    "revision" text NOT NULL,
                    "source_hash" text NOT NULL,
                    "dialect" text NOT NULL,
                    "applied_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_schema_revision_pkey" PRIMARY KEY (crm_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_apply (
                    "crm_id" text NOT NULL,
                    "revision" text NOT NULL,
                    "source_hash" text NOT NULL,
                    "dialect" text NOT NULL,
                    "status" text NOT NULL,
                    "error" text,
                    "started_at" text NOT NULL,
                    "finished_at" text,
                    CONSTRAINT "kickside_crm_schema_apply_pkey" PRIMARY KEY (crm_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_object (
                    "crm_id" text NOT NULL,
                    "object_id" text NOT NULL,
                    "object_type" text NOT NULL,
                    "table_name" text NOT NULL,
                    "fts_table" text,
                    "label" text,
                    "icon" text,
                    "plural" text,
                    "is_syncable" boolean NOT NULL,
                    "definition" text NOT NULL,
                    "revision" text NOT NULL,
                    CONSTRAINT "kickside_crm_schema_object_pkey" PRIMARY KEY (crm_id, object_id),
                    CONSTRAINT "kickside_crm_schema_object_crm_id_object_type_key" UNIQUE (crm_id, object_type),
                    CONSTRAINT "kickside_crm_schema_object_table_name_key" UNIQUE (table_name)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_attribute (
                    "crm_id" text NOT NULL,
                    "object_id" text NOT NULL,
                    "field_id" text NOT NULL,
                    "object_type" text NOT NULL,
                    "attr" text NOT NULL,
                    "data_type" text NOT NULL,
                    "column_name" text,
                    "relation_table" text,
                    "target_kind" text,
                    "target_type" text,
                    "target_object_id" text,
                    "cardinality" text,
                    "indexed" boolean NOT NULL,
                    "searchable" boolean NOT NULL,
                    "label" text,
                    "config" text NOT NULL,
                    "sort_order" integer NOT NULL,
                    "system" boolean NOT NULL,
                    "definition" text NOT NULL,
                    "revision" text NOT NULL,
                    CONSTRAINT "kickside_crm_schema_attribute_check" CHECK ((column_name IS NOT NULL) <> (relation_table IS NOT NULL)),
                    CONSTRAINT "kickside_crm_schema_attribute_pkey" PRIMARY KEY (crm_id, object_id, field_id),
                    CONSTRAINT "kickside_crm_schema_attribute_crm_id_object_type_attr_key" UNIQUE (crm_id, object_type, attr)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_declaration (
                    "crm_id" text NOT NULL,
                    "kind" text NOT NULL,
                    "declaration_id" text NOT NULL,
                    "definition" text NOT NULL,
                    "revision" text NOT NULL,
                    CONSTRAINT "kickside_crm_schema_declaration_pkey" PRIMARY KEY (crm_id, kind, declaration_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_record_locator (
                    "crm_id" text NOT NULL,
                    "record_id" text NOT NULL,
                    "object_type" text NOT NULL,
                    "created_at" text NOT NULL,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_record_locator_pkey" PRIMARY KEY (crm_id, record_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_locator_object ON kickside_crm_record_locator USING btree (crm_id, object_type, updated_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_write_origin (
                    "crm_id" text NOT NULL,
                    "provider" text NOT NULL,
                    "connection_id" text NOT NULL,
                    "object_type" text NOT NULL,
                    "target_ref" text NOT NULL,
                    "attr" text NOT NULL,
                    "value_hash" text NOT NULL,
                    "write_ref" text NOT NULL,
                    "completed_at" text NOT NULL,
                    "origin" text NOT NULL DEFAULT '{}'::text,
                    CONSTRAINT "kickside_crm_write_origin_pkey" PRIMARY KEY (crm_id, provider, connection_id, object_type, target_ref, attr)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_write_origin_lookup ON kickside_crm_write_origin USING btree (crm_id, provider, connection_id, object_type, target_ref, attr, completed_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_sink_receipt (
                    "crm_id" text NOT NULL,
                    "origin" text NOT NULL,
                    "sink_op" text NOT NULL,
                    "idempotency_key" text NOT NULL,
                    "payload_hash" text NOT NULL,
                    "outcome" text NOT NULL,
                    "dest_ref" text,
                    "completed_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_sink_receipt_pkey" PRIMARY KEY (crm_id, origin, sink_op, idempotency_key)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_sink_receipt_scan ON kickside_crm_sink_receipt USING btree (crm_id, origin, idempotency_key, sink_op)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_sink_receipt_retention ON kickside_crm_sink_receipt USING btree (completed_at, crm_id, origin, sink_op, idempotency_key)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_collection_membership (
                    "crm_id" text NOT NULL,
                    "collection_id" text NOT NULL,
                    "record_id" text NOT NULL,
                    "stage_id" text NOT NULL,
                    "position" double precision NOT NULL DEFAULT 0,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_collection_membership_pkey" PRIMARY KEY (crm_id, collection_id, record_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_mem_stage ON kickside_crm_collection_membership USING btree (crm_id, collection_id, stage_id, "position")]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_mem_record ON kickside_crm_collection_membership USING btree (crm_id, record_id)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_activity (
                    "crm_id" text NOT NULL,
                    "activity_id" text NOT NULL,
                    "record_id" text NOT NULL,
                    "activity_type" text NOT NULL,
                    "occurred_at" text NOT NULL,
                    "actor" text,
                    "participant_record_id" text,
                    "due_at" text,
                    "done" boolean NOT NULL DEFAULT false,
                    "payload" text NOT NULL DEFAULT '{}'::text,
                    "source" text,
                    "external_id" text,
                    "correlation_key" text,
                    "direction" text,
                    "duration_sec" integer,
                    "outcome" text,
                    "recording_url" text,
                    "has_transcript" boolean NOT NULL DEFAULT false,
                    CONSTRAINT "kickside_crm_activity_pkey" PRIMARY KEY (crm_id, activity_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_act_record ON kickside_crm_activity USING btree (crm_id, record_id, occurred_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_act_participant ON kickside_crm_activity USING btree (crm_id, participant_record_id, occurred_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_act_due ON kickside_crm_activity USING btree (crm_id, done, due_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE UNIQUE INDEX idx_kickside_crm_act_external ON kickside_crm_activity USING btree (crm_id, external_id) WHERE (external_id IS NOT NULL)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE UNIQUE INDEX idx_kickside_crm_act_correlation ON kickside_crm_activity USING btree (crm_id, correlation_key) WHERE (correlation_key IS NOT NULL)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_alias (
                    "crm_id" text NOT NULL,
                    "object_scope" text NOT NULL,
                    "alias_type" text NOT NULL,
                    "alias_hash" text NOT NULL,
                    "alias_display" text,
                    "record_id" text NOT NULL,
                    "source" text,
                    "is_primary" boolean NOT NULL DEFAULT false,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_alias_pkey" PRIMARY KEY (crm_id, object_scope, alias_type, alias_hash)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_alias_record ON kickside_crm_alias USING btree (crm_id, record_id)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_alias_reservation (
                    "crm_id" text NOT NULL,
                    "object_scope" text NOT NULL,
                    "alias_type" text NOT NULL,
                    "alias_hash" text NOT NULL,
                    "record_id" text NOT NULL,
                    "state" text NOT NULL DEFAULT 'committed'::text,
                    "reserved_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_alias_reservation_pkey" PRIMARY KEY (crm_id, object_scope, alias_type, alias_hash)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_alias_res_record ON kickside_crm_alias_reservation USING btree (crm_id, record_id)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_alias_res_state ON kickside_crm_alias_reservation USING btree (crm_id, state)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_alias_secret (
                    "crm_id" text NOT NULL,
                    "key_version" text NOT NULL,
                    "secret_encrypted" text NOT NULL,
                    "created_at" text NOT NULL,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_alias_secret_pkey" PRIMARY KEY (crm_id, key_version)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_merge_decision (
                    "crm_id" text NOT NULL,
                    "left_id" text NOT NULL,
                    "right_id" text NOT NULL,
                    "object_type" text NOT NULL,
                    "decision" text NOT NULL DEFAULT 'pending'::text,
                    "resolution_id" text,
                    "winner_id" text,
                    "loser_id" text,
                    "confidence" double precision,
                    "reason" text,
                    "evidence_hash" text NOT NULL DEFAULT ''::text,
                    "resolved_by" text,
                    "resolved_at" text,
                    "override" boolean NOT NULL DEFAULT false,
                    "override_reviewed_by" text,
                    "override_reason" text,
                    "override_prior_decision_ref" text,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_merge_decision_pkey" PRIMARY KEY (crm_id, left_id, right_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_merge_state ON kickside_crm_merge_decision USING btree (crm_id, decision, updated_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_merge_object ON kickside_crm_merge_decision USING btree (crm_id, object_type, decision)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_merge_resolution (
                    "crm_id" text NOT NULL,
                    "resolution_id" text NOT NULL,
                    "left_id" text NOT NULL,
                    "right_id" text NOT NULL,
                    "object_type" text NOT NULL,
                    "decision" text NOT NULL,
                    "winner_id" text,
                    "loser_id" text,
                    "note" text,
                    "resolved_by" text,
                    "resolved_at" text NOT NULL,
                    CONSTRAINT "kickside_crm_merge_resolution_pkey" PRIMARY KEY (crm_id, resolution_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_resolution_pair ON kickside_crm_merge_resolution USING btree (crm_id, left_id, right_id, resolved_at)]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                require("compiler").drop_component_tables(db)
                local _, err = db:execute("DROP TABLE kickside_crm_sink_receipt")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_merge_resolution")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_merge_decision")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_alias_secret")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_alias_reservation")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_alias")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_activity")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_collection_membership")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_write_origin")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_record_locator")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_declaration")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_attribute")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_object")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_apply")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_revision")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_revision (crm_id TEXT PRIMARY KEY, revision TEXT NOT NULL, source_hash TEXT NOT NULL, dialect TEXT NOT NULL, applied_at TEXT NOT NULL)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_apply (crm_id TEXT PRIMARY KEY, revision TEXT NOT NULL, source_hash TEXT NOT NULL, dialect TEXT NOT NULL, status TEXT NOT NULL, error TEXT, started_at TEXT NOT NULL, finished_at TEXT)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_object (crm_id TEXT NOT NULL, object_id TEXT NOT NULL, object_type TEXT NOT NULL, table_name TEXT NOT NULL, fts_table TEXT, label TEXT, icon TEXT, plural TEXT, is_syncable INTEGER NOT NULL, definition TEXT NOT NULL, revision TEXT NOT NULL, PRIMARY KEY (crm_id, object_id), UNIQUE (crm_id, object_type), UNIQUE (table_name))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_attribute (crm_id TEXT NOT NULL, object_id TEXT NOT NULL, field_id TEXT NOT NULL, object_type TEXT NOT NULL, attr TEXT NOT NULL, data_type TEXT NOT NULL, column_name TEXT, relation_table TEXT, target_kind TEXT, target_type TEXT, target_object_id TEXT, cardinality TEXT, indexed INTEGER NOT NULL, searchable INTEGER NOT NULL, label TEXT, config TEXT NOT NULL, sort_order INTEGER NOT NULL, system INTEGER NOT NULL, definition TEXT NOT NULL, revision TEXT NOT NULL, PRIMARY KEY (crm_id, object_id, field_id), UNIQUE (crm_id, object_type, attr), CHECK ((column_name IS NOT NULL) <> (relation_table IS NOT NULL)))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_schema_declaration (crm_id TEXT NOT NULL, kind TEXT NOT NULL, declaration_id TEXT NOT NULL, definition TEXT NOT NULL, revision TEXT NOT NULL, PRIMARY KEY (crm_id, kind, declaration_id))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_record_locator (crm_id TEXT NOT NULL, record_id TEXT NOT NULL, object_type TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (crm_id, record_id))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_write_origin (crm_id TEXT NOT NULL, provider TEXT NOT NULL, connection_id TEXT NOT NULL, object_type TEXT NOT NULL, target_ref TEXT NOT NULL, attr TEXT NOT NULL, value_hash TEXT NOT NULL, write_ref TEXT NOT NULL, completed_at TEXT NOT NULL, origin TEXT NOT NULL DEFAULT '{}', PRIMARY KEY (crm_id, provider, connection_id, object_type, target_ref, attr))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_collection_membership (crm_id TEXT NOT NULL, collection_id TEXT NOT NULL, record_id TEXT NOT NULL, stage_id TEXT NOT NULL, position REAL NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (crm_id, collection_id, record_id))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_activity (crm_id TEXT NOT NULL, activity_id TEXT NOT NULL, record_id TEXT NOT NULL, activity_type TEXT NOT NULL, occurred_at TEXT NOT NULL, actor TEXT, participant_record_id TEXT, due_at TEXT, done INTEGER NOT NULL DEFAULT 0, payload TEXT NOT NULL DEFAULT '{}', source TEXT, external_id TEXT, correlation_key TEXT, direction TEXT, duration_sec INTEGER, outcome TEXT, recording_url TEXT, has_transcript INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (crm_id, activity_id))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_alias (crm_id TEXT NOT NULL, object_scope TEXT NOT NULL, alias_type TEXT NOT NULL, alias_hash TEXT NOT NULL, alias_display TEXT, record_id TEXT NOT NULL, source TEXT, is_primary INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (crm_id, object_scope, alias_type, alias_hash))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_alias_reservation (crm_id TEXT NOT NULL, object_scope TEXT NOT NULL, alias_type TEXT NOT NULL, alias_hash TEXT NOT NULL, record_id TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'committed', reserved_at TEXT NOT NULL, PRIMARY KEY (crm_id, object_scope, alias_type, alias_hash))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_alias_secret (crm_id TEXT NOT NULL, key_version TEXT NOT NULL, secret_encrypted TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (crm_id, key_version))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_merge_decision (crm_id TEXT NOT NULL, left_id TEXT NOT NULL, right_id TEXT NOT NULL, object_type TEXT NOT NULL, decision TEXT NOT NULL DEFAULT 'pending', resolution_id TEXT, winner_id TEXT, loser_id TEXT, confidence REAL, reason TEXT, evidence_hash TEXT NOT NULL DEFAULT '', resolved_by TEXT, resolved_at TEXT, override INTEGER NOT NULL DEFAULT 0, override_reviewed_by TEXT, override_reason TEXT, override_prior_decision_ref TEXT, updated_at TEXT NOT NULL, PRIMARY KEY (crm_id, left_id, right_id))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_merge_resolution (crm_id TEXT NOT NULL, resolution_id TEXT NOT NULL, left_id TEXT NOT NULL, right_id TEXT NOT NULL, object_type TEXT NOT NULL, decision TEXT NOT NULL, winner_id TEXT, loser_id TEXT, note TEXT, resolved_by TEXT, resolved_at TEXT NOT NULL, PRIMARY KEY (crm_id, resolution_id))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_locator_object ON kickside_crm_record_locator(crm_id, object_type, updated_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_write_origin_lookup ON kickside_crm_write_origin(crm_id, provider, connection_id, object_type, target_ref, attr, completed_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_mem_stage ON kickside_crm_collection_membership(crm_id, collection_id, stage_id, position)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_mem_record ON kickside_crm_collection_membership(crm_id, record_id)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_act_record ON kickside_crm_activity(crm_id, record_id, occurred_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_act_participant ON kickside_crm_activity(crm_id, participant_record_id, occurred_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_act_due ON kickside_crm_activity(crm_id, done, due_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_alias_record ON kickside_crm_alias(crm_id, record_id)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_alias_res_record ON kickside_crm_alias_reservation(crm_id, record_id)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_alias_res_state ON kickside_crm_alias_reservation(crm_id, state)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_merge_state ON kickside_crm_merge_decision(crm_id, decision, updated_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_merge_object ON kickside_crm_merge_decision(crm_id, object_type, decision)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_resolution_pair ON kickside_crm_merge_resolution(crm_id, left_id, right_id, resolved_at)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE UNIQUE INDEX idx_kickside_crm_act_external ON kickside_crm_activity(crm_id, external_id) WHERE external_id IS NOT NULL]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE UNIQUE INDEX idx_kickside_crm_act_correlation ON kickside_crm_activity(crm_id, correlation_key) WHERE correlation_key IS NOT NULL]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_crm_sink_receipt (crm_id TEXT NOT NULL, origin TEXT NOT NULL, sink_op TEXT NOT NULL, idempotency_key TEXT NOT NULL, payload_hash TEXT NOT NULL, outcome TEXT NOT NULL, dest_ref TEXT, completed_at TEXT NOT NULL, PRIMARY KEY (crm_id, origin, sink_op, idempotency_key))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_sink_receipt_scan ON kickside_crm_sink_receipt(crm_id, origin, idempotency_key, sink_op)]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE INDEX idx_kickside_crm_sink_receipt_retention ON kickside_crm_sink_receipt(completed_at, crm_id, origin, sink_op, idempotency_key)]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                require("compiler").drop_component_tables(db)
                local _, err = db:execute("DROP TABLE kickside_crm_sink_receipt")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_merge_resolution")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_merge_decision")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_alias_secret")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_alias_reservation")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_alias")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_activity")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_collection_membership")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_write_origin")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_record_locator")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_declaration")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_attribute")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_object")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_apply")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_crm_schema_revision")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
