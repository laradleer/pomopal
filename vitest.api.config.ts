import { defineConfig } from 'vitest/config'

// API tests: real HTTP requests to the production build (npm run build) with a real Postgres
// (DATABASE_URL). Run with `npm run test:api`. Unit tests stay in vitest.config.ts.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/api/**/*.test.ts'],
    globalSetup: ['tests/api/server.ts'],
    // One server and one database: run the files one after another.
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 30_000,
  },
})
