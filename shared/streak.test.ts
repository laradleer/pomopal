import { describe, expect, it } from 'vitest'
import { daysBetween, isValidTimeZone, localDate, nextStreak, visibleStreak } from './streak'

describe('nextStreak', () => {
  it('starts at 1 on the first study day', () => {
    expect(nextStreak({ streakDays: 0, lastStudyDate: null }, '2026-11-13')).toEqual({
      streakDays: 1,
      lastStudyDate: '2026-11-13',
    })
  })

  it('adds 1 on the next day', () => {
    expect(nextStreak({ streakDays: 4, lastStudyDate: '2026-11-12' }, '2026-11-13')).toEqual({
      streakDays: 5,
      lastStudyDate: '2026-11-13',
    })
  })

  it('does not change for more sessions on the same day', () => {
    const current = { streakDays: 4, lastStudyDate: '2026-11-13' }
    expect(nextStreak(current, '2026-11-13')).toEqual(current)
  })

  it('resets to 1 after a skipped day', () => {
    expect(nextStreak({ streakDays: 9, lastStudyDate: '2026-11-10' }, '2026-11-13')).toEqual({
      streakDays: 1,
      lastStudyDate: '2026-11-13',
    })
  })

  it('counts across month and year ends', () => {
    expect(
      nextStreak({ streakDays: 2, lastStudyDate: '2026-11-30' }, '2026-12-01').streakDays,
    ).toBe(3)
    expect(
      nextStreak({ streakDays: 2, lastStudyDate: '2026-12-31' }, '2027-01-01').streakDays,
    ).toBe(3)
  })

  it('ignores a "today" before the last study day (time-zone change)', () => {
    const current = { streakDays: 3, lastStudyDate: '2026-11-13' }
    expect(nextStreak(current, '2026-11-12')).toEqual(current)
  })
})

describe('visibleStreak', () => {
  it('shows the streak on the study day and the day after', () => {
    const streak = { streakDays: 5, lastStudyDate: '2026-11-12' }
    expect(visibleStreak(streak, '2026-11-12')).toBe(5)
    expect(visibleStreak(streak, '2026-11-13')).toBe(5)
  })

  it('shows 0 once a whole day was skipped, or before any study', () => {
    expect(visibleStreak({ streakDays: 5, lastStudyDate: '2026-11-11' }, '2026-11-13')).toBe(0)
    expect(visibleStreak({ streakDays: 0, lastStudyDate: null }, '2026-11-13')).toBe(0)
  })
})

describe('localDate', () => {
  it("uses the user's time zone for the calendar day", () => {
    const lateEvening = new Date('2026-11-12T21:30:00Z')
    expect(localDate(lateEvening, 'UTC')).toBe('2026-11-12')
    expect(localDate(lateEvening, 'Europe/Istanbul')).toBe('2026-11-13') // UTC+3
    expect(localDate(lateEvening, 'America/New_York')).toBe('2026-11-12')
  })
})

describe('helpers', () => {
  it('counts calendar days', () => {
    expect(daysBetween('2026-11-12', '2026-11-13')).toBe(1)
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2) // across a DST change
  })

  it('recognises IANA time zones', () => {
    expect(isValidTimeZone('Europe/Istanbul')).toBe(true)
    expect(isValidTimeZone('UTC')).toBe(true)
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false)
  })
})
