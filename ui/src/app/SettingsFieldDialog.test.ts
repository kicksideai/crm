// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SettingsFieldDialog from './SettingsFieldDialog.vue'
import type { AttributeConfig } from '../crm-types'

vi.mock('primevue/dialog', () => ({ default: { template: '<div><slot /></div>' } }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

function dialog(config: AttributeConfig = {}, dataType = 'text') {
  const save = vi.fn()
  const field = mount(SettingsFieldDialog, {
    props: {
      field: { object_type: 'person', attr: 'files', label: 'Files', data_type: dataType, config },
      objects: [],
      selected: 'person',
      attachmentProviders: ['alpha', 'zeta'],
      onSave: save,
    },
  })
  return { field, save }
}

const stored = {
  attachment: { provider: 'legacy', custom: 'keep' },
  help: 'Original help',
  required: false,
  indexed: true,
  searchable: true,
  alias: { type: 'external' },
  ui: { section: 'custom-seat', group: 'Files', role: 'subtitle' as const },
}

describe('CRM field settings', () => {
  it('keeps the complete populated configuration when only the label changes', async () => {
    const { field, save } = dialog(stored)
    expect(field.text()).toContain('legacy (unavailable)')
    await field.get('input').setValue('New label')
    await field.get('button.primary').trigger('click')
    expect(save).toHaveBeenCalledOnce()
    expect(save.mock.calls[0]?.[0].label).toBe('New label')
    expect(save.mock.calls[0]?.[0].config).toEqual(stored)
  })

  it.each(['', 'alpha'])('clears or replaces the attachment selection %j', async (provider) => {
    const { field, save } = dialog(stored, 'url')
    const labels = field.findAll('label')
    const select = labels.find((label) => label.text().startsWith('Holds files from'))!.get('select')
    expect(select.findAll('option').map((option) => option.element.value)).toEqual(['', 'legacy', 'alpha', 'zeta'])
    await select.setValue(provider)
    await labels.find((label) => label.text().startsWith('Help text'))!.get('input').setValue('')
    await field.get('button.primary').trigger('click')
    expect(save).toHaveBeenCalledOnce()
    const { config } = save.mock.calls[0]?.[0] as { config: AttributeConfig }
    const { attachment, help, ...retained } = stored
    expect(config).toEqual(provider ? { ...retained, attachment: { provider } } : retained)
  })

  it('does not offer file marking for other field types', () => {
    expect(dialog({}, 'number').field.text()).not.toContain('Holds files from')
  })
})
