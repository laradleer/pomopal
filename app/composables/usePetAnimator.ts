import { enqueueAction } from '#shared/pet-animation'
import type { PetAction } from '#shared/pet-animation'

/**
 * The mascot's reactions and what it says (shared/pet-animation.ts). Anything can ask the pet to
 * react; the live <PetView> on screen plays the reactions one by one and calls `done()` after each.
 *
 *   usePetAnimator().send('celebrate')          // a focus session was completed
 *   usePetAnimator().say('Hehe, that tickles!') // shown in the bubble for a few seconds
 *
 * Pages and stores only send reactions; they never animate the pet themselves. The pose comes
 * from the timer and the mood from the server, both read by <PetView live>. `isAsleep` is set by
 * the live pet after a minute without input (#76); usePetMood shows it.
 */
const SAY_MS = 4000

export function usePetAnimator() {
  const queue = useState<PetAction[]>('pet:actions', () => [])
  const spoken = useState<string | null>('pet:spoken', () => null)
  const isAsleep = useState('pet:asleep', () => false)

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

  let sayTimer: ReturnType<typeof setTimeout> | undefined
  /** Puts a line in the pet's bubble for a few seconds, instead of its usual line. */
  function say(line: string, ms = SAY_MS) {
    spoken.value = line
    clearTimeout(sayTimer)
    sayTimer = setTimeout(() => (spoken.value = null), ms)
  }

  function setAsleep(value: boolean) {
    isAsleep.value = value
  }

  return {
    action,
    spoken: readonly(spoken),
    isAsleep: readonly(isAsleep),
    send,
    done,
    clear,
    say,
    setAsleep,
  }
}
