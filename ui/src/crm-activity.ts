import type { CrmActivity } from './crm-types'
import { humanize, isPlainObject, structuredLines, type StructuredLine } from './crm-model'

// What a record's chronology is made of, as the reader meets it. Every function
// here is pure: the record page owns the reads, this owns the reading.

const ACTIVITY_LABELS: Record<string, string> = {
  meeting: 'Meeting',
  call: 'Call',
  email: 'Email',
  note: 'Note',
  task: 'Task',
}

const ACTIVITY_ICONS: Record<string, string> = {
  meeting: 'tabler:calendar-event',
  call: 'tabler:phone',
  email: 'tabler:mail',
  note: 'tabler:note',
  task: 'tabler:checkbox',
}

// Producers write the compass point, not the sentence: "in"/"out" from the
// engagement bridge. Both spellings map so a source that writes the long form
// reads the same.
const DIRECTION_LABELS: Record<string, string> = {
  in: 'Inbound',
  inbound: 'Inbound',
  out: 'Outbound',
  outbound: 'Outbound',
}

// Meeting outcomes arrive as the upstream CRM's own constants. A reader never
// sees a constant.
const OUTCOME_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  rescheduled: 'Rescheduled',
  no_show: 'No show',
  canceled: 'Canceled',
  cancelled: 'Canceled',
}

const MEETING = 'meeting'

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function code(value: unknown): string {
  return text(value).toLowerCase()
}

export function activityLabel(activityType: string): string {
  return ACTIVITY_LABELS[code(activityType)] || humanize(text(activityType)) || 'Activity'
}

export function activityIcon(activityType: string): string {
  return ACTIVITY_ICONS[code(activityType)] || 'tabler:point'
}

export function directionLabel(direction: unknown): string {
  const key = code(direction)
  if (!key) return ''
  return DIRECTION_LABELS[key] || humanize(key)
}

export function outcomeLabel(outcome: unknown): string {
  const key = code(outcome)
  if (!key) return ''
  return OUTCOME_LABELS[key] || humanize(key)
}

// A duration reads in the units a person would say it in.
export function durationLabel(seconds: unknown): string {
  const total = typeof seconds === 'number' ? seconds : Number.parseFloat(text(seconds))
  if (!Number.isFinite(total) || total <= 0) return ''
  const minutes = Math.round(total / 60)
  if (minutes < 1) return 'Under a minute'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
}

// The activity's own words when it has them; otherwise what kind of thing it is.
// The activity id is never a title -- an id is not something that happened.
export function activityTitle(activity: CrmActivity): string {
  return text(activity.payload?.title) || activityLabel(activity.activity_type)
}

// A person read out of an address. The address stays available as the row's
// title text, so a derived name is never the only thing on offer.
export function personName(email: string): string {
  const local = text(email).split('@')[0] ?? ''
  const parts = local.split(/[._+-]+/).filter((part) => part !== '')
  if (!parts.length) return text(email)
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export interface Participant { name: string; email: string }

// Who else was there. The record's own address drops out: a person's page does
// not need every line to say the person attended.
export function participants(activity: CrmActivity, exclude = ''): Participant[] {
  const raw = activity.payload?.attendee_emails
  const list = Array.isArray(raw) ? raw : []
  const self = text(exclude).toLowerCase()
  const seen = new Set<string>()
  const out: Participant[] = []
  for (const entry of list) {
    const email = text(typeof entry === 'string' ? entry : (entry as { email?: unknown })?.email)
    const key = email.toLowerCase()
    if (!email || key === self || seen.has(key)) continue
    seen.add(key)
    out.push({ name: personName(email), email })
  }
  return out
}

// The identity the producing system knows this activity by, without the system's
// own name in front of it. A CRM activity carries "<source>:<id>" because the
// producer composed it that way; the systems it came from index the bare id.
// Only the source prefix the row itself declares is removed -- nothing is
// guessed from punctuation.
export function externalReference(activity: CrmActivity): string {
  const row = activity as unknown as { external_id?: unknown; source?: unknown }
  const raw = text(row.external_id)
  if (!raw) return ''
  const source = text(row.source)
  return source && raw.startsWith(`${source}:`) ? raw.slice(source.length + 1) : raw
}

export function isMeeting(activity: CrmActivity): boolean {
  return code(activity.activity_type) === MEETING
}

// The bare external references of the meetings on screen, deduplicated. Only
// meetings: no other activity kind is addressed by a meetings component.
export function meetingReferences(activities: CrmActivity[]): string[] {
  const out: string[] = []
  for (const activity of activities) {
    if (!isMeeting(activity)) continue
    const reference = externalReference(activity)
    if (reference && !out.includes(reference)) out.push(reference)
  }
  return out
}

// Bounded request batches. The meetings API answers a page, so a chronology
// longer than one page asks in several queries instead of truncating silently.
export function chunk<T>(items: T[], size: number): T[][] {
  const bounded = Math.max(1, Math.floor(size))
  const out: T[][] = []
  for (let index = 0; index < items.length; index += bounded) out.push(items.slice(index, index + bounded))
  return out
}

// external reference -> meeting id, over what the meetings API answered with.
// The API answers only the meetings the caller may read, so a reference this map
// has no entry for names a call the viewer was never granted: the row keeps its
// place in the chronology and offers no way in.
export function meetingIdByReference(items: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (!Array.isArray(items)) return out
  for (const raw of items) {
    const row = (raw ?? {}) as Record<string, unknown>
    const meetingId = text(row.meeting_id)
    if (!meetingId) continue
    const refs = Array.isArray(row.refs) ? row.refs : []
    for (const entry of refs) {
      const reference = text((entry as Record<string, unknown>)?.external_id)
      if (reference) out[reference] = meetingId
    }
  }
  return out
}

// Where the workbench opens a meeting. An href, not a CRM route: the meetings
// page is another surface's address and the CRM never routes into it itself.
export function meetingHref(meetingId: string): string {
  const id = text(meetingId)
  return id ? `/meetings/${encodeURIComponent(id)}` : ''
}

export function activityHref(activity: CrmActivity, byReference: Record<string, string>): string {
  if (!isMeeting(activity)) return ''
  const reference = externalReference(activity)
  return reference ? meetingHref(byReference[reference] || '') : ''
}

export interface ActivityFact { key: string; label: string; icon?: string }

// The facts that distinguish one row from the next, in the order a reader scans
// them: what kind of thing it was, how long it ran, which way it went, how it
// ended, and whether there is a record of what was said. A fact with no value
// is not a fact and never renders as an empty slot.
export function activityFacts(activity: CrmActivity): ActivityFact[] {
  const row = activity as unknown as { duration_sec?: unknown; direction?: unknown; outcome?: unknown; has_transcript?: unknown }
  const facts: ActivityFact[] = [{ key: 'type', label: activityLabel(activity.activity_type) }]
  const duration = durationLabel(row.duration_sec)
  if (duration) facts.push({ key: 'duration', label: duration, icon: 'tabler:clock' })
  const direction = directionLabel(row.direction)
  if (direction) facts.push({ key: 'direction', label: direction, icon: 'tabler:arrows-left-right' })
  const outcome = outcomeLabel(row.outcome)
  if (outcome) facts.push({ key: 'outcome', label: outcome, icon: 'tabler:flag' })
  if (row.has_transcript === true) facts.push({ key: 'transcript', label: 'Transcript', icon: 'tabler:file-text' })
  if (activity.due_at && activity.done !== true) facts.push({ key: 'due', label: 'Open', icon: 'tabler:hourglass' })
  return facts
}

// Where the row came from, in the words a reader uses for the system rather than
// the constant the producer wrote. A row whose source nobody recorded says
// nothing rather than saying "Unknown".
export function sourceLabel(activity: CrmActivity): string {
  const raw = text((activity as unknown as { source?: unknown }).source)
  return raw ? humanize(raw.toLowerCase()) : ''
}

// The keys the row has already read out in its own line, so the detail
// disclosure repeats none of them.
const STATED_PAYLOAD_KEYS = ['title', 'attendee_emails']

// What the producer wrote beyond the row's own headline: a note's body, a call's
// summary, whatever else a source contributed to this activity's payload. The
// keys are the producer's, so nothing here names one deployment's fields -- the
// payload is rendered as the labelled lines it already is.
export function activityDetails(activity: CrmActivity): StructuredLine[] {
  const payload = activity.payload
  if (!isPlainObject(payload)) return []
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(payload)) {
    if (STATED_PAYLOAD_KEYS.includes(key)) continue
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    if (isPlainObject(value) && Object.keys(value).length === 0) continue
    rest[key] = value
  }
  if (!Object.keys(rest).length) return []
  return structuredLines(rest).filter((line) => line.text !== '' && line.text !== '—')
}

// Which record a row is keyed to, when that is not the record being read. The
// chronology of a company is made of its people's calls and its deals' meetings;
// naming the record each row belongs to is what keeps a rolled-up history honest.
export function anchorRecordId(activity: CrmActivity, viewedRecordId: string): string {
  const anchor = text(activity.record_id)
  return anchor && anchor !== text(viewedRecordId) ? anchor : ''
}

// When this record was last touched, for the page header. The chronology is
// ordered newest first, so the answer is the first row that carries a time.
export function lastTouchedAt(activities: CrmActivity[]): string {
  for (const activity of activities) {
    const at = text(activity.occurred_at)
    if (at) return at
  }
  return ''
}
