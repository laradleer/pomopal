import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { H3Event } from 'h3'
import { account, session, user, verification } from '~~/server/db/schema'
import { createProfile } from '~~/server/services/profile'

/** Google sign-in is on only when both keys are set. */
export function isGoogleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

function createAuth() {
  const db = useDb()
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  // Secret and public URL come from BETTER_AUTH_SECRET and BETTER_AUTH_URL.
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
    },
    // Google is optional: without both keys the app works with email/password only.
    socialProviders:
      googleClientId && googleClientSecret
        ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
        : {},
    session: {
      // Keep the session in a signed cookie for 5 minutes, so most requests skip the DB lookup.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (newUser) => {
            await createProfile(db, newUser.id, newUser.name)
          },
        },
      },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
export type AuthSession = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>
export type AuthUser = AuthSession['user']

declare module 'h3' {
  interface H3EventContext {
    /** Cached result of getAuthSession() for this request. */
    authSession?: AuthSession | null
  }
}

let auth: Auth | undefined

/** The shared Better Auth instance, created on first use (like useDb). */
export function useAuth(): Auth {
  auth ??= createAuth()
  return auth
}

/** The signed-in session, or null. Looked up once per request. */
export async function getAuthSession(event: H3Event): Promise<AuthSession | null> {
  if (event.context.authSession === undefined) {
    event.context.authSession = await useAuth().api.getSession({ headers: event.headers })
  }
  return event.context.authSession
}

/**
 * The signed-in user, or a 401 `UNAUTHORIZED` error. Every protected API route starts with it:
 *
 *   const user = await requireUser(event)
 */
export async function requireUser(event: H3Event): Promise<AuthUser> {
  const authSession = await getAuthSession(event)
  if (!authSession) throw apiError('UNAUTHORIZED')
  return authSession.user
}
