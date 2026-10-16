import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { wippyComponentPlugin } from '@wippy-fe/vite-plugin'
import { defineConfig } from 'vite'

// The complete Vue surface set builds into ui/dist. The sync step copies only
// this build's JS and sourcemaps into the checked-in served static directory,
// keeping package metadata under explicit registry control.
const entries = {
  create: resolve(__dirname, 'src/create.ts'),
  settings: resolve(__dirname, 'src/settings.ts'),
  picker: resolve(__dirname, 'src/picker.ts'),
  merge: resolve(__dirname, 'src/merge.ts'),
  surface: resolve(__dirname, 'src/surface.ts'),
}
export default defineConfig({
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('kickside-') || tag.startsWith('kickside-') || tag.startsWith('wc-') } } }), wippyComponentPlugin()],
  build: {
    target: 'esnext',
    emptyOutDir: true,
    lib: {
      entry: entries,
      name: 'kicksideCrmMergeReview',
      formats: ['es'],
    },
    rollupOptions: {
      input: entries,
      preserveEntrySignatures: false,
      external: ['vue', '@iconify/vue', '@wippy-fe/proxy'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
