<script setup lang="ts">
// One small typed form: define or edit an object type. Split out of the former three-in-one
// settings modal so each schema form is a self-contained, testable unit.
import { onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import { loadByTagName } from '@wippy-fe/proxy'
import { apiName } from '../crm-model'
import type { CrmObject } from '../crm-types'

const props = defineProps<{ object?: CrmObject | null; busy?: boolean }>()
const emit = defineEmits<{ close: []; save: [value: { label: string; type: string; icon: string; titleLabel: string }] }>()

const form = reactive({ label: props.object?.label || '', type: props.object?.type || '', icon: props.object?.icon || 'tabler:category', titleLabel: '' })
const close = () => emit('close')
const dialogPt = { content: { class: 'crm-dialog-content' } }

onMounted(() => loadByTagName('wc-icon-picker', { timeoutMs: 8000 }))

function selectIcon(event: Event) {
  const value = (event as CustomEvent<unknown>).detail
  if (typeof value === 'string') form.icon = value
}

function submit() {
  if (!form.label.trim()) return
  if (!props.object && !form.titleLabel.trim()) return
  emit('save', { label: form.label.trim(), type: form.type.trim(), icon: form.icon.trim() || 'tabler:category', titleLabel: form.titleLabel.trim() })
}
</script>

<template>
  <Dialog :visible="true" modal :dismissable-mask="true" :show-header="false" class="crm-dialog" :pt="dialogPt" aria-label="Object" @update:visible="(visible: boolean) => { if (!visible) close() }">
    <header class="crm-dialog-head"><div><h2>{{ object ? 'Edit object' : 'New object' }}</h2><p>One reusable record type.</p></div><button type="button" class="crm-icon-button" aria-label="Close" @click="close"><Icon icon="tabler:x" /></button></header>
    <div class="crm-dialog-body crm-form-grid">
      <label class="crm-field"><span class="crm-field-label">Name</span><input v-model="form.label" class="crm-input" placeholder="Companies" @keyup.enter="submit" /></label>
      <label class="crm-field"><span class="crm-field-label">API name</span><input v-model="form.type" class="crm-input" :disabled="!!object" :placeholder="apiName(form.label)" /></label>
      <label v-if="!object" class="crm-field full"><span class="crm-field-label">Record title field</span><span class="crm-field-help">The field used to identify records throughout CRM.</span><input v-model="form.titleLabel" class="crm-input" placeholder="Display name" /></label>
      <label class="crm-field full"><span class="crm-field-label">Icon</span><wc-icon-picker :value="form.icon" fallback="tabler:category" @select="selectIcon" /></label>
    </div>
    <footer class="crm-dialog-foot"><button type="button" class="crm-button" @click="close">Cancel</button><button type="button" class="crm-button primary" :disabled="busy || !form.label.trim() || (!object && !form.titleLabel.trim())" @click="submit"><Icon :icon="busy ? 'tabler:loader-2' : 'tabler:check'" :class="{ spin: busy }" />{{ busy ? 'Saving…' : 'Save' }}</button></footer>
  </Dialog>
</template>
