import type { PetMood } from '#shared/constants'

/**
 * The pet's mood right now, and what it says.
 *   during a break      → sleepy
 *   focusing or paused  → neutral (concentrating)
 *   otherwise           → the mood saved on the server: happy after a completed session,
 *                         sad after quitting one, neutral before the first one
 */
export function usePetMood() {
  const pet = usePetStore()
  const timer = useTimerStore()

  const mood = computed<PetMood>(() => {
    if (timer.phase === 'shortBreak' || timer.phase === 'longBreak') return 'sleepy'
    if (timer.phase === 'focusing' || timer.phase === 'paused') return 'neutral'
    return pet.mood
  })

  const line = computed(() => petLine(timer.phase, mood.value))

  return { mood, line }
}
