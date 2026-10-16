<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { host } from '@wippy-fe/proxy'
import { applySchema, bootstrap, crmErrorMessage, exportConfig, getSchema, importConfig, readSettings, writeSetting } from '../crm-api'
import type { AttributeConfig, CrmAttribute, CrmBootstrap, CrmObject, CrmSchemaDeclaration, CrmSchemaState, PipelineStage } from '../crm-types'
import { apiName, objectAttributes, objectPipeline, stages } from '../crm-model'
import SettingsObjectDialog from './SettingsObjectDialog.vue'
import SettingsFieldDialog from './SettingsFieldDialog.vue'
import SettingsPipelineDialog from './SettingsPipelineDialog.vue'

const props = withDefaults(defineProps<{ crmId?: string; initial?: CrmBootstrap; canWrite?: boolean }>(), { canWrite: true })
const emit = defineEmits<{ changed: [bootstrap: CrmBootstrap] }>()
const data = ref<CrmBootstrap | null>(props.initial || null)
const selected = ref('')
const loading = ref(true)
const error = ref('')
const busy = ref(false)
// One dialog open at a time, each its own typed form component -- no multiplexed modal.
const dialog = ref<'' | 'object' | 'field' | 'pipeline'>('')
const editingObject = ref<CrmObject | null>(null)
const editingField = ref<CrmAttribute | null>(null)
const retention = ref(365)
const revision = ref('')
const currentObject = computed(() => data.value?.objects.find((object) => object.type === selected.value))
const currentFields = computed(() => objectAttributes(data.value?.attributes || [], selected.value))
const currentPipeline = computed(() => currentObject.value ? objectPipeline(data.value?.pipelines || [], currentObject.value) : undefined)

async function load(prefer = selected.value) {
  loading.value = true; error.value = ''
  try {
    const crmId = props.crmId || data.value?.crm_id || ''
    const [schema, stored, workspace] = await Promise.all([getSchema(crmId), readSettings(), bootstrap(crmId)])
    if ('provisioned' in workspace) throw new Error('No CRM workspace has been created yet.')
    revision.value = schema.revision
    const fresh: CrmBootstrap = { success: true, crm_id: crmId, workspace_label: workspace.workspace_label, can_write: props.canWrite, ...schema.declaration }
    data.value = fresh; retention.value = Number(stored.thread_event_retention_days || 365)
    selected.value = fresh.objects.some((object) => object.type === prefer) ? prefer : fresh.objects[0]?.type || ''
    emit('changed', fresh)
  } catch (cause) { error.value = crmErrorMessage(cause, 'CRM settings could not load.') }
  finally { loading.value = false }
}
function closeDialog() { dialog.value = ''; editingObject.value = null; editingField.value = null }
function openObject(object?: CrmObject) { editingObject.value = object || null; dialog.value = 'object' }
function openField(field?: CrmAttribute) { editingField.value = field || null; dialog.value = 'field' }
function openPipeline() { dialog.value = 'pipeline' }

function currentDeclaration(): CrmSchemaDeclaration {
  if (!data.value) return { objects: [], attributes: [], pipelines: [], views: [] }
  const schema = data.value as CrmBootstrap & Partial<CrmSchemaDeclaration>
  return { version: schema.version, objects: schema.objects, attributes: schema.attributes, pipelines: schema.pipelines, views: schema.views,
    policies: schema.policies, merge_config: schema.merge_config }
}
async function commitSchema(declaration: CrmSchemaDeclaration): Promise<CrmSchemaState> {
  const current = data.value
  if (!current) throw new Error('CRM settings are not loaded.')
  const crmId = current.crm_id
  const state = await applySchema(crmId, revision.value, declaration)
  revision.value = state.revision
  const fresh: CrmBootstrap = { success: true, crm_id: crmId, workspace_label: current.workspace_label, can_write: props.canWrite, ...state.declaration }
  data.value = fresh
  selected.value = fresh.objects.some((object) => object.type === selected.value) ? selected.value : fresh.objects[0]?.type || ''
  emit('changed', fresh)
  return state
}

async function saveObject(value: { label: string; type: string; icon: string; titleLabel: string }) {
  const type = editingObject.value?.type || apiName(value.type || value.label)
  if (!type) return
  busy.value = true
  try {
    const declaration = currentDeclaration()
    const object: CrmObject = { ...(editingObject.value || {}), type, label: value.label, icon: value.icon || undefined }
    const objects = [...declaration.objects.filter((item) => item.type !== type), object]
    let attributes = declaration.attributes
    if (!editingObject.value) {
      const attr = apiName(value.titleLabel)
      attributes = [...attributes, { object_type: type, attr, data_type: 'text', label: value.titleLabel, sort_order: 10, system: true, config: { ui: { role: 'title', section: 'main', span: 4, list: true, form: true } } }]
    }
    await commitSchema({ ...declaration, objects, attributes }); host.toast({ severity: 'success', summary: editingObject.value ? 'Object updated' : 'Object created', detail: value.label }); closeDialog(); selected.value = type
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not save object', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
  finally { busy.value = false }
}
async function removeObject() {
  const object = currentObject.value; if (!object) return
  const accepted = await host.confirm({ header: `Delete ${object.label}`, message: `Delete this object, all of its fields, pipeline, views, and records? This cannot be undone.`, icon: 'tabler:trash', acceptLabel: 'Delete object', rejectLabel: 'Cancel', acceptClass: 'p-button-danger' })
  if (!accepted) return
  try {
    const declaration = currentDeclaration()
    const declarations = [
      ...declaration.pipelines.filter((item) => item.object_type === object.type).map((item) => ({ kind: 'pipeline' as const, id: item.collection_id })),
      ...declaration.views.filter((item) => item.object_type === object.type).map((item) => ({ kind: 'view' as const, id: item.view_id })),
    ]
    await commitSchema({ ...declaration, remove: { objects: [{ object_id: object.id || object.type }], ...(declarations.length ? { declarations } : {}) } })
    host.toast({ severity: 'success', summary: 'Object deleted', detail: object.label })
  }
  catch (cause) { host.toast({ severity: 'error', summary: 'Could not delete object', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
}
async function saveField(value: { label: string; attr: string; data_type: string; config: AttributeConfig; sort_order: number }) {
  if (!value.attr) return
  busy.value = true
  try {
    const declaration = currentDeclaration()
    const attribute: CrmAttribute = { object_type: selected.value, attr: value.attr, data_type: value.data_type, label: value.label, config: value.config, sort_order: value.sort_order || (currentFields.value.length + 1) * 10, system: editingField.value?.system === true }
    await commitSchema({ ...declaration, attributes: [...declaration.attributes.filter((item) => !(item.object_type === selected.value && item.attr === value.attr)), attribute] })
    host.toast({ severity: 'success', summary: editingField.value ? 'Field updated' : 'Field created', detail: value.label }); closeDialog()
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not save field', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
  finally { busy.value = false }
}
async function removeField(field: CrmAttribute) {
  if (field.system) return
  const accepted = await host.confirm({ header: `Delete ${field.label}`, message: 'Delete this field and its stored values? This cannot be undone.', icon: 'tabler:trash', acceptLabel: 'Delete field', rejectLabel: 'Cancel', acceptClass: 'p-button-danger' })
  if (!accepted) return
  try {
    const declaration = currentDeclaration()
    await commitSchema({ ...declaration, remove: { attributes: [{ object_id: currentObject.value?.id || selected.value, field_id: field.id || field.attr }] } })
    host.toast({ severity: 'success', summary: 'Field deleted', detail: field.label })
  }
  catch (cause) { host.toast({ severity: 'error', summary: 'Could not delete field', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
}
async function savePipeline(value: { label: string; collection_id: string; stages: PipelineStage[] }) {
  busy.value = true
  try {
    const normalized = value.stages.filter((stage) => stage.label.trim()).map((stage, index) => ({ ...stage, stage_id: apiName(stage.stage_id || stage.label), label: stage.label.trim(), order: (index + 1) * 10 }))
    const declaration = currentDeclaration()
    const pipeline = { collection_id: value.collection_id, object_type: selected.value, label: value.label, stages: normalized }
    await commitSchema({ ...declaration, pipelines: [...declaration.pipelines.filter((item) => item.collection_id !== value.collection_id), pipeline] })
    host.toast({ severity: 'success', summary: 'Pipeline saved', detail: value.label }); closeDialog()
  } catch (cause) { host.toast({ severity: 'error', summary: 'Could not save pipeline', detail: crmErrorMessage(cause, 'CRM write failed.') }) }
  finally { busy.value = false }
}
async function saveRetention() {
  try { await writeSetting('thread_event_retention_days', retention.value); host.toast({ severity: 'success', summary: 'Retention saved', detail: `${retention.value} days` }) }
  catch (cause) { host.toast({ severity: 'error', summary: 'Could not save retention', detail: crmErrorMessage(cause, 'Setting write failed.') }) }
}
async function pickImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && data.value) {
    try {
      const result = await importConfig(data.value.crm_id, revision.value, JSON.parse(await file.text()))
      host.toast({ severity: 'success', summary: 'Configuration imported', detail: result.changed ? 'The CRM schema was updated.' : 'The CRM schema was already current.' })
      await load(selected.value)
    } catch (cause) { host.toast({ severity: 'error', summary: 'Import failed', detail: crmErrorMessage(cause, 'Configuration import failed.') }) }
  }
  input.value = ''
}
async function exportConfigFile() {
  if (!data.value) return
  busy.value = true
  try {
    const config = await exportConfig(data.value.crm_id)
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `crm-config-${data.value.crm_id}.json`
    document.body.appendChild(anchor); anchor.click(); anchor.remove()
    URL.revokeObjectURL(url)
    host.toast({ severity: 'success', summary: 'Configuration exported', detail: 'Downloaded schema JSON' })
  } catch (cause) { host.toast({ severity: 'error', summary: 'Export failed', detail: crmErrorMessage(cause, 'Configuration export failed.') }) }
  finally { busy.value = false }
}
onMounted(() => load())
</script>

<template>
  <div v-if="loading" class="crm-state"><Icon icon="tabler:loader-2" class="spin" /> Loading CRM settings…</div>
  <div v-else-if="error" class="crm-state error" role="alert"><Icon icon="tabler:alert-circle" /><div><strong>Settings could not load</strong><span>{{ error }}</span></div><button class="crm-button" @click="load()">Try again</button></div>
  <section v-else-if="data" class="crm-settings">
    <header class="crm-page-head"><div><span class="crm-eyebrow">CRM control</span><h1>Data model</h1><p>Objects, fields, relationships, and pipelines.</p></div><div class="crm-page-actions"><span v-if="!canWrite" class="crm-pill"><Icon icon="tabler:eye" />Read-only</span><button class="crm-button" :disabled="busy" @click="exportConfigFile"><Icon icon="tabler:download" />Export JSON</button><label v-if="canWrite" class="crm-button"><Icon icon="tabler:upload" />Import JSON<input class="crm-file-input" type="file" accept="application/json,.json" @change="pickImport" /></label><button v-if="canWrite" class="crm-button primary" @click="openObject()"><Icon icon="tabler:plus" />New object</button></div></header>
    <div class="crm-settings-layout">
      <aside class="crm-settings-objects"><button v-for="object in data.objects" :key="object.type" :class="{ active: selected === object.type }" @click="selected = object.type"><span class="crm-object-icon"><Icon :icon="object.icon || 'tabler:category'" /></span><span><strong>{{ object.label }}</strong><small>{{ objectAttributes(data.attributes, object.type).length }} fields</small></span><Icon icon="tabler:chevron-right" /></button></aside>
      <main v-if="currentObject" class="crm-settings-main">
        <section class="crm-settings-title"><span class="crm-object-icon large"><Icon :icon="currentObject.icon || 'tabler:category'" /></span><div><span>Object</span><h2>{{ currentObject.label }}</h2><code>{{ currentObject.type }}</code></div><template v-if="canWrite"><button class="crm-button" @click="openObject(currentObject)"><Icon icon="tabler:edit" />Edit</button><button class="crm-button danger-text" @click="removeObject"><Icon icon="tabler:trash" />Delete</button></template></section>
        <section class="crm-card"><header class="crm-card-head"><div><h2>Fields and relationships</h2><p>{{ currentFields.length }} fields define records of this type.</p></div><button v-if="canWrite" class="crm-button primary" @click="openField()"><Icon icon="tabler:plus" />New field</button></header><div class="crm-field-list"><div class="crm-field-row header"><span>Field</span><span>API name</span><span>Type</span><span>Placement</span><span /></div><div v-for="field in currentFields" :key="field.attr" class="crm-field-row"><span><strong>{{ field.label }}</strong><small v-if="field.config?.required">Required</small><small v-if="field.system">System</small></span><code>{{ field.attr }}</code><span class="crm-type-badge">{{ field.data_type.replace('_', ' ') }}<small v-if="field.config?.target?.kind === 'record'">→ {{ field.config.target.object_type }}</small><small v-else-if="field.config?.target?.kind === 'component'">→ {{ field.config.target.class }}</small><small v-else-if="field.config?.target?.kind === 'principal'">→ directory</small></span><span class="crm-type-badge">{{ field.config?.ui?.section || 'main' }}<small>{{ field.config?.ui?.span || 2 }}/4</small></span><span class="crm-row-actions"><button v-if="canWrite" class="crm-icon-button" aria-label="Edit field" @click="openField(field)"><Icon icon="tabler:edit" /></button><button v-if="canWrite && !field.system" class="crm-icon-button danger" aria-label="Delete field" @click="removeField(field)"><Icon icon="tabler:trash" /></button></span></div></div></section>
        <section class="crm-card"><header class="crm-card-head"><div><h2>Pipeline</h2><p>{{ currentPipeline ? currentPipeline.label : 'Optional stages for a board view.' }}</p></div><button v-if="canWrite" class="crm-button" @click="openPipeline"><Icon :icon="currentPipeline ? 'tabler:edit' : 'tabler:plus'" />{{ currentPipeline ? 'Edit stages' : 'Add pipeline' }}</button></header><div v-if="currentPipeline" class="crm-pipeline-preview"><span v-for="stage in stages(currentPipeline)" :key="stage.stage_id">{{ stage.label }}</span></div><div v-else class="crm-card-empty"><Icon icon="tabler:layout-kanban" /><span>No pipeline is configured for this object.</span></div></section>
        <section class="crm-card"><header class="crm-card-head"><div><h2>Retention</h2><p>How long CRM thread events remain available.</p></div></header><div class="crm-setting-line"><label>Event retention</label><input v-model.number="retention" class="crm-input short" type="number" min="1" :disabled="!canWrite" /><span>days</span><button v-if="canWrite" class="crm-button" @click="saveRetention">Save</button></div></section>
      </main>
      <main v-else class="crm-settings-main crm-settings-empty"><span class="crm-empty-icon"><Icon icon="tabler:database-plus" /></span><h2>No objects yet</h2><p>Define a record type and its title field to begin building this CRM.</p><button v-if="canWrite" class="crm-button primary" @click="openObject()"><Icon icon="tabler:plus" />New object</button></main>
    </div>

    <SettingsObjectDialog v-if="dialog === 'object'" :object="editingObject" :busy="busy" @close="closeDialog" @save="saveObject" />
    <SettingsFieldDialog v-else-if="dialog === 'field'" :field="editingField" :objects="data.objects" :selected="selected" :busy="busy" @close="closeDialog" @save="saveField" />
    <SettingsPipelineDialog v-else-if="dialog === 'pipeline'" :pipeline="currentPipeline" :object-label="currentObject?.label || 'CRM'" :selected="selected" :busy="busy" @close="closeDialog" @save="savePipeline" />
  </section>
</template>
