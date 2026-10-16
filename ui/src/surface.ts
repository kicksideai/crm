import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { crmStyles } from './crmStyles'

interface Props { route?: string; componentId?: string; entryId?: string }
interface Events { navigate: { route: string } }

const propsSchema: WippyPropsSchema = {
  type: 'object',
  properties: {
    route: { type: 'string', default: '', description: 'CRM object, record, review, or model route.' },
    'component-id': { type: 'string', default: '', description: 'CRM component id.' },
    'entry-id': { type: 'string', default: '', description: 'CRM component id supplied by the Workspace manage view.' },
  },
}

// Stable-named stub; `CrmSurface.vue` lands in its own content-hashed chunk
// (shared with index.ts, which dynamic-imports the same specifier).
class kicksideCrmSurfaceElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: crmStyles }
  }
  static get vueConfig() { return { lazyConfig: () => import('./app/CrmSurface.vue').then((m) => ({ rootComponent: m.default, plugins: [PrimeVuePlugin] })) } }
}

export async function webComponent() { return kicksideCrmSurfaceElement }
define(import.meta.url, kicksideCrmSurfaceElement)
