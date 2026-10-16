export interface Coalescer { signal(): void; cancel(): void }

// A read-model advance says only that the projection moved -- it carries no
// records and no object type -- so a burst of advances is one refresh, not one
// refresh each. The trailing timer lets a stream that has settled refresh almost
// at once, while the ceiling keeps a sustained stream (a sync writing hundreds of
// records) refreshing at a bounded rate instead of never.
export function coalesce(run: () => void, options: { quietMs: number; maxWaitMs: number }): Coalescer {
  let timer: ReturnType<typeof setTimeout> | undefined
  let ceiling = 0

  function fire() {
    timer = undefined
    ceiling = 0
    run()
  }

  return {
    signal() {
      const now = Date.now()
      if (timer) clearTimeout(timer)
      else ceiling = now + options.maxWaitMs
      timer = setTimeout(fire, Math.max(0, Math.min(options.quietMs, ceiling - now)))
    },
    cancel() {
      if (timer) clearTimeout(timer)
      timer = undefined
      ceiling = 0
    },
  }
}
