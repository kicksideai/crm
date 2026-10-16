<script setup lang="ts">
import { computed } from 'vue'
import type { CrmAttribute, CrmValue } from '../crm-types'
import { referenceTarget } from '../crm-model'
import ReferenceInput from './ReferenceInput.vue'

const props = defineProps<{ crmId: string; attribute: CrmAttribute; attributes?: CrmAttribute[]; modelValue?: CrmValue; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: CrmValue | undefined] }>()
const config = computed(() => props.attribute.config || {})
function textValue(event: Event) {
  const input = event.target as HTMLInputElement
  if (props.attribute.data_type === 'number' || props.attribute.data_type === 'currency') emit('update:modelValue', input.value === '' ? undefined : Number(input.value))
  else if (props.attribute.data_type === 'datetime') emit('update:modelValue', input.value === '' ? undefined : `${input.value}:00`)
  else emit('update:modelValue', input.value)
}
function multiValue(event: Event) {
  const select = event.target as HTMLSelectElement
  emit('update:modelValue', [...select.selectedOptions].map((option) => option.value))
}
const target = computed(() => referenceTarget(props.attribute))
const inputType = computed(() => {
  if (props.attribute.data_type === 'email') return 'email'
  if (props.attribute.data_type === 'url') return 'url'
  if (props.attribute.data_type === 'date') return 'date'
  if (props.attribute.data_type === 'time') return 'time'
  if (props.attribute.data_type === 'datetime') return 'datetime-local'
  if (props.attribute.data_type === 'number' || props.attribute.data_type === 'currency') return 'number'
  return 'text'
})
const inputValue = computed(() => props.attribute.data_type === 'datetime' && typeof props.modelValue === 'string' ? props.modelValue.slice(0, 16) : props.modelValue ?? '')
</script>

<template>
  <label class="crm-field">
    <span class="crm-field-label">{{ attribute.label || attribute.attr }}<b v-if="config.required" aria-label="required">*</b></span>
    <span v-if="config.help || config.description" class="crm-field-help">{{ config.help || config.description }}</span>
    <select v-if="attribute.data_type === 'select'" class="crm-input" :value="modelValue ?? ''" :disabled="disabled" @change="textValue">
      <option value="">Select…</option><option v-for="choice in config.choices || []" :key="choice" :value="choice">{{ choice }}</option>
    </select>
    <select v-else-if="attribute.data_type === 'multi_select'" class="crm-input crm-multi" multiple :value="Array.isArray(modelValue) ? modelValue : []" :disabled="disabled" @change="multiValue">
      <option v-for="choice in config.choices || []" :key="choice" :value="choice">{{ choice }}</option>
    </select>
    <label v-else-if="attribute.data_type === 'boolean'" class="crm-switch">
      <input type="checkbox" :checked="modelValue === true" :disabled="disabled" @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)" /><span /><em>{{ modelValue === true ? 'Yes' : 'No' }}</em>
    </label>
    <ReferenceInput v-else-if="attribute.data_type === 'relation' && target" :crm-id="crmId" :target="target" :cardinality="config.cardinality === 'many' ? 'many' : 'one'" :model-value="modelValue" :attributes="attributes" :disabled="disabled" @update:model-value="emit('update:modelValue', $event)" />
    <span v-else-if="attribute.data_type === 'relation'" class="crm-inline-error" role="alert">This relation has no typed target.</span>
    <input
      v-else
      class="crm-input"
      :type="inputType"
      :value="inputValue"
      placeholder=""
      :required="config.required"
      :min="config.min"
      :max="config.max"
      :minlength="config.min_length"
      :maxlength="config.max_length"
      :pattern="config.pattern"
      :disabled="disabled"
      @input="textValue"
    />
  </label>
</template>
