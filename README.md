<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kicksideai/docs/main/getting-started/assets/brand/kickside-logo-dark.png">
  <img src="https://raw.githubusercontent.com/kicksideai/docs/main/getting-started/assets/brand/kickside-logo-light.png" alt="KickSide" width="320">
</picture>

# KickSide CRM

A Lua module and web component for typed business records. CRM provides object and field schemas, relations, table and board views, imports, search, record history, and agent and automation operations.

A new CRM starts with an empty schema. A consuming module or a user defines the objects, fields, and collections for its domain.

Install `kickside/crm` through **System → Modules**, create a CRM workspace entry, and configure its schema. See the [CRM guide](https://github.com/kicksideai/docs/blob/main/using/crm.md), [module contracts](docs/module.md), and [field configuration](docs/field-config.md).

![CRM with fictional demonstration data: a deals table, the sales pipeline board, and a company record with its activity](https://raw.githubusercontent.com/kicksideai/docs/main/assets/readme/crm-overview.webp)

The repository includes the backend, migrations, Vue web component, and Lua tests for SQLite and PostgreSQL.

## Reference

The [module contract](docs/module.md) describes structured results, Blocks,
ports, and persistence. [Field configuration](docs/field-config.md) describes
the object-neutral schema.

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`CRMList`](src/traits/_index.yaml) | None |
| [`CRMCreate`](src/traits/_index.yaml) | `title`, `idempotency_key` |
| [`CRMListRecords`](src/traits/_index.yaml) | `fields`, `limit`, `offset` |
| [`CRMGetRecord`](src/traits/_index.yaml) | See the operation schema |
| [`CRMGetBoard`](src/traits/_index.yaml) | `limit`, `offset` |
| [`CRMGetTimeline`](src/traits/_index.yaml) | `fields`, `limit`, `cursor` |
| [`CRMSchemaGet`](src/traits/_index.yaml) | See the operation schema |
| [`CRMSchemaApply`](src/traits/_index.yaml) | See the operation schema |
| [`CRMResolveRecord`](src/traits/_index.yaml) | See the operation schema |
| [`CRMCreateRecord`](src/traits/_index.yaml) | See the operation schema |
| [`CRMCreateRecords`](src/traits/_index.yaml) | `records` |
| [`CRMUpdateRecord`](src/traits/_index.yaml) | See the operation schema |
| [`CRMSetMembership`](src/traits/_index.yaml) | See the operation schema |
| [`CRMLogActivity`](src/traits/_index.yaml) | See the operation schema |
| [`CRMDeleteActivity`](src/traits/_index.yaml) | See the operation schema |
| [`CRMLinkReference`](src/traits/_index.yaml) | See the operation schema |
| [`CRMUnlinkReference`](src/traits/_index.yaml) | See the operation schema |

`CRMSchemaApply` uses a non-empty `config.choices` array for `select` and
`multi_select` attributes. Items are strings or objects with a non-empty
`value` and optional `label`; tokens are at most 255 bytes. See
[select vocabularies](docs/field-config.md#select-vocabularies) for examples.

### Record files

An attribute whose value holds provider file links is marked in the schema:

```yaml
- object_type: person
  attr: file_url
  data_type: text          # text or url
  config:
    attachment: { provider: hubspot }
```

The provider must declare a `registry.entry` with `meta.type: attachment.fetcher`,
`provider`, `fetch_func` and `parse_func`. `parse_func` turns a field value into
file refs without downloading; `fetch_func` downloads one ref.

| Entry | What it does |
| --- | --- |
| [`kickside.crm.files:record_attachments`](src/files/_index.yaml) | Automation port: `upsert` downloads, `delete` is a noop (the ops `kickside.sync` delivers). Config `crm_id`, `component_id` (provider connection; empty uses the single one). Input `{ record_id }`. Downloads every file the record's marked fields promise into uploads and tracks each identity on an `attachment` edge `crm:<record>` → `file:<upload_id>` with provider, ref and attempt attributes. |
| [`kickside.crm.files:on_upload_complete`](src/files/_index.yaml) | Completion and failure target for upload tokens. Rewrites the identity edge to wake consumers; reads use the upload’s current state. |
| [`kickside.crm.files:backfill`](src/files/_index.yaml) | `{ crm_id, component_id, object_type? }` → counts. Runs the same download for every existing record with a marked field, under the caller's WRITE. Safe to repeat. A record whose field value the provider cannot parse is counted in `errors` (the first 5 named in `error_records`) and the backfill goes on; an access, CRM or setup failure stops it. |
| [`kickside.crm.traits:record.files`](src/traits/_index.yaml) | `{ crm_id, record_ref, max_chars? }` → `{ success, files }`. Expected and downloaded files with status, error and text; READ on the CRM. |
| [`kickside.crm.traits:record.file_image`](src/traits/_index.yaml) | `{ crm_id, record_ref, upload_id }` → the original image of an `image/*` file, base64, up to 25 MB; READ on the CRM. |
| [`kickside.crm.traits:record.file_url`](src/traits/_index.yaml) | `{ crm_id, record_ref, upload_id }` → `{ success, url, expires_in, filename, content_type }`: a link to the original of a `ready` file, good for 5 minutes (`kickside.uploads:uploads` `delivery_url`). READ on the CRM, the field must still name the file and its upload must be this CRM's for this record; anything else is refused. |

Rules:

- Status comes from uploads: completed uploads read `ready`, failed uploads read
  `failed` / `conversion_failed`, and processing or missing uploads read `pending`.
  An edge error applies only when the upload does not exist; competing fetch
  failures may replace that error. Upload status always takes precedence.
- A file already `ready`, or `pending` for less than 24 h, is not downloaded
  again. An expired pending upload, `download_failed`, `no_access`,
  `conversion_failed` or `expired` opens the next attempt, up to 3 attempts.
  Retries and expiry run on an upsert delivery or a backfill with WRITE.
- Each attempt binds a deterministic upload ID in its completion token.
  Concurrent deliveries of that attempt create one upload and one edge;
  an ingest conflict writes nothing. An edge is written after ingestion or
  a pre-ingest failure, so a file without an edge still reads pending.
- Reads and retries select the newest attempt per provider/ref. Older attempts
  are ignored immediately and unlinked when the record is processed again.
  Status and timestamp break ties between existing edges of the same attempt.
- A file taken out of the field is no longer the record's: `record.files`
  leaves it out and `record.file_image` refuses it at once, and the next
  download of the record unlinks its edge (`reference.unlinked`). Its upload
  stays. Put back, the file is downloaded again as a new upload. This holds for
  edges of a provider one of the record's marked fields belongs to; an edge of
  any other provider was linked otherwise and stays.
- A fault reading an uploaded file fails `record.files`; only an upload
  without a text artifact reads as a file with no text.
- Pre-ingest error codes on the edge: `too_large` (over 50 MB), `no_access`, `not_found`,
  `download_failed`, `unsupported_type`, `upload_failed`. Archives are rejected
  after ingest as `unsupported_type`; conversion failures come from uploads.
- Identity edge writes, including completion and failure callbacks, emit
  `kickside.crm.events:reference.linked`. Consumers wake on that event and read
  the current upload state from `record.files`.
- An upload is served only if its `metadata.crm_files` names this CRM, record,
  provider and ref. An edge to any other upload is reported `failed` /
  `no_access` and not read.

#### Install: the download automations

Two `kickside.sync:sync` automations on the CRM's thread, both into
`record_attachments` with `{ record_id: payload.record_id }`, so a new file
downloads at once and a removed one is unlinked at once:

| source | filter |
| --- | --- |
| `kickside.crm.ports:record_created` | `payload.object_type == "person" && trim(payload.values.file_url ?? "") != ""` |
| `kickside.crm.ports:record_updated` | `payload.object_type == "person" && ((payload.set != nil && payload.set.file_url != nil) \|\| (payload.unset != nil && "file_url" in payload.unset))` |

Use the object type and attribute of your marked field. `record_updated`
carries only what changed: a set value (an emptied field from a sync arrives as
`set.file_url = ""`) or a cleared one in `unset`.

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Host binding or default |
| --- | --- |
| [`kickside.crm:api_router`](src/_index.yaml) | Host-supplied `http.router` |
| [`kickside.crm:ui_server`](src/_index.yaml) | Host-supplied `http.service` |
| [`kickside.crm:target_db`](src/_index.yaml) | Host-supplied `db.sql` |
| [`kickside.crm:thread_event_retention_days`](src/_index.yaml) | `365` |
| [`kickside.crm:write_origin_retention_days`](src/_index.yaml) | `30` |
| [`kickside.crm:sink_receipt_retention_days`](src/_index.yaml) | `30` |
| [`kickside.crm.security:user_security_scope`](src/security/_index.yaml) | `kickside.security.groups:members` |
| [`kickside.crm.security:admin_security_scope`](src/security/_index.yaml) | Host-supplied `security.scope` |

License: [KickSide Community License 1.0](LICENSE.md) · [Third-party notices](THIRD_PARTY_NOTICES.md).

[Documentation](https://github.com/kicksideai/docs) · [KickSide](https://kickside.ai)
