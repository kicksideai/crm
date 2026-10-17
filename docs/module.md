# kickside CRM registry contract

`kickside/crm` is a generic CRM substrate. It starts with no objects,
attributes, collections, views, or object-specific merge rules. Applications
and business modules own those declarations.

## Requirements

The host supplies these resource bindings through its dependency declaration.

| Requirement | Value kind | Purpose |
| --- | --- | --- |
| `kickside.crm:api_router` | `http.router` | Authenticated CRM API router. |
| `kickside.crm:ui_server` | `http.service` | Server for bundled web-component assets. |
| `kickside.crm:target_db` | `db.sql` | Schema catalog, typed records, and projections database. |
| `kickside.crm.security:admin_security_scope` | `security.scope` | Group permitted to create CRM components and alter schema. |

`kickside.crm.security:user_security_scope` is a `security.scope` requirement
that defaults to `kickside.security.groups:members`. It grants access to the
CRM module surface; record authorization remains the CRM component ACL.

CRM also declares configuration requirements with numeric defaults:

| Requirement | Default | Purpose |
| --- | --- | --- |
| `kickside.crm:thread_event_retention_days` | `365` | Aggregate event retention window in days. |
| `kickside.crm:write_origin_retention_days` | `30` | Maximum age of completed external-write facts used for echo suppression. |
| `kickside.crm:sink_receipt_retention_days` | `30` | Maximum age of committed CRM sink receipts. |

## Namespace layout

`kickside.crm` contains the module definition, requirements, shared types, and
the public read facade. Its child namespaces are:

| Namespace | Contents |
| --- | --- |
| `kickside.crm.api` | Authenticated HTTP adapters. |
| `kickside.crm.binding` | CRM component contract binding. |
| `kickside.crm.blocks` | Object-neutral Blocks. |
| `kickside.crm.command` | Event command validation and append. |
| `kickside.crm.domain` | Policy, constraints, and value validation. |
| `kickside.crm.events` | Public record-domain event types. |
| `kickside.crm.migrations` | Owned storage migrations. |
| `kickside.crm.persist` | Typed storage, projection, and read models. |
| `kickside.crm.ports` | Automation port declarations. |
| `kickside.crm.read` | Public read faces. |
| `kickside.crm.registry` | Module configuration entries. |
| `kickside.crm.resolution` | Aliases, exact resolution, suggestions, and merge decisions. |
| `kickside.crm.schema` | Schema contracts and revisioned mutations. |
| `kickside.crm.security` | Module access policies and scope requirements. |
| `kickside.crm.sink` | Writable CRM sink. |
| `kickside.crm.surface` | Optional web components and navigation. |
| `kickside.crm.traits` | Agent tool declarations. |
| `kickside.crm.ui` | Static UI asset serving. |
| `kickside.crm.workspace` | CRM component creation and workspace operations. |

Child namespaces depend on public contracts, not on UI implementation details.

## Authority and persistence

The CRM component thread is the authority for record, merge, reference,
membership, activity, and external-write facts. A leased projector materializes
those facts into owned `kickside_crm_*` SQL tables for reads and search.
Readers never append events or synchronously drive the projector.

The canonical schema arrives through `kickside.crm.registry:default_config`, an
explicit schema apply, or a business module using the public schema contract.
Schema edits compile directly and transactionally to owned tables. Agent schema
changes use the same portable export/apply contract; record tools cannot invent
fields. See [`field-config.md`](field-config.md) for the declaration and typed
SQL rules.

## Blocks

CRM publishes two object-neutral `kickside.block/v1` entries:

- `kickside.crm.blocks:resolve` resolves an exact alias in a declared object
  table and returns the record, creation state, projection checkpoint, policy
  outcomes, and merge suggestions.
- `kickside.crm.blocks:merge_review` parks a Dataflow on the generic Blocks
  Signal seam and returns exactly one decision: `merged`, `do_not_merge`, or
  `skipped`.

These Blocks are headless. They have no dependency on visual Workflows,
Automation, or CRM UI components. CRM publishes no business-specific Flows.

## Events and ports

Every public record-domain event has one exact `kickside.automation.port` bound to
`kickside.crm.binding:crm`. Important examples are record creation/update,
collection membership set/removed, merge suggested/decided, typed reference
link/unlink, activity logged, and external-write lifecycle facts. Schema edits
are direct transactional configuration operations, not thread events. Ports are
discovery data; CRM does not own trigger activation.

## Writable sink and activity identity

`kickside.crm.sink:crm_sink` implements `kickside.data:writable` with required
`meta.delivery: at_least_once` and `meta.input_shape: record`. Every call
requires `origin`, the writing automation ID or a stable explicit origin for
a non-round producer. Receipts use `(crm_id, origin, sink_op, idempotency_key)`
so writers do not share delivery history.

Receipts are single-phase: the sink commits a completed receipt after the
domain event and projection settle. The event stores the payload digest,
outcome, and destination reference. Recovery checks the payload digest before
replaying the durable effect or rebuilding a missing receipt; a different
payload under the same identity returns a conflict. Receipt retention is
30 days. Boot migrations establish the receipt schema before delivery. Fresh
installs omit the retired writer lease table. Existing inert tables remain
unread and unchanged. Hub Update all and restart applies module updates;
retiring a stored shape requires a forward-only, idempotent, resumable migration
in its owning module, tested with the previous published version’s data.

Activity `correlation_key` names one real-world event across sources without a
shared external ID. Colliding external IDs, correlation keys, or activity IDs
fold into the surviving activity; absorbed identities remain lookup aliases.
Use the same correlation key only for observations of the same event.

Membership to a missing record returns retriable `dependency_missing` with a
record `dependency_key`. A successful record delivery announces
`dependencies_available` so waiting writes can retry.

A round opens the sink with its work deadline. The projection catch-up wait is
bounded by that deadline; a timeout returns retriable `provider_unavailable`
and leaves the event available for recovery without creating a pending receipt.
Deleting a sync retires its engine receipts and keeps CRM records.

## Agent operations

`kickside.crm.traits:crm_trait` exposes small exact tools for exporting and
applying the canonical portable schema; listing and reading records, boards,
and timelines; resolving, creating, and updating records; setting collection
membership; logging activity; and linking or unlinking typed references. Each
tool calls the same schema, reader, writer, or resolver facade used by the rest
of CRM. There is no mixed action dispatcher or direct merge tool.

### Structured reads

Tools return structured result objects directly. `CRMListRecords` accepts
`limit`, `offset`, and `fields`, returning `success` with the reader page’s
`rows`, `total`, `limit`, and `offset`. Each row keeps its identity and selected
`values`; the default fields are `name`, `title`, `status`, and `owner`.
List rows omit associations. `CRMGetRecord` returns `{success, record}` with
the complete record and associations.

`CRMGetTimeline` accepts `limit`, `cursor`, and `fields` and returns
`{success, entries, next_cursor}`. Its rows keep activity/record identifiers and
selected display fields rather than full payloads. `CRMGetBoard` returns
`{success, board}`. `CRMSchemaGet` returns `{success, schema}` and
`CRMSchemaApply` uses the same revisioned import path as the API. Typed failures
return `nil, err`; domain refusals retain `{success = false, error, ...}`.
The [tool declarations](../src/traits/_index.yaml) own the exact schemas.

## UI

The embedded filesystem serves independent CRM workspace, create, record-picker,
settings, and merge-review web-component entries from `/kickside-crm/`.
The UI renders the application-owned declaration and uses only the authenticated
CRM API. It is not required for Blocks, ports, sinks, or agent tools.
