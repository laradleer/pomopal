import { describe, expect, it } from 'vitest'
import { fillDays, lastDays, STATS_WEEK_DAYS } from './stats'

describe('lastDays', () => {
  it('lists the week up to today, oldest first', () => {
    expect(lastDays('2026-11-26', STATS_WEEK_DAYS)).toEqual([
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
      '2026-11-26',
    ])
  })

  it('crosses month, year and leap-day boundaries', () => {
    expect(lastDays('2027-01-02', 3)).toEqual(['2026-12-31', '2027-01-01', '2027-01-02'])
    expect(lastDays('2028-03-01', 2)).toEqual(['2028-02-29', '2028-03-01'])
  })

  it('ignores daylight saving changes (calendar days, not 24-hour steps in a zone)', () => {
    expect(lastDays('2026-10-26', 2)).toEqual(['2026-10-25', '2026-10-26'])
  })
})

describe('fillDays', () => {
  const dates = ['2026-11-24', '2026-11-25', '2026-11-26']

  it('gives 0 for days without study', () => {
    expect(fillDays(dates, [])).toEqual([
      { date: '2026-11-24', focusMinutes: 0, focusSessions: 0 },
      { date: '2026-11-25', focusMinutes: 0, focusSessions: 0 },
      { date: '2026-11-26', focusMinutes: 0, focusSessions: 0 },
    ])
  })

  it('keeps the order of the dates and drops rows outside them', () => {
    const rows = [
      { date: '2026-11-26', focusMinutes: 50, focusSessions: 2 },
      { date: '2026-11-20', focusMinutes: 25, focusSessions: 1 },
      { date: '2026-11-24', focusMinutes: 25, focusSessions: 1 },
    ]
    expect(fillDays(dates, rows)).toEqual([
      { date: '2026-11-24', focusMinutes: 25, focusSessions: 1 },
      { date: '2026-11-25', focusMinutes: 0, focusSessions: 0 },
      { date: '2026-11-26', focusMinutes: 50, focusSessions: 2 },
    ])
  })
})
