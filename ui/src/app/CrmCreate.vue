<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'

interface CreateProps {
  parentId?: string
  mode?: string
}

interface CreateEvents {
  created: { id: string }
  close: Record<string, never>
}

interface CreateResponse {
  success?: boolean
  id?: string
  error?: string
}

type CreatedListener = (payload: { id: string }) => void
type CloseListener = (payload: Record<string, never>) => void

const props = useProps<CreateProps>()
const emit = useEvents<CreateEvents>()
const attrs = useAttrs()
const parentId = computed(() => String(props.value?.parentId || '').trim())
const canClose = computed(() => String(attrs.mode || props.value?.mode || '') !== 'initial')
const title = ref('')
const saving = ref(false)
const error = ref('')
// A draft owns one key for its whole lifetime. Retrying a timed-out request
// therefore resolves the same server-side creation instead of creating a peer.
const idempotencyKey = crypto.randomUUID()

function notifyCreated(id: string) {
  const payload = { id }
  emit('created', payload)
  const listener = attrs.onCreated
  if (typeof listener === 'function') (listener as CreatedListener)(payload)
}

async function submit() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    const { data } = await api.post<CreateResponse>('/api/v1/workspace/crm', {
      title: title.value.trim() || 'CRM',
      parent_id: parentId.value,
      idempotency_key: idempotencyKey,
    })
    const id = String(data?.id || '').trim()
    if (data?.success !== true || !id) throw new Error(data?.error || 'CRM could not be created.')
    notifyCreated(id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'CRM could not be created.'
  } finally {
    saving.value = false
  }
}

function close() {
  const payload = {}
  emit('close', payload)
  const listener = attrs.onClose
  if (typeof listener === 'function') (listener as CloseListener)(payload)
}
</script>

<template>
  <form class="crm-create" aria-label="Create CRM" @submit.prevent="submit">
    <label class="crm-create-field">
      <span>Name</span>
      <input v-model="title" type="text" autocomplete="off" autofocus placeholder="CRM" />
    </label>
    <p class="crm-create-hint">Create an empty CRM workspace. Install a business module or define its objects and fields after creation.</p>
    <p v-if="error" class="crm-create-error" role="alert"><Icon icon="tabler:alert-circle" aria-hidden="true" />{{ error }}</p>
    <footer class="crm-create-actions">
      <button v-if="canClose" class="crm-button ghost" type="button" :disabled="saving" @click="close">Cancel</button>
      <button class="crm-button primary" type="submit" :disabled="saving">
        <Icon :icon="saving ? 'tabler:loader-2' : 'tabler:plus'" :class="{ spin: saving }" aria-hidden="true" />
        {{ saving ? 'Creating…' : 'Create CRM' }}
      </button>
    </footer>
  </form>
</template>
