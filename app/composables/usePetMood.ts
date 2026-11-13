import type { PetMood } from '#shared/constants'

/**
 * The pet's mood right now, and what it says.
 *   asleep (#76)        → sleepy, until the student interacts again
 *   during a break      → sleepy
 *   focusing or paused  → neutral (concentrating)
 *   otherwise           → the mood saved on the server: happy after a completed session,
 *                         sad after quitting one, neutral before the first one
 */
export function usePetMood() {
  const pet = usePetStore()
  const timer = useTimerStore()
  const animator = usePetAnimator()

  const mood = computed<PetMood>(() => {
    if (animator.isAsleep.value) return 'sleepy'
    if (timer.phase === 'shortBreak' || timer.phase === 'longBreak') return 'sleepy'
    if (timer.phase === 'focusing' || timer.phase === 'paused') return 'neutral'
    return pet.mood
  })

  // A reaction line (after a tap, a stroke …) wins for a few seconds.
  const line = computed(() => {
    if (animator.spoken.value) return animator.spoken.value
    if (animator.isAsleep.value) return SLEEPING_LINE
    return petLine(timer.phase, mood.value)
  })

  return { mood, line }
}
