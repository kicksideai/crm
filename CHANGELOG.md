# Changelog

## 0.6.1 (2026-10-19)

- Document the object label and icon contract in CRMSchemaApply: label is the collection name the CRM shows, icon an Iconify id.

## 0.6.0 (2026-10-19)

- Relation fields are record values: create values and update set/unset carry typed references, so a required relation is satisfiable at creation.
- Agent tools resolve their CRM like the bootstrap API; add CRMList, CRMCreate and the atomic CRMCreateRecords batch.
- CRMSchemaApply seals the agent-authored declaration, accepts expected_revision and documents the declaration grammar.
- Generated record ids take the form <object_type>:<uuid> for every tool and the resolver.

## 0.5.1 (2026-10-17)

- Declare registry entry requirements with value_kind and default bindings.

## 0.4.0 (2026-10-08)

- fix: preserve native result bounds and refresh selected model limits (3f0152d)
- fix: bound agent tool results and derive model checkpoint budgets (258d29b)
- chore: refresh locks to latest published dependencies (856e4fe)
- Isolate schema fault fixtures with cancellation-safe database cleanup (a5f2d60)
- build: rebuild bundles from source (5d400b0)
- Resolve @wippy-fe packages to the newest versions and rebuild the CRM UI bundle (959e120)
- Declare ES2022 target and lib in the CRM UI tsconfig (5017d4d)
- chore: refresh locks to latest published dependencies (db7ca29)
- Gate the CRM System tab by the schema administration endpoint (63033cb)
- Declare platform Members defaults for module access requirements (6f216e4)
- feat(crm): declare selectable module access policy (09c7101)
- fix(crm): preserve component-id alongside Workspace entry-id (69ce970)
- test: refresh the harness to current Hub dependencies (d26aa9e)
- test: resolve CRM harness against fresh local modules (23cc9ac)
- Open the selected CRM entry in Workspace manage views (1183854)
- chore(release): synchronize published Hub versions and baseline (4b63456)

## 0.3.10

Current published Hub version.
