<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { detailGroups, isStructuredValue, moreFields, partitionFields, type NameIndex } from '../crm-model'
import ValueDisplay from './ValueDisplay.vue'
import type { CrmAttribute, CrmRecord } from '../crm-types'

// The record's own data, as a reader takes it in: what it says, grouped by what
// kind of thing each field is, one label and one value per row. What the record
// does not say is not a row -- it waits behind a single disclosure with the rest
// of the long tail.

const props = withDefaults(defineProps<{ record: CrmRecord; fields: CrmAttribute[]; names: NameIndex; stated?: string[] }>(), { stated: () => [] })
const emit = defineEmits<{ navigate: [route: string] }>()

const partition = computed(() => partitionFields(props.fields))
const groups = computed(() => detailGroups(partition.value.reading, props.record.values, props.stated))
const rest = computed(() => moreFields(partition.value.reading, partition.value.system, props.record.values))

function structured(field: CrmAttribute): boolean {
  return isStructuredValue(props.record.values[field.attr], field)
}
</script>

<template>
  <section v-if="groups.length" class="crm-card crm-fields-card">
    <div v-for="group in groups" :key="group.key" class="crm-fields-group">
      <p class="crm-fields-kind">{{ group.label }}</p>
      <dl class="crm-fields">
        <div v-for="field in group.fields" :key="field.attr" :class="{ stacked: structured(field) }">
          <dt>{{ field.label || field.attr }}</dt>
          <dd><ValueDisplay :value="record.values[field.attr]" :attribute="field" :names="names" @navigate="emit('navigate', $event)" /></dd>
        </div>
      </dl>
    </div>
  </section>
  <section v-if="rest.length" class="crm-card crm-more-card">
    <details>
      <summary class="crm-more-summary">
        <Icon icon="tabler:chevron-right" class="crm-more-caret" aria-hidden="true" />
        <span>More fields</span>
        <small>{{ rest.length }}</small>
      </summary>
      <dl class="crm-fields">
        <div v-for="field in rest" :key="field.attr" :class="{ stacked: structured(field) }">
          <dt>{{ field.label || field.attr }}</dt>
          <dd><ValueDisplay :value="record.values[field.attr]" :attribute="field" :names="names" @navigate="emit('navigate', $event)" /></dd>
        </div>
      </dl>
    </details>
  </section>
</template>
