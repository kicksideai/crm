// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Shared Rollup settings for lazily loaded web components. The Host import map
// is the externals contract: every key stays a bare import in every entry.
const snapshotPath = fileURLToPath(new URL('./web-host.import-map.snapshot.json', import.meta.url))
const hostImportMap = JSON.parse(readFileSync(snapshotPath, 'utf8')) as { imports: Record<string, string> }

export const hostExternals = Object.keys(hostImportMap.imports)

// The Host requests an entry with a ?declare-tag= query. A chunk that imports the
// entry back has no query, so it would load a second copy of the wrapper. Keeping
// the wrapper in its own chunk leaves the entry with nothing a lazy chunk needs.
export function wcRuntimeChunk(id: string): string | undefined {
  return id.includes('/@wippy-fe/webcomponent-') ? 'wc-runtime' : undefined
}
