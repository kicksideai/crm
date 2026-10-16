<script setup lang="ts">
// The records criteria editor. It edits an unsaved view's conditions (field + operator
// appropriate to the field type + a typed value input); complete criteria render as removable
// chips combined with AND. Applying and saving views live in the saved-view tabs; this control
// owns only the filter vocabulary, so filter.lua stays the single match authority.
import { computed, ref, useId } from 'vue'
import { Icon } from '@iconify/vue'
import type { CrmAttribute, CrmValue } from '../crm-types'
import { humanize, referenceTarget } from '../crm-model'
import {
  OPERATORS, type FilterCondition, type FilterOp,
  conditionComplete, describeCondition, fieldByAttr, filterableFields,
  newCondition, operatorsForType, withOperator,
} from '../crm-filter'
import ReferenceInput from './ReferenceInput.vue'

const props = defineProps<{ crmId: string; fields: CrmAttribute[]; modelValue: FilterCondition[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: FilterCondition[]] }>()

const open = ref(false)
const menuId = useId()

const pickable = computed(() => filterableFields(props.fields))
const chips = computed(() => props.modelValue.filter(conditionComplete))
const activeCount = computed(() => chips.value.length)

function fieldFor(cond: FilterCondition): CrmAttribute | undefined { return fieldByAttr(props.fields, cond.attr) }
function opsFor(cond: FilterCondition): FilterOp[] { return operatorsForType(fieldFor(cond)?.data_type || 'text') }
function choicesFor(cond: FilterCondition): string[] { return fieldFor(cond)?.config?.choices || [] }
function asArray(value: CrmValue): string[] { return Array.isArray(value) ? value.map(String) : [] }
function chipLabel(cond: FilterCondition) { return describeCondition(cond, fieldFor(cond)) }

// Which value control a row shows, from the field type crossed with the operator arity.
function inputKind(cond: FilterCondition): string {
  const dataType = fieldFor(cond)?.data_type || 'text'
  const arity = OPERATORS[cond.op].arity
  if (arity === 'none') return 'none'
  if (dataType === 'boolean') return 'bool'
  if (dataType === 'select' || dataType === 'multi_select') return arity === 'list' ? 'choices-multi' : 'choices-single'
  if (dataType === 'relation') return 'relation'
  if (dataType === 'number' || dataType === 'currency') return arity === 'two' ? 'number-range' : 'number'
  if (dataType === 'date') return arity === 'two' ? 'date-range' : 'date'
  return 'text'
}

function commit(next: FilterCondition[]) { emit('update:modelValue', next) }
function patch(id: string, changes: Partial<FilterCondition>) {
  commit(props.modelValue.map((cond) => (cond.id === id ? { ...cond, ...changes } : cond)))
}
function setField(id: string, attr: string) {
  const field = fieldByAttr(props.fields, attr)
  if (!field) return
  const fresh = newCondition(field)
  commit(props.modelValue.map((cond) => (cond.id === id ? { ...fresh, id } : cond)))
}
function setOp(id: string, op: FilterOp) {
  const cond = props.modelValue.find((row) => row.id === id)
  if (!cond) return
  patch(id, withOperator(cond, op, fieldFor(cond)))
}
function setValue(id: string, value: CrmValue) { patch(id, { value }) }
function setValue2(id: string, value: CrmValue) { patch(id, { value2: value }) }
function setList(id: string, event: Event) {
  const select = event.target as HTMLSelectElement
  patch(id, { value: [...select.selectedOptions].map((option) => option.value) })
}
function addCondition() {
  const field = pickable.value[0]
  if (!field) return
  commit([...props.modelValue, newCondition(field)])
  open.value = true
}
function removeCondition(id: string) { commit(props.modelValue.filter((cond) => cond.id !== id)) }
function clearAll() { commit([]) }

function menuFocusOut(event: FocusEvent, close: () => void) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) close()
}
</script>

<template>
  <div class="crm-filterbar">
    <div class="crm-filter-add" @focusout="menuFocusOut($event, () => (open = false))">
      <button class="crm-button" :class="{ active: open || activeCount > 0 }" :aria-expanded="open" :aria-controls="menuId" @click="open = !open"><Icon icon="tabler:filter" />Filter<b v-if="activeCount" class="crm-filter-count">{{ activeCount }}</b></button>
      <div v-if="open" :id="menuId" class="crm-filter-menu" role="group" aria-label="Filter conditions">
        <div v-if="!modelValue.length" class="crm-filter-empty">No conditions yet.</div>
        <div v-for="cond in modelValue" :key="cond.id" class="crm-filter-row">
          <select class="crm-input" :value="cond.attr" aria-label="Filter field" @change="setField(cond.id, ($event.target as HTMLSelectElement).value)">
            <option v-for="field in pickable" :key="field.attr" :value="field.attr">{{ field.label || humanize(field.attr) }}</option>
          </select>
          <select class="crm-input" :value="cond.op" aria-label="Filter operator" @change="setOp(cond.id, ($event.target as HTMLSelectElement).value as FilterOp)">
            <option v-for="op in opsFor(cond)" :key="op" :value="op">{{ OPERATORS[op].label }}</option>
          </select>
          <template v-if="inputKind(cond) === 'none'"><span class="crm-filter-novalue" /></template>
          <select v-else-if="inputKind(cond) === 'bool'" class="crm-input" :value="String(cond.value === true)" aria-label="Filter value" @change="setValue(cond.id, ($event.target as HTMLSelectElement).value === 'true')">
            <option value="true">Yes</option><option value="false">No</option>
          </select>
          <select v-else-if="inputKind(cond) === 'choices-single'" class="crm-input" :value="String(cond.value ?? '')" aria-label="Filter value" @change="setValue(cond.id, ($event.target as HTMLSelectElement).value)">
            <option value="" disabled>Select…</option>
            <option v-for="choice in choicesFor(cond)" :key="choice" :value="choice">{{ choice }}</option>
          </select>
          <select v-else-if="inputKind(cond) === 'choices-multi'" class="crm-input crm-multi" multiple aria-label="Filter values" @change="setList(cond.id, $event)">
            <option v-for="choice in choicesFor(cond)" :key="choice" :value="choice" :selected="asArray(cond.value).includes(choice)">{{ choice }}</option>
          </select>
          <ReferenceInput v-else-if="inputKind(cond) === 'relation' && referenceTarget(fieldFor(cond))" class="crm-filter-relation" :crm-id="crmId" :target="referenceTarget(fieldFor(cond))!" cardinality="one" :model-value="cond.value" :attributes="fields" @update:model-value="setValue(cond.id, $event ?? '')" />
          <template v-else-if="inputKind(cond) === 'number-range' || inputKind(cond) === 'date-range'">
            <input class="crm-input" :type="inputKind(cond) === 'date-range' ? 'date' : 'number'" :value="cond.value ?? ''" aria-label="Filter range start" @input="setValue(cond.id, ($event.target as HTMLInputElement).value)" />
            <span class="crm-filter-dash">–</span>
            <input class="crm-input" :type="inputKind(cond) === 'date-range' ? 'date' : 'number'" :value="cond.value2 ?? ''" aria-label="Filter range end" @input="setValue2(cond.id, ($event.target as HTMLInputElement).value)" />
          </template>
          <input v-else class="crm-input" :type="inputKind(cond) === 'number' ? 'number' : inputKind(cond) === 'date' ? 'date' : 'text'" :value="cond.value ?? ''" placeholder="Value" aria-label="Filter value" @input="setValue(cond.id, ($event.target as HTMLInputElement).value)" />
          <button class="crm-icon-button danger" title="Remove condition" aria-label="Remove condition" @click="removeCondition(cond.id)"><Icon icon="tabler:x" /></button>
        </div>
        <div class="crm-filter-actions">
          <button class="crm-button" @click="addCondition"><Icon icon="tabler:plus" />Add condition</button>
          <button v-if="modelValue.length" class="crm-button danger-text" @click="clearAll">Clear all</button>
        </div>
      </div>
    </div>

    <div class="crm-filter-chips">
      <button v-for="cond in chips" :key="cond.id" class="crm-filter-chip" @click="removeCondition(cond.id)">
        <span class="crm-filter-chip-field">{{ chipLabel(cond).field }}</span>
        <span class="crm-filter-chip-op">{{ chipLabel(cond).op }}</span>
        <span v-if="chipLabel(cond).value" class="crm-filter-chip-value">{{ chipLabel(cond).value }}</span>
        <Icon icon="tabler:x" />
      </button>
    </div>
  </div>
</template>
