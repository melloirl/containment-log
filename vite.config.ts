import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import { authoring } from './tools/author-plugin.ts'

export default defineConfig(({ command, mode }) => {
  // Author mode: the dev server with VITE_AUTHOR=true. See README.
  const author =
    command === 'serve' && !process.env.VITEST && loadEnv(mode, process.cwd(), 'VITE_').VITE_AUTHOR === 'true'

  return {
    // Relative base: the build works from any subpath and from a plain static server.
    base: './',
    plugins: [vue(), author && authoring()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    test: {
      include: ['src/**/*.test.ts'],
      environment: 'node',
    },
  }
})
