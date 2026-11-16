import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { crmStyles } from './crmStyles'
import { lazyPage } from './lazy'
interface Props { componentId?: string }
const propsSchema: WippyPropsSchema = { type: 'object', properties: { 'component-id': { type: 'string', default: '', description: 'CRM component id.' } } }
// Stable-named stub; `CrmSettingsRoot.vue` lands in its own content-hashed chunk, loaded
// through `settings-mount.ts` behind the lazy page boundary.
class CrmSettingsElement extends WippyVueElement<Props, Record<string, never>> {
  static get wippyConfig(): WippyElementConfig<Props> { return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: crmStyles } }
  static get vueConfig() {
    return {
      lazyConfig: lazyPage(
        () => import('./settings-mount').then((module) => module.mountConfig),
        'Could not load the CRM settings. Reload the page to try again.',
        useEvents,
      ),
    }
  }
}
export async function webComponent() { return CrmSettingsElement }
define(import.meta.url, CrmSettingsElement)
