// Vitest global setup for the API tests: starts the production build (.output) on its own port
// against DATABASE_URL, waits until it answers, and stops it after the last test. The server
// migrates and seeds the database by itself on start, like in production.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { API_BASE_URL, API_PORT } from './config'

const ENTRY = '.output/server/index.mjs'
const START_TIMEOUT_MS = 60_000

export default async function startServer() {
  try {
    process.loadEnvFile('.env')
  } catch {
    // No .env file (CI): DATABASE_URL comes from the environment.
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  if (!existsSync(ENTRY)) throw new Error(`${ENTRY} is missing. Run "npm run build" first.`)

  const server = spawn(process.execPath, [ENTRY], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: String(API_PORT),
      BETTER_AUTH_URL: API_BASE_URL,
      // Only for this throwaway test server.
      BETTER_AUTH_SECRET: 'api-tests-only-secret-0123456789abcdef',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
    },
    stdio: ['ignore', 'inherit', 'inherit'],
  })

  const deadline = Date.now() + START_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`The server exited with code ${server.exitCode}.`)
    try {
      if ((await fetch(`${API_BASE_URL}/api/health`)).ok) break
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  if (Date.now() >= deadline) {
    server.kill()
    throw new Error(`The server did not answer within ${START_TIMEOUT_MS / 1000} s.`)
  }

  return () => {
    server.kill()
  }
}
