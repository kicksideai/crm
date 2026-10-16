<script setup lang="ts">
// One small typed form: define or edit a pipeline's stages (the board columns). The stage
// reorder list lives here rather than nested inside a multiplexed modal.
import { reactive } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import type { CrmPipeline, PipelineStage } from '../crm-types'
import { stages } from '../crm-model'

const props = defineProps<{ pipeline?: CrmPipeline | null; objectLabel: string; selected: string; busy?: boolean }>()
const emit = defineEmits<{ close: []; save: [value: { label: string; collection_id: string; stages: PipelineStage[] }] }>()

const existing = stages(props.pipeline || undefined)
const form = reactive<{ label: string; collection_id: string; stages: PipelineStage[] }>({
  label: props.pipeline?.label || `${props.objectLabel} Pipeline`,
  collection_id: props.pipeline?.collection_id || `${props.selected}_pipeline`,
  stages: existing.length ? existing.map((stage) => ({ ...stage })) : [{ stage_id: 'new', label: 'New', order: 10 }, { stage_id: 'won', label: 'Won', order: 20 }, { stage_id: 'lost', label: 'Lost', order: 30 }],
})
const close = () => emit('close')
const dialogPt = { content: { class: 'crm-dialog-content' } }

function moveStage(index: number, delta: number) {
  const next = index + delta
  if (next < 0 || next >= form.stages.length) return
  const [stage] = form.stages.splice(index, 1)
  form.stages.splice(next, 0, stage)
}
function addStage() { form.stages.push({ stage_id: '', label: '', order: (form.stages.length + 1) * 10 }) }
function submit() {
  if (!form.stages.some((stage) => stage.label.trim())) return
  emit('save', { label: form.label.trim(), collection_id: form.collection_id, stages: form.stages })
}
</script>

<template>
  <Dialog :visible="true" modal :dismissable-mask="true" :show-header="false" class="crm-dialog" :pt="dialogPt" aria-label="Pipeline stages" @update:visible="(visible: boolean) => { if (!visible) close() }">
    <header class="crm-dialog-head"><div><h2>Pipeline stages</h2><p>The stages shown in board view.</p></div><button type="button" class="crm-icon-button" aria-label="Close" @click="close"><Icon icon="tabler:x" /></button></header>
    <div class="crm-dialog-body">
      <label class="crm-field"><span class="crm-field-label">Pipeline name</span><input v-model="form.label" class="crm-input" /></label>
      <div class="crm-stage-editor">
        <div v-for="(stage, index) in form.stages" :key="index">
          <Icon icon="tabler:grip-vertical" />
          <input v-model="stage.label" class="crm-input" placeholder="Stage name" />
          <button type="button" class="crm-icon-button" :disabled="index === 0" aria-label="Move up" @click="moveStage(index, -1)"><Icon icon="tabler:arrow-up" /></button>
          <button type="button" class="crm-icon-button" :disabled="index === form.stages.length - 1" aria-label="Move down" @click="moveStage(index, 1)"><Icon icon="tabler:arrow-down" /></button>
          <button type="button" class="crm-icon-button danger" aria-label="Remove stage" @click="form.stages.splice(index, 1)"><Icon icon="tabler:x" /></button>
        </div>
        <button type="button" class="crm-button" @click="addStage"><Icon icon="tabler:plus" />Add stage</button>
      </div>
    </div>
    <footer class="crm-dialog-foot"><button type="button" class="crm-button" @click="close">Cancel</button><button type="button" class="crm-button primary" :disabled="busy" @click="submit"><Icon :icon="busy ? 'tabler:loader-2' : 'tabler:check'" :class="{ spin: busy }" />{{ busy ? 'Saving…' : 'Save' }}</button></footer>
  </Dialog>
</template>
