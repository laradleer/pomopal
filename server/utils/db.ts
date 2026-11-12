import { createDb } from '../db/client'
import type { Database } from '../db/client'

let db: Database | undefined

/**
 * The shared database client, created on first use. Use it in services, never in API handlers:
 *
 *   const rows = await useDb().select().from(shopItem)
 */
export function useDb(): Database {
  if (!db) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set. Copy .env.example to .env.')
    db = createDb(url)
  }
  return db
}
