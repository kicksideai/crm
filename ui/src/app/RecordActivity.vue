<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host } from '@wippy-fe/proxy'
import {
  activityDetails,
  activityFacts,
  activityHref,
  activityIcon,
  activityLabel,
  activityTitle,
  anchorRecordId,
  chunk,
  isMeeting,
  meetingIdByReference,
  meetingReferences,
  participants,
  sourceLabel,
  type ActivityFact,
  type Participant,
} from '../crm-activity'
import { friendly, relativeTime, type NameIndex, type StructuredLine } from '../crm-model'
import type { CrmActivity } from '../crm-types'
import { recordRoute } from '../crm-route'

// The record's chronology. The rows are the CRM's own truth about what touched
// this record; the way into a call is the meetings component service's answer
// about what THIS viewer may open. The CRM depends on no meetings module for
// that -- it asks the public meetings API at runtime, by external reference, and
// an installation without meetings simply answers nothing.

const props = withDefaults(defineProps<{
  activities: CrmActivity[]
  selfEmail?: string
  hasMore?: boolean
  loadingMore?: boolean
  recordId?: string
  names?: NameIndex
}>(), { selfEmail: '', hasMore: false, loadingMore: false, recordId: '', names: () => ({}) })
const emit = defineEmits<{ more: []; navigate: [route: string] }>()

// A batch stays inside the meetings API's own page, so a long chronology asks
// several bounded questions instead of one unbounded one.
const BATCH = 100
const PEOPLE_SHOWN = 3

const links = ref<Record<string, string>>({})
// The chronology stands on its own; only the answer about which calls this
// viewer may open is missing, and that is said rather than staged as an absence.
const linkError = ref('')
let resolveRun = 0

interface Row {
  id: string
  title: string
  icon: string
  occurredAt: string
  when: string
  facts: ActivityFact[]
  people: Participant[]
  hidden: number
  href: string
  source: string
  details: StructuredLine[]
  anchorName: string
  anchorRoute: string
}

// The record a row belongs to, named. The page has already resolved the names of
// everything this record connects to; a row keyed to something outside that set
// is named by what kind of record it is rather than by its id.
function anchor(activity: CrmActivity): { name: string; route: string } {
  const id = anchorRecordId(activity, props.recordId)
  if (!id) return { name: '', route: '' }
  const entry = props.names[id]
  return { name: entry?.name || friendly(id), route: entry?.type ? recordRoute(entry.type, id) : '' }
}

const rows = computed<Row[]>(() => props.activities.map((activity) => {
  const people = participants(activity, props.selfEmail)
  const belongsTo = anchor(activity)
  return {
    id: activity.activity_id,
    title: activityTitle(activity),
    icon: activityIcon(activity.activity_type),
    occurredAt: activity.occurred_at || '',
    when: relativeTime(activity.occurred_at) || 'Date unavailable',
    facts: activityFacts(activity),
    people: people.slice(0, PEOPLE_SHOWN),
    hidden: Math.max(0, people.length - PEOPLE_SHOWN),
    href: activityHref(activity, links.value),
    source: sourceLabel(activity),
    details: activityDetails(activity),
    anchorName: belongsTo.name,
    anchorRoute: belongsTo.route,
  }
}))

// What this record's history amounts to, in one line. One kind of thing says so;
// a mixture counts itself. Nothing to count is left to the body to say, once.
const summary = computed(() => {
  const count = props.activities.length
  if (!count) return ''
  const kinds = new Set(props.activities.map((activity) => activity.activity_type))
  const noun = kinds.size === 1 ? activityLabel([...kinds][0]).toLowerCase() : 'activity'
  if (noun === 'activity') return `${count} ${count === 1 ? 'entry' : 'entries'}`
  return `${count} ${noun}${count === 1 ? '' : 's'}`
})

async function resolveLinks(activities: CrmActivity[]) {
  const run = ++resolveRun
  linkError.value = ''
  const references = meetingReferences(activities)
  if (!references.length || !api) { links.value = {}; return }
  try {
    const found: Record<string, string> = {}
    for (const batch of chunk(references, BATCH)) {
      const { data } = await api.get(`/api/v1/meetings?limit=${batch.length}&external_ids=${encodeURIComponent(batch.join(','))}`)
      if (data?.success !== true) throw new Error(typeof data?.error === 'string' && data.error ? data.error : 'The meetings behind these calls could not be read.')
      Object.assign(found, meetingIdByReference(data.items))
    }
    if (run !== resolveRun) return
    links.value = found
  } catch (cause) {
    if (run !== resolveRun) return
    // A missing link is a statement about access. A lookup that failed has made
    // no such statement, and is reported instead of being rendered as one.
    links.value = {}
    linkError.value = cause instanceof Error && cause.message ? cause.message : 'The meetings behind these calls could not be read.'
  }
}

// A record whose chronology holds no meeting asks nothing of the meetings API.
watch(() => props.activities, (activities) => {
  if (activities.some(isMeeting)) void resolveLinks(activities)
  else { resolveRun++; links.value = {}; linkError.value = '' }
}, { immediate: true })

// The href is what the row is addressed by, so it stays copyable and openable in
// a new tab. A plain click is handed to the workbench router instead, which
// keeps the session rather than reloading the whole shell.
function open(href: string, event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  try {
    host.navigate(href)
    event.preventDefault()
  } catch { /* the anchor's own href carries the reader there */ }
}
</script>

<template>
  <section class="crm-card crm-timeline-card">
    <header class="crm-card-head">
      <div><h2>Activity</h2><p v-if="summary">{{ summary }}</p></div>
    </header>
    <p v-if="linkError" class="crm-inline-error" role="status" data-test="link-error">
      {{ linkError }} The history below is the CRM's own record, without the links that open each call.
    </p>
    <ol v-if="rows.length" class="crm-timeline">
      <li v-for="row in rows" :key="row.id">
        <component
          :is="row.href ? 'a' : 'div'"
          class="crm-timeline-row"
          :class="{ open: !!row.href }"
          :href="row.href || undefined"
          @click="row.href && open(row.href, $event)"
        >
          <span class="crm-activity-icon"><Icon :icon="row.icon" aria-hidden="true" /></span>
          <span class="crm-timeline-body">
            <span class="crm-timeline-head">
              <strong>{{ row.title }}</strong>
              <time :datetime="row.occurredAt">{{ row.when }}</time>
            </span>
            <span class="crm-timeline-facts">
              <span v-for="fact in row.facts" :key="fact.key" class="crm-fact">
                <Icon v-if="fact.icon" :icon="fact.icon" aria-hidden="true" />{{ fact.label }}
              </span>
              <span v-if="row.source" class="crm-fact" data-test="activity-source">
                <Icon icon="tabler:plug-connected" aria-hidden="true" />{{ row.source }}
              </span>
            </span>
            <span v-if="row.people.length" class="crm-timeline-people">
              <span v-for="person in row.people" :key="person.email" :title="person.email">{{ person.name }}</span>
              <span v-if="row.hidden" class="crm-muted">+{{ row.hidden }} more</span>
            </span>
          </span>
          <Icon v-if="row.href" icon="tabler:arrow-up-right" class="crm-timeline-go" aria-hidden="true" />
        </component>
        <p v-if="row.anchorName" class="crm-timeline-anchor" data-test="activity-anchor">
          <Icon icon="tabler:corner-down-right" aria-hidden="true" />
          <button v-if="row.anchorRoute" type="button" @click="emit('navigate', row.anchorRoute)">{{ row.anchorName }}</button>
          <span v-else>{{ row.anchorName }}</span>
        </p>
        <details v-if="row.details.length" class="crm-timeline-details" data-test="activity-details">
          <summary><Icon icon="tabler:chevron-right" class="crm-more-caret" aria-hidden="true" /><span>Details</span></summary>
          <dl>
            <div v-for="line in row.details" :key="line.label">
              <dt>{{ line.label }}</dt>
              <dd>{{ line.text }}</dd>
            </div>
          </dl>
        </details>
      </li>
    </ol>
    <p v-else class="crm-empty-copy">Nothing has been logged against this record yet.</p>
    <button v-if="hasMore" class="crm-button crm-timeline-more" type="button" :disabled="loadingMore" @click="emit('more')">
      {{ loadingMore ? 'Loading…' : 'Show earlier activity' }}
    </button>
  </section>
</template>
