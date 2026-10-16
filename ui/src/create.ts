import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { crmStyles } from './crmStyles'

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

class kicksideCrmCreateElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl'] as const, inlineCss: crmStyles }
  }

  static get vueConfig() {
    return { lazyConfig: () => import('./app/CrmCreate.vue').then((module) => ({ rootComponent: module.default })) }
  }
}

export async function webComponent() {
  return kicksideCrmCreateElement
}

define(import.meta.url, kicksideCrmCreateElement)
