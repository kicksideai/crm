import type { CrmAttribute, CrmObject, CrmRecord } from './crm-types'
import { humanize, objectAttributes, referenceValues } from './crm-model'

// The records this record is connected to, as one list.
//
// Two things describe the same connection: the association edges the CRM stores
// and the relation values written on the record itself. Rendering both would
// show a reader the same company twice, and rendering only one loses whichever
// the deployment did not write. They are merged here, into the single place the
// record page answers "what else is this attached to".

export type RelationDirection = 'outgoing' | 'incoming'

export interface RelatedRow {
  id: string
  type: string
  attr: string
  direction: RelationDirection
}

export interface RelatedGroup {
  type: string
  label: string
  rows: RelatedRow[]
}

function push(rows: RelatedRow[], seen: Set<string>, row: RelatedRow) {
  if (!row.id || !row.type) return
  const key = `${row.direction}|${row.attr}|${row.id}`
  if (seen.has(key)) return
  seen.add(key)
  rows.push(row)
}

export function relatedRows(record: CrmRecord | null, fields: CrmAttribute[] = []): RelatedRow[] {
  if (!record) return []
  const rows: RelatedRow[] = []
  const seen = new Set<string>()
  for (const edge of record.associations?.outgoing || []) {
    push(rows, seen, { id: edge.target.id, type: edge.target.type, attr: edge.attr, direction: 'outgoing' })
  }
  for (const field of fields) {
    if (field.data_type !== 'relation') continue
    for (const reference of referenceValues(record.values[field.attr])) {
      if (reference.kind !== 'record') continue
      push(rows, seen, { id: reference.id, type: reference.type, attr: field.attr, direction: 'outgoing' })
    }
  }
  for (const edge of record.associations?.incoming || []) {
    push(rows, seen, { id: edge.source.id, type: edge.source.type, attr: edge.attr, direction: 'incoming' })
  }
  return rows
}

// What the connection is called, in the words the schema uses for it. An
// incoming edge is named by the field on the record that points here, so the
// caption stays the name a person configured rather than a stored attribute key.
export function relationLabel(row: RelatedRow, attributes: CrmAttribute[], ownerType: string): string {
  const owner = row.direction === 'outgoing' ? ownerType : row.type
  const declared = objectAttributes(attributes, owner).find((field) => field.attr === row.attr)
  return declared?.label?.trim() || humanize(row.attr)
}

// Connections gathered by the kind of record they point at, in the order the
// workspace declares its objects, so the panel reads the same way on every page.
export function relatedGroups(rows: RelatedRow[], objects: CrmObject[]): RelatedGroup[] {
  const byType = new Map<string, RelatedRow[]>()
  for (const row of rows) {
    const existing = byType.get(row.type)
    if (existing) existing.push(row)
    else byType.set(row.type, [row])
  }
  const declared = objects.map((object) => object.type).filter((type) => byType.has(type))
  const rest = [...byType.keys()].filter((type) => !declared.includes(type))
  return [...declared, ...rest].map((type) => ({
    type,
    label: objects.find((object) => object.type === type)?.label || humanize(type),
    rows: byType.get(type) || [],
  }))
}

// Every id the panel will need a name for, so the record page can hydrate them
// in one bounded read instead of one read per row.
export function relatedIds(rows: RelatedRow[]): string[] {
  const out: string[] = []
  for (const row of rows) if (!out.includes(row.id)) out.push(row.id)
  return out
}

// How many connections of one kind the panel shows before the rest wait behind a
// disclosure. The record page and the panel read the same number: the page asks
// for exactly the names the panel will put on screen.
export const RELATED_SHOWN = 5

// The ids the panel will render right now. A company with two thousand people
// attached is a normal company, and naming all of them to show five of them is a
// read the size of the data rather than the size of the page. The rest are named
// when their group is opened.
export function visibleRelatedIds(rows: RelatedRow[], objects: CrmObject[], shown = RELATED_SHOWN): string[] {
  const out: string[] = []
  for (const group of relatedGroups(rows, objects)) {
    for (const row of group.rows.slice(0, shown)) if (!out.includes(row.id)) out.push(row.id)
  }
  return out
}
