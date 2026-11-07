# Changelog

## [0.6.8](https://github.com/kicksideai/crm/compare/crm-v0.6.7...crm-v0.6.8) (2026-11-07)


### Bug Fixes

* **crm:** merge the records a source folded into an upserted record ([#28](https://github.com/kicksideai/crm/issues/28)) ([31e3fe2](https://github.com/kicksideai/crm/commit/31e3fe26155458bd0a16a28023d4bf99400f6d8b))

## [0.6.7](https://github.com/kicksideai/crm/compare/crm-v0.6.6...crm-v0.6.7) (2026-11-07)


### Bug Fixes

* **crm:** select the record attachments CRM with the port's one picker ([#31](https://github.com/kicksideai/crm/issues/31)) ([37299e9](https://github.com/kicksideai/crm/commit/37299e9237eb68740e7f7b843596f22949aea14d))

## [0.6.6](https://github.com/kicksideai/crm/compare/crm-v0.6.5...crm-v0.6.6) (2026-11-06)


### Features

* **crm:** add the record files sweep port for an hourly recurring task ([af4003a](https://github.com/kicksideai/crm/commit/af4003aa30e7f2b6b6899aae8f8a31aea1ce6a8b))
* **crm:** download record attachments with an upload completion hook ([ae555c7](https://github.com/kicksideai/crm/commit/ae555c78adeabcd09732fb6f4ef42cfbffb04811))
* **crm:** download, track and serve a record's file attachments (ATN-98) ([ea6dde2](https://github.com/kicksideai/crm/commit/ea6dde28b5df7bd177b7e9edb2f137c4d9ea3bba))
* **crm:** hand out a short-lived link to a record's file ([73bedb3](https://github.com/kicksideai/crm/commit/73bedb3318bd4841fa500721c676de244229fd3f))
* **crm:** mark attachment fields in the schema and depend on uploads ([7e68f65](https://github.com/kicksideai/crm/commit/7e68f659fac56050fa981ab6d3050caf6d09820a))
* **crm:** serve a record's files with a provenance check ([d02c881](https://github.com/kicksideai/crm/commit/d02c88118488be4554542c5e9f51987723a99c08))


### Bug Fixes

* **crm:** accept the sync engine's upsert and delete on the record attachments port ([3a253dc](https://github.com/kicksideai/crm/commit/3a253dcbe9b9687e716f92f90a0b5ce722de2ce9))
* **crm:** clear the lint errors of the record files ([431e3b2](https://github.com/kicksideai/crm/commit/431e3b2d025c5afee7c273444702ba4fcb4b0bee))
* **crm:** drop a file taken out of the record's field ([3a0ed05](https://github.com/kicksideai/crm/commit/3a0ed0589f8e75feba92b7d4555644d6fada7826))
* **crm:** fail a record's files read on an upload read fault instead of hiding it ([277fa86](https://github.com/kicksideai/crm/commit/277fa86c305b877e4c01defe0f523a17b9c16133))
* **crm:** fail an archive download at once as an unsupported type ([3053a8a](https://github.com/kicksideai/crm/commit/3053a8ac55da23d2a59b548ca84d8d7f39babfd1))
* **crm:** keep a record files backfill going past a record it cannot parse ([d509445](https://github.com/kicksideai/crm/commit/d50944518509e653859166125757c3ff6027eb8b))
* **crm:** let one edge stand for a record file when two downloads raced ([7e7f655](https://github.com/kicksideai/crm/commit/7e7f655be6758f7e7c2e030dc1b22c0d43607616))
* **crm:** read attachment state from uploads and check access first ([1b07319](https://github.com/kicksideai/crm/commit/1b0731981e39e54c17815a7b84394370e3a5c847))
* **crm:** retire an expired pending edge as failed and cover file retries ([fb0db4c](https://github.com/kicksideai/crm/commit/fb0db4c0db88135ef2c10cc86100b7ccf95f7fb9))
* **crm:** take an attachment error code from a fetcher only from the contract vocabulary ([876cdd4](https://github.com/kicksideai/crm/commit/876cdd41d44550f43ec616f41d7df784037c0147))

## [0.6.5](https://github.com/kicksideai/crm/compare/crm-v0.6.4...crm-v0.6.5) (2026-10-23)


### Bug Fixes

* **crm:** align writable conflicts and suggestion output ([3cdb074](https://github.com/kicksideai/crm/commit/3cdb074d2e1ee9853e4665e40312d6314cf73f88))
* **crm:** avoid rsync in test mirror setup ([4e966f7](https://github.com/kicksideai/crm/commit/4e966f74cd3db9066e70b53428aa09c7495ea252))
* **crm:** distinguish record lifetimes during alias resolution ([#15](https://github.com/kicksideai/crm/issues/15)) ([fb633c7](https://github.com/kicksideai/crm/commit/fb633c7020d393edf15e95952606aaae62836da0))

## [0.6.4](https://github.com/kicksideai/crm/compare/crm-v0.6.3...crm-v0.6.4) (2026-10-20)


### Bug Fixes

* **crm:** document the select choices vocabulary ([#12](https://github.com/kicksideai/crm/issues/12)) ([bb30826](https://github.com/kicksideai/crm/commit/bb3082678829420cdcf12434390ff6cb290f74d0))

## 0.6.3 (2026-10-19)

- Schema apply refuses a field alias outside the CRM's alias vocabulary (email, domain, phone, linkedin, external:<system>) instead of accepting it and failing the first record write.

## 0.6.2 (2026-10-19)

- The CRM rail re-reads its object counts when the CRM's data revision advances, so records written by agents or other modules show in the counts without reopening the CRM.

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
