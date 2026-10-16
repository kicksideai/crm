import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import stylesText from './styles.css?inline'

// The inbox host mounts this by tag inside an item's body, sets item-id / content
// / data-meta as attributes, and listens for the composed `inbox-resolve` event
// the card dispatches. data-meta stays a string (not an object prop) so a malformed
// payload keeps its raw text for the safe fallback instead of being dropped.
interface Props {
  'item-id'?: string
  content?: string
  'data-meta'?: string
}
interface Events {
  'inbox-resolve': { id: string; action: string; form: Record<string, unknown> }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    'item-id': { type: 'string', default: '', description: 'Inbox item id.' },
    content: { type: 'string', default: '', description: 'Human-readable duplicate summary.' },
    'data-meta': { type: 'string', default: '', description: 'Serialized merge-review metadata.' },
  },
}

// Stable-named stub; `MergeReview.vue` lands in its own content-hashed chunk.
class kicksideCrmMergeReviewElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { lazyConfig: () => import('./app/MergeReview.vue').then((m) => ({ rootComponent: m.default })) }
  }
}

export async function webComponent() {
  return kicksideCrmMergeReviewElement
}

define(import.meta.url, kicksideCrmMergeReviewElement)
