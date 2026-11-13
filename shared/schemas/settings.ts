import { z } from 'zod'
import { TIMER_LIMITS } from '../constants'

/** Whole minutes inside one of the TIMER_LIMITS ranges, with a friendly message. */
function minutes(limits: { min: number; max: number }, name: string) {
  const range = `${name} can be ${limits.min} to ${limits.max} minutes.`
  return z
    .number({ error: range })
    .int({ error: 'Use whole minutes.' })
    .min(limits.min, { error: range })
    .max(limits.max, { error: range })
}

/** PATCH /api/settings: the timer lengths, saved on the profile. */
export const timerSettingsSchema = z.object({
  focusMin: minutes(TIMER_LIMITS.focus, 'Focus'),
  shortBreakMin: minutes(TIMER_LIMITS.shortBreak, 'A short break'),
  longBreakMin: minutes(TIMER_LIMITS.longBreak, 'A long break'),
})

export type TimerSettings = z.infer<typeof timerSettingsSchema>
