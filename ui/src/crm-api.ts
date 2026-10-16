import { api } from '@wippy-fe/proxy'
import { type CrmActivity, type CrmBootstrap, type CrmCommand, type CrmFilter, type CrmRecord, type CrmRecordPanel, type CrmSchemaDeclaration, type CrmSchemaState, type CrmSort } from './crm-types'

interface Envelope<T> { success: boolean; data: T; error?: string; message?: string }

// Every list read is a page: the reader returns { rows, total, limit, offset } so the UI
// reports an honest "N of total" and loads more instead of fetching a whole object type.
export interface RecordPage { rows: CrmRecord[]; total: number; limit: number; offset: number }
export interface Page<T> { rows: T[]; total: number; limit: number; offset: number }
export interface MergeReviewRow {
  left_id: string; right_id: string; object_type: string; decision: string
  confidence?: number; reason?: string; evidence_hash?: string; resolved_by?: string; resolved_at?: string; updated_at?: string
}
export interface BoardLane { records: Array<{ record_id: string; position: number }>; total: number }

function message(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error) {
    const row = error as { response?: { data?: { error?: string; message?: string } }; error?: string; message?: string }
    return row.response?.data?.message || row.response?.data?.error || row.message || row.error || fallback
  }
  return fallback
}

export interface WorkspaceCandidate { crm_id: string; component_id: string; label: string }

// GET /workspace/crm answers 409 { code: "multiple_crm_components", candidates } when the
// caller can reach more than one CRM component and named none. bootstrap raises this typed
// signal so the shell renders a workspace chooser instead of dead-ending on the error.
export class CrmWorkspaceChoice extends Error {
  readonly candidates: WorkspaceCandidate[]
  constructor(candidates: WorkspaceCandidate[]) {
    super('Multiple CRM workspaces are available.')
    this.name = 'CrmWorkspaceChoice'
    this.candidates = candidates
  }
}

function workspaceCandidates(payload: unknown): WorkspaceCandidate[] | null {
  const body = payload as { code?: string; candidates?: unknown } | null
  if (body?.code !== 'multiple_crm_components' || !Array.isArray(body.candidates)) return null
  const out: WorkspaceCandidate[] = []
  for (const row of body.candidates) {
    const c = row as Partial<WorkspaceCandidate>
    if (typeof c.crm_id === 'string' && c.crm_id.trim() && typeof c.component_id === 'string' && c.component_id.trim() && typeof c.label === 'string' && c.label.trim()) {
      out.push({ crm_id: c.crm_id.trim(), component_id: c.component_id.trim(), label: c.label.trim() })
    }
  }
  return out.length ? out : null
}

function assertSuccess<T>(payload: Envelope<T>, fallback: string): T {
  if (payload?.success !== true) throw new Error(payload?.error || payload?.message || fallback)
  if (!Object.prototype.hasOwnProperty.call(payload, 'data')) throw new Error(`${fallback} Response data is missing.`)
  return payload.data
}

function normalizeRecord(row: unknown): CrmRecord {
  if (typeof row !== 'object' || row === null || typeof (row as CrmRecord).record_id !== 'string' || typeof (row as CrmRecord).object_type !== 'string' || typeof (row as CrmRecord).values !== 'object' || (row as CrmRecord).values === null) {
    throw new Error('CRM returned an invalid record.')
  }
  const record = row as CrmRecord
  return record
}

function toRecordPage(data: unknown): RecordPage {
  const raw = data as Partial<RecordPage> | null
  if (!raw || !Array.isArray(raw.rows) || !Number.isFinite(raw.total) || !Number.isFinite(raw.limit) || !Number.isFinite(raw.offset)) throw new Error('CRM returned an invalid record page.')
  return { rows: raw.rows.map(normalizeRecord), total: Number(raw.total), limit: Number(raw.limit), offset: Number(raw.offset) }
}

function toPage<T>(data: unknown): Page<T> {
  const raw = data as Partial<Page<T>> | null
  if (!raw || !Array.isArray(raw.rows) || !Number.isFinite(raw.total) || !Number.isFinite(raw.limit) || !Number.isFinite(raw.offset)) throw new Error('CRM returned an invalid page.')
  return { rows: raw.rows, total: Number(raw.total), limit: Number(raw.limit), offset: Number(raw.offset) }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBootstrap(value: unknown): value is CrmBootstrap {
  return isObject(value) && value.success === true && typeof value.crm_id === 'string'
    && typeof value.workspace_label === 'string' && !!value.workspace_label.trim()
    && typeof value.can_write === 'boolean' && Array.isArray(value.objects)
    && Array.isArray(value.attributes) && Array.isArray(value.pipelines) && Array.isArray(value.views)
}

export interface CrmNotProvisioned { success: true; provisioned: false; can_create: boolean }
export function isNotProvisioned(value: CrmBootstrap | CrmNotProvisioned): value is CrmNotProvisioned {
  return 'provisioned' in value && value.provisioned === false
}

export async function bootstrap(componentId = ''): Promise<CrmBootstrap | CrmNotProvisioned> {
  try {
    const path = componentId ? `/api/v1/workspace/crm/${encodeURIComponent(componentId)}` : '/api/v1/workspace/crm'
    const { data } = await api.get<unknown>(path)
    if (!isObject(data)) throw new Error('CRM returned an invalid bootstrap response.')
    if (data.success === true && data.provisioned === false) {
      if (typeof data.can_create !== 'boolean') throw new Error('CRM returned an invalid creation capability.')
      return { success: true, provisioned: false, can_create: data.can_create }
    }
    if (data.success === false) {
      const candidates = workspaceCandidates(data)
      if (candidates) throw new CrmWorkspaceChoice(candidates)
      throw new Error(typeof data.error === 'string' ? data.error : 'CRM could not be opened.')
    }
    if (!isBootstrap(data)) throw new Error('CRM returned an invalid bootstrap response.')
    return data
  } catch (error) {
    if (error instanceof CrmWorkspaceChoice) throw error
    // A 409 raised by the transport carries the same body on error.response.data.
    const responseData = isObject(error) && isObject(error.response) ? error.response.data : undefined
    const candidates = workspaceCandidates(responseData)
    if (candidates) throw new CrmWorkspaceChoice(candidates)
    throw new Error(message(error, 'CRM could not be opened.'))
  }
}

async function query<T>(crmId: string, body: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await api.post<Envelope<T>>(`/api/v1/workspace/crm/${encodeURIComponent(crmId)}/query`, body)
    return assertSuccess(data, 'CRM query failed.')
  } catch (error) { throw new Error(message(error, 'CRM query failed.')) }
}

export interface ListOptions { filters?: CrmFilter[]; sort?: CrmSort; search?: string; limit?: number; offset?: number }

export async function listRecords(crmId: string, objectType: string, opts: ListOptions = {}): Promise<RecordPage> {
  const body: Record<string, unknown> = { kind: 'records', object_type: objectType, filters: opts.filters ?? [] }
  if (opts.sort) body.sort = opts.sort
  if (opts.search && opts.search.trim()) body.search = opts.search.trim()
  if (typeof opts.limit === 'number') body.limit = opts.limit
  if (typeof opts.offset === 'number') body.offset = opts.offset
  return toRecordPage(await query<unknown>(crmId, body))
}

// The object's grand total, independent of the active filters, for the object rail badge.
export async function countRecords(crmId: string, objectType: string): Promise<number> {
  const total = await query<unknown>(crmId, { kind: 'count', object_type: objectType })
  const n = typeof total === 'number' ? total : Number(total)
  return Number.isFinite(n) ? n : 0
}

// Bounded name/label hydration for detail, related, and board cards -- never scans an object type.
export async function recordsByIds(crmId: string, ids: string[]): Promise<CrmRecord[]> {
  if (!ids.length) return []
  const rows = await query<unknown>(crmId, { kind: 'records_by_ids', ids })
  if (!Array.isArray(rows)) throw new Error('CRM returned an invalid record collection.')
  return rows.map(normalizeRecord)
}

export async function getRecord(crmId: string, recordId: string): Promise<CrmRecord | null> {
  const row = await query<unknown>(crmId, { kind: 'record', record_id: recordId })
  if (row === null) return null
  return normalizeRecord(row)
}

export async function getRecordPanels(crmId: string, objectType: string): Promise<CrmRecordPanel[]> {
  try {
    const { data } = await api.get<unknown>(`/api/v1/workspace/crm/${encodeURIComponent(crmId)}/panels/${encodeURIComponent(objectType)}`)
    const body = data as { success?: unknown; panels?: unknown; error?: unknown } | null
    if (body?.success !== true || !Array.isArray(body.panels)) throw new Error(typeof body?.error === 'string' ? body.error : 'CRM record panels could not load.')
    const panels: CrmRecordPanel[] = []
    for (const row of body.panels) {
      const panel = row as Partial<CrmRecordPanel>
      if (typeof panel.tag !== 'string' || !panel.tag.trim() || typeof panel.title !== 'string' || !panel.title.trim() || !Number.isFinite(panel.order) || !Array.isArray(panel.object_types) || !panel.object_types.every((object) => typeof object === 'string')) {
        throw new Error('CRM returned an invalid record panel.')
      }
      panels.push({ tag: panel.tag, title: panel.title, order: Number(panel.order), object_types: panel.object_types })
    }
    return panels
  } catch (error) { throw new Error(message(error, 'CRM record panels could not load.')) }
}

// The real membership board, bound to an explicit collection -- lanes with honest per-lane
// totals, not a heuristic over record values.
export async function getBoard(crmId: string, collectionId: string, opts: { limit?: number; offset?: number } = {}): Promise<Record<string, BoardLane>> {
  const body: Record<string, unknown> = { kind: 'board', collection_id: collectionId }
  if (typeof opts.limit === 'number') body.limit = opts.limit
  if (typeof opts.offset === 'number') body.offset = opts.offset
  const data = await query<unknown>(crmId, body)
  if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new Error('CRM returned an invalid board.')
  return data as Record<string, BoardLane>
}

export function getTimeline(crmId: string, recordId?: string, limit = 100): Promise<CrmActivity[]> {
  return query(crmId, { kind: 'timeline', ...(recordId ? { record_id: recordId } : {}), limit })
}

// Review queues read straight from the CRM read model. status defaults to "pending" (the
// queue); resolution still flows through the Inbox card / the merge.decided apply path.
export async function mergeReviews(crmId: string, opts: { status?: string; limit?: number; offset?: number } = {}): Promise<Page<MergeReviewRow>> {
  return toPage<MergeReviewRow>(await query<unknown>(crmId, { kind: 'merge_reviews', ...opts }))
}
export async function applyCommands(crmId: string, commands: CrmCommand[]): Promise<void> {
  try {
    const { data } = await api.post<Envelope<never>>(`/api/v1/workspace/crm/${encodeURIComponent(crmId)}/apply`, { commands })
    if (data?.success !== true) throw new Error(data?.error || 'CRM write failed.')
  } catch (error) { throw new Error(message(error, 'CRM write failed.')) }
}

function schemaState(payload: unknown): CrmSchemaState {
  const body = payload as { success?: boolean; revision?: unknown; declaration?: Partial<CrmSchemaDeclaration>; error?: string } | null
  const declaration = body?.declaration
  if (body?.success !== true) throw new Error(body?.error || 'CRM schema request failed.')
  if ((typeof body.revision !== 'string' && typeof body.revision !== 'number') || !declaration || !Array.isArray(declaration.objects) || !Array.isArray(declaration.attributes) || !Array.isArray(declaration.pipelines) || !Array.isArray(declaration.views)) {
    throw new Error('CRM returned an invalid schema response.')
  }
  return { revision: String(body.revision), declaration: declaration as CrmSchemaDeclaration }
}

export async function getSchema(crmId: string): Promise<CrmSchemaState> {
  try {
    const { data } = await api.get<unknown>(`/api/v1/workspace/crm/${encodeURIComponent(crmId)}/schema`)
    return schemaState(data)
  } catch (error) { throw new Error(message(error, 'CRM schema could not load.')) }
}

export async function applySchema(crmId: string, expectedRevision: string, declaration: CrmSchemaDeclaration): Promise<CrmSchemaState> {
  try {
    const { data } = await api.post<unknown>(`/api/v1/workspace/crm/${encodeURIComponent(crmId)}/schema`, { expected_revision: expectedRevision, declaration })
    return schemaState(data)
  } catch (error) { throw new Error(message(error, 'CRM schema could not be saved.')) }
}

// Per-user list state (columns, sort, density, private saved views) on the canonical
// kickside.users.profile store (namespace "crm", key "list_views"), keyed by crm id then
// object type. This is the one per-user persistence story -- never localStorage.
const PROFILE_NS = 'crm'
const PROFILE_KEY = 'list_views'
export type ListViewsState = Record<string, unknown>

export async function readListViews(): Promise<ListViewsState> {
  try {
    const { data } = await api.get<{ success: boolean; value: unknown }>(`/api/v1/profile?namespace=${PROFILE_NS}&key=${PROFILE_KEY}`)
    if (data?.success !== true) throw new Error('CRM list-view preferences could not load.')
    if (data.value === null) return {}
    if (typeof data.value !== 'object' || Array.isArray(data.value)) throw new Error('CRM returned invalid list-view preferences.')
    return data.value as ListViewsState
  } catch (error) { throw new Error(message(error, 'CRM list-view preferences could not load.')) }
}

export async function writeListViews(value: ListViewsState): Promise<void> {
  try {
    const { data } = await api.put<{ success: boolean; error?: string }>('/api/v1/profile', { namespace: PROFILE_NS, key: PROFILE_KEY, value })
    if (data?.success !== true) throw new Error(data?.error || 'CRM list-view preferences could not save.')
  } catch (error) { throw new Error(message(error, 'CRM list-view preferences could not save.')) }
}

export interface SchemaImportResult { changed: boolean; revision: string; source_hash: string }
export async function importConfig(crmId: string, expectedRevision: string, artifact: unknown): Promise<SchemaImportResult> {
  try {
    const { data } = await api.post<{ success: boolean; result?: Partial<SchemaImportResult>; error?: string }>(`/api/v1/workspace/crm/${encodeURIComponent(crmId)}/config/import`, { expected_revision: expectedRevision, artifact })
    if (data?.success !== true) throw new Error(data?.error || 'Configuration import failed.')
    if (!data.result || typeof data.result.changed !== 'boolean' || typeof data.result.revision !== 'string' || typeof data.result.source_hash !== 'string') throw new Error('Configuration import returned an invalid result.')
    return data.result as SchemaImportResult
  } catch (error) { throw new Error(message(error, 'Configuration import failed.')) }
}

export async function exportConfig(crmId: string): Promise<Record<string, unknown>> {
  try {
    const { data } = await api.get<Envelope<Record<string, unknown>> & { config?: Record<string, unknown> }>(`/api/v1/workspace/crm/${encodeURIComponent(crmId)}/config/export`)
    if (data?.success !== true) throw new Error(data?.error || 'Configuration export failed.')
    if (!data.config || typeof data.config !== 'object') throw new Error('Configuration export is empty.')
    return data.config
  } catch (error) { throw new Error(message(error, 'Configuration export failed.')) }
}

export async function readSettings(): Promise<Record<string, unknown>> {
  try {
    const { data } = await api.get<{ success: boolean; settings: Array<{ key: string; value?: unknown; default?: unknown }> }>('/api/v1/settings?namespace=kickside.crm')
    if (data?.success !== true || !Array.isArray(data.settings)) throw new Error('CRM returned invalid settings.')
    const rows = data.settings
    return Object.fromEntries(rows.map((row: { key: string; value?: unknown; default?: unknown }) => [row.key, row.value ?? row.default]))
  } catch (error) { throw new Error(message(error, 'CRM settings could not load.')) }
}

export async function writeSetting(key: string, value: unknown): Promise<void> {
  try {
    const { data } = await api.put<Envelope<never>>('/api/v1/settings', { namespace: 'kickside.crm', key, value })
    if (data?.success !== true) throw new Error(data?.error || 'Setting could not be saved.')
  } catch (error) { throw new Error(message(error, 'Setting could not be saved.')) }
}

export { message as crmErrorMessage }
