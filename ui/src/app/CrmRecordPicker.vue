<script setup lang="ts">
import { computed } from 'vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import type { CrmRecord } from '../crm-types'
import RecordPickerControl from './RecordPickerControl.vue'

interface Props { crmId?: string; componentId?: string; objectType?: string; placeholder?: string; value?: string }
const props = useProps<Props>()
const emit = useEvents<{ 'crm-record-selected': { record_id: string | null; object_type?: string; values?: Record<string, unknown> } }>()
const crmId = computed(() => String(props.value?.crmId || props.value?.componentId || '').trim())
const objectType = computed(() => String(props.value?.objectType || '').trim())
const value = computed(() => props.value?.value)
const placeholder = computed(() => props.value?.placeholder)
function selected(record: CrmRecord | null) {
  emit('crm-record-selected', record ? { record_id: record.record_id, object_type: record.object_type, values: record.values as Record<string, unknown> } : { record_id: null })
}
</script>

<template>
  <RecordPickerControl :crm-id="crmId" :object-type="objectType" :model-value="value" :placeholder="placeholder" @select="selected" />
</template>
