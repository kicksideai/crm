<script setup lang="ts">
// One small typed form: define or edit an attribute. It owns the per-type config growth seam
// (choices for selects, target/cardinality for relation, min/max for numbers) and emits a
// fully-built { label, attr, data_type, config } payload -- the writer wrapping stays in the
// settings surface.
import { computed, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import { apiName } from '../crm-model'
import type { AttributeConfig, CrmAttribute, CrmObject, CrmReferenceTarget } from '../crm-types'

const props = defineProps<{ field?: CrmAttribute | null; objects: CrmObject[]; selected: string; busy?: boolean }>()
const emit = defineEmits<{ close: []; save: [value: { label: string; attr: string; data_type: string; config: AttributeConfig; sort_order: number }] }>()

const TYPES = ['text', 'email', 'phone', 'url', 'number', 'currency', 'boolean', 'date', 'time', 'datetime', 'select', 'multi_select', 'relation', 'ai']
const config = props.field?.config || {}
const ui = config.ui || {}
const target: Partial<CrmReferenceTarget> = config.target || {}
const form = reactive({
  label: props.field?.label || '',
  attr: props.field?.attr || '',
  data_type: props.field?.data_type || 'text',
  help: String(config.help || ''),
  required: config.required === true,
  unique: config.unique === true,
  choices: (config.choices || []).join('\n'),
  record_type: String(target.object_type || ''),
  target_kind: String(target.kind || 'record') as 'record' | 'component' | 'principal',
  target_class: String(target.class || ''),
  target_contract: String(target.contract || ''),
  target_types: (target.kinds || ['user']).join(', '),
  target_route: String(target.route || ''),
  cardinality: config.cardinality === 'many' ? 'many' : 'one' as 'one' | 'many',
  min: config.min == null ? '' : String(config.min),
  max: config.max == null ? '' : String(config.max),
  sort_order: Number(props.field?.sort_order || 10),
  ui_section: String(ui.section || 'main') as 'main' | 'collapsed' | 'hidden',
  ui_form: ui.form !== false,
  ui_list: ui.list !== false,
  ui_role: String(ui.role || '') as '' | 'title' | 'subtitle',
  ui_span: Number(ui.span || 2) as 1 | 2 | 3 | 4,
})
const relationTargets = computed(() => props.objects)
const hasChoices = computed(() => ['select', 'multi_select'].includes(form.data_type))
const hasRange = computed(() => ['number', 'currency'].includes(form.data_type))
const supportsUnique = computed(() => form.data_type !== 'relation')
const valid = computed(() => {
  if (!form.label.trim()) return false
  if (form.data_type !== 'relation') return true
  if (form.target_kind === 'record') return form.record_type.trim() !== ''
  if (form.target_kind === 'component') return form.target_class.trim() !== ''
  return form.target_types.split(',').some((value) => value.trim() !== '')
})
const close = () => emit('close')
const dialogPt = { content: { class: 'crm-dialog-content' } }

function fieldAttr(): string {
  return props.field?.attr || apiName(form.attr || form.label)
}

function buildConfig(attr: string): AttributeConfig {
  const out: AttributeConfig = {}
  if (form.help.trim()) out.help = form.help.trim()
  if (form.required) out.required = true
  if (supportsUnique.value && form.unique) out.unique = true
  if (hasChoices.value) out.choices = form.choices.split(/\n|,/).map((value) => value.trim()).filter(Boolean)
  if (form.data_type === 'relation') {
    let ref: CrmReferenceTarget
    if (form.target_kind === 'record') ref = { kind: 'record', object_type: form.record_type }
    else if (form.target_kind === 'component') ref = { kind: 'component', class: form.target_class.trim(), contract: form.target_contract.trim() || undefined, route: form.target_route.trim() || undefined }
    else ref = { kind: 'principal', kinds: form.target_types.split(',').map((value) => value.trim()).filter(Boolean) }
    out.target = ref
    out.relation = `${props.selected}_${attr}`
    out.cardinality = form.cardinality
  }
  if (form.min !== '') out.min = Number(form.min)
  if (form.max !== '') out.max = Number(form.max)
  out.ui = {
    section: form.ui_section,
    form: form.ui_form,
    list: form.ui_list,
    span: form.ui_span,
    ...(form.ui_role ? { role: form.ui_role } : {}),
  }
  return out
}
function submit() {
  if (!valid.value) return
  const attr = fieldAttr()
  emit('save', { label: form.label.trim(), attr, data_type: form.data_type, config: buildConfig(attr), sort_order: form.sort_order })
}
</script>

<template>
  <Dialog :visible="true" modal :dismissable-mask="true" :show-header="false" class="crm-dialog crm-dialog-wide" :pt="dialogPt" aria-label="Field" @update:visible="(visible: boolean) => { if (!visible) close() }">
      <header class="crm-dialog-head"><div><h2>{{ field ? 'Edit field' : 'New field' }}</h2><p>A schema-backed value on every record.</p></div><button type="button" class="crm-icon-button" aria-label="Close" @click="close"><Icon icon="tabler:x" /></button></header>
      <div class="crm-dialog-body crm-form-grid">
        <label class="crm-field"><span class="crm-field-label">Field label</span><input v-model="form.label" class="crm-input" /></label>
        <label class="crm-field"><span class="crm-field-label">API name</span><input v-model="form.attr" class="crm-input" :disabled="!!field" :placeholder="apiName(form.label)" /></label>
        <label class="crm-field"><span class="crm-field-label">Type</span><select v-model="form.data_type" class="crm-input" :disabled="!!field"><option v-for="type in TYPES" :key="type" :value="type">{{ type.replace('_', ' ') }}</option></select></label>
        <label class="crm-field"><span class="crm-field-label">Help text</span><input v-model="form.help" class="crm-input" /></label>
        <label v-if="hasChoices" class="crm-field full"><span class="crm-field-label">Choices</span><span class="crm-field-help">One per line.</span><textarea v-model="form.choices" class="crm-input crm-textarea" /></label>
        <template v-if="form.data_type === 'relation'">
          <label class="crm-field"><span class="crm-field-label">Target kind</span><select v-model="form.target_kind" class="crm-input"><option value="record">CRM record</option><option value="component">Application component</option><option value="principal">Person or group directory</option></select></label>
          <label v-if="form.target_kind === 'record'" class="crm-field"><span class="crm-field-label">Related object</span><select v-model="form.record_type" class="crm-input"><option value="">Select…</option><option v-for="object in relationTargets" :key="object.type" :value="object.type">{{ object.label }}</option></select></label>
          <label v-else-if="form.target_kind === 'component'" class="crm-field"><span class="crm-field-label">Component class</span><input v-model="form.target_class" class="crm-input" placeholder="knowledge_base" /></label>
          <label v-else class="crm-field"><span class="crm-field-label">Principal kinds</span><input v-model="form.target_types" class="crm-input" placeholder="user, group" /></label>
          <label v-if="form.target_kind === 'component'" class="crm-field"><span class="crm-field-label">Required contract</span><input v-model="form.target_contract" class="crm-input" placeholder="module:contract" /></label>
          <label v-if="form.target_kind === 'component'" class="crm-field"><span class="crm-field-label">Open route</span><span class="crm-field-help">Use {id} for the selected component.</span><input v-model="form.target_route" class="crm-input" placeholder="knowledge/{id}" /></label>
          <label class="crm-field"><span class="crm-field-label">Cardinality</span><select v-model="form.cardinality" class="crm-input"><option value="one">One item</option><option value="many">Many items</option></select></label>
        </template>
        <label v-if="hasRange" class="crm-field"><span class="crm-field-label">Minimum</span><input v-model="form.min" class="crm-input" type="number" /></label>
        <label v-if="hasRange" class="crm-field"><span class="crm-field-label">Maximum</span><input v-model="form.max" class="crm-input" type="number" /></label>
        <div class="crm-form-section full"><strong>Presentation</strong><span>Declarative placement used by every CRM surface.</span></div>
        <label class="crm-field"><span class="crm-field-label">Detail section</span><select v-model="form.ui_section" class="crm-input"><option value="main">Main details</option><option value="collapsed">Collapsed details</option><option value="hidden">Hidden</option></select></label>
        <label class="crm-field"><span class="crm-field-label">Width</span><select v-model.number="form.ui_span" class="crm-input"><option :value="1">Quarter</option><option :value="2">Half</option><option :value="3">Three quarters</option><option :value="4">Full</option></select></label>
        <label class="crm-field"><span class="crm-field-label">Semantic role</span><select v-model="form.ui_role" class="crm-input"><option value="">Standard field</option><option value="title">Record title</option><option value="subtitle">Record subtitle</option></select></label>
        <label class="crm-field"><span class="crm-field-label">Position</span><input v-model.number="form.sort_order" class="crm-input" type="number" min="0" step="10" /></label>
        <label class="crm-check"><input v-model="form.ui_form" type="checkbox" /><span><strong>Show in forms</strong><small>Available while creating or editing a record.</small></span></label>
        <label class="crm-check"><input v-model="form.ui_list" type="checkbox" /><span><strong>Show in default lists</strong><small>Eligible for the default table columns.</small></span></label>
        <label class="crm-check"><input v-model="form.required" type="checkbox" /><span><strong>Required</strong><small>Records cannot omit this value.</small></span></label>
        <label v-if="supportsUnique" class="crm-check"><input v-model="form.unique" type="checkbox" /><span><strong>Unique</strong><small>No two records may share it.</small></span></label>
      </div>
      <footer class="crm-dialog-foot"><button type="button" class="crm-button" @click="close">Cancel</button><button type="button" class="crm-button primary" :disabled="busy || !valid" @click="submit"><Icon :icon="busy ? 'tabler:loader-2' : 'tabler:check'" :class="{ spin: busy }" />{{ busy ? 'Saving…' : 'Save' }}</button></footer>
  </Dialog>
</template>
