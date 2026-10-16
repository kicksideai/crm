<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { host } from '@wippy-fe/proxy'
import { applyCommands, countRecords, crmErrorMessage, getBoard, getTimeline, listRecords, readListViews, recordsByIds, writeListViews, type ListViewsState } from '../crm-api'
import { createRecordCommands } from '../crm-commands'
import { CRM_EVENTS, type CrmActivity, type CrmAttribute, type CrmObject, type CrmPipeline, type CrmRecord, type CrmValue, type CrmView, type PipelineStage } from '../crm-types'
import { apiName, defaultColumns, displayValue, formatTimestamp, indexRecordNames, initials, objectAttributes, objectName, objectPipeline, recordId, recordLabel, relationEntries, relationValues, stages, subtitleFields, titleField, type NameIndex } from '../crm-model'
import { deserializeFilters, parseScopeTokens, serializeConditions, type FilterCondition } from '../crm-filter'
import type { CrmFilter } from '../crm-types'
import { recordRoute } from '../crm-route'
import CrmFilterBar from './CrmFilterBar.vue'
import ValueDisplay from './ValueDisplay.vue'
import RecordEditor from './RecordEditor.vue'

const PAGE = 50
const LANE_PAGE = 30
// The columns every record carries whatever the schema declares, which a view may
// therefore sort on without declaring them as fields.
const SORTABLE_SYSTEM_ATTRS = ['updated_at', 'created_at', 'record_id']

const props = withDefaults(defineProps<{ crmId: string; object: CrmObject; objects: CrmObject[]; attributes: CrmAttribute[]; pipelines: CrmPipeline[]; views: CrmView[]; canWrite?: boolean; revision?: number }>(), { canWrite: true, revision: 0 })
const emit = defineEmits<{ navigate: [route: string]; changed: [] }>()
const records = ref<CrmRecord[]>([])
const names = ref<NameIndex>({})
const timeline = ref<CrmActivity[]>([])
const boardLanes = ref<Record<string, { rows: CrmRecord[]; total: number }>>({})
const layout = ref<'table' | 'board' | 'timeline'>('table')
const command = ref('')
const search = ref('')
const tokenFilters = ref<CrmFilter[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const createOpen = ref(false)
const saving = ref(false)
const columnsOpen = ref(false)
const columnsMenuId = useId()
const saveViewOpen = ref(false)
const viewNameDraft = ref('')
const activeViewId = ref('')
const privateViews = ref<CrmView[]>([])
const sort = ref<{ attr: string; dir: 'asc' | 'desc' }>({ attr: '', dir: 'asc' })
const conditions = ref<FilterCondition[]>([])
const total = ref(0)
const grandTotal = ref(0)
const offset = ref(0)
let profileState: ListViewsState = {}

const fields = computed(() => objectAttributes(props.attributes, props.object.type))
const title = computed(() => titleField(fields.value))
const subtitles = computed(() => subtitleFields(fields.value))
const objectViews = computed(() => [...props.views.filter((view) => view.object_type === props.object.type), ...privateViews.value])
// The one filter authority: the criteria editor's conditions plus the command bar's typed
// scope tokens, both serialized by the same contract before they cross the API.
const activeFilters = computed(() => [...serializeConditions(conditions.value, fields.value), ...tokenFilters.value])
const pipeline = computed(() => objectPipeline(props.pipelines, props.object))
const fieldMap = computed(() => Object.fromEntries(fields.value.map((field) => [field.attr, field])))
const validAttrs = computed(() => new Set(fields.value.map((field) => field.attr)))
const defaultView = computed(() => props.views.find((view) => view.object_type === props.object.type && (view.layout === 'table' || !view.layout) && Array.isArray(view.spec?.columns) && (view.spec?.columns?.length || 0) > 0))
const baseColumns = computed(() => {
  const declared = defaultView.value?.spec?.columns?.filter((column) => validAttrs.value.has(column))
  return declared && declared.length ? declared : defaultColumns(fields.value)
})
const chosen = ref<string[] | null>(null)
const columns = computed(() => {
  const picked = chosen.value ? chosen.value.filter((column) => validAttrs.value.has(column)) : []
  return picked.length ? picked : baseColumns.value
})
const recordMap = computed(() => Object.fromEntries(records.value.map((record) => [record.record_id, record])))
const isNarrowed = computed(() => activeFilters.value.length > 0 || search.value.trim() !== '')
const shown = computed(() => records.value.length)
const hasMore = computed(() => shown.value < total.value)
const boardTotal = computed(() => Object.values(boardLanes.value).reduce((total, lane) => total + lane.total, 0))
const countLabel = computed(() => {
  const word = (n: number) => (n === 1 ? objectName(props.object).toLowerCase() : props.object.label.toLowerCase())
  if (layout.value === 'board') return `${boardTotal.value} in ${pipeline.value?.label || 'pipeline'}`
  return isNarrowed.value ? `${total.value} of ${grandTotal.value} ${word(total.value)}` : `${grandTotal.value} ${word(grandTotal.value)}`
})
const rangeLabel = computed(() => `${shown.value ? 1 : 0}–${shown.value} of ${total.value}`)

interface ObjectViewState { columns?: string[]; sort?: { attr: string; dir: 'asc' | 'desc' }; views?: CrmView[] }
function stateFor(): ObjectViewState {
  const byCrm = (profileState[props.crmId] as Record<string, unknown>) || {}
  const entry = byCrm[props.object.type]
  return entry && typeof entry === 'object' ? (entry as ObjectViewState) : {}
}
async function persistState(patch: Partial<ObjectViewState>) {
  const byCrm = { ...((profileState[props.crmId] as Record<string, unknown>) || {}) }
  byCrm[props.object.type] = { ...stateFor(), ...patch }
  profileState = { ...profileState, [props.crmId]: byCrm }
  await writeListViews(profileState)
}
async function persistStateWithNotice(patch: Partial<ObjectViewState>) {
  try { await persistState(patch) }
  catch (cause) { host.toast({ severity: 'error', summary: 'Could not save view preferences', detail: crmErrorMessage(cause, 'Profile write failed.') }) }
}
function toggleColumn(attr: string) {
  if (attr === title.value?.attr) return
  const current = chosen.value ? [...chosen.value] : [...columns.value]
  const index = current.indexOf(attr)
  if (index >= 0) current.splice(index, 1)
  else current.push(attr)
  chosen.value = current
  void persistStateWithNotice({ columns: current })
}
function columnsFocusOut(event: FocusEvent) { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) columnsOpen.value = false }
function subtitle(record?: CrmRecord): string {
  if (!record) return ''
  for (const field of subtitles.value) {
    const value = record.values[field.attr]
    if (value === undefined || value === null || value === '') continue
    if (field.data_type === 'relation') { const entries = relationEntries(value, names.value, field.config?.target); if (entries.length) return entries.map((entry) => entry.label).join(', ') }
    return displayValue(value, field)
  }
  return ''
}
function rowName(record?: CrmRecord, fallbackId = ''): string { return record ? recordLabel(record, fields.value) : fallbackId }

// One bounded records_by_ids read resolves the names the page's relation values point at,
// so a cell shows "Cascadia Coffee" instead of a raw company:uuid, without scanning a type.
async function hydrateNames(rows: CrmRecord[], into: NameIndex) {
  indexRecordNames(rows, props.object.type, into, props.attributes)
  const relationAttrs = fields.value.filter((field) => field.data_type === 'relation')
  const ids = new Set<string>()
  for (const record of rows) for (const field of relationAttrs) for (const id of relationValues(record.values[field.attr])) if (!into[id]) ids.add(id)
  if (ids.size) indexRecordNames(await recordsByIds(props.crmId, [...ids]), '', into, props.attributes)
}

// A background load is the same query as the foreground one, re-read to the depth
// the reader has already paged to, without the spinner: an upstream write refreshes
// the rows in place instead of collapsing the view and losing the reader's position.
async function load(options: { background?: boolean } = {}) {
  const depth = options.background ? Math.max(PAGE, records.value.length) : PAGE
  if (!options.background) { loading.value = true; error.value = ''; offset.value = 0 }
  try {
    const [page, count, activity] = await Promise.all([
      listRecords(props.crmId, props.object.type, { filters: activeFilters.value, sort: sort.value.attr ? sort.value : undefined, search: search.value, limit: depth, offset: 0 }),
      countRecords(props.crmId, props.object.type),
      getTimeline(props.crmId, undefined, 100),
    ])
    records.value = page.rows; total.value = page.total; grandTotal.value = count; timeline.value = activity
    offset.value = Math.max(0, page.rows.length - PAGE)
    error.value = ''
    const index: NameIndex = {}
    await hydrateNames(page.rows, index)
    names.value = index
    if (layout.value === 'board') await loadBoard()
  } catch (cause) {
    // A failed background read leaves the rows the reader already has.
    if (!options.background) error.value = crmErrorMessage(cause, `${props.object.label} could not load.`)
  }
  finally { if (!options.background) loading.value = false }
}
async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    offset.value += PAGE
    const page = await listRecords(props.crmId, props.object.type, { filters: activeFilters.value, sort: sort.value.attr ? sort.value : undefined, search: search.value, limit: PAGE, offset: offset.value })
    records.value = [...records.value, ...page.rows]; total.value = page.total
    const index = { ...names.value }
    await hydrateNames(page.rows, index)
    names.value = index
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not load more', detail: crmErrorMessage(cause, 'CRM query failed.') }) }
  finally { loadingMore.value = false }
}
async function loadBoard() {
  if (!pipeline.value) { boardLanes.value = {}; return }
  const board = await getBoard(props.crmId, pipeline.value.collection_id, { limit: LANE_PAGE, offset: 0 })
  const ids = Object.values(board).flatMap((lane) => lane.records.map((entry) => entry.record_id))
  const hydrated = ids.length ? await recordsByIds(props.crmId, ids) : []
  const byId = Object.fromEntries(hydrated.map((record) => [record.record_id, record]))
  const lanes: Record<string, { rows: CrmRecord[]; total: number }> = {}
  for (const stage of stages(pipeline.value)) {
    const lane = board[stage.stage_id] || { records: [], total: 0 }
    lanes[stage.stage_id] = { rows: lane.records.map((entry) => byId[entry.record_id]).filter(Boolean), total: lane.total }
  }
  const index: NameIndex = { ...names.value }
  await hydrateNames(hydrated, index)
  boardLanes.value = lanes; names.value = index
}
async function loadMoreInLane(stage: PipelineStage) {
  const lane = boardLanes.value[stage.stage_id]
  if (!pipeline.value || !lane || lane.rows.length >= lane.total) return
  const board = await getBoard(props.crmId, pipeline.value.collection_id, { limit: LANE_PAGE, offset: lane.rows.length })
  const ids = (board[stage.stage_id]?.records || []).map((entry) => entry.record_id)
  const rows = ids.length ? await recordsByIds(props.crmId, ids) : []
  const byId = Object.fromEntries(rows.map((record) => [record.record_id, record]))
  const ordered = ids.map((id) => byId[id]).filter(Boolean)
  const index = { ...names.value }
  await hydrateNames(ordered, index)
  boardLanes.value = { ...boardLanes.value, [stage.stage_id]: { rows: [...lane.rows, ...ordered], total: board[stage.stage_id]?.total || lane.total } }
  names.value = index
}
function changeSort(attr: string) {
  sort.value = { attr, dir: sort.value.attr === attr && sort.value.dir === 'asc' ? 'desc' : 'asc' }
  void persistStateWithNotice({ sort: sort.value })
  void load()
}
async function create(values: Record<string, CrmValue>) {
  saving.value = true
  const id = recordId(props.object.type)
  try {
    await applyCommands(props.crmId, createRecordCommands(id, props.object.type, fields.value, values))
    host.toast({ severity: 'success', summary: `${objectName(props.object)} created`, detail: recordLabel({ record_id: id, values }, fields.value) })
    createOpen.value = false; await load(); emit('changed'); emit('navigate', recordRoute(props.object.type, id))
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not create record', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
  finally { saving.value = false }
}
async function move(record: CrmRecord, stage: PipelineStage) {
  if (!pipeline.value) return
  const fromStage = Object.entries(boardLanes.value).find(([, lane]) => lane.rows.some((row) => row.record_id === record.record_id))?.[0]
  if (fromStage === stage.stage_id) return
  try {
    await applyCommands(props.crmId, [{ type: CRM_EVENTS.membershipSet, body: { collection_id: pipeline.value.collection_id, record_id: record.record_id, stage_id: stage.stage_id, position: (boardLanes.value[stage.stage_id]?.total || 0) + 1, ...(fromStage ? { from_stage_id: fromStage } : {}) } }])
    host.toast({ severity: 'success', summary: 'Stage updated', detail: rowName(record) })
    await load(); emit('changed')
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not move record', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
}
function activityName(activity: CrmActivity) { return String(activity.payload?.title || activity.activity_type || 'Activity') }

function applyView(view: CrmView) {
  activeViewId.value = view.view_id
  command.value = ''; tokenFilters.value = []; search.value = ''
  conditions.value = view.layout === 'board' ? [] : deserializeFilters(view.spec?.filters, fields.value)
  const cols = Array.isArray(view.spec?.columns) ? view.spec.columns.filter((column) => validAttrs.value.has(column)) : []
  if (cols.length) { chosen.value = cols.slice(); void persistState({ columns: cols }) }
  if (view.spec?.sort?.attr) sort.value = { attr: view.spec.sort.attr, dir: view.spec.sort.dir === 'desc' ? 'desc' : 'asc' }
  if (view.layout === 'board' && pipeline.value) layout.value = 'board'
  else if (view.layout === 'timeline') layout.value = 'timeline'
  else layout.value = 'table'
  void load()
}
// The default "All" tab: clear every scope back to the unfiltered object.
function resetView() {
  activeViewId.value = ''; conditions.value = []; command.value = ''; tokenFilters.value = []; search.value = ''
  void load()
}
function confirmSaveView() {
  const name = viewNameDraft.value.trim()
  if (!name) return
  void onSaveView(name)
  viewNameDraft.value = ''; saveViewOpen.value = false
}
async function onSaveView(name: string) {
  const view_id = `private:${props.object.type}:${apiName(name) || 'view'}`
  const spec: CrmView['spec'] = layout.value === 'board'
    ? { columns: columns.value, sort: sort.value }
    : { filters: activeFilters.value, columns: columns.value, sort: sort.value }
  const body: CrmView = { view_id, object_type: props.object.type, name, layout: layout.value, spec }
  if (layout.value === 'board' && pipeline.value) body.collection_id = pipeline.value.collection_id
  try {
    const views = [...privateViews.value.filter((view) => view.view_id !== view_id), body]
    privateViews.value = views
    await persistState({ views })
    host.toast({ severity: 'success', summary: 'View saved', detail: name })
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not save view', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
}

async function loadProfile() {
  try { profileState = await readListViews() }
  catch (cause) {
    profileState = {}
    host.toast({ severity: 'error', summary: 'Could not load view preferences', detail: crmErrorMessage(cause, 'Profile read failed.') })
  }
  const state = stateFor()
  privateViews.value = Array.isArray(state.views)
    ? state.views.filter((view) => view && view.object_type === props.object.type && view.view_id.startsWith(`private:${props.object.type}:`))
    : []
  if (Array.isArray(state.columns) && state.columns.length) chosen.value = state.columns.slice()
  // The reader's own choice first, then what the schema declares for this object,
  // then the record's name. The declared view's columns already lead the page;
  // its sort is read the same way rather than being silently replaced by A-Z.
  const declaredSort = defaultView.value?.spec?.sort
  if (state.sort?.attr) sort.value = { attr: state.sort.attr, dir: state.sort.dir === 'desc' ? 'desc' : 'asc' }
  else if (declaredSort?.attr && (validAttrs.value.has(declaredSort.attr) || SORTABLE_SYSTEM_ATTRS.includes(declaredSort.attr))) {
    sort.value = { attr: declaredSort.attr, dir: declaredSort.dir === 'desc' ? 'desc' : 'asc' }
  }
  else sort.value = { attr: title.value?.attr || '', dir: 'asc' }
}

// Parse the command bar into its two honest halves: typed scope tokens become real filters,
// the remainder is the full-text search. Both feed the same load.
function parseCommand() {
  const { filters, text } = parseScopeTokens(command.value, fields.value)
  tokenFilters.value = filters
  search.value = text
}
function applyCommand() { parseCommand(); void load() }

watch(() => layout.value, (next) => { if (next === 'board') void loadBoard() })
watch(() => props.object.type, async () => {
  layout.value = 'table'; command.value = ''; search.value = ''; tokenFilters.value = []; columnsOpen.value = false; conditions.value = []; chosen.value = null; activeViewId.value = ''
  await loadProfile(); await load()
})
watch(() => JSON.stringify(activeFilters.value), () => load())
// The surface has already coalesced a burst of read-model advances into one
// revision bump, so this refetches exactly this object's current query, once.
watch(() => props.revision, () => { void load({ background: true }) })
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(command, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(applyCommand, 250)
})
onBeforeUnmount(() => { if (searchTimer) clearTimeout(searchTimer) })
onMounted(async () => { await loadProfile(); await load() })
</script>

<template>
  <section class="crm-page">
    <header class="crm-page-head">
      <div class="crm-page-title"><span class="crm-eyebrow">Records</span><h1>{{ object.label }}</h1></div>
      <div class="crm-page-actions">
        <label v-if="layout !== 'board'" class="crm-search crm-command"><Icon icon="tabler:search" /><input v-model="command" type="search" :placeholder="`Search ${object.label.toLowerCase()} · attr:value…`" aria-label="Search and scope" /><kbd v-if="tokenFilters.length" class="crm-command-scoped" title="Typed scope tokens are applied as filters">{{ tokenFilters.length }} scoped</kbd></label>
        <CrmFilterBar v-if="layout !== 'board'" v-model="conditions" :crm-id="crmId" :fields="fields" />
        <span class="crm-count" :title="countLabel">{{ countLabel }}</span>
        <div v-if="layout === 'table'" class="crm-colpicker" @focusout="columnsFocusOut">
          <button class="crm-icon-button" :class="{ active: columnsOpen }" title="Columns" aria-label="Columns" :aria-expanded="columnsOpen" :aria-controls="columnsMenuId" @click="columnsOpen = !columnsOpen"><Icon icon="tabler:columns-3" /></button>
          <div v-if="columnsOpen" :id="columnsMenuId" class="crm-colmenu" role="group" aria-label="Visible columns">
            <span class="crm-colmenu-label">Columns</span>
            <label v-for="field in fields" :key="field.attr" class="crm-colopt"><input type="checkbox" :checked="columns.includes(field.attr)" :disabled="field.attr === title?.attr" @change="toggleColumn(field.attr)" /><span>{{ field.label || field.attr }}</span></label>
          </div>
        </div>
        <div class="crm-segment" aria-label="View layout">
          <button :class="{ active: layout === 'table' }" aria-label="Table view" :aria-pressed="layout === 'table'" @click="layout = 'table'"><Icon icon="tabler:table" /></button>
          <button v-if="pipeline" :class="{ active: layout === 'board' }" aria-label="Board view" :aria-pressed="layout === 'board'" @click="layout = 'board'"><Icon icon="tabler:layout-kanban" /></button>
          <button :class="{ active: layout === 'timeline' }" aria-label="Timeline view" :aria-pressed="layout === 'timeline'" @click="layout = 'timeline'"><Icon icon="tabler:timeline-event" /></button>
        </div>
        <button v-if="canWrite" class="crm-button primary" @click="createOpen = true"><Icon icon="tabler:plus" />New {{ objectName(object) }}</button>
      </div>
    </header>
    <div class="crm-viewsbar" role="tablist" aria-label="Saved views">
      <button class="crm-vtab" :class="{ active: !activeViewId }" role="tab" :aria-selected="!activeViewId" @click="resetView">All {{ object.label.toLowerCase() }}</button>
      <button v-for="view in objectViews" :key="view.view_id" class="crm-vtab" :class="{ active: activeViewId === view.view_id }" role="tab" :aria-selected="activeViewId === view.view_id" @click="applyView(view)">{{ view.name }}</button>
      <div class="crm-vtab-save">
        <button v-if="!saveViewOpen" class="crm-vtab add" @click="saveViewOpen = true"><Icon icon="tabler:plus" />Save view</button>
        <template v-else>
          <input v-model="viewNameDraft" class="crm-input" placeholder="Name this view" aria-label="View name" @keyup.enter="confirmSaveView" @keyup.esc="saveViewOpen = false" />
          <button class="crm-button primary small" :disabled="!viewNameDraft.trim()" @click="confirmSaveView"><Icon icon="tabler:device-floppy" />Save</button>
          <button class="crm-button small" @click="saveViewOpen = false">Cancel</button>
        </template>
      </div>
    </div>
    <div v-if="loading" class="crm-state"><Icon icon="tabler:loader-2" class="spin" /> Loading {{ object.label.toLowerCase() }}…</div>
    <div v-else-if="error" class="crm-state error" role="alert"><Icon icon="tabler:alert-circle" /><div><strong>{{ object.label }} could not load</strong><span>{{ error }}</span></div><button class="crm-button" @click="load()">Try again</button></div>
    <template v-else-if="layout === 'table'">
      <div class="crm-table-wrap">
        <table class="crm-table"><thead><tr><th v-for="column in columns" :key="column"><button @click="changeSort(column)">{{ fieldMap[column]?.label || column }}<Icon v-if="sort.attr === column" :icon="sort.dir === 'asc' ? 'tabler:chevron-up' : 'tabler:chevron-down'" /></button></th><th aria-label="Open" /></tr></thead>
          <tbody><tr v-for="record in records" :key="record.record_id"><td v-for="column in columns" :key="column"><button v-if="column === title?.attr" type="button" class="crm-name-cell crm-row-link" @click="emit('navigate', recordRoute(object.type, record.record_id))"><span class="crm-avatar">{{ initials(rowName(record)) }}</span><strong>{{ rowName(record) }}</strong></button><span v-else class="crm-cell"><ValueDisplay :value="record.values[column]" :attribute="fieldMap[column]" :names="names" compact @navigate="emit('navigate', $event)" /></span></td><td><button type="button" class="crm-row-open" :aria-label="`Open ${rowName(record)}`" @click="emit('navigate', recordRoute(object.type, record.record_id))"><Icon icon="tabler:chevron-right" class="crm-row-arrow" /></button></td></tr></tbody>
        </table>
        <div v-if="!records.length" class="crm-empty"><span class="crm-empty-icon"><Icon icon="tabler:address-book-off" /></span><h2>{{ isNarrowed ? 'No matching records' : `No ${object.label.toLowerCase()} yet` }}</h2><p>{{ isNarrowed ? 'Try a different search or clear the filters.' : `Create the first ${objectName(object).toLowerCase()} to get started.` }}</p><button v-if="!isNarrowed && canWrite" class="crm-button primary" @click="createOpen = true"><Icon icon="tabler:plus" />New {{ objectName(object) }}</button></div>
      </div>
      <footer v-if="records.length" class="crm-gridfoot">
        <span class="crm-mono">{{ rangeLabel }}</span>
        <button v-if="hasMore" class="crm-button" :disabled="loadingMore" @click="loadMore"><Icon v-if="loadingMore" icon="tabler:loader-2" class="spin" />Load {{ Math.min(PAGE, total - shown) }} more</button>
        <span class="crm-grow" />
        <span class="crm-foot-meta">sorted by <span class="crm-mono">{{ sort.attr }} {{ sort.dir }}</span></span>
      </footer>
    </template>
    <div v-else-if="layout === 'board' && pipeline" class="crm-board">
      <section v-for="stage in stages(pipeline)" :key="stage.stage_id" class="crm-board-column" @dragover.prevent @drop="canWrite && ($event.dataTransfer?.getData('text/plain') && recordMap[$event.dataTransfer.getData('text/plain')]) && move(recordMap[$event.dataTransfer.getData('text/plain')], stage)">
        <header><span>{{ stage.label }}</span><b>{{ (boardLanes[stage.stage_id]?.total ?? 0) }}</b></header>
        <div class="crm-board-cards"><button v-for="record in boardLanes[stage.stage_id]?.rows || []" :key="record.record_id" class="crm-board-card" :draggable="canWrite" @dragstart="canWrite && $event.dataTransfer?.setData('text/plain', record.record_id)" @click="emit('navigate', recordRoute(object.type, record.record_id))"><span class="crm-avatar">{{ initials(rowName(record)) }}</span><span><strong>{{ rowName(record) }}</strong><small v-if="subtitle(record)">{{ subtitle(record) }}</small></span></button>
          <p v-if="!(boardLanes[stage.stage_id]?.rows || []).length">No records in {{ stage.label }}</p>
          <button v-else-if="(boardLanes[stage.stage_id]?.total ?? 0) > (boardLanes[stage.stage_id]?.rows.length ?? 0)" class="crm-button ghost small crm-lane-more" @click="loadMoreInLane(stage)">Load {{ Math.min(LANE_PAGE, (boardLanes[stage.stage_id]?.total ?? 0) - (boardLanes[stage.stage_id]?.rows.length ?? 0)) }} more</button>
        </div>
      </section>
    </div>
    <div v-else class="crm-feed">
      <article v-for="activity in timeline" :key="activity.activity_id" class="crm-feed-item"><span class="crm-activity-icon"><Icon :icon="activity.activity_type === 'call' ? 'tabler:phone' : activity.activity_type === 'email' ? 'tabler:mail' : activity.activity_type === 'meeting' ? 'tabler:calendar' : 'tabler:note'" /></span><div><strong>{{ activityName(activity) }}</strong><p><button v-if="activity.record_id && recordMap[activity.record_id]" @click="emit('navigate', recordRoute(object.type, activity.record_id))">{{ rowName(recordMap[activity.record_id], activity.record_id) }}</button><span>{{ activity.activity_type }}</span></p></div><time :datetime="activity.occurred_at">{{ formatTimestamp(activity.occurred_at) }}</time></article>
      <div v-if="!timeline.length" class="crm-empty"><span class="crm-empty-icon"><Icon icon="tabler:timeline-event" /></span><h2>No activity yet</h2><p>Calls, emails, meetings, and notes will appear here.</p></div>
    </div>
    <RecordEditor v-if="createOpen" :crm-id="crmId" :title="`New ${objectName(object)}`" :attributes="fields" :schema="attributes" :saving="saving" @close="createOpen = false" @save="create" />
  </section>
</template>
