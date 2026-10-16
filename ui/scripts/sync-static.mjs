import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Copy only files produced by this Vue build into the served static directory.
// Every served CRM UI entry is generated from ui/src; sourcemaps stay together.
const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '../dist')
const destDir = resolve(here, '../../static')

if (!['create.js', 'settings.js', 'picker.js', 'merge.js', 'surface.js'].every((name) => existsSync(resolve(srcDir, name)))) {
  console.error(`sync-static: required build outputs missing in ${srcDir}`)
  process.exit(1)
}
if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
const detachedCss = readdirSync(srcDir).filter((name) => name.endsWith('.css'))
if (detachedCss.length > 0) {
  console.error(`sync-static: detached CSS cannot be served inside CRM shadow roots: ${detachedCss.join(', ')}`)
  process.exit(1)
}
// Hashed chunks are immutable per build. Remove the previous generated set so
// the package never accumulates dead frontend implementations. wippy-meta.json
// is included: it is the served package descriptor (views/bundled_meta.lua
// fetches it from the static mount) and must move in lockstep with the JS.
const isSyncedOutput = (name) => /\.(?:js|map)$/.test(name) || name === 'wippy-meta.json'
for (const name of readdirSync(destDir)) {
  if (isSyncedOutput(name)) rmSync(resolve(destDir, name))
}
for (const name of readdirSync(srcDir)) {
  if (!isSyncedOutput(name)) continue
  copyFileSync(resolve(srcDir, name), resolve(destDir, name))
}
console.log('sync-static: wrote maintained CRM Vue bundles')
