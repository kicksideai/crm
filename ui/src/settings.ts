import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { crmStyles } from './crmStyles'
interface Props { componentId?: string }
const propsSchema: WippyPropsSchema = { type: 'object', properties: { 'component-id': { type: 'string', default: '', description: 'CRM component id.' } } }
// Stable-named stub; `CrmSettingsRoot.vue` lands in its own content-hashed chunk.
class CrmSettingsElement extends WippyVueElement<Props, Record<string, never>> {
  static get wippyConfig(): WippyElementConfig<Props> { return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: crmStyles } }
  static get vueConfig() { return { lazyConfig: () => import('./app/CrmSettingsRoot.vue').then((m) => ({ rootComponent: m.default, plugins: [PrimeVuePlugin] })) } }
}
export async function webComponent() { return CrmSettingsElement }
define(import.meta.url, CrmSettingsElement)
