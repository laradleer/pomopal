import { DAILY_GOAL_SESSIONS } from '#shared/constants'
import type { TodayDto } from '#shared/types/today'

/**
 * Today's goal: DAILY_GOAL_SESSIONS completed focus sessions (#77). The count comes from the
 * server for the student's own calendar day, so it survives a reload. It is loaded in the browser
 * only (the server can't know the time zone) and refreshed by the timer after each session.
 * Reaching the goal is celebrated once: the pet jumps and says so, and a toast appears.
 */
export function useDailyGoal() {
  const toast = useToast()
  const petAnimator = usePetAnimator()
  const pet = usePetStore()

  const { data: today } = useFetch<TodayDto>('/api/today', {
    key: 'today',
    server: false,
    query: {
      timeZone: import.meta.client ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    },
    default: () => ({ focusSessions: 0, goal: DAILY_GOAL_SESSIONS }),
  })

  const done = computed(() => Math.min(today.value.focusSessions, today.value.goal))
  const isReached = computed(() => today.value.focusSessions >= today.value.goal)

  // The first value is the page loading, not progress: only later changes can be celebrated.
  let isLoaded = false
  watch(today, (next, previous) => {
    const wasReached = previous.focusSessions >= previous.goal
    if (isLoaded && !wasReached && next.focusSessions >= next.goal) {
      petAnimator.send('celebrate')
      petAnimator.say(`All ${next.goal} sessions done today! ${pet.name} is so proud of you.`)
      toast.show('Daily goal reached!', { tone: 'success', icon: 'trophy' })
    }
    isLoaded = true
  })

  return { done, goal: computed(() => today.value.goal), isReached }
}
