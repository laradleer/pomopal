// Database commands for local use:
//   npm run db:migrate    apply pending migrations
//   npm run db:seed       sync the shop items
// The app does both by itself on start (server/plugins/database.ts).
import { createDb } from './client'
import { runMigrations } from './migrate'
import { seedShopItems } from './seed'

try {
  process.loadEnvFile('.env')
} catch {
  // No .env file: use the environment as it is.
}

const command = process.argv[2]
const url = process.env.DATABASE_URL

if (command !== 'migrate' && command !== 'seed') {
  console.error('Usage: tsx server/db/cli.ts <migrate|seed>')
  process.exit(1)
}
if (!url) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.')
  process.exit(1)
}

const db = createDb(url)
try {
  if (command === 'migrate') {
    await runMigrations(db)
    process.stdout.write('Migrations applied.\n')
  } else {
    const count = await seedShopItems(db)
    process.stdout.write(`Shop items synced: ${count}.\n`)
  }
} finally {
  await db.$client.end()
}
