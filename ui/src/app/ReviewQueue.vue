<script setup lang="ts">
// The in-workbench review queue reads durable merge suggestions and presents them as a
// first-class triage surface. Resolution is not forked here: the read model carries no Block resume handles, so
// each item routes to the Inbox merge card, which owns the decision, record merge,
// and durable Block resume. The display logic is shared with MergeReview.vue.
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { host } from '@wippy-fe/proxy'
import { crmErrorMessage, mergeReviews, recordsByIds, type MergeReviewRow } from '../crm-api'
import { confidencePercent, confidenceTone, reasonLabel } from './model'
import { displayValue, fieldSection, fieldUi, friendly, initials, objectAttributes, recordLabel, referenceTarget, relationEntries, titleField } from '../crm-model'
import type { CrmAttribute, CrmObject, CrmRecord } from '../crm-types'

const props = defineProps<{ crmId: string; objects: CrmObject[]; attributes: CrmAttribute[]; canWrite?: boolean }>()
const PAGE = 50
const merges = ref<MergeReviewRow[]>([])
const records = ref<Record<string, CrmRecord>>({})
const loading = ref(true)
const error = ref('')

const objectLabel = computed(() => Object.fromEntries(props.objects.map((object) => [object.type, object.label])))
const summary = computed(() => {
  const count = merges.value.length
  return `${count} merge suggestion${count === 1 ? '' : 's'}`
})
const empty = computed(() => !merges.value.length)

function displayName(id: string): string {
  const record = records.value[id]
  return record ? recordLabel(record, objectAttributes(props.attributes, record.object_type)) : friendly(id)
}
// The merge read-model row carries the pair and score, not the record bodies -- one bounded
// records_by_ids read resolves display names and key values for the side-by-side grid.
function keyValues(id: string): Array<{ attr: string; label: string; value: string }> {
  const record = records.value[id]
  if (!record) return []
  const fields = objectAttributes(props.attributes, record.object_type)
  const title = titleField(fields)?.attr
  const visible = fields.filter((field) => field.attr !== title && fieldSection(field) === 'main' && fieldUi(field).list !== false)
  const out: Array<{ attr: string; label: string; value: string }> = []
  for (const field of visible) {
    const value = record.values[field.attr]
    if (value === undefined || value === null || value === '') continue
    const rendered = field.data_type === 'relation'
      ? relationEntries(value, undefined, referenceTarget(field)).map((entry) => entry.label).join(', ')
      : displayValue(value, field)
    if (rendered && rendered !== '—') out.push({ attr: field.attr, label: field.label, value: rendered })
    if (out.length === 4) break
  }
  return out
}
function pct(row: MergeReviewRow): number { return confidencePercent(row.confidence ?? 0) }
function tone(row: MergeReviewRow): string { return confidenceTone(row.confidence ?? 0) }
function toneLabel(row: MergeReviewRow): string { return `${tone(row)} confidence` }
function reason(row: MergeReviewRow): string { return reasonLabel(row.reason || '') }
async function load() {
  loading.value = true; error.value = ''
  try {
    const mergePage = await mergeReviews(props.crmId, { limit: PAGE })
    merges.value = mergePage.rows
    const ids = new Set<string>()
    for (const row of mergePage.rows) { ids.add(row.left_id); ids.add(row.right_id) }
    const index: Record<string, CrmRecord> = {}
    if (ids.size) for (const record of await recordsByIds(props.crmId, [...ids])) index[record.record_id] = record
    records.value = index
  } catch (cause) { error.value = crmErrorMessage(cause, 'Review queue could not load.') }
  finally { loading.value = false }
}
function openInbox() { host.navigate('/inbox') }

watch(() => props.crmId, load)
onMounted(load)
</script>

<template>
  <section class="crm-page crm-review">
    <header class="crm-review-bar">
      <div><span class="crm-eyebrow">Queues</span><h1>Needs review</h1></div>
      <span class="crm-chip">{{ summary }}</span>
      <span class="crm-grow" />
      <button class="crm-button" @click="openInbox"><Icon icon="tabler:inbox" />Open review inbox</button>
    </header>

    <div v-if="loading" class="crm-state"><Icon icon="tabler:loader-2" class="spin" /> Loading review queue…</div>
    <div v-else-if="error" class="crm-state error" role="alert"><Icon icon="tabler:alert-circle" /><div><strong>Review queue could not load</strong><span>{{ error }}</span></div><button class="crm-button" @click="load">Try again</button></div>
    <div v-else-if="empty" class="crm-empty"><span class="crm-empty-icon"><Icon icon="tabler:checks" /></span><h2>Nothing to review</h2><p>Possible duplicate records appear here when identity resolution finds a match.</p></div>

    <div v-else class="crm-review-wrap">
      <section v-if="merges.length" class="crm-review-group">
        <h2 class="crm-review-h">Merge suggestions</h2>
        <article v-for="row in merges" :key="`${row.left_id}:${row.right_id}`" class="crm-card crm-merge">
          <header class="crm-card-head">
            <div><h2>Possible duplicate</h2><p>{{ objectLabel[row.object_type] || row.object_type }}</p></div>
            <span class="crm-pill" :class="`tone-${tone(row)}`">{{ pct(row) }}% · {{ reason(row) }}</span>
          </header>
          <div class="crm-merge-grid">
            <div v-for="side in [{ id: row.left_id, tag: 'Record A' }, { id: row.right_id, tag: 'Record B' }]" :key="side.id" class="crm-merge-col">
              <div class="crm-merge-who"><span class="crm-avatar small">{{ initials(displayName(side.id)) }}</span><strong>{{ displayName(side.id) }}</strong><span class="crm-flag">{{ side.tag }}</span></div>
              <code class="crm-merge-id">{{ side.id }}</code>
              <dl class="crm-merge-vals">
                <div v-for="value in keyValues(side.id)" :key="value.attr"><dt>{{ value.label }}</dt><dd>{{ value.value }}</dd></div>
                <p v-if="!keyValues(side.id).length" class="crm-muted">No hydrated field values.</p>
              </dl>
            </div>
          </div>
          <div class="crm-conf-line">
            <span class="crm-meter" :class="`tone-${tone(row)}`"><i :style="{ width: pct(row) + '%' }" /></span>
            <span>{{ toneLabel(row) }}</span>
            <span class="crm-grow" />
            <button class="crm-button primary" :disabled="!canWrite" @click="openInbox"><Icon icon="tabler:external-link" />Resolve in inbox</button>
          </div>
        </article>
      </section>

      <p class="crm-review-foot"><Icon icon="tabler:info-circle" /> Decisions are recorded through the review inbox so the durable Block resumes correctly.</p>
    </div>
  </section>
</template>
