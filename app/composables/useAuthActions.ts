import type { SignInInput, SignUpInput } from '#shared/schemas/auth'
import { authClient } from '~/lib/auth-client'

const HOME = '/home'

/**
 * Sign-up, sign-in and sign-out for pages. Every action throws an Error with a friendly
 * message on failure, which useZodForm shows as `formError`.
 */
export async function useAuthActions() {
  const user = useUserStore()
  const route = useRoute()

  const { data: config } = await useFetch('/api/auth-config', {
    key: 'auth-config',
    default: () => ({ google: false }),
  })

  /** Where to go after signing in: the page they wanted, or home. Same-site paths only. */
  function redirectTarget(): string {
    const target = route.query.redirect
    const isSafe = typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    return isSafe ? target : HOME
  }

  async function finishSignIn() {
    await user.refresh()
    // The auth middleware sends new users on to /onboarding.
    await navigateTo(redirectTarget())
  }

  async function signUp(input: SignUpInput): Promise<void> {
    const { error } = await authClient.signUp.email(input)
    if (error) throw new Error(authErrorMessage(error))
    await finishSignIn()
  }

  async function signIn(input: SignInInput): Promise<void> {
    const { error } = await authClient.signIn.email(input)
    if (error) throw new Error(authErrorMessage(error))
    await finishSignIn()
  }

  /** Leaves the app for Google and comes back to `redirectTarget()`. */
  async function signInWithGoogle(): Promise<void> {
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: redirectTarget(),
    })
    if (error) throw new Error(authErrorMessage(error))
  }

  async function signOut(): Promise<void> {
    await authClient.signOut()
    user.clear()
    await navigateTo('/login')
  }

  return {
    googleEnabled: computed(() => config.value.google),
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }
}
