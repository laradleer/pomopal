import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

/** Creates a Drizzle client with its own connection pool. The app uses one shared `useDb()`. */
export function createDb(connectionString: string) {
  const pool = new pg.Pool({ connectionString, max: 10 })
  return drizzle(pool, { schema, casing: 'snake_case' })
}

export type Database = ReturnType<typeof createDb>
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]

/** Services accept either, so they can run on their own or inside a caller's transaction. */
export type DbOrTx = Database | Transaction
