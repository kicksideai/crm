import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { crmStyles } from './crmStyles'
import { lazyPage } from './lazy'

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

// Stable-named stub; `CrmSurface.vue` lands in its own content-hashed chunk, loaded
// through `surface-mount.ts` behind the lazy page boundary.
class kicksideCrmSurfaceElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: crmStyles }
  }
  static get vueConfig() {
    return {
      lazyConfig: lazyPage(
        () => import('./surface-mount').then((module) => module.mountConfig),
        'Could not load the CRM. Reload the page to try again.',
        useEvents,
      ),
    }
  }
}

export async function webComponent() { return kicksideCrmSurfaceElement }
define(import.meta.url, kicksideCrmSurfaceElement)
