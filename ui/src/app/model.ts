// Pure payload logic for the CRM merge-review card. No DOM, no framework — the
// Vue component is a thin renderer over these functions so the parsing and the
// per-action form assembly are unit-testable in isolation.

export const MERGE_ACTIONS = ['merged', 'do_not_merge', 'skipped'] as const
export type MergeAction = (typeof MERGE_ACTIONS)[number]

export interface MatchedAttr {
  attr: string
  value: string
}

export interface RecordSide {
  id: string
  label: string
  values: Array<{ attr: string; value: string }>
  aliases: string[]
  activityCount: number | null
}

export interface MergeModel {
  ok: true
  itemId: string
  crmId: string
  objectType: string
  content: string
  confidence: number
  reasonCode: string
  reasonLabel: string
  matched: MatchedAttr[]
  matchedAttrs: string[]
  left: RecordSide
  right: RecordSide
  workflow: { workflowId: string; runId: string; dataflowId: string; signalId: string }
}

export interface MalformedModel {
  ok: false
  itemId: string
  content: string
  raw: string
  error: string
}

export type CardModel = MergeModel | MalformedModel

const REASON_LABELS: Record<string, string> = {
  email_exact: 'Same email address',
  website_domain_exact: 'Same website domain',
  domain_exact: 'Same domain',
  domain_name: 'Same domain and a similar name',
  value_exact: 'Matching field value',
}

function str(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function trim(v: unknown): string {
  return str(v).replace(/^\s+|\s+$/g, '')
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function clampConfidence(v: unknown): number {
  const n = typeof v === 'number' ? v : Number.parseFloat(str(v))
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

export function reasonLabel(code: string): string {
  const key = trim(code).toLowerCase()
  if (!key) return 'Possible duplicate'
  if (REASON_LABELS[key]) return REASON_LABELS[key]
  return key
    .replace(/[._]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function confidenceTone(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.85) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

export function confidencePercent(confidence: number): number {
  return Math.round(clampConfidence(confidence) * 100)
}

// Evidence rides as a single object (the winning pattern's match) or, defensively,
// as an array of them. Each pattern kind carries a different shape; normalize all
// of them into a flat list of {attr, value} pairs used both for the "why" strip
// and for highlighting the matching rows in each record column.
export function matchedAttributes(evidence: unknown): MatchedAttr[] {
  const entries = Array.isArray(evidence) ? evidence : evidence ? [evidence] : []
  const out: MatchedAttr[] = []
  for (const entry of entries) {
    if (!isObj(entry)) continue
    // domain_name pattern: matched domain + a name-similarity signal.
    if (entry.domain_attr || entry.name_attr) {
      const domainAttr = trim(entry.domain_attr)
      const domain = trim(entry.domain)
      if (domainAttr && domain) out.push({ attr: domainAttr, value: domain })
      const nameAttr = trim(entry.name_attr)
      const sim = typeof entry.name_similarity === 'number' ? entry.name_similarity : Number.parseFloat(str(entry.name_similarity))
      if (nameAttr && Number.isFinite(sim)) out.push({ attr: nameAttr, value: `${Math.round(sim * 100)}% name match` })
      continue
    }
    const attr = trim(entry.attr)
    if (!attr) continue
    const value = entry.value !== undefined ? trim(entry.value) : trim(entry.domain)
    out.push({ attr, value })
  }
  return out
}

// A record side may arrive under context.left / context.right (preferred) or be
// absent entirely — the CRM merge-review Block input may carry only the ids. Render
// whatever is present; never fetch. Accepts either a {values:{}} wrapper or a flat
// attribute map, plus optional aliases / activity_count.
function readSide(id: string, ctx: unknown): RecordSide {
  const side: RecordSide = { id, label: id || '(unknown record)', values: [], aliases: [], activityCount: null }
  if (!isObj(ctx)) return side

  const rawValues = isObj(ctx.values) ? ctx.values : ctx
  const values: Array<{ attr: string; value: string }> = []
  for (const [k, v] of Object.entries(rawValues)) {
    if (k === 'values' || k === 'aliases' || k === 'activity_count' || k === 'activityCount' || k === 'label' || k === 'record_id') continue
    const val = trim(v)
    if (val) values.push({ attr: k, value: val })
  }
  side.values = values

  const aliases = Array.isArray(ctx.aliases) ? ctx.aliases : []
  side.aliases = aliases.map(trim).filter((a) => a !== '')

  const count = ctx.activity_count !== undefined ? ctx.activity_count : ctx.activityCount
  const n = typeof count === 'number' ? count : Number.parseInt(str(count), 10)
  side.activityCount = Number.isFinite(n) ? n : null

  const label = trim(ctx.label)
  side.label = label || labelFrom(values) || id || '(unknown record)'
  return side
}

function labelFrom(values: Array<{ attr: string; value: string }>): string {
  const byAttr = (name: string) => values.find((v) => v.attr === name)?.value
  return byAttr('name') || byAttr('email') || byAttr('website') || ''
}

export function parseMeta(itemId: string, content: string, rawMeta: unknown): CardModel {
  const raw = typeof rawMeta === 'string' ? rawMeta : rawMeta === undefined || rawMeta === null ? '' : safeStringify(rawMeta)
  const malformed = (error: string): MalformedModel => ({ ok: false, itemId: trim(itemId), content: trim(content), raw, error })

  if (trim(raw) === '' && !isObj(rawMeta)) return malformed('No merge details were provided.')

  let meta: unknown
  if (isObj(rawMeta)) {
    meta = rawMeta
  } else {
    try {
      meta = JSON.parse(raw)
    } catch {
      return malformed('Merge details could not be read.')
    }
  }
  if (!isObj(meta)) return malformed('Merge details are not in the expected format.')

  const leftId = trim(meta.left_id)
  const rightId = trim(meta.right_id)
  if (!leftId || !rightId) return malformed('Merge details are missing the records to compare.')

  const matched = matchedAttributes(meta.evidence)
  const context = isObj(meta.context) ? meta.context : {}
  const reasonCode = trim(meta.reason)

  return {
    ok: true,
    itemId: trim(itemId),
    crmId: trim(meta.crm_id),
    objectType: trim(meta.object_type) || 'record',
    content: trim(content),
    confidence: clampConfidence(meta.confidence),
    reasonCode,
    reasonLabel: reasonLabel(reasonCode),
    matched,
    matchedAttrs: matched.map((m) => m.attr),
    left: readSide(leftId, context.left),
    right: readSide(rightId, context.right),
    workflow: {
      workflowId: trim(meta.workflow_id),
      runId: trim(meta.run_id),
      dataflowId: trim(meta.dataflow_id),
      signalId: trim(meta.signal_id),
    },
  }
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v)
  } catch {
    return ''
  }
}

export interface FormOpts {
  leftId: string
  rightId: string
  winnerId?: string
  note?: string
}

export interface AssembledForm {
  form: Record<string, unknown> | null
  error: string | null
}

// Maps the action-specific fields into the form. The Inbox action is a separate,
// top-level value and is never duplicated inside this payload.
export function assembleForm(action: string, opts: FormOpts): AssembledForm {
  const note = trim(opts.note)
  const withNote = (form: Record<string, unknown>): Record<string, unknown> => (note ? { ...form, note } : form)

  switch (action) {
    case 'merged': {
      const winner = trim(opts.winnerId)
      if (winner !== opts.leftId && winner !== opts.rightId) {
        return { form: null, error: 'Select which record to keep.' }
      }
      const loser = winner === opts.leftId ? opts.rightId : opts.leftId
      return { form: withNote({ winner_id: winner, loser_id: loser }), error: null }
    }
    case 'do_not_merge':
    case 'skipped':
      return { form: withNote({}), error: null }
    default:
      return { form: null, error: `Unknown action: ${action}` }
  }
}
