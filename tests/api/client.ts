// Helpers for the API tests: real HTTP requests to the test server as a signed-up student, and
// direct database access to set up a student's level and coins.
import { randomUUID } from 'node:crypto'
import pg from 'pg'
import type { ErrorCode } from '../../shared/errors'
import { API_BASE_URL } from './config'

export type ApiResponse<T = unknown> = {
  status: number
  body: T
  /** The `data.code` of an error response. */
  code: ErrorCode | undefined
}

let pool: pg.Pool | undefined

/** Direct database access for setting up a test. */
export function db(): pg.Pool {
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
  return pool
}

export async function closeDb() {
  await pool?.end()
  pool = undefined
}

async function call<T>(path: string, method: string, cookie: string, body?: unknown) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      origin: API_BASE_URL,
      ...(cookie ? { cookie } : {}),
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  const parsed = text ? JSON.parse(text) : null
  return {
    status: response.status,
    body: parsed as T,
    code: parsed?.data?.code,
    setCookies: response.headers.getSetCookie(),
  }
}

/** A signed-in student. Requests carry their session cookie. */
export type Student = {
  id: string
  get: <T = unknown>(path: string) => Promise<ApiResponse<T>>
  post: <T = unknown>(path: string, body?: unknown) => Promise<ApiResponse<T>>
  /** Sets level and coins directly in the database. */
  setProgress: (progress: { level: number; coins: number }) => Promise<void>
  coins: () => Promise<number>
}

/** Signs up a new student (a profile is created with it) through the real sign-up endpoint. */
export async function signUp(): Promise<Student> {
  const email = `api-test-${randomUUID()}@example.test`
  const response = await call<{ user: { id: string } }>('/api/auth/sign-up/email', 'POST', '', {
    name: 'API test',
    email,
    password: `pw-${randomUUID()}`,
  })
  if (response.status !== 200) throw new Error(`Sign-up failed with ${response.status}.`)
  const cookie = response.setCookies.map((header) => header.split(';')[0]).join('; ')
  const id = response.body.user.id

  return {
    id,
    get: async (path) => call(path, 'GET', cookie),
    post: async (path, body) => call(path, 'POST', cookie, body),
    setProgress: async ({ level, coins }) => {
      await db().query('update profile set level = $2, coins = $3 where user_id = $1', [
        id,
        level,
        coins,
      ])
    },
    coins: async () => {
      const result = await db().query('select coins from profile where user_id = $1', [id])
      return result.rows[0].coins
    },
  }
}

/** Anonymous requests, without a session. */
export const signedOut = {
  post: async (path: string, body?: unknown): Promise<ApiResponse> => call(path, 'POST', '', body),
}

/** Deletes test students; their profile, pet and items go with them. */
export async function deleteStudents(...students: Student[]) {
  await db().query('delete from "user" where id = any($1)', [students.map((s) => s.id)])
}

/** Shop item ids by asset key, e.g. `items['party-hat']`. */
export async function shopItemIds(): Promise<Record<string, number>> {
  const result = await db().query<{ id: number; asset_key: string }>(
    'select id, asset_key from shop_item',
  )
  return Object.fromEntries(result.rows.map((row) => [row.asset_key, row.id]))
}
