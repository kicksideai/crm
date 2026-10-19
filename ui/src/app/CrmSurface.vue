<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { on } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { bootstrap, isNotProvisioned, CrmWorkspaceChoice, crmErrorMessage, type WorkspaceCandidate } from '../crm-api'
import { coalesce } from '../crm-refresh'
import type { CrmBootstrap, CrmObject } from '../crm-types'
import { recordFromRoute } from '../crm-route'
import CrmSidebar from './CrmSidebar.vue'
import RecordsView from './RecordsView.vue'
import RecordDetail from './RecordDetail.vue'
import ReviewQueue from './ReviewQueue.vue'
import CrmSettings from './CrmSettings.vue'
import CrmCreate from './CrmCreate.vue'

interface Props { route?: string; componentId?: string; entryId?: string }
const props = useProps<Props>()
const emit = useEvents<{ navigate: { route: string } }>()
const data = ref<CrmBootstrap | null>(null)
const loading = ref(true)
const error = ref('')
const needsCreate = ref(false)
const canCreate = ref(false)
const canWrite = ref(true)
// Workspace ambiguity is a first-class state, not an error: candidates render a chooser.
const candidates = ref<WorkspaceCandidate[] | null>(null)
// The component id chosen from the workspace chooser overrides the host-supplied one.
const chosenId = ref('')
// Every read-model advance bumps this counter; the active view watches it and
// refetches its own query. The bootstrap (workspace, objects, fields, pipelines,
// views) is schema state and is deliberately not part of that reaction.
const dataRevision = ref(0)
let unsubscribe: (() => void) | undefined
let pendingRoute: string | null = null
let routeTimer: ReturnType<typeof setTimeout> | undefined
let loadRun = 0

// A settled write refreshes within QUIET_MS; a sustained stream refreshes at most
// once per CEILING_MS. SCHEMA_RECHECK_MS bounds how often a stream may pay for a
// bootstrap comparison, which is the only way to notice a concurrent schema edit
// -- the advance envelope carries no schema revision to compare against.
const QUIET_MS = 300
const CEILING_MS = 2000
const SCHEMA_RECHECK_MS = 30000
// Seeded at mount: the surface has just bootstrapped, so the first stream of
// advances has nothing to reconcile.
let lastSchemaCheck = Date.now()

// The schema-class shape of a bootstrap. Records are excluded by construction:
// only a change here justifies replacing the surface's schema state.
function schemaShape(boot: CrmBootstrap | null): string {
  if (!boot) return ''
  return JSON.stringify([boot.crm_id, boot.workspace_label, boot.can_write, boot.objects, boot.attributes, boot.pipelines, boot.views])
}

// Reconcile schema state without disturbing the surface: no spinner, no view
// remount, and the data is swapped only when the schema actually differs. A
// failure is left to the next cycle rather than blanking a working surface.
async function recheckSchema() {
  const run = loadRun
  try {
    const boot = await bootstrap(suppliedId.value)
    if (run !== loadRun) return
    if (isNotProvisioned(boot)) { needsCreate.value = true; canCreate.value = boot.can_create; data.value = null; unsubscribe?.(); return }
    if (schemaShape(boot) === schemaShape(data.value)) return
    data.value = boot
    canWrite.value = boot.can_write
  } catch { /* the surface keeps the schema it already has */ }
}

const dataRefresh = coalesce(() => {
  dataRevision.value++
  const now = Date.now()
  if (now - lastSchemaCheck < SCHEMA_RECHECK_MS) return
  lastSchemaCheck = now
  void recheckSchema()
}, { quietMs: QUIET_MS, maxWaitMs: CEILING_MS })

// Reserved routes address workbench surfaces that are not object types.
const RESERVED = new Set(['review', 'model'])

// Keep navigation responsive even when the shell considers two routes part of the
// same mounted surface. Host route changes are copied into the local route so a
// delayed shell round-trip cannot resurrect the previous detail page.
const localRoute = ref<string | null>(null)
watch(() => props.value?.route, (next) => {
  const normalized = String(next ?? '').replace(/^\/+|\/+$/g, '')
  if (pendingRoute && normalized !== pendingRoute) return
  localRoute.value = normalized
  pendingRoute = null
})
const route = computed(() => {
  const value = String(localRoute.value ?? props.value?.route ?? '').replace(/^\/+|\/+$/g, '')
  return value === props.value?.entryId ? '' : value
})
const routeParts = computed(() => route.value.split('/').filter(Boolean))
const surface = computed(() => (RESERVED.has(routeParts.value[0]) ? routeParts.value[0] : 'records'))
// The object type the address names, or '' when it names none. The CRM root
// names none and opens the first object; every other address names one.
const namedObjectType = computed(() => (surface.value === 'records' ? routeParts.value[0] ?? '' : ''))
const activeObject = computed<CrmObject | undefined>(() => {
  const objects = data.value?.objects || []
  if (surface.value !== 'records') return objects[0]
  if (namedObjectType.value === '') return objects[0]
  // No fallback to the first object. An address that NAMES an object type this
  // CRM does not have is answered by saying so -- opening some other object's
  // list instead is the same lie as opening a list for a record that could not
  // be found, and it hides a retired or renamed object type behind a page that
  // looks like it worked.
  return objects.find((object) => object.type === namedObjectType.value)
})
// Set only when the address named an object type and this CRM has objects but
// none by that name -- an empty CRM is a different answer and keeps its own.
const unknownObjectType = computed(() =>
  namedObjectType.value !== '' && (data.value?.objects || []).length > 0 && !activeObject.value
    ? namedObjectType.value
    : '')
// What the route addresses under the active object: its list, one record, or a
// record this surface cannot name. The third is an answer, not an absence -- a
// link that named a record and silently opened the list is a link that lied.
const recordSegment = computed(() =>
  activeObject.value !== undefined && activeObject.value.type === namedObjectType.value
    ? recordFromRoute(routeParts.value)
    : ({ kind: 'none' } as const))
const activeRecordId = computed(() => recordSegment.value.kind === 'record' ? recordSegment.value.recordId : undefined)
const unresolvedRecord = computed(() => recordSegment.value.kind === 'unresolvable' ? recordSegment.value.segment : '')
const hostId = computed(() => String(props.value?.entryId || '').trim() || String(props.value?.componentId || '').trim())
const suppliedId = computed(() => chosenId.value || hostId.value)
const workspaceLabel = computed(() => data.value?.workspace_label || '')

function navigate(next: string) {
  const normalized = next.replace(/^\//, '')
  pendingRoute = normalized
  if (!props.value?.entryId) emit('navigate', { route: normalized })
  // The host may synchronously round-trip the route and trigger the prop watcher.
  // Apply the local value last so this click always wins the current render.
  localRoute.value = normalized
  if (routeTimer) clearTimeout(routeTimer)
  routeTimer = setTimeout(() => { pendingRoute = null }, 1000)
}

async function load() {
  const run = ++loadRun
  loading.value = true; error.value = ''; candidates.value = null; needsCreate.value = false
  try {
    const boot = await bootstrap(suppliedId.value)
    if (run !== loadRun) return
    if (isNotProvisioned(boot)) { needsCreate.value = true; canCreate.value = boot.can_create; data.value = null; unsubscribe?.(); return }
    data.value = boot
    canWrite.value = boot.can_write
    unsubscribe?.()
    // A read-model advance is a record-data signal, never a schema one: it moves
    // the revision the active view reacts to and never re-runs this bootstrap.
    unsubscribe = on(`kickside.thread.${boot.crm_id}.projection.kickside.crm:read_model`, () => dataRefresh.signal())
  } catch (cause) {
    if (run !== loadRun) return
    if (cause instanceof CrmWorkspaceChoice) { candidates.value = cause.candidates; data.value = null }
    else error.value = crmErrorMessage(cause, 'CRM could not be opened.')
  } finally {
    if (run === loadRun) loading.value = false
  }
}

function createdWorkspace(event: { id: string }) {
  chosenId.value = event.id
  void load()
}

function chooseWorkspace(candidate: WorkspaceCandidate) {
  if (candidate.crm_id === data.value?.crm_id) return
  chosenId.value = candidate.crm_id
  void load()
}

onMounted(load)
onBeforeUnmount(() => { loadRun++; unsubscribe?.(); dataRefresh.cancel(); if (routeTimer) clearTimeout(routeTimer) })
</script>

<template>
  <main class="crm-app" :data-route="route" :data-record-id="activeRecordId || ''">
    <div v-if="loading" class="crm-state full"><Icon icon="tabler:loader-2" class="spin" /> Opening CRM…</div>
    <section v-else-if="needsCreate" class="crm-chooser full" aria-label="Create your CRM workspace">
      <div class="crm-chooser-card">
        <span class="crm-chooser-mark"><Icon icon="tabler:address-book" aria-hidden="true" /></span>
        <h1>{{ canCreate ? 'Create your CRM' : 'No CRM workspace is available' }}</h1>
        <template v-if="canCreate">
          <p>Start with one workspace. Its objects, fields, and pipelines stay configuration-driven.</p>
          <CrmCreate mode="initial" @created="createdWorkspace" />
        </template>
        <p v-else>An administrator can create a CRM workspace and share it with you.</p>
      </div>
    </section>
    <section v-else-if="candidates" class="crm-chooser full" role="dialog" aria-label="Choose a CRM workspace">
      <div class="crm-chooser-card">
        <span class="crm-chooser-mark"><Icon icon="tabler:versions" aria-hidden="true" /></span>
        <h1>Choose a workspace</h1>
        <p>You can reach more than one CRM. Pick which one to open.</p>
        <div class="crm-chooser-list">
          <button v-for="candidate in candidates" :key="candidate.crm_id" @click="chooseWorkspace(candidate)">
            <span class="crm-object-icon"><Icon icon="tabler:address-book" aria-hidden="true" /></span>
            <span><strong>{{ candidate.label }}</strong><small>{{ candidate.component_id }}</small></span>
            <Icon icon="tabler:chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
    <div v-else-if="error || !data" class="crm-state full error" role="alert"><Icon icon="tabler:alert-circle" /><div><strong>CRM could not open</strong><span>{{ error || 'No CRM data was returned.' }}</span></div><button class="crm-button" @click="load">Try again</button></div>
    <template v-else>
      <CrmSidebar :crm-id="data.crm_id" :objects="data.objects" :active-object="activeObject?.type" :active-surface="surface" :workspace-label="workspaceLabel" :can-write="canWrite" :revision="dataRevision" @navigate="navigate" />
      <section class="crm-content">
        <ReviewQueue v-if="surface === 'review'" :crm-id="data.crm_id" :objects="data.objects" :attributes="data.attributes" :can-write="canWrite" />
        <CrmSettings v-else-if="surface === 'model'" :crm-id="data.crm_id" :initial="data" :can-write="canWrite" @changed="data = $event" />
        <div v-else-if="activeObject && unresolvedRecord" class="crm-state full" data-test="unresolved-record">
          <Icon icon="tabler:file-off" />
          <div><strong>Record not found</strong><span>This address does not name a record in {{ activeObject.label }}.</span></div>
          <button class="crm-button" @click="navigate(activeObject.type)">Back to {{ activeObject.label }}</button>
        </div>
        <RecordDetail v-else-if="activeObject && activeRecordId" :key="activeRecordId" :crm-id="data.crm_id" :record-id="activeRecordId" :object="activeObject" :objects="data.objects" :attributes="data.attributes" :can-write="canWrite" :revision="dataRevision" @back="navigate(activeObject.type)" @navigate="navigate" @changed="load" />
        <RecordsView v-else-if="activeObject" :key="activeObject.type" :crm-id="data.crm_id" :object="activeObject" :objects="data.objects" :attributes="data.attributes" :pipelines="data.pipelines" :views="data.views" :can-write="canWrite" :revision="dataRevision" @navigate="navigate" @changed="load" />
        <div v-else-if="unknownObjectType" class="crm-state full" data-test="unknown-object">
          <Icon icon="tabler:category-off" />
          <div><strong>Not found</strong><span>This CRM has nothing called “{{ unknownObjectType }}”.</span></div>
          <button v-if="data.objects[0]" class="crm-button" @click="navigate(data.objects[0].type)">Back to {{ data.objects[0].label }}</button>
        </div>
        <div v-else class="crm-state full"><Icon icon="tabler:category-off" /><div><strong>No CRM objects</strong><span>Define objects in System settings under CRM to begin.</span></div></div>
      </section>
    </template>
  </main>
</template>
