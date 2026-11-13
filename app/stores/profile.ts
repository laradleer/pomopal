import { TIMER_LIMITS } from '#shared/constants'
import { levelProgress } from '#shared/levels'
import { localDate, visibleStreak } from '#shared/streak'

/**
 * Game progress and timer settings of the signed-in user.
 * A view on useUserStore (filled once from GET /api/me), so there is one source of truth.
 */
export const useProfileStore = defineStore('profile', () => {
  const user = useUserStore()

  /**
   * Today's date in the browser's time zone. Unknown during SSR (the server can't know the
   * user's time zone), so it is set after mount with `syncToday()`; until then the stored
   * streak is shown, which keeps server and browser HTML identical.
   */
  const today = ref<string | null>(null)

  const profile = computed(() => user.me?.profile ?? null)
  const displayName = computed(() => profile.value?.displayName ?? user.me?.user.name ?? '')
  const xp = computed(() => profile.value?.xp ?? 0)
  const coins = computed(() => profile.value?.coins ?? 0)

  /** Level and XP inside the level, for the XP bar. */
  const progress = computed(() => levelProgress(xp.value))
  const level = computed(() => progress.value.level)

  /** The streak to show: 0 once a whole day was skipped. */
  const streakDays = computed(() => {
    const streak = {
      streakDays: profile.value?.streakDays ?? 0,
      lastStudyDate: profile.value?.lastStudyDate ?? null,
    }
    return today.value ? visibleStreak(streak, today.value) : streak.streakDays
  })

  /** Timer lengths in minutes, from the user's settings. */
  const timerMinutes = computed(() => ({
    focus: profile.value?.focusMin ?? TIMER_LIMITS.focus.default,
    short: profile.value?.shortBreakMin ?? TIMER_LIMITS.shortBreak.default,
    long: profile.value?.longBreakMin ?? TIMER_LIMITS.longBreak.default,
  }))

  /** Whether the streak already counts today (unknown until syncToday has run). */
  const hasStudiedToday = computed(
    () => today.value !== null && profile.value?.lastStudyDate === today.value,
  )

  function syncToday() {
    today.value = localDate(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone)
  }

  return {
    profile,
    displayName,
    xp,
    coins,
    progress,
    level,
    streakDays,
    hasStudiedToday,
    timerMinutes,
    syncToday,
  }
})
