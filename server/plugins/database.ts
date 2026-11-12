import { runMigrations } from '../db/migrate'
import { seedShopItems } from '../db/seed'

/**
 * On server start: apply pending migrations, then sync the shop items.
 * Every request waits until this has finished, so no request ever sees an old schema.
 */
export default defineNitroPlugin((nitroApp) => {
  const ready = prepareDatabase().catch((error: unknown) => {
    console.error('[db] Could not prepare the database:', error)
    // In production, crash so Docker restarts the container and the problem is visible.
    // In development, keep the server running so pages without data still work.
    if (!import.meta.dev) process.exit(1)
  })

  nitroApp.hooks.hook('request', () => ready)
})

async function prepareDatabase(): Promise<void> {
  const db = useDb()
  await runMigrations(db)
  await seedShopItems(db)
}
