<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { parseMeta, assembleForm, confidencePercent, confidenceTone } from './model'
import type { MergeAction } from './model'

// Attributes arrive camelCased through useProps (item-id -> itemId, data-meta ->
// dataMeta). The host mounts this element in the inbox body, sets these three
// attributes, and listens for the composed `inbox-resolve` event this element
// dispatches. The crm_merge_review declaration marks this component as the action
// owner because its three exact decisions need action-specific confirmation UI.
interface Props {
  itemId?: string
  content?: string
  dataMeta?: string
}
interface Events {
  'inbox-resolve': { id: string; action: string; form: Record<string, unknown> }
}

const props = useProps<Props>()
const emit = useEvents<Events>()

const model = computed(() => parseMeta(props.value.itemId ?? '', props.value.content ?? '', props.value.dataMeta))

const busy = ref(false)
// '' | 'merge' | 'separate' — at most one confirmation is open at a time.
const mode = ref<'' | 'merge' | 'separate'>('')
const winnerId = ref('')
const note = ref('')
const formError = ref('')

const confPercent = computed(() => (model.value.ok ? confidencePercent(model.value.confidence) : 0))
const confToneClass = computed(() => (model.value.ok ? `tone-${confidenceTone(model.value.confidence)}` : 'tone-low'))

function isMatched(attr: string): boolean {
  return model.value.ok && model.value.matchedAttrs.includes(attr)
}

function resolve(action: MergeAction, opts: { winnerId?: string } = {}) {
  if (!model.value.ok || busy.value) return
  const { form, error } = assembleForm(action, {
    leftId: model.value.left.id,
    rightId: model.value.right.id,
    winnerId: opts.winnerId,
    note: note.value,
  })
  if (error || !form) {
    formError.value = error ?? 'Could not build the decision.'
    return
  }
  formError.value = ''
  busy.value = true
  emit('inbox-resolve', { id: model.value.itemId, action, form })
}

function openMerge() {
  formError.value = ''
  if (model.value.ok && !winnerId.value) winnerId.value = model.value.left.id
  mode.value = mode.value === 'merge' ? '' : 'merge'
}
function openSeparate() {
  formError.value = ''
  mode.value = mode.value === 'separate' ? '' : 'separate'
}
function confirmMerge() {
  resolve('merged', { winnerId: winnerId.value })
}
</script>

<template>
  <div class="cm">
    <template v-if="model.ok">
      <div class="cm-why">
        <span class="cm-reason">{{ model.reasonLabel }}</span>
        <span class="cm-conf" :class="confToneClass">
          <span class="cm-conf-bar"><span class="cm-conf-fill" :style="{ width: confPercent + '%' }" /></span>
          {{ confPercent }}% match
        </span>
        <span class="cm-obj">{{ model.objectType }}</span>
      </div>

      <p v-if="model.content" class="cm-summary">{{ model.content }}</p>

      <div class="cm-grid">
        <section
          v-for="(side, key) in { left: model.left, right: model.right }"
          :key="key"
          class="cm-rec"
          :class="{ 'cm-rec-primary': mode === 'merge' && winnerId === side.id }"
        >
          <header class="cm-rec-head">
            <div class="cm-rec-title">
              <label v-if="mode === 'merge'" class="cm-radio">
                <input v-model="winnerId" type="radio" :value="side.id" />
                <span>{{ side.label }}</span>
              </label>
              <span v-else class="cm-rec-name">{{ side.label }}</span>
              <span v-if="mode === 'merge' && winnerId === side.id" class="cm-tag">Keep</span>
              <span v-else-if="mode === ''" class="cm-tag cm-tag-muted">{{ key === 'left' ? 'Record A' : 'Record B' }}</span>
            </div>
            <code class="cm-id">{{ side.id }}</code>
          </header>

          <dl v-if="side.values.length" class="cm-vals">
            <div v-for="v in side.values" :key="v.attr" class="cm-val" :class="{ 'cm-val-match': isMatched(v.attr) }">
              <dt>{{ v.attr }}</dt>
              <dd>{{ v.value }}</dd>
            </div>
          </dl>
          <p v-else class="cm-empty">No field values in this notice.</p>

          <div v-if="side.aliases.length || side.activityCount !== null" class="cm-affected">
            <span v-if="side.activityCount !== null" class="cm-chip">{{ side.activityCount }} activities</span>
            <span v-for="a in side.aliases" :key="a" class="cm-chip">{{ a }}</span>
          </div>
        </section>
      </div>

      <div v-if="model.matched.length" class="cm-evidence">
        <span class="cm-evidence-label">Matched</span>
        <span v-for="m in model.matched" :key="m.attr" class="cm-chip cm-chip-match">
          <b>{{ m.attr }}</b>{{ m.value ? ': ' + m.value : '' }}
        </span>
      </div>

      <label class="cm-note">
        <span>Note (optional)</span>
        <textarea v-model="note" rows="2" placeholder="Add context for this decision" />
      </label>

      <div v-if="mode === 'separate'" class="cm-warn">
        <strong>This is permanent.</strong>
        Keeping these records separate stops the CRM from suggesting this pair again.
        <div class="cm-warn-row">
          <button class="cm-btn cm-btn-danger" :disabled="busy" @click="resolve('do_not_merge')">Confirm — keep separate</button>
          <button class="cm-btn cm-btn-ghost" :disabled="busy" @click="mode = ''">Cancel</button>
        </div>
      </div>

      <div v-if="mode === 'merge'" class="cm-primary-confirm">
        <p class="cm-hint">Choose the record to keep. The other is merged into it.</p>
        <div class="cm-warn-row">
          <button class="cm-btn cm-btn-primary" :disabled="busy || !winnerId" @click="confirmMerge">Merge, keep selected</button>
          <button class="cm-btn cm-btn-ghost" :disabled="busy" @click="mode = ''">Cancel</button>
        </div>
      </div>

      <p v-if="formError" class="cm-error">{{ formError }}</p>

      <div v-if="mode === ''" class="cm-actions">
        <button
          class="cm-btn cm-btn-primary"
          :disabled="busy"
          @click="openMerge"
        >Merge records</button>
        <button
          class="cm-btn cm-btn-ghost cm-btn-danger-text"
          :disabled="busy"
          @click="openSeparate"
        >Keep separate</button>
        <button
          class="cm-btn cm-btn-ghost"
          :disabled="busy"
          @click="resolve('skipped')"
        >Skip</button>
      </div>
    </template>

    <div v-else class="cm-fallback">
      <p class="cm-fallback-title">This merge review could not be displayed.</p>
      <p class="cm-fallback-msg">{{ model.error }}</p>
      <dl class="cm-fallback-ref">
        <div><dt>Item</dt><dd><code>{{ model.itemId || '(none)' }}</code></dd></div>
      </dl>
      <pre v-if="model.raw" class="cm-fallback-raw">{{ model.raw }}</pre>
    </div>
  </div>
</template>
