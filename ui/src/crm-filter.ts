// Record criteria for the CRM list. The filter bar edits an unsaved view's criteria and
// "Save as view" persists them, so this is the single client model that maps to both the
// /query records filter and a CrmView spec.filters. Operators and their value shapes
// mirror the backend filter library; the field's declared data type drives which
// operators appear and how a value is coerced before it crosses the API.
import type { CrmAttribute, CrmFilter, CrmValue, Scalar } from './crm-types'
import { humanize, humanizeKey } from './crm-model'

export type FilterOp =
  | 'eq' | 'neq' | 'contains' | 'any_of'
  | 'gt' | 'gte' | 'lt' | 'lte' | 'between'
  | 'before' | 'after'
  | 'is_empty' | 'is_set'

export type OpArity = 'none' | 'one' | 'two' | 'list'

export interface OperatorMeta { label: string; arity: OpArity }

// Value shape per operator: none takes no input, one a scalar, two a range, list a set.
export const OPERATORS: Record<FilterOp, OperatorMeta> = {
  eq: { label: 'is', arity: 'one' },
  neq: { label: 'is not', arity: 'one' },
  contains: { label: 'contains', arity: 'one' },
  any_of: { label: 'is any of', arity: 'list' },
  gt: { label: 'greater than', arity: 'one' },
  gte: { label: 'at least', arity: 'one' },
  lt: { label: 'less than', arity: 'one' },
  lte: { label: 'at most', arity: 'one' },
  between: { label: 'between', arity: 'two' },
  before: { label: 'before', arity: 'one' },
  after: { label: 'after', arity: 'one' },
  is_empty: { label: 'is empty', arity: 'none' },
  is_set: { label: 'is set', arity: 'none' },
}

export interface FilterCondition {
  id: string
  attr: string
  op: FilterOp
  value: CrmValue
  value2?: CrmValue // upper bound for a `between` range
}

export function isFilterableField(_field: CrmAttribute): boolean {
  return true
}
export function filterableFields(fields: CrmAttribute[]): CrmAttribute[] {
  return fields.filter(isFilterableField)
}

const PRESENCE: FilterOp[] = ['is_set', 'is_empty']

export function operatorsForType(dataType: string): FilterOp[] {
  switch (dataType) {
    case 'number':
    case 'currency':
      return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', ...PRESENCE]
    case 'date':
      return ['before', 'after', 'between', ...PRESENCE]
    case 'boolean':
      return ['eq', ...PRESENCE]
    case 'select':
      return ['eq', 'any_of', 'neq', ...PRESENCE]
    case 'multi_select':
      return ['any_of', 'eq', ...PRESENCE]
    case 'relation':
      return ['eq', ...PRESENCE]
    default: // text, email, phone, url, ai
      return ['contains', 'eq', 'neq', ...PRESENCE]
  }
}

export function defaultOperatorFor(dataType: string): FilterOp {
  return operatorsForType(dataType)[0]
}

export function fieldByAttr(fields: CrmAttribute[], attr: string): CrmAttribute | undefined {
  return fields.find((field) => field.attr === attr)
}

let sequence = 0
export function newConditionId(): string {
  sequence += 1
  return `fc_${sequence}_${Math.random().toString(36).slice(2, 8)}`
}

function emptyValueFor(dataType: string, op: FilterOp): CrmValue {
  if (OPERATORS[op].arity === 'list') return []
  if (dataType === 'boolean') return true
  return ''
}

export function newCondition(field: CrmAttribute): FilterCondition {
  const op = defaultOperatorFor(field.data_type)
  return { id: newConditionId(), attr: field.attr, op, value: emptyValueFor(field.data_type, op) }
}

// Re-seed a condition's value when its operator (and thus arity) changes, so switching
// from "between" to "is set" never leaves a stale half-range behind.
export function withOperator(cond: FilterCondition, op: FilterOp, field?: CrmAttribute): FilterCondition {
  const dataType = field?.data_type || 'text'
  return { ...cond, op, value: emptyValueFor(dataType, op), value2: undefined }
}

function notBlank(value: CrmValue | undefined): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function conditionComplete(cond: FilterCondition): boolean {
  const arity = OPERATORS[cond.op]?.arity
  if (!cond.attr || !arity) return false
  if (arity === 'none') return true
  if (arity === 'list') return Array.isArray(cond.value) && cond.value.length > 0
  if (arity === 'two') return notBlank(cond.value) && notBlank(cond.value2)
  return notBlank(cond.value)
}

export function coerceValue(value: CrmValue | undefined, dataType: string): CrmValue {
  if (value === undefined || value === null) return ''
  if (dataType === 'number' || dataType === 'currency') {
    const n = typeof value === 'number' ? value : Number(String(value))
    return Number.isFinite(n) ? n : ''
  }
  if (dataType === 'boolean') return typeof value === 'boolean' ? value : String(value) === 'true'
  return value
}

function isScalar(value: CrmValue): value is Scalar {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value)
}

// Drop incomplete rows and coerce each value to the field's type, producing the exact
// CrmFilter[] the API and a view spec store. between packs a [lo, hi] range.
export function serializeConditions(conditions: FilterCondition[], fields: CrmAttribute[]): CrmFilter[] {
  const out: CrmFilter[] = []
  for (const cond of conditions) {
    if (!conditionComplete(cond)) continue
    const dataType = fieldByAttr(fields, cond.attr)?.data_type || 'text'
    const arity = OPERATORS[cond.op].arity
    if (arity === 'none') { out.push({ attr: cond.attr, op: cond.op, value: null }); continue }
    if (arity === 'two') {
      out.push({ attr: cond.attr, op: cond.op, value: [coerceValue(cond.value, dataType), coerceValue(cond.value2, dataType)] })
      continue
    }
    if (arity === 'list') {
      const list = Array.isArray(cond.value) ? cond.value : [cond.value]
      out.push({ attr: cond.attr, op: cond.op, value: list.map((item) => coerceValue(item as CrmValue, dataType)) })
      continue
    }
    out.push({ attr: cond.attr, op: cond.op, value: coerceValue(cond.value, dataType) })
  }
  return out
}

// Load a saved view's canonical criteria back into editable conditions.
// between/any_of unpack back into value/value2.
export function deserializeFilters(filters: CrmFilter[] | undefined, fields: CrmAttribute[]): FilterCondition[] {
  if (!Array.isArray(filters)) return []
  const out: FilterCondition[] = []
  for (const raw of filters) {
    if (!raw || typeof raw.attr !== 'string' || typeof raw.op !== 'string') throw new Error('Invalid saved-view filter')
    const op = raw.op as FilterOp
    if (!OPERATORS[op]) throw new Error('Unknown saved-view filter operator: ' + raw.op)
    const dataType = fieldByAttr(fields, raw.attr)?.data_type || 'text'
    const arity = OPERATORS[op].arity
    const cond: FilterCondition = { id: newConditionId(), attr: raw.attr, op, value: emptyValueFor(dataType, op) }
    if (arity === 'two' && Array.isArray(raw.value)) {
      cond.value = coerceValue(raw.value[0] as CrmValue, dataType)
      cond.value2 = coerceValue(raw.value[1] as CrmValue, dataType)
    } else if (arity === 'list') {
      if (!Array.isArray(raw.value)) throw new Error('Saved-view list filter requires an array')
      const values = raw.value
      cond.value = (values as CrmValue[]).map((item) => coerceValue(item, dataType)).filter(isScalar)
    } else if (arity === 'one') {
      cond.value = coerceValue(raw.value as CrmValue, dataType)
    }
    out.push(cond)
  }
  return out
}

// The command bar accepts full text plus typed scope tokens `attr:value`. A token whose key
// resolves to a filterable field (by attr key or humanized label) becomes a real eq filter;
// everything else stays free text for the server full-text search. This is the honest mapping
// the mockup's `stage:demo` token promises -- one filter contract, no separate scope engine.
export interface ParsedCommand { filters: CrmFilter[]; text: string }

function resolveTokenField(key: string, fields: CrmAttribute[]): CrmAttribute | undefined {
  const lower = key.toLowerCase()
  return filterableFields(fields).find(
    (field) => field.attr.toLowerCase() === lower || (field.label || '').toLowerCase() === lower || humanize(field.attr).toLowerCase() === lower,
  )
}

export function parseScopeTokens(raw: string, fields: CrmAttribute[]): ParsedCommand {
  const filters: CrmFilter[] = []
  const text: string[] = []
  for (const word of String(raw || '').split(/\s+/)) {
    if (!word) continue
    const match = /^([A-Za-z][\w]*):(.+)$/.exec(word)
    const field = match ? resolveTokenField(match[1], fields) : undefined
    if (match && field) filters.push({ attr: field.attr, op: 'eq', value: coerceValue(match[2], field.data_type) })
    else text.push(word)
  }
  return { filters, text: text.join(' ') }
}

export interface ChipParts { field: string; op: string; value: string }

function displayScalar(value: CrmValue | undefined, field?: CrmAttribute): string {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (field?.data_type === 'relation') return humanizeKey(String(value))
  return String(value)
}

// A removable chip's parts: humanized field label (never the raw attr key), operator
// label, and a type-aware value string.
export function describeCondition(cond: FilterCondition, field?: CrmAttribute): ChipParts {
  const meta = OPERATORS[cond.op]
  const label = field?.label || humanize(cond.attr)
  if (!meta) return { field: label, op: cond.op, value: '' }
  if (meta.arity === 'none') return { field: label, op: meta.label, value: '' }
  if (meta.arity === 'two') return { field: label, op: meta.label, value: `${displayScalar(cond.value, field)} – ${displayScalar(cond.value2, field)}` }
  if (meta.arity === 'list') return { field: label, op: meta.label, value: (Array.isArray(cond.value) ? cond.value : []).map((item) => displayScalar(item as CrmValue, field)).join(', ') }
  return { field: label, op: meta.label, value: displayScalar(cond.value, field) }
}
