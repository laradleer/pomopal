/**
 * Who may open which page. Runs on the server for the first request (so a signed-out user gets a
 * 302 before any HTML is sent) and in the browser on every navigation after that.
 *
 * Each page declares its rule once with definePageMeta({ auth }):
 *   (not set)      signed in and has a pet: the normal app pages
 *   'onboarding'   signed in without a pet yet
 *   'guest'        signed out only (login, sign-up); signed-in users go to the app
 *   false          anyone (dev pages, error pages)
 */
export type PageAuth = false | 'guest' | 'onboarding'

declare module '#app' {
  interface PageMeta {
    auth?: PageAuth
  }
}

const HOME = '/home'
const LOGIN = '/login'
const ONBOARDING = '/onboarding'

export default defineNuxtRouteMiddleware(async (to) => {
  const rule = to.meta.auth
  if (rule === false) return

  const user = useUserStore()
  await user.load()

  if (!user.isSignedIn) {
    if (rule === 'guest') return
    // Remember where they wanted to go, unless it's just the home page.
    const query = to.fullPath === HOME ? undefined : { redirect: to.fullPath }
    return navigateTo({ path: LOGIN, query })
  }

  const appStart = user.hasPet ? HOME : ONBOARDING
  if (rule === 'guest') return navigateTo(appStart)
  if (rule === 'onboarding') return user.hasPet ? navigateTo(HOME) : undefined
  if (!user.hasPet) return navigateTo(ONBOARDING)
})
