import { TIMER_LIMITS } from '#shared/constants'

/**
 * Game progress and timer settings of the signed-in user.
 * A view on useUserStore (filled once from GET /api/me), so there is one source of truth.
 */
export const useProfileStore = defineStore('profile', () => {
  const user = useUserStore()

  const profile = computed(() => user.me?.profile ?? null)
  const displayName = computed(() => profile.value?.displayName ?? user.me?.user.name ?? '')
  const level = computed(() => profile.value?.level ?? 1)
  const xp = computed(() => profile.value?.xp ?? 0)
  const coins = computed(() => profile.value?.coins ?? 0)
  const streakDays = computed(() => profile.value?.streakDays ?? 0)

  /** Timer lengths in minutes, from the user's settings. */
  const timerMinutes = computed(() => ({
    focus: profile.value?.focusMin ?? TIMER_LIMITS.focus.default,
    short: profile.value?.shortBreakMin ?? TIMER_LIMITS.shortBreak.default,
    long: profile.value?.longBreakMin ?? TIMER_LIMITS.longBreak.default,
  }))

  return { profile, displayName, level, xp, coins, streakDays, timerMinutes }
})
