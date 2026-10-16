<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useProps } from '@wippy-fe/webcomponent-vue'
import { bootstrap, crmErrorMessage } from '../crm-api'
import type { CrmBootstrap } from '../crm-types'
import CrmSettings from './CrmSettings.vue'
const props = useProps<{ componentId?: string }>()
const data = ref<CrmBootstrap | null>(null)
const loading = ref(true)
const error = ref('')
const canWrite = ref(true)
const suppliedId = computed(() => String(props.value?.componentId || '').trim())
async function load() {
  loading.value = true; error.value = ''
  try {
    const boot = await bootstrap(suppliedId.value)
    if ('provisioned' in boot) { data.value = null; return }
    data.value = boot
    canWrite.value = boot.can_write
  }
  catch (cause) { error.value = crmErrorMessage(cause, 'CRM administration could not load.') }
  finally { loading.value = false }
}
onMounted(load)
</script>

<template>
  <main class="crm-admin-root">
    <div v-if="loading" class="crm-state full"><Icon icon="tabler:loader-2" class="spin" /> Opening CRM administration…</div>
    <div v-else-if="error" class="crm-state full error" role="alert"><Icon icon="tabler:alert-circle" /><div><strong>CRM administration could not load</strong><span>{{ error }}</span></div><button class="crm-button" @click="load">Try again</button></div>
    <div v-else-if="!data" class="crm-state full">No CRM workspace has been created yet.</div>
    <template v-else>
      <CrmSettings :crm-id="data.crm_id" :initial="data" :can-write="canWrite" @changed="data = $event" />
    </template>
  </main>
</template>
