import { getErrorCode } from '#shared/errors'
import type { Me } from '#shared/types/me'

/**
 * Who is signed in, with their profile and pet (GET /api/me).
 * Loaded once by the auth middleware during SSR, then reused on every navigation.
 * Call `refresh()` after anything that changes it (sign-in, onboarding, rewards).
 */
export const useUserStore = defineStore('user', () => {
  // undefined: not loaded yet · null: signed out · Me: signed in
  const me = ref<Me | null | undefined>(undefined)

  // During SSR this forwards the browser's cookies to the API.
  const requestFetch = useRequestFetch()

  const isLoaded = computed(() => me.value !== undefined)
  const isSignedIn = computed(() => Boolean(me.value))
  const hasPet = computed(() => Boolean(me.value?.pet))

  async function load(): Promise<void> {
    if (isLoaded.value) return
    await refresh()
  }

  async function refresh(): Promise<void> {
    try {
      me.value = await requestFetch<Me>('/api/me')
    } catch (error) {
      if (getErrorCode(error) !== 'UNAUTHORIZED') throw error
      me.value = null
    }
  }

  function clear() {
    me.value = null
  }

  return { me, isLoaded, isSignedIn, hasPet, load, refresh, clear }
})
