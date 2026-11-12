import type { SessionMode } from './constants'

/**
 * The Pomodoro timer as a pure state machine (docs/03-architecture.md → Timer states).
 * No clock, no Vue: the store passes `now` in, so every transition is easy to test.
 *
 *   Idle ─start─▶ Focusing ─pause─▶ Paused ─resume─▶ Focusing
 *   Focusing / Paused ─quit─▶ Idle (abandoned)
 *   Focusing ─time up─▶ ShortBreak, or LongBreak after the 4th focus session
 *   ShortBreak / LongBreak ─time up or skip─▶ Idle
 */

export type TimerPhase = 'idle' | 'focusing' | 'paused' | 'shortBreak' | 'longBreak'

/** Minutes per mode, from the user's settings. */
export type TimerDurations = Record<SessionMode, number>

export type TimerState = {
  phase: TimerPhase
  /** The mode chosen with the tabs; `start` begins a session of this mode. */
  mode: SessionMode
  /** Epoch ms when the running phase ends. `null` while idle or paused. */
  endsAt: number | null
  /** Time left while paused. */
  pausedRemainingMs: number | null
  /** Full length of the current (or next) phase, for the progress ring. */
  durationMs: number
  /** Focus sessions finished in this cycle. The 4th leads to a long break, then it resets. */
  completedInCycle: number
}

export type TimerEvent =
  | { type: 'selectMode'; mode: SessionMode }
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'quit' }
  | { type: 'timeUp' }
  | { type: 'skip' }

export const FOCUS_SESSIONS_PER_CYCLE = 4
const MS_PER_MINUTE = 60_000

const PHASE_OF_MODE: Record<SessionMode, TimerPhase> = {
  focus: 'focusing',
  short: 'shortBreak',
  long: 'longBreak',
}

const minutesToMs = (minutes: number) => minutes * MS_PER_MINUTE

export function isBreak(phase: TimerPhase): boolean {
  return phase === 'shortBreak' || phase === 'longBreak'
}

export function initialTimerState(durations: TimerDurations): TimerState {
  return idle('focus', durations, 0)
}

function idle(mode: SessionMode, durations: TimerDurations, completedInCycle: number): TimerState {
  return {
    phase: 'idle',
    mode,
    endsAt: null,
    pausedRemainingMs: null,
    durationMs: minutesToMs(durations[mode]),
    completedInCycle,
  }
}

function running(
  mode: SessionMode,
  startsAt: number,
  durations: TimerDurations,
  completedInCycle: number,
): TimerState {
  const durationMs = minutesToMs(durations[mode])
  return {
    phase: PHASE_OF_MODE[mode],
    mode,
    endsAt: startsAt + durationMs,
    pausedRemainingMs: null,
    durationMs,
    completedInCycle,
  }
}

/** The next state. Events that don't apply to the current phase leave it unchanged. */
export function timerTransition(
  state: TimerState,
  event: TimerEvent,
  durations: TimerDurations,
): TimerState {
  switch (event.type) {
    case 'selectMode':
      return state.phase === 'idle' ? idle(event.mode, durations, state.completedInCycle) : state

    case 'start':
      return state.phase === 'idle'
        ? running(state.mode, event.now, durations, state.completedInCycle)
        : state

    case 'pause':
      if (state.phase !== 'focusing' || state.endsAt === null) return state
      return {
        ...state,
        phase: 'paused',
        endsAt: null,
        pausedRemainingMs: Math.max(0, state.endsAt - event.now),
      }

    case 'resume':
      if (state.phase !== 'paused' || state.pausedRemainingMs === null) return state
      return {
        ...state,
        phase: 'focusing',
        endsAt: event.now + state.pausedRemainingMs,
        pausedRemainingMs: null,
      }

    case 'quit':
      return state.phase === 'focusing' || state.phase === 'paused'
        ? idle('focus', durations, state.completedInCycle)
        : state

    case 'timeUp': {
      if (state.endsAt === null) return state
      if (state.phase === 'focusing') {
        const completed = state.completedInCycle + 1
        const breakMode: SessionMode = completed >= FOCUS_SESSIONS_PER_CYCLE ? 'long' : 'short'
        // The break starts when the focus session really ended, even if the tab was asleep.
        return running(breakMode, state.endsAt, durations, completed)
      }
      return isBreak(state.phase) ? endBreak(state, durations) : state
    }

    case 'skip':
      return isBreak(state.phase) ? endBreak(state, durations) : state
  }
}

function endBreak(state: TimerState, durations: TimerDurations): TimerState {
  const completed = state.phase === 'longBreak' ? 0 : state.completedInCycle
  return idle('focus', durations, completed)
}

/** Milliseconds left on the clock at `now`. */
export function timerRemainingMs(state: TimerState, now: number): number {
  if (state.phase === 'idle') return state.durationMs
  if (state.phase === 'paused') return state.pausedRemainingMs ?? 0
  return Math.max(0, (state.endsAt ?? now) - now)
}

/** "24:59". Rounds up, so the clock shows 25:00 at the start and 00:00 only at the end. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
