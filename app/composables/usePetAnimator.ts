import { enqueueAction } from '#shared/pet-animation'
import type { PetAction } from '#shared/pet-animation'

/**
 * The mascot's reactions (shared/pet-animation.ts). Anything can ask the pet to react; the live
 * <PetView> on screen plays the reactions one by one and calls `done()` after each.
 *
 *   usePetAnimator().send('celebrate')   // a focus session was completed
 *
 * Pages and stores only send reactions; they never animate the pet themselves. The pose comes
 * from the timer and the mood from the server, both read by <PetView live>.
 */
export function usePetAnimator() {
  const queue = useState<PetAction[]>('pet:actions', () => [])

  /** The reaction to play now, or null. */
  const action = computed(() => queue.value[0] ?? null)

  function send(next: PetAction) {
    queue.value = enqueueAction(queue.value, next)
  }

  /** The current reaction finished playing. */
  function done() {
    queue.value = queue.value.slice(1)
  }

  /** Forgets waiting reactions, e.g. ones sent while no pet was on screen. */
  function clear() {
    queue.value = []
  }

  return { action, send, done, clear }
}
