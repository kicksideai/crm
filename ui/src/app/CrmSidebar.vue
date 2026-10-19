<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { countRecords, mergeReviews } from '../crm-api'
import type { CrmObject } from '../crm-types'

// The Instrument rail: workspace switcher, object navigation with live counts, the review
// and follow-up queues with badges, and the data-model section. Counts and badges are
// best-effort reads -- a failed count never blocks navigation.
const props = defineProps<{
  crmId: string
  objects: CrmObject[]
  activeObject?: string
  activeSurface?: string
  workspaceLabel?: string
  canWrite?: boolean
  revision?: number
}>()
const emit = defineEmits<{ navigate: [route: string] }>()

const counts = ref<Record<string, number>>({})
const reviewCount = ref(0)

const surface = computed(() => props.activeSurface || 'records')

function num(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : String(value)
}

async function loadCounts() {
  const entries = await Promise.all(props.objects.map(async (object) => {
    try { return [object.type, await countRecords(props.crmId, object.type)] as const } catch { return null }
  }))
  const next: Record<string, number> = {}
  for (const entry of entries) if (entry) next[entry[0]] = entry[1]
  counts.value = next
}
async function loadQueues() {
  try {
    reviewCount.value = (await mergeReviews(props.crmId, { limit: 1 })).total
  } catch { reviewCount.value = 0 }
}
function refresh() { void loadCounts(); void loadQueues() }

watch(() => [props.crmId, props.objects, props.revision] as const, refresh)
onMounted(refresh)
</script>

<template>
  <aside class="crm-rail">
    <div class="crm-brand">
      <span class="crm-brand-mark"><Icon icon="tabler:address-book" aria-hidden="true" /></span>
      <div class="crm-brand-text"><strong>CRM</strong><small>Workbench</small></div>
    </div>

    <div class="crm-rail-scope">
      <span>Workspace <strong>{{ workspaceLabel || 'CRM' }}</strong></span>
    </div>

    <div class="crm-rail-label">Objects</div>
    <nav class="crm-rail-nav" aria-label="CRM objects">
      <button
        v-for="object in objects"
        :key="object.type"
        :class="{ active: surface === 'records' && activeObject === object.type }"
        @click="emit('navigate', object.type)"
      >
        <Icon :icon="object.icon || 'tabler:category'" aria-hidden="true" />
        <span>{{ object.label || object.type }}</span>
        <b v-if="counts[object.type] !== undefined" class="crm-rail-count">{{ num(counts[object.type]) }}</b>
      </button>
      <button v-if="canWrite" class="crm-rail-add" @click="emit('navigate', 'model')">
        <Icon icon="tabler:plus" aria-hidden="true" /><span>New object</span>
      </button>
    </nav>

    <div class="crm-rail-label">Queues</div>
    <nav class="crm-rail-nav" aria-label="CRM queues">
      <button :class="{ active: surface === 'review' }" @click="emit('navigate', 'review')">
        <Icon icon="tabler:git-merge" aria-hidden="true" />
        <span>Needs review</span>
        <b v-if="reviewCount" class="crm-rail-badge">{{ reviewCount }}</b>
      </button>
    </nav>

    <div class="crm-rail-label">Model</div>
    <nav class="crm-rail-nav" aria-label="CRM data model">
      <button :class="{ active: surface === 'model' }" @click="emit('navigate', 'model')">
        <Icon icon="tabler:table-options" aria-hidden="true" /><span>Objects &amp; fields</span>
      </button>
    </nav>
  </aside>
</template>
