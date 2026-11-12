import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests for pure code: game rules (server/services/rules) and shared helpers.
// They run in plain Node, without booting Nuxt, so they stay fast.
export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '~~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts', 'shared/**/*.test.ts'],
    passWithNoTests: true,
  },
})
