// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import type { WippyVueMountConfig } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import CrmSurface from './app/CrmSurface.vue'

export const mountConfig: WippyVueMountConfig = {
  rootComponent: CrmSurface,
  plugins: [PrimeVuePlugin],
}
