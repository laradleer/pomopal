import { defineConfig } from 'drizzle-kit'

try {
  process.loadEnvFile('.env')
} catch {
  // No .env file: use the environment as it is.
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  casing: 'snake_case',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
})
