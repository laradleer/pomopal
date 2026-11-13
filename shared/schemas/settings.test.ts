import { describe, expect, it } from 'vitest'
import { timerSettingsSchema } from './settings'

const valid = { focusMin: 25, shortBreakMin: 5, longBreakMin: 15 }
const firstMessage = (input: unknown) =>
  timerSettingsSchema.safeParse(input).error?.issues[0]?.message

describe('timerSettingsSchema', () => {
  it('accepts the defaults and both ends of every range', () => {
    expect(timerSettingsSchema.parse(valid)).toEqual(valid)
    expect(
      timerSettingsSchema.safeParse({ focusMin: 15, shortBreakMin: 3, longBreakMin: 10 }).success,
    ).toBe(true)
    expect(
      timerSettingsSchema.safeParse({ focusMin: 60, shortBreakMin: 15, longBreakMin: 30 }).success,
    ).toBe(true)
  })

  it('names the range when a length is outside it', () => {
    expect(firstMessage({ ...valid, focusMin: 61 })).toBe('Focus can be 15 to 60 minutes.')
    expect(firstMessage({ ...valid, shortBreakMin: 2 })).toBe(
      'A short break can be 3 to 15 minutes.',
    )
    expect(firstMessage({ ...valid, longBreakMin: 31 })).toBe(
      'A long break can be 10 to 30 minutes.',
    )
  })

  it('wants whole minutes as numbers', () => {
    expect(firstMessage({ ...valid, focusMin: 25.5 })).toBe('Use whole minutes.')
    expect(firstMessage({ ...valid, focusMin: '25' })).toBe('Focus can be 15 to 60 minutes.')
  })
})
