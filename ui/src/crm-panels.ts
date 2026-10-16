import { loadByTagName } from '@wippy-fe/proxy'

// The loading half of the record-panel seam. Discovery hands CRM a declared tag
// and nothing else; the platform views API resolves that tag to the contributing
// module's bundle and defines the custom element, so CRM never learns a
// contributor's name, base path, or entry point. Resolution is deduped per tag
// for the page session -- element registration is a one-shot global -- and never
// rejects: an unavailable contribution drops out of the record page instead of
// breaking it.
const PANEL_LOAD_TIMEOUT_MS = 8000
const resolving = new Map<string, Promise<void>>()

export function loadRecordPanelElement(tag: string): Promise<void> {
  if (customElements.get(tag)) return Promise.resolve()
  const pending = resolving.get(tag)
  if (pending) return pending
  // Wrapping the call keeps a host without proxy globals (which throws
  // synchronously) on the same tolerated path as a missing bundle.
  const started = Promise.resolve()
    .then(() => loadByTagName(tag, { timeoutMs: PANEL_LOAD_TIMEOUT_MS }))
    .then(() => undefined)
    .catch((cause: unknown) => { console.warn(`CRM record panel <${tag}> is unavailable.`, cause) })
  resolving.set(tag, started)
  return started
}
