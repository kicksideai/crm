<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { bootstrap, crmErrorMessage, getRecord, listRecords } from '../crm-api'
import type { CrmAttribute, CrmRecord } from '../crm-types'
import { initials, objectAttributes, recordLabel, subtitleFields, displayValue } from '../crm-model'

const props = withDefaults(defineProps<{ crmId: string; objectType?: string; attributes?: CrmAttribute[]; modelValue?: string; placeholder?: string; disabled?: boolean }>(), { objectType: '', modelValue: '', placeholder: 'Search records…' })
const emit = defineEmits<{ 'update:modelValue': [value: string | undefined]; select: [record: CrmRecord | null] }>()
const query = ref('')
const rows = ref<CrmRecord[]>([])
const selected = ref<CrmRecord | null>(null)
const active = ref(-1)
const open = ref(false)
const loading = ref(false)
const error = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
let selectionRun = 0
const listboxId = `crm-picker-${Math.random().toString(36).slice(2)}`
const schema = ref<CrmAttribute[]>(props.attributes || [])
const fields = computed(() => objectAttributes(schema.value, props.objectType))

async function ensureSchema() {
  if (schema.value.length || !props.crmId) return
  const workspace = await bootstrap(props.crmId)
  if ('provisioned' in workspace) throw new Error('No CRM workspace has been created yet.')
  schema.value = workspace.attributes
}
function label(record: CrmRecord): string { return recordLabel(record, fields.value) }
function subtitle(record: CrmRecord): string {
  for (const field of subtitleFields(fields.value)) {
    const value = record.values[field.attr]
    if (value !== undefined && value !== null && value !== '') return displayValue(value, field)
  }
  return ''
}

async function loadSelection(value: string) {
  const run = ++selectionRun
  if (!value) { selected.value = null; query.value = ''; return }
  loading.value = true; error.value = ''
  try {
    const record = await getRecord(props.crmId, value)
    if (run !== selectionRun) return
    selected.value = record
    query.value = record ? label(record) : ''
  } catch (cause) {
    if (run === selectionRun) { selected.value = null; query.value = ''; error.value = crmErrorMessage(cause, 'Selected record could not load.') }
  } finally { if (run === selectionRun) loading.value = false }
}
async function runSearch(value: string) {
  if (!props.crmId || !props.objectType) { error.value = 'CRM and record type are required.'; open.value = true; return }
  loading.value = true; error.value = ''
  try {
    await ensureSchema()
    rows.value = (await listRecords(props.crmId, props.objectType, { search: value.trim(), limit: 20 })).rows
    active.value = rows.value.length ? 0 : -1; open.value = true
  } catch (cause) { rows.value = []; error.value = crmErrorMessage(cause, 'Records could not load.'); open.value = true }
  finally { loading.value = false }
}
function search(value: string) {
  query.value = value; selected.value = null
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => runSearch(value), 180)
}
function pick(record: CrmRecord) {
  selected.value = record; query.value = label(record); open.value = false
  emit('update:modelValue', record.record_id); emit('select', record)
}
function clear() { selected.value = null; query.value = ''; rows.value = []; open.value = false; emit('update:modelValue', undefined); emit('select', null) }
function keydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); active.value = Math.min(active.value + 1, rows.value.length - 1); open.value = true }
  else if (event.key === 'ArrowUp') { event.preventDefault(); active.value = Math.max(active.value - 1, 0) }
  else if (event.key === 'Enter' && active.value >= 0) { event.preventDefault(); pick(rows.value[active.value]) }
  else if (event.key === 'Escape') open.value = false
}
function focusOut(event: FocusEvent) { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) open.value = false }
watch(() => props.attributes, (value) => { if (value?.length) schema.value = value }, { immediate: true })
watch(() => [props.crmId, props.modelValue], ([, value]) => loadSelection(String(value || '')), { immediate: true })
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>

<template>
  <div class="crm-picker" @focusout="focusOut">
    <div class="crm-picker-input" :class="{ open }">
      <span v-if="selected" class="crm-avatar small">{{ initials(label(selected)) }}</span><Icon v-else :icon="loading ? 'tabler:loader-2' : 'tabler:search'" :class="{ spin: loading }" />
      <input :value="query" type="text" :placeholder="placeholder" :disabled="disabled" role="combobox" :aria-expanded="open" :aria-controls="listboxId" :aria-activedescendant="active >= 0 ? `${listboxId}-option-${active}` : undefined" aria-autocomplete="list" @focus="runSearch(query)" @input="search(($event.target as HTMLInputElement).value)" @keydown="keydown" />
      <button v-if="query && !disabled" type="button" aria-label="Clear selection" @click="clear"><Icon icon="tabler:x" /></button>
    </div>
    <div v-if="open" :id="listboxId" class="crm-picker-menu" role="listbox">
      <div v-if="loading" class="crm-picker-state"><Icon icon="tabler:loader-2" class="spin" />Searching…</div>
      <div v-else-if="error" class="crm-picker-state error"><Icon icon="tabler:alert-circle" />{{ error }}</div>
      <button v-for="(record, index) in rows" v-else :id="`${listboxId}-option-${index}`" :key="record.record_id" type="button" :class="{ active: index === active }" role="option" :aria-selected="index === active" @mouseenter="active = index" @mousedown.prevent="pick(record)"><span class="crm-avatar small">{{ initials(label(record)) }}</span><span><strong>{{ label(record) }}</strong><small v-if="subtitle(record)">{{ subtitle(record) }}</small></span><Icon icon="tabler:chevron-right" /></button>
      <div v-if="!loading && !error && !rows.length" class="crm-picker-state">No matching records.</div>
    </div>
  </div>
</template>
