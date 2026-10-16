<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { host } from '@wippy-fe/proxy'
import { applyCommands, getRecord, getRecordPanels, getTimeline, recordsByIds, crmErrorMessage } from '../crm-api'
import { updateRecordCommands } from '../crm-commands'
import { loadRecordPanelElement } from '../crm-panels'
import { CRM_EVENTS, type CrmActivity, type CrmAttribute, type CrmObject, type CrmRecord, type CrmRecordPanel, type CrmValue } from '../crm-types'
import { friendly, hasValue, heroFacts, indexRecordNames, initials, objectAttributes, objectName, recordLabel, relativeTime, titleField, type NameIndex } from '../crm-model'
import { anchorRecordId, lastTouchedAt } from '../crm-activity'
import { relatedRows, visibleRelatedIds } from '../crm-related'
import ValueDisplay from './ValueDisplay.vue'
import RecordEditor from './RecordEditor.vue'
import RecordFields from './RecordFields.vue'
import RecordActivity from './RecordActivity.vue'
import RecordRelated from './RecordRelated.vue'

// One record, read top to bottom in one scroll: who it is and where it stands,
// then what it says, then what happened to it and what it is attached to.

const props = withDefaults(defineProps<{ crmId: string; recordId: string; object: CrmObject; objects: CrmObject[]; attributes: CrmAttribute[]; canWrite?: boolean; revision?: number }>(), { canWrite: true, revision: 0 })
const emit = defineEmits<{ back: []; navigate: [route: string]; changed: [] }>()

// The chronology arrives a page at a time. A record with hundreds of calls costs
// the page the first fifty until the reader asks for the ones before them.
const PAGE = 50

const record = ref<CrmRecord | null>(null)
const timeline = ref<CrmActivity[]>([])
const timelineLimit = ref(PAGE)
const loadingMore = ref(false)
const panels = ref<CrmRecordPanel[]>([])
const names = ref<NameIndex>({})
const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const error = ref('')

const fields = computed(() => objectAttributes(props.attributes, props.object.type))
const name = computed(() => (record.value ? recordLabel(record.value, fields.value) : friendly(props.recordId)))
const facts = computed(() => (record.value ? heroFacts(fields.value, record.value.values) : {}))
const lastTouch = computed(() => relativeTime(lastTouchedAt(timeline.value)))
// What the header has already said. The name is the heading and the leading
// facts sit beside it; the field groups start where the header left off.
const stated = computed(() => [titleField(fields.value)?.attr, facts.value.status?.attr].filter((attr): attr is string => !!attr))
const hasMoreActivity = computed(() => timeline.value.length >= timelineLimit.value)

// The address this record answers at, so its own attendance drops out of every
// line of its history.
const selfEmail = computed(() => {
  const values = record.value?.values || {}
  const field = fields.value.find((item) => item.data_type === 'email' && hasValue(values[item.attr]))
  return field ? String(values[field.attr] ?? '') : ''
})

// A declared panel becomes visible only once its contributed element is defined.
// customElements.get is not reactive, so it is read where the answer can change
// -- after that tag's bundle has been resolved -- and the outcome is kept here.
const defined = ref(new Set<string>())
const visiblePanels = computed(() => panels.value.filter((panel) => defined.value.has(panel.tag)))

// Panels resolve alongside the record rather than gating it: each contribution
// appears as its own bundle lands, and one that never lands costs the page nothing.
async function resolvePanels(declared: CrmRecordPanel[]) {
  await Promise.all(declared.map(async (panel) => {
    await loadRecordPanelElement(panel.tag)
    if (customElements.get(panel.tag)) defined.value.add(panel.tag)
  }))
}

// Resolve only the records this one connects to -- its association edges, its
// relation values, and the records the rows of its chronology are keyed to --
// never a scan of every object type. One bounded records_by_ids read builds the
// name index the page reads names from.
async function hydrateNames(found: CrmRecord | null, activity: CrmActivity[]) {
  const ids = visibleRelatedIds(relatedRows(found, fields.value), props.objects)
  for (const row of activity) {
    const anchor = anchorRecordId(row, props.recordId)
    if (anchor && !ids.includes(anchor)) ids.push(anchor)
  }
  const index: NameIndex = {}
  if (ids.length) indexRecordNames(await recordsByIds(props.crmId, ids), props.object.type, index, props.attributes)
  names.value = index
}

// A group the reader opened asks for the names it has not read yet. The panel
// already holds the rows; this reads only the ones with no name, and a read that
// fails leaves the rows named by what kind of record they are.
async function hydrateMore(ids: string[]) {
  const missing = ids.filter((id) => !names.value[id])
  if (!missing.length) return
  try {
    const index: NameIndex = { ...names.value }
    indexRecordNames(await recordsByIds(props.crmId, missing), props.object.type, index, props.attributes)
    names.value = index
  } catch (cause) {
    host.toast({ severity: 'error', summary: 'Could not read connected record names', detail: crmErrorMessage(cause, 'CRM query failed.') })
  }
}

// A background load re-reads this record and its timeline without the spinner, so
// an upstream write updates the page in place. The read-model advance names no
// records, so "did this record change" cannot be asked -- only this record is
// re-read, never the object's list.
async function load(options: { background?: boolean } = {}) {
  if (!options.background) { loading.value = true; error.value = '' }
  try {
    const [found, activity, declaredPanels] = await Promise.all([
      getRecord(props.crmId, props.recordId),
      getTimeline(props.crmId, props.recordId, timelineLimit.value),
      getRecordPanels(props.crmId, props.object.type),
    ])
    record.value = found
    timeline.value = activity
    panels.value = declaredPanels
    void resolvePanels(declaredPanels)
    await hydrateNames(found, activity)
    error.value = ''
  } catch (cause) {
    // A failed background read leaves the record the reader already has.
    if (!options.background) error.value = crmErrorMessage(cause, 'Record could not load.')
  }
  finally { if (!options.background) loading.value = false }
}

// Earlier activity extends the same list rather than opening another surface.
async function loadMore() {
  if (loadingMore.value) return
  loadingMore.value = true
  const next = timelineLimit.value + PAGE
  try {
    timeline.value = await getTimeline(props.crmId, props.recordId, next)
    timelineLimit.value = next
    await hydrateNames(record.value, timeline.value)
  } catch (cause) {
    host.toast({ severity: 'error', summary: 'Could not load earlier activity', detail: crmErrorMessage(cause, 'CRM query failed.') })
  } finally { loadingMore.value = false }
}

async function save(values: Record<string, CrmValue>) {
  if (!record.value) return
  const commands = updateRecordCommands(props.recordId, props.object.type, fields.value, record.value.values, values)
  if (!commands.length) { editing.value = false; return }
  saving.value = true
  try {
    await applyCommands(props.crmId, commands)
    host.toast({ severity: 'success', summary: 'Record saved', detail: name.value })
    editing.value = false; await load(); emit('changed')
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not save record', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
  finally { saving.value = false }
}

async function remove() {
  const accepted = await host.confirm({ header: `Delete ${objectName(props.object).toLowerCase()}`, message: `Delete ${name.value}? This cannot be undone.`, icon: 'tabler:trash', acceptLabel: 'Delete', rejectLabel: 'Cancel', acceptClass: 'p-button-danger' })
  if (!accepted) return
  try {
    await applyCommands(props.crmId, [{ type: CRM_EVENTS.recordDeleted, body: { record_id: props.recordId, object_type: props.object.type } }])
    host.toast({ severity: 'success', summary: 'Record deleted', detail: name.value })
    emit('changed'); emit('back')
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not delete record', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
}

// The surface has already coalesced a burst of read-model advances into one
// revision bump; this re-reads only the record on screen and its timeline.
watch(() => props.revision, () => { void load({ background: true }) })
onMounted(() => load())
</script>

<template>
  <div v-if="loading" class="crm-state"><Icon icon="tabler:loader-2" class="spin" /> Loading record…</div>
  <div v-else-if="error" class="crm-state error" role="alert"><Icon icon="tabler:alert-circle" /><div><strong>Record could not load</strong><span>{{ error }}</span></div><button class="crm-button" @click="load()">Try again</button></div>
  <div v-else-if="!record" class="crm-state"><Icon icon="tabler:file-off" /><div><strong>Record not found</strong><span>It may have been removed.</span></div><button class="crm-button" @click="emit('back')">Back to {{ object.label }}</button></div>
  <article v-else class="crm-record">
    <header class="crm-record-hero">
      <button class="crm-icon-button" aria-label="Back" @click="emit('back')"><Icon icon="tabler:arrow-left" aria-hidden="true" /></button>
      <span class="crm-avatar large">{{ initials(name) }}</span>
      <div class="crm-record-title">
        <span class="crm-eyebrow">{{ objectName(object) }}</span>
        <h1>{{ name }}</h1>
        <div class="crm-hero-facts">
          <span v-if="facts.relation" class="crm-hero-fact">
            <small>{{ facts.relation.label || facts.relation.attr }}</small>
            <ValueDisplay :value="record.values[facts.relation.attr]" :attribute="facts.relation" :names="names" @navigate="emit('navigate', $event)" />
          </span>
          <span v-if="facts.status" class="crm-hero-fact">
            <small>{{ facts.status.label || facts.status.attr }}</small>
            <ValueDisplay :value="record.values[facts.status.attr]" :attribute="facts.status" :names="names" />
          </span>
          <span v-if="lastTouch" class="crm-hero-fact">
            <small>Last touch</small><span>{{ lastTouch }}</span>
          </span>
        </div>
      </div>
      <div class="crm-record-actions">
        <template v-if="canWrite">
          <button class="crm-button danger-text" @click="remove"><Icon icon="tabler:trash" aria-hidden="true" />Delete</button>
          <button class="crm-button primary" @click="editing = true"><Icon icon="tabler:edit" aria-hidden="true" />Edit</button>
        </template>
        <span v-else class="crm-pill"><Icon icon="tabler:eye" aria-hidden="true" />Read-only</span>
      </div>
    </header>
    <div class="crm-record-layout">
      <div class="crm-record-main">
        <RecordFields :record="record" :fields="fields" :names="names" :stated="stated" @navigate="emit('navigate', $event)" />
        <RecordRelated :record="record" :fields="fields" :attributes="attributes" :objects="objects" :names="names" :object-type="object.type" @navigate="emit('navigate', $event)" @hydrate="hydrateMore" />
        <section v-for="panel in visiblePanels" :key="panel.tag" class="crm-card crm-panel-card">
          <header class="crm-card-head"><div><h2>{{ panel.title }}</h2></div></header>
          <component :is="panel.tag" class="crm-panel-body" :record-id="recordId" :crm-id="crmId" :object-type="object.type" />
        </section>
      </div>
      <div class="crm-record-side">
        <RecordActivity :activities="timeline" :self-email="selfEmail" :record-id="recordId" :names="names" :has-more="hasMoreActivity" :loading-more="loadingMore" @more="loadMore" @navigate="emit('navigate', $event)" />
      </div>
    </div>
    <RecordEditor v-if="editing" :crm-id="crmId" :title="`Edit ${name}`" :attributes="fields" :schema="attributes" :record="record" :saving="saving" @close="editing = false" @save="save" />
  </article>
</template>
