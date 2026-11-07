// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { Icon } from '@iconify/vue'
import { defineAsyncComponent, defineComponent, h, onMounted } from 'vue'
import type { Component, VNode } from 'vue'

// Lazy boundaries for web component entries. Both keep the declared
// `error: { message, error }` event, which the wrapper's own lazyConfig rejection
// reduces to `{ message }`. The caller passes the wrapper's `useEvents`, so an entry
// and its lazy chunk share nothing but the wrapper's own chunk.
type UseEvents = <Events>() => <K extends keyof Events>(event: K, detail: Events[K]) => void

interface FailureEvents {
  error: { message: string, error: unknown }
}

interface ControlLabels {
  loading: string
  failed: string
  // A small auto-width control shows an icon, so the failure keeps its normal space.
  iconOnly?: boolean
}

const loadTimeoutMs = 30000
const controlStyle = 'display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;'
const hiddenStyle = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;'

// A request that never settles must not leave the loader up forever.
function withTimeout<T>(load: Promise<T>) {
  let timer: ReturnType<typeof setTimeout>
  const limit = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Loading timed out after ${loadTimeoutMs} ms.`)), loadTimeoutMs)
  })
  return Promise.race([load, limit]).finally(() => clearTimeout(timer))
}

// Some packages have no UI Kit, so the loader turns itself instead of relying on a .spin rule.
function spin(vnode: VNode) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ;(vnode.el as Element).animate({ rotate: ['0deg', '360deg'] }, { duration: 1000, iterations: Infinity })
}

function useFailure(message: string, error: unknown, useEvents: UseEvents) {
  const emit = useEvents<FailureEvents>()
  onMounted(() => emit('error', { message, error }))
}

// Page surfaces use the wrapper's lazyConfig and its loader. The rejection is caught
// here, so the mount config always resolves and the failure root owns the event.
export function lazyPage<T extends { rootComponent: Component }>(
  load: () => Promise<T>,
  message: string,
  useEvents: UseEvents,
) {
  return () => withTimeout(load()).catch((error: unknown) => ({
    rootComponent: defineComponent(() => {
      useFailure(message, error, useEvents)
      return () => h('wippy-error', { title: 'Failed to load', message })
    }),
  }))
}

// Compact controls use an async root, because the wrapper's loader fills the viewport
// when it is the only child of a small surface. The control's stylesheet reserves its
// normal size during the load only, so a loaded control keeps its own size.
export function lazyControl(
  loader: () => Promise<{ default: Component }>,
  labels: ControlLabels,
  useEvents: UseEvents,
) {
  return defineAsyncComponent({
    loader,
    loadingComponent: {
      render: () => h('span', {
        role: 'status',
        'aria-label': labels.loading,
        style: `${controlStyle}color:var(--p-text-muted-color);`,
      }, h('span', { style: 'display:inline-flex;', onVnodeMounted: spin }, h(Icon, { icon: 'tabler:loader-2', 'aria-hidden': 'true' }))),
    },
    errorComponent: defineComponent({
      props: { error: { type: Error, required: true } },
      setup(props) {
        useFailure(labels.failed, props.error, useEvents)
        return () => h('span', {
          role: 'alert',
          title: labels.iconOnly ? labels.failed : undefined,
          style: `${controlStyle}color:var(--p-danger-500);`,
        }, labels.iconOnly
          ? [h(Icon, { icon: 'tabler:alert-circle', 'aria-hidden': 'true' }), h('span', { style: hiddenStyle }, labels.failed)]
          : labels.failed)
      },
    }),
    delay: 200,
    timeout: loadTimeoutMs,
    suspensible: false,
  })
}
