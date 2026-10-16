import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import stylesText from './surface.css?inline'

interface Props { crmId?: string; componentId?: string; objectType?: string; placeholder?: string; value?: string }
interface Events { 'crm-record-selected': { record_id: string | null; object_type?: string; values?: Record<string, unknown> } }
const propsSchema: WippyPropsSchema = { type: 'object', properties: { 'crm-id': { type: 'string', default: '', description: 'CRM workspace id.' }, 'component-id': { type: 'string', default: '', description: 'CRM component id.' }, 'object-type': { type: 'string', default: '', description: 'Declared CRM object type to search.' }, placeholder: { type: 'string', default: 'Search records…', description: 'Search input placeholder.' }, value: { type: 'string', default: '', description: 'Selected record id.' } } }
// Stable-named stub; `CrmRecordPicker.vue` lands in its own content-hashed chunk.
class CrmRecordPickerElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> { return { propsSchema, hostCssKeys: ['themeConfigUrl'] as const, inlineCss: stylesText } }
  static get vueConfig() { return { lazyConfig: () => import('./app/CrmRecordPicker.vue').then((m) => ({ rootComponent: m.default })) } }
}
export async function webComponent() { return CrmRecordPickerElement }
define(import.meta.url, CrmRecordPickerElement)
