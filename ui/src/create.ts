import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { crmStyles } from './crmStyles'
import { lazyControl } from './lazy'

interface Props {
  parentId?: string
  mode?: string
  type?: string
}

interface Events {
  created: { id: string }
  close: Record<string, never>
}

const propsSchema: WippyPropsSchema = {
  type: 'object',
  properties: {
    'parent-id': { type: 'string', default: '', description: 'Workspace folder that owns the CRM.' },
    mode: { type: 'string', default: 'create' },
    type: { type: 'string', default: '' },
  },
}

const Root = lazyControl(
  () => import('./app/CrmCreate.vue'),
  { loading: 'Loading the CRM creation form…', failed: 'Could not load the CRM creation form. Reload the page to try again.' },
  useEvents,
)

class kicksideCrmCreateElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl'] as const, inlineCss: crmStyles }
  }

  static get vueConfig() {
    return { rootComponent: Root }
  }
}

export async function webComponent() {
  return kicksideCrmCreateElement
}

define(import.meta.url, kicksideCrmCreateElement)
