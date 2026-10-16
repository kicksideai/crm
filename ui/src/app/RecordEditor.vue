<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import type { CrmAttribute, CrmRecord, CrmValue } from '../crm-types'
import { fieldSpan, fieldUi } from '../crm-model'
import FieldInput from './FieldInput.vue'

const props = defineProps<{ crmId: string; title: string; attributes: CrmAttribute[]; schema?: CrmAttribute[]; record?: CrmRecord; saving?: boolean }>()
const emit = defineEmits<{ close: []; save: [values: Record<string, CrmValue>] }>()
const values = reactive<Record<string, CrmValue>>({ ...(props.record?.values || {}) })
const error = ref('')
const close = () => emit('close')
const dialogPt = { content: { class: 'crm-dialog-content' } }
const editable = computed(() => props.attributes.filter((attribute) => fieldUi(attribute).form !== false))
function update(attr: string, value: CrmValue | undefined) { if (value === undefined || value === '') delete values[attr]; else values[attr] = value }
function submit() {
  const missing = editable.value.find((attribute) => attribute.config?.required && (values[attribute.attr] === undefined || values[attribute.attr] === ''))
  if (missing) { error.value = `${missing.label || missing.attr} is required.`; return }
  error.value = ''
  emit('save', { ...values })
}
</script>

<template>
  <Dialog :visible="true" modal :dismissable-mask="true" :show-header="false" class="crm-dialog crm-dialog-wide" :pt="dialogPt" :aria-label="title" @update:visible="(visible: boolean) => { if (!visible) close() }">
    <header class="crm-dialog-head"><div><h2>{{ title }}</h2><p>Fields follow this object’s CRM schema.</p></div><button type="button" class="crm-icon-button" aria-label="Close" @click="close"><Icon icon="tabler:x" /></button></header>
    <form class="crm-dialog-body crm-form-grid crm-record-form" @submit.prevent="submit">
      <FieldInput v-for="attribute in editable" :key="attribute.attr" :class="`crm-field-span-${fieldSpan(attribute)}`" :crm-id="crmId" :attribute="attribute" :attributes="schema" :model-value="values[attribute.attr]" @update:model-value="update(attribute.attr, $event)" />
    </form>
    <div v-if="error" class="crm-inline-error" role="alert">{{ error }}</div>
    <footer class="crm-dialog-foot"><button type="button" class="crm-button" :disabled="saving" @click="close">Cancel</button><button type="button" class="crm-button primary" :disabled="saving" @click="submit"><Icon :icon="saving ? 'tabler:loader-2' : 'tabler:check'" :class="{ spin: saving }" />{{ saving ? 'Saving…' : 'Save' }}</button></footer>
  </Dialog>
</template>
