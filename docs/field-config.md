# CRM schema and typed projection contract

CRM is object-neutral. A declaration defines the object tables visible to the
CRM API and UI; the package default is empty.

```yaml
version: "5"
objects: []
attributes: []
pipelines: []
views: []
merge_config:
  objects: {}
```

Object identifiers are application vocabulary. CRM does not reserve or seed
business object types.

## Declaration authority

Schema is installed or edited through the CRM configuration contract. The
typed-table compiler applies each declaration transactionally and records its
revision. UI and agent record operations consume that schema; they do not
invent fields. Direct writes to `kickside_crm_*` tables are invalid.

An object declaration supplies a stable `type` and display metadata. Attribute
declarations use:

```yaml
object_type: asset
attr: custodian
data_type: relation
label: Custodian
sort_order: 20
system: false
config:
  target: { kind: principal, kinds: [user] }
  cardinality: one
  relation: held_by
  ui: { section: main, span: 2, list: true, form: true }
```

Supported scalar types are `text`, `email`, `phone`, `url`, `number`,
`currency`, `boolean`, `date`, `time`, `datetime`, `select`, `multi_select`,
`relation`, and `ai`. Common constraints are
`required`, `unique`, and `default`; type-specific constraints include
`min_length`, `max_length`, `pattern`, `min`, `max`, `precision`, and
`choices`. `config.ui` is presentation metadata and is returned unchanged.

## Typed references

Relations use one canonical target declaration:

- record: `{ kind: record, object_type: <declared object> }`
- principal: `{ kind: principal, kinds: [<principal kind>...] }`
- component: `{ kind: component, class: <component class>, contract: <id?> }`

`cardinality` is `one` or `many`. Values are typed references, never ambiguous
bare identifiers:

```json
{ "kind": "record", "type": "asset", "id": "019f..." }
```

Multi-valued relations use an array of the same shape. Each declared relation
compiles to an owned `kickside_crm_rel_*` table indexed by source and typed
target. It does not occupy a scalar field column.

## Owned SQL projection

All read-model tables use the `kickside_crm_` prefix and are scoped by
`crm_id`. The projection separates concerns:

- schema revision, object, and attribute catalogs;
- one compiled `kickside_crm_obj_*` table per declared object, containing
  record identity, canonical merge state, and typed scalar columns;
- one compiled `kickside_crm_rel_*` table per declared relation;
- database-native full-text indexes for searchable compiled columns;
- collection membership;
- activity, alias, merge-decision, and full-text-search indexes;
- saved views and pipeline declarations.

SQLite and PostgreSQL implement the same logical contract. Full-text search is
database-native, while the API first pages matching record identifiers and only
then hydrates the selected records. The component thread remains authoritative;
projection tables are replaceable read state.

## Composition

Imports use the declared writable sink. Programmatic workflows use the
object-neutral Blocks and exact event ports. Visual Workflows is optional and
does not own schema, records, or execution semantics.
