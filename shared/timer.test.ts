import { describe, expect, it } from 'vitest'
import {
  FOCUS_SESSIONS_PER_CYCLE,
  formatClock,
  initialTimerState,
  timerRemainingMs,
  timerTransition,
} from './timer'
import type { TimerEvent, TimerState } from './timer'

const durations = { focus: 25, short: 5, long: 15 }
const MIN = 60_000
const T0 = 1_000_000

const run = (state: TimerState, ...events: TimerEvent[]) =>
  events.reduce((current, event) => timerTransition(current, event, durations), state)

const idle = initialTimerState(durations)

describe('timerTransition', () => {
  it('starts idle on focus with 25 minutes on the clock', () => {
    expect(idle.phase).toBe('idle')
    expect(idle.mode).toBe('focus')
    expect(timerRemainingMs(idle, T0)).toBe(25 * MIN)
  })

  it('start → Focusing, ending 25 minutes later', () => {
    const state = run(idle, { type: 'start', now: T0 })
    expect(state.phase).toBe('focusing')
    expect(state.endsAt).toBe(T0 + 25 * MIN)
    expect(timerRemainingMs(state, T0 + 10 * MIN)).toBe(15 * MIN)
  })

  it('pause and resume keep the time that was left', () => {
    const paused = run(idle, { type: 'start', now: T0 }, { type: 'pause', now: T0 + 10 * MIN })
    expect(paused.phase).toBe('paused')
    expect(timerRemainingMs(paused, T0 + 99 * MIN)).toBe(15 * MIN)

    const resumed = run(paused, { type: 'resume', now: T0 + 30 * MIN })
    expect(resumed.phase).toBe('focusing')
    expect(resumed.endsAt).toBe(T0 + 45 * MIN)
  })

  it('quit from Focusing or Paused goes back to Idle on focus', () => {
    const focusing = run(idle, { type: 'start', now: T0 })
    expect(run(focusing, { type: 'quit' }).phase).toBe('idle')
    const paused = run(focusing, { type: 'pause', now: T0 + MIN })
    expect(run(paused, { type: 'quit' })).toMatchObject({ phase: 'idle', mode: 'focus' })
  })

  it('time up after focus → short break that starts when the focus session ended', () => {
    const state = run(idle, { type: 'start', now: T0 }, { type: 'timeUp' })
    expect(state).toMatchObject({ phase: 'shortBreak', mode: 'short', completedInCycle: 1 })
    expect(state.endsAt).toBe(T0 + 25 * MIN + 5 * MIN)
  })

  it(`the ${FOCUS_SESSIONS_PER_CYCLE}th focus session is followed by a long break, then the cycle resets`, () => {
    let state = idle
    for (let session = 1; session <= 3; session++) {
      state = run(state, { type: 'start', now: T0 }, { type: 'timeUp' }, { type: 'timeUp' })
      expect(state).toMatchObject({ phase: 'idle', completedInCycle: session })
    }
    state = run(state, { type: 'start', now: T0 }, { type: 'timeUp' })
    expect(state).toMatchObject({ phase: 'longBreak', completedInCycle: 4 })
    expect(state.durationMs).toBe(15 * MIN)

    state = run(state, { type: 'timeUp' })
    expect(state).toMatchObject({ phase: 'idle', mode: 'focus', completedInCycle: 0 })
  })

  it('skip ends a break; it does nothing during focus', () => {
    const onBreak = run(idle, { type: 'start', now: T0 }, { type: 'timeUp' })
    expect(run(onBreak, { type: 'skip' })).toMatchObject({ phase: 'idle', completedInCycle: 1 })
    const focusing = run(idle, { type: 'start', now: T0 })
    expect(run(focusing, { type: 'skip' })).toBe(focusing)
  })

  it('the mode tabs only work while idle', () => {
    const shortBreak = run(idle, { type: 'selectMode', mode: 'short' })
    expect(shortBreak).toMatchObject({ phase: 'idle', mode: 'short', durationMs: 5 * MIN })
    expect(run(shortBreak, { type: 'start', now: T0 }).phase).toBe('shortBreak')

    const focusing = run(idle, { type: 'start', now: T0 })
    expect(run(focusing, { type: 'selectMode', mode: 'long' })).toBe(focusing)
  })

  it('ignores events that do not fit the phase', () => {
    expect(run(idle, { type: 'pause', now: T0 })).toBe(idle)
    expect(run(idle, { type: 'resume', now: T0 })).toBe(idle)
    expect(run(idle, { type: 'quit' })).toBe(idle)
    expect(run(idle, { type: 'timeUp' })).toBe(idle)
  })
})

describe('formatClock', () => {
  it('shows minutes and seconds, rounding up', () => {
    expect(formatClock(25 * MIN)).toBe('25:00')
    expect(formatClock(25 * MIN - 1)).toBe('25:00')
    expect(formatClock(24 * MIN + 59_000)).toBe('24:59')
    expect(formatClock(999)).toBe('00:01')
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(-5)).toBe('00:00')
  })
})
