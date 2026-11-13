import type { TimerPhase } from './timer'

/**
 * The mascot's animation state machine (epic #69), as pure functions so it can be tested.
 *
 *   pose     the long-lasting state, from the timer: idle, focusing (reading quietly), resting
 *   actions  one-shot reactions that play once and return to the pose, in order
 *
 * The mood (happy, sad …) comes from the server and changes how the pose looks.
 */
export type PetPose = 'idle' | 'focusing' | 'resting'
export type PetAction = 'celebrate' | 'sad' | 'giggle' | 'dizzy' | 'wake'

/** At most this many reactions wait; older ones are dropped, so the pet never lags behind. */
export const PET_ACTION_QUEUE_MAX = 2

export function poseForPhase(phase: TimerPhase): PetPose {
  if (phase === 'focusing' || phase === 'paused') return 'focusing'
  if (phase === 'shortBreak' || phase === 'longBreak') return 'resting'
  return 'idle'
}

/** Taps this close together (ms) make the pet dizzy … */
export const POKE_WINDOW_MS = 2000
/** … once there are this many of them. */
export const POKES_FOR_DIZZY = 5
/** After this long without any input on the page, the pet falls asleep. */
export const FALL_ASLEEP_AFTER_MS = 60_000

/** Whether the taps (times in ms) are a poke frenzy: enough of them within the window. */
export function isPokeFrenzy(taps: readonly number[], now: number): boolean {
  return taps.filter((at) => now - at <= POKE_WINDOW_MS).length >= POKES_FOR_DIZZY
}

/** Adds a reaction to the queue. The same reaction twice in a row plays once. */
export function enqueueAction(queue: readonly PetAction[], action: PetAction): PetAction[] {
  if (queue.at(-1) === action) return [...queue]
  return [...queue, action].slice(-PET_ACTION_QUEUE_MAX)
}
