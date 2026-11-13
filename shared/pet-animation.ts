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
export type PetAction = 'celebrate' | 'sad'

/** At most this many reactions wait; older ones are dropped, so the pet never lags behind. */
export const PET_ACTION_QUEUE_MAX = 2

export function poseForPhase(phase: TimerPhase): PetPose {
  if (phase === 'focusing' || phase === 'paused') return 'focusing'
  if (phase === 'shortBreak' || phase === 'longBreak') return 'resting'
  return 'idle'
}

/** Adds a reaction to the queue. The same reaction twice in a row plays once. */
export function enqueueAction(queue: readonly PetAction[], action: PetAction): PetAction[] {
  if (queue.at(-1) === action) return [...queue]
  return [...queue, action].slice(-PET_ACTION_QUEUE_MAX)
}
