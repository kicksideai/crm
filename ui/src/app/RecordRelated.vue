<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { initials, humanize, type NameIndex } from '../crm-model'
import { RELATED_SHOWN, relatedGroups, relatedRows, relationLabel, type RelatedRow } from '../crm-related'
import { recordRoute } from '../crm-route'
import type { CrmAttribute, CrmObject, CrmRecord } from '../crm-types'

// What else this record is attached to. Rows carry a name and what the
// connection is called; a group carries the kind of record and how many. An id
// never appears -- a record whose name has not been read yet is named by what
// kind of record it is, which is true, where a title-cased key would not be.

const props = defineProps<{
  record: CrmRecord | null
  fields: CrmAttribute[]
  attributes: CrmAttribute[]
  objects: CrmObject[]
  names: NameIndex
  objectType: string
}>()
const emit = defineEmits<{ navigate: [route: string]; hydrate: [ids: string[]] }>()

// Long lists stay short until asked. The connection a reader came for is at the
// top of its group; the rest are one click away and on the same page -- and the
// names of the rest are read only once a reader asks to see them.
const SHOWN = RELATED_SHOWN
const expanded = ref(new Set<string>())

const groups = computed(() => relatedGroups(relatedRows(props.record, props.fields), props.objects).map((group) => ({
  ...group,
  visible: expanded.value.has(group.type) ? group.rows : group.rows.slice(0, SHOWN),
  hidden: expanded.value.has(group.type) ? 0 : Math.max(0, group.rows.length - SHOWN),
})))
const total = computed(() => groups.value.reduce((count, group) => count + group.rows.length, 0))

function objectLabel(type: string): string {
  return props.objects.find((object) => object.type === type)?.label || humanize(type)
}

function name(row: RelatedRow): string {
  return props.names[row.id]?.name || objectLabel(row.type)
}

function caption(row: RelatedRow): string {
  return relationLabel(row, props.attributes, props.objectType)
}

function expand(type: string) {
  expanded.value = new Set(expanded.value).add(type)
  const group = groups.value.find((entry) => entry.type === type)
  if (group) emit('hydrate', group.rows.map((row) => row.id))
}
</script>

<template>
  <section v-if="total" class="crm-card crm-related-card">
    <header class="crm-card-head">
      <div><h2>Related</h2><p>{{ total }} connected record{{ total === 1 ? '' : 's' }}</p></div>
    </header>
    <div v-for="group in groups" :key="group.type" class="crm-related-group">
      <p class="crm-related-kind">{{ group.label }}<span>{{ group.rows.length }}</span></p>
      <button
        v-for="row in group.visible"
        :key="`${row.direction}:${row.attr}:${row.id}`"
        class="crm-related"
        type="button"
        @click="emit('navigate', recordRoute(row.type, row.id))"
      >
        <span class="crm-avatar">{{ initials(name(row)) }}</span>
        <span><strong>{{ name(row) }}</strong><small>{{ caption(row) }}</small></span>
        <Icon icon="tabler:chevron-right" aria-hidden="true" />
      </button>
      <button v-if="group.hidden" class="crm-related-more" type="button" @click="expand(group.type)">
        Show {{ group.hidden }} more
      </button>
    </div>
  </section>
</template>
