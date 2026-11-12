import { createAuthClient } from 'better-auth/vue'

/**
 * Better Auth in the browser: signUp.email, signIn.email, signIn.social, signOut, useSession.
 * Requests go to /api/auth on the same origin.
 *
 * Use it through useAuthActions() (app/composables), not directly in components.
 */
export const authClient = createAuthClient()
