import { resolve } from 'node:path'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import type { Database } from './client'

/** Relative to the working directory: the project root locally, /app in the container. */
const MIGRATIONS_DIR = resolve(process.env.MIGRATIONS_DIR ?? 'server/db/migrations')

/** Applies every migration that hasn't run yet. Safe to call on every start. */
export async function runMigrations(db: Database): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
}
