import type { CrmAttribute, CrmFieldUi, CrmObject, CrmPipeline, CrmRecord, CrmReference, CrmReferenceTarget, CrmValue, PipelineStage } from './crm-types'
import { recordRoute } from './crm-route'

export function apiName(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}
export function objectName(object: CrmObject): string { return humanize(object.type) }
export function objectAttributes(attributes: CrmAttribute[], objectType: string): CrmAttribute[] {
  return attributes.filter((item) => item.object_type === objectType).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

export function fieldUi(field: CrmAttribute): CrmFieldUi {
  return field.config?.ui || {}
}

// Where a field reads on the record page. Declaring nothing is the calm default
// -- a field with no placement belongs on the page. Declaring a placement this
// surface does not have is not the same statement: the author put the field
// somewhere other than the front, so it collapses rather than being promoted
// onto the primary reading surface it was never assigned to.
export function fieldSection(field: CrmAttribute): 'main' | 'collapsed' | 'hidden' {
  const section = String(fieldUi(field).section ?? '').trim()
  if (section === '') return 'main'
  if (section === 'main') return 'main'
  return section === 'hidden' ? 'hidden' : 'collapsed'
}

export function fieldSpan(field: CrmAttribute): 1 | 2 | 3 | 4 {
  const span = Number(fieldUi(field).span)
  return span === 1 || span === 2 || span === 3 || span === 4 ? span : 2
}

export function referenceTarget(field?: CrmAttribute): CrmReferenceTarget | undefined {
  if (!field) return undefined
  const declared = field.config?.target
  if (declared && ['record', 'component', 'principal'].includes(declared.kind)) return declared
  return undefined
}

export function titleField(fields: CrmAttribute[]): CrmAttribute | undefined {
  return fields.find((field) => fieldUi(field).role === 'title' && fieldSection(field) !== 'hidden')
}

export function subtitleFields(fields: CrmAttribute[]): CrmAttribute[] {
  return fields.filter((field) => fieldUi(field).role === 'subtitle' && fieldSection(field) !== 'hidden')
}
export function objectPipeline(pipelines: CrmPipeline[], object: CrmObject): CrmPipeline | undefined {
  return pipelines.find((item) => item.object_type === object.type || (!!object.collection && item.collection_id === object.collection))
}
export function stages(pipeline?: CrmPipeline): PipelineStage[] {
  return (pipeline?.stages || []).map((stage, index) => typeof stage === 'string'
    ? { stage_id: stage, label: stage, order: (index + 1) * 10 }
    : { ...stage, label: stage.label || stage.stage_id })
}
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// The stored attribute value a board move should write for a stage: the object's own
// declared choice that matches the stage, so the record and its board column agree.
export function stageValue(stage: PipelineStage, attr?: CrmAttribute): string {
  const target = apiName(stage.stage_id)
  const labelTarget = apiName(stage.label || '')
  const match = (attr?.config?.choices || []).find((choice) => { const key = apiName(String(choice)); return key === target || key === labelTarget })
  return match !== undefined ? String(match) : stage.label || stage.stage_id
}

// The board's cards per column, derived from the records' stage attribute rather than a
// separate membership store, so a record created or edited through the UI lands in the
// right column immediately. Values match columns by normalized key, tolerating case and
// punctuation differences between a choice and a stage id.
export function boardBuckets(pipeline: CrmPipeline, records: CrmRecord[], attr?: CrmAttribute): Record<string, CrmRecord[]> {
  const columns = stages(pipeline)
  const buckets: Record<string, CrmRecord[]> = {}
  for (const stage of columns) buckets[stage.stage_id] = []
  if (!attr) return buckets
  const columnByKey = new Map<string, string>()
  for (const stage of columns) { columnByKey.set(apiName(stage.stage_id), stage.stage_id); if (stage.label) columnByKey.set(apiName(stage.label), stage.stage_id) }
  for (const record of records) {
    const raw = record.values[attr.attr]
    if (raw === undefined || raw === null || raw === '') continue
    const stageId = columnByKey.get(apiName(String(Array.isArray(raw) ? raw[0] : raw)))
    if (stageId) buckets[stageId].push(record)
  }
  return buckets
}

// A structured value renders as a collapsed disclosure of humanized lines, not a scalar
// or a relation or a scalar tag list. Shared so the detail view and ValueDisplay agree
// on what is structured.
export function isStructuredValue(value: CrmValue | undefined, attribute?: CrmAttribute): boolean {
  if (attribute?.data_type === 'relation') return false
  if (value === undefined || value === null || typeof value !== 'object') return false
  if (Array.isArray(value) && value.every((item) => item === null || typeof item !== 'object')) return false
  return true
}

// A compact, brace-free string for one value inside a structured field. Nested
// structures collapse to their scalar leaves joined with spaces; a JSON blob never
// reaches the reader.
export function leafText(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    const parts = value.map((item) => (isPlainObject(item) ? structuredLines(item).map((line) => line.text).join(' ') : leafText(item))).filter((text) => text && text !== '—')
    return parts.length ? parts.join(', ') : '—'
  }
  if (isPlainObject(value)) {
    const parts = Object.values(value).map((item) => leafText(item)).filter((text) => text && text !== '—')
    return parts.length ? parts.join(' ') : '—'
  }
  return String(value)
}

export interface StructuredLine { label: string; text: string }

// An object/array attribute value rendered as humanized key: value lines instead of a
// raw JSON blob. One level of nesting flattens into a "Parent · Child" label so a
// reader sees fields, not machinery.
export function structuredLines(value: unknown): StructuredLine[] {
  const lines: StructuredLine[] = []
  const walk = (val: unknown, prefix: string, depth: number) => {
    if (isPlainObject(val)) {
      for (const [key, item] of Object.entries(val)) {
        const label = prefix ? `${prefix} · ${humanize(key)}` : humanize(key)
        if ((isPlainObject(item) || Array.isArray(item)) && depth < 1) walk(item, label, depth + 1)
        else lines.push({ label, text: leafText(item) })
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, index) => {
        const label = prefix ? `${prefix} ${index + 1}` : String(index + 1)
        if (isPlainObject(item) && depth < 1) walk(item, label, depth + 1)
        else lines.push({ label, text: leafText(item) })
      })
    } else {
      lines.push({ label: prefix || 'Value', text: leafText(val) })
    }
  }
  walk(value, '', 0)
  return lines
}

export function displayValue(value: CrmValue | undefined, attribute?: CrmAttribute): string {
  if (value === undefined || value === null || value === '') return '—'
  if (Array.isArray(value)) return value.map((item) => (isPlainObject(item) ? leafText(item) : String(item))).join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number' && attribute?.data_type === 'currency') {
    const currency = String(attribute.config?.currency_code || 'USD')
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: attribute.config?.precision ?? 0 }).format(value) } catch { return String(value) }
  }
  if ((attribute?.data_type === 'date' || attribute?.data_type === 'time' || attribute?.data_type === 'datetime') && typeof value === 'string') {
    if (attribute.data_type === 'time') {
      const match = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value)
      if (match) {
        const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]), Number(match[3] || 0))
        return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
      }
    }
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      if (attribute.data_type === 'date') return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
    }
  }
  // A structured value never renders as JSON here; ValueDisplay surfaces it as a
  // collapsed disclosure of structured lines on the record detail.
  if (typeof value === 'object') return ''
  if (typeof value === 'string' && attribute?.data_type === 'select') return choiceLabel(value)
  if (typeof value === 'string' && attribute?.data_type === 'text') return readableText(value)
  return String(value)
}
export function initials(value: unknown): string {
  return String(value || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || '?'
}
export function humanize(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

// A bare identifier shape: one word of letters, digits and underscores. Anything
// with punctuation or whitespace was written for a reader and is left alone.
const CODE_SHAPE = /^[A-Za-z][A-Za-z0-9_]*$/
const isOneCase = (value: string) => value === value.toUpperCase() || value === value.toLowerCase()

// A choice is a code by construction -- the schema stores what the upstream
// system calls the option, and "DIRECT_TRAFFIC" is not something anyone says. A
// choice whose casing is mixed was written by a person and keeps its own words.
export function choiceLabel(value: unknown): string {
  const raw = String(value ?? '').trim()
  if (!CODE_SHAPE.test(raw)) return raw
  return isOneCase(raw) ? humanize(raw.toLowerCase()) : raw
}

// The shortest all-capital word that is a constant rather than an abbreviation.
// NDA, GDPR and SOC2 are things people write; OFFLINE and REFERRAL are things
// only a system writes.
const ABBREVIATION_LIMIT = 5

// Free text is prose until it demonstrably is not. A single-cased word joined by
// underscores is a constant beyond doubt; a long unbroken shout is one in
// practice. Anything with punctuation, spaces or mixed case is left exactly as
// the person who wrote it left it.
export function readableText(value: string): string {
  if (!CODE_SHAPE.test(value)) return value
  if (value.includes('_')) return isOneCase(value) ? humanize(value.toLowerCase()) : value
  if (value.length >= ABBREVIATION_LIMIT && value === value.toUpperCase() && !/\d/.test(value)) return humanize(value.toLowerCase())
  return value
}

const OPAQUE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const OPAQUE_ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/i
// A slug carrying its own namespace ("hubspot:421037348576") or nothing but
// digits is an upstream system's key. Title-casing it produces an id with
// capital letters, which is still an id on the page.
const OPAQUE_FOREIGN_KEY = /(^\d+$)|:/

export function splitRecordKey(id: string): { type: string; slug: string } {
  const raw = String(id ?? '')
  const index = raw.indexOf(':')
  return index > 0 ? { type: raw.slice(0, index), slug: raw.slice(index + 1) } : { type: '', slug: raw }
}

// A raw record key (type:slug) is machinery to a reader. Strip the type prefix and
// title-case the slug; when the slug is an opaque id (uuid/ulid) name it by its type
// instead of showing the raw id.
export function humanizeKey(id: string): string {
  const { type, slug } = splitRecordKey(id)
  if (OPAQUE_UUID.test(slug) || OPAQUE_ULID.test(slug) || OPAQUE_FOREIGN_KEY.test(slug)) return type ? humanize(type) : slug
  return humanize(slug)
}

export function looksLikeRecordKey(value: unknown): boolean {
  return typeof value === 'string' && /^[a-z][a-z0-9_]*:[^\s]/i.test(value) && !value.includes(' ')
}

export function friendly(value: unknown): string {
  if (value === undefined || value === null) return ''
  return looksLikeRecordKey(value) ? humanizeKey(value as string) : String(value)
}

export function recordLabel(record: { record_id: string; values: Record<string, CrmValue> }, fields: CrmAttribute[] = []): string {
  const title = titleField(fields)
  const declared = title ? record.values?.[title.attr] : undefined
  if (declared !== undefined && declared !== null && String(declared).trim() !== '') return displayValue(declared, title)
  return humanizeKey(record.record_id)
}

export interface NameEntry { name: string; type: string }
export type NameIndex = Record<string, NameEntry>

export function indexRecordNames(records: CrmRecord[], objectType: string, into: NameIndex = {}, fields: CrmAttribute[] = []): NameIndex {
  for (const record of records) into[record.record_id] = { name: recordLabel(record, fields.filter((field) => field.object_type === (record.object_type || objectType))), type: record.object_type || objectType }
  return into
}

export function relationTargetTypes(attributes: CrmAttribute[], objectType: string): string[] {
  const out = new Set<string>()
  for (const attribute of attributes) {
    if (attribute.object_type === objectType && attribute.data_type === 'relation') {
      const target = referenceTarget(attribute)?.object_type
      if (typeof target === 'string' && target.trim() !== '') out.add(target)
    }
  }
  return [...out]
}

export function isCrmReference(value: unknown): value is CrmReference {
  if (!isPlainObject(value)) return false
  return ['record', 'component', 'principal'].includes(String(value.kind))
    && typeof value.type === 'string'
    && typeof value.id === 'string'
    && value.id.trim() !== ''
}

export function referenceValues(value: CrmValue | undefined): CrmReference[] {
  if (value === undefined || value === null || value === '') return []
  const list = Array.isArray(value) ? value : [value]
  return list.filter(isCrmReference)
}

export function relationValues(value: CrmValue | undefined): string[] {
  return referenceValues(value).map((reference) => reference.id)
}

export interface RelationEntry extends CrmReference { label: string; route?: string; href?: string }
export function relationEntries(value: CrmValue | undefined, names?: NameIndex, target?: CrmReferenceTarget): RelationEntry[] {
  return referenceValues(value).map((reference) => {
    const entry = reference.kind === 'record' ? names?.[reference.id] : undefined
    const label = reference.label || entry?.name || humanizeKey(reference.id)
    let route: string | undefined
    let href: string | undefined
    if (reference.kind === 'record') route = recordRoute(reference.type, reference.id)
    else if (target?.route) {
      const destination = target.route.split('{id}').join(encodeURIComponent(reference.id)).split('{type}').join(encodeURIComponent(reference.type))
      if (/^https?:\/\//i.test(destination)) href = destination
      else route = destination.replace(/^\/+/, '')
    }
    return { ...reference, label, route, href }
  })
}

export function isCollapsedField(field: CrmAttribute): boolean {
  return fieldSection(field) === 'collapsed'
}

// A field carries something a reader can see.
export function hasValue(value: CrmValue | undefined): boolean {
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (isPlainObject(value)) return Object.keys(value).length > 0
  return true
}

export type FieldGroupKey = string

// Grouping keys on what a field IS, never on what it is called: this surface
// reads a declared schema and must not learn one deployment's business names to
// lay out another's. A deployment that DOES want its own business sections
// declares them on the schema (config.ui.group), and the surface renders the
// declared label verbatim -- the name still comes from the schema, never from
// this code.
const GROUP_BY_TYPE: Record<string, FieldGroupKey> = {
  email: 'contact', phone: 'contact', url: 'contact',
  select: 'status', boolean: 'status',
  currency: 'numbers', number: 'numbers',
  date: 'dates', datetime: 'dates', time: 'dates',
}

export const FIELD_GROUP_LABELS: Record<string, string> = {
  profile: 'Profile',
  contact: 'Contact',
  status: 'Status',
  numbers: 'Numbers',
  dates: 'Dates',
}

export function fieldGroup(field: CrmAttribute): FieldGroupKey {
  const declared = String(fieldUi(field).group ?? '').trim()
  if (declared !== '') return `declared:${declared}`
  return GROUP_BY_TYPE[field.data_type] ?? 'profile'
}

export function fieldGroupLabel(key: FieldGroupKey): string {
  if (key.startsWith('declared:')) return key.slice('declared:'.length)
  return FIELD_GROUP_LABELS[key] ?? key
}

// A relation addresses another record. The record page answers that once, in the
// related-records panel, which renders association edges and relation values as
// a single list -- so relations never take a second seat among the field groups.
export function isRelationField(field: CrmAttribute): boolean {
  return field.data_type === 'relation'
}

export interface FieldGroup { key: FieldGroupKey; label: string; fields: CrmAttribute[] }

// The record's filled fields, grouped. A group sits where its earliest member was
// declared, so the schema author's ordering still leads the page, and a group
// with nothing in it does not exist. An empty field is not shown as an empty
// field: absence belongs behind the disclosure, not in front of the reader.
// `stated` names the fields the page header already reads out -- saying them
// twice on one screen is noise, not emphasis.
export function detailGroups(fields: CrmAttribute[], values: Record<string, CrmValue>, stated: string[] = []): FieldGroup[] {
  const groups = new Map<FieldGroupKey, CrmAttribute[]>()
  for (const field of fields) {
    if (isRelationField(field) || stated.includes(field.attr) || !hasValue(values[field.attr])) continue
    const key = fieldGroup(field)
    const existing = groups.get(key)
    if (existing) existing.push(field)
    else groups.set(key, [field])
  }
  return [...groups].map(([key, list]) => ({ key, label: fieldGroupLabel(key), fields: list }))
}

// The long tail behind one disclosure: everything the author collapsed, plus the
// fields this record simply has no value for. What is written comes first, so
// opening the disclosure lands on content rather than on a column of dashes.
export function moreFields(reading: CrmAttribute[], collapsed: CrmAttribute[], values: Record<string, CrmValue>): CrmAttribute[] {
  const candidates = [...collapsed, ...reading.filter((field) => !hasValue(values[field.attr]))].filter((field) => !isRelationField(field))
  return [
    ...candidates.filter((field) => hasValue(values[field.attr])),
    ...candidates.filter((field) => !hasValue(values[field.attr])),
  ]
}

export interface HeroFacts { relation?: CrmAttribute; status?: CrmAttribute }

// The two things read before anything else on the page, taken from what the
// schema declares: who this record belongs to (its first filled relation) and
// where it stands (its first filled choice).
export function heroFacts(fields: CrmAttribute[], values: Record<string, CrmValue>): HeroFacts {
  const filled = fields.filter((field) => fieldSection(field) !== 'hidden' && hasValue(values[field.attr]))
  return {
    relation: filled.find(isRelationField),
    status: filled.find((field) => field.data_type === 'select'),
  }
}
export function partitionFields(fields: CrmAttribute[]): { reading: CrmAttribute[]; system: CrmAttribute[]; hidden: CrmAttribute[] } {
  const reading: CrmAttribute[] = []
  const system: CrmAttribute[] = []
  const hidden: CrmAttribute[] = []
  for (const field of fields) {
    const section = fieldSection(field)
    if (section === 'hidden') hidden.push(field)
    else if (section === 'collapsed') system.push(field)
    else reading.push(field)
  }
  return { reading, system, hidden }
}

// The calm default column set for an object without a saved view: the record label
// plus declared main fields, capped. Collapsed and hidden fields stay behind the
// record detail disclosure or column picker.
export function defaultColumns(fields: CrmAttribute[]): string[] {
  const visible = fields.filter((field) => fieldSection(field) === 'main' && fieldUi(field).list !== false)
  const title = titleField(visible)
  const out = title ? [title.attr] : []
  for (const field of visible) if (!out.includes(field.attr) && out.length < 6) out.push(field.attr)
  return out
}
export function relativeTime(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })
}

export function formatTimestamp(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(date)
}
export function recordId(objectType: string): string {
  return `${objectType}:${crypto.randomUUID()}`
}
