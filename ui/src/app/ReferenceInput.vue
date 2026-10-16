<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { CrmAttribute, CrmRecord, CrmReference, CrmReferenceTarget, CrmValue } from '../crm-types'
import { humanize, objectAttributes, recordLabel, referenceValues } from '../crm-model'
import RecordPickerControl from './RecordPickerControl.vue'

const props = defineProps<{
  crmId: string
  target: CrmReferenceTarget
  cardinality: 'one' | 'many'
  modelValue?: CrmValue
  attributes?: CrmAttribute[]
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: CrmReference | CrmReference[] | undefined] }>()

const references = computed(() => referenceValues(props.modelValue))
const draftId = ref('')
const draftType = ref('')
const allowedTypes = computed(() => props.target.kind === 'principal' ? (props.target.kinds || []) : [])
const fixedType = computed(() => props.target.kind === 'component' ? String(props.target.class || '') : '')
const activeType = computed(() => fixedType.value || draftType.value || allowedTypes.value[0] || '')

function commit(reference: CrmReference) {
  if (props.cardinality === 'many') {
    const next = references.value.filter((item) => !(item.kind === reference.kind && item.type === reference.type && item.id === reference.id))
    emit('update:modelValue', [...next, reference])
  } else emit('update:modelValue', reference)
}
function selectRecord(record: CrmRecord | null) {
  if (!record) {
    if (props.cardinality === 'one') emit('update:modelValue', undefined)
    return
  }
  const type = String(props.target.object_type || record.object_type)
  commit({ kind: 'record', type, id: record.record_id, label: recordLabel(record, objectAttributes(props.attributes || [], type)) })
}
function addReference() {
  const id = draftId.value.trim()
  const type = activeType.value.trim()
  if (!id || !type || props.target.kind === 'record') return
  commit({ kind: props.target.kind, type, id })
  draftId.value = ''
}
function removeReference(index: number) {
  const next = references.value.filter((_, itemIndex) => itemIndex !== index)
  emit('update:modelValue', props.cardinality === 'many' ? next : undefined)
}
</script>

<template>
  <div class="crm-reference-input">
    <div v-if="references.length" class="crm-reference-values" aria-label="Selected references">
      <span v-for="(reference, index) in references" :key="`${reference.kind}:${reference.type}:${reference.id}`" class="crm-reference-chip">
        <span>{{ reference.label || humanize(reference.id) }}</span>
        <small>{{ humanize(reference.type) }}</small>
        <button v-if="!disabled" type="button" :aria-label="`Remove ${reference.label || reference.id}`" @click="removeReference(index)"><Icon icon="tabler:x" /></button>
      </span>
    </div>
    <RecordPickerControl
      v-if="target.kind === 'record' && (cardinality === 'many' || !references.length)"
      :crm-id="crmId"
      :object-type="target.object_type"
      :attributes="attributes"
      :disabled="disabled"
      :model-value="cardinality === 'one' ? references[0]?.id : ''"
      :placeholder="`Search ${humanize(target.object_type || 'records')}…`"
      @select="selectRecord"
    />
    <div v-else-if="target.kind !== 'record' && (cardinality === 'many' || !references.length)" class="crm-reference-compose">
      <select v-if="target.kind === 'principal' && allowedTypes.length > 1" v-model="draftType" class="crm-input" :disabled="disabled" aria-label="Principal type">
        <option value="">Choose type…</option>
        <option v-for="kind in allowedTypes" :key="kind" :value="kind">{{ humanize(kind) }}</option>
      </select>
      <input v-model="draftId" class="crm-input" :disabled="disabled" :placeholder="target.kind === 'component' ? 'Component ID' : 'Directory ID'" :aria-label="target.kind === 'component' ? 'Component ID' : 'Directory ID'" @keyup.enter.prevent="addReference" />
      <button type="button" class="crm-button" :disabled="disabled || !draftId.trim() || !activeType" @click="addReference"><Icon icon="tabler:plus" />Add</button>
    </div>
  </div>
</template>
