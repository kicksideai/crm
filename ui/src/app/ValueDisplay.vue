<script setup lang="ts">
import { computed } from 'vue'
import type { CrmAttribute, CrmValue } from '../crm-types'
import { choiceLabel, displayValue, isStructuredValue, referenceTarget, relationEntries, structuredLines, type NameIndex } from '../crm-model'

// `value` is declared with an explicit default because its type admits a boolean,
// and Vue casts an OMITTED boolean-capable prop to false. Without the default, a
// caller that leaves the value out is answered "No" for a field nobody answered,
// while a caller binding the same absent value explicitly is answered "—".
const props = withDefaults(defineProps<{ value?: CrmValue; attribute?: CrmAttribute; compact?: boolean; names?: NameIndex }>(), { value: undefined, attribute: undefined, names: undefined })
const emit = defineEmits<{ navigate: [route: string] }>()
const isRelation = computed(() => props.attribute?.data_type === 'relation')
const relations = computed(() => (isRelation.value ? relationEntries(props.value, props.names, referenceTarget(props.attribute)) : []))
const isBoolean = computed(() => props.attribute?.data_type === 'boolean')
const text = computed(() => displayValue(props.value, props.attribute))
// A scalar array is a choice/tag list; an array holding objects is a structured value.
const scalarArray = computed(() => Array.isArray(props.value) && props.value.every((item) => item === null || typeof item !== 'object'))
const isStructured = computed(() => isStructuredValue(props.value, props.attribute))
const lines = computed(() => (isStructured.value ? structuredLines(props.value) : []))
// A collapsed structured value names itself: the field label carries the disclosure so
// the summary reads on its own instead of a bare field count with the label outside it.
const structuredSummary = computed(() => {
  const count = `${lines.value.length} field${lines.value.length === 1 ? '' : 's'}`
  const label = props.attribute?.label?.trim()
  return label ? `${label} — ${count}` : count
})
// A chip carries the option, not the constant the option is stored as.
const choices = computed(() => {
  const raw = (!isRelation.value && scalarArray.value) ? (props.value as CrmValue[]) : (props.attribute?.data_type === 'select' && props.value ? [props.value] : [])
  return (raw as unknown[]).map((choice) => ({ key: String(choice), label: choiceLabel(choice) }))
})
</script>

<template>
  <span v-if="isRelation" class="crm-rels">
    <template v-if="relations.length">
      <template v-for="rel in relations" :key="`${rel.kind}:${rel.type}:${rel.id}`">
        <a v-if="rel.href" class="crm-rel" :href="rel.href" target="_blank" rel="noopener">{{ rel.label }}</a>
        <button v-else-if="rel.route" type="button" class="crm-rel" @click.stop="emit('navigate', rel.route)">{{ rel.label }}</button>
        <span v-else class="crm-rel plain">{{ rel.label }}</span>
      </template>
    </template>
    <span v-else class="crm-muted">—</span>
  </span>
  <span v-else-if="isStructured && compact" class="crm-muted" aria-hidden="true">—</span>
  <details v-else-if="isStructured" class="crm-struct">
    <summary>{{ structuredSummary }}</summary>
    <dl class="crm-struct-grid">
      <div v-for="line in lines" :key="line.label"><dt>{{ line.label }}</dt><dd>{{ line.text }}</dd></div>
    </dl>
  </details>
  <template v-else-if="isBoolean && compact">
    <span v-if="value === true" class="crm-flag">{{ attribute?.label || 'Yes' }}</span>
    <span v-else class="crm-flag-blank" aria-hidden="true" />
  </template>
  <span v-else-if="choices.length" class="crm-chips"><span v-for="choice in choices" :key="choice.key" class="crm-chip">{{ choice.label }}</span></span>
  <a v-else-if="attribute?.data_type === 'email' && value" class="crm-link" :href="`mailto:${value}`">{{ text }}</a>
  <a v-else-if="attribute?.data_type === 'url' && value" class="crm-link" :href="String(value)" target="_blank" rel="noopener">{{ text }}</a>
  <!-- An unanswered yes/no is an empty field, not a "no": it reads as absence
       like every other empty field rather than as a switch in the off position. -->
  <span v-else-if="isBoolean && typeof value === 'boolean'" class="crm-boolean" :class="{ on: value === true }"><span />{{ text }}</span>
  <span v-else :class="{ 'crm-muted': text === '—', 'crm-value-compact': compact }">{{ text }}</span>
</template>
