/**
 * Study streak (docs/03-architecture.md → Game rules): +1 on the first completed focus session of
 * a new day, back to 1 if a day was skipped. Days are calendar dates ("YYYY-MM-DD") in the
 * user's own time zone, so studying at 23:30 and 00:10 counts as two days.
 */

export type Streak = {
  streakDays: number
  /** The last day with a completed focus session, or null if there was none yet. */
  lastStudyDate: string | null
}

const MS_PER_DAY = 86_400_000

/** "YYYY-MM-DD" for `at` in an IANA time zone such as "Europe/Istanbul". */
export function localDate(at: Date, timeZone: string): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at)
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

/** Whole calendar days from `from` to `to` (both "YYYY-MM-DD"). */
export function daysBetween(from: string, to: string): number {
  const toDayNumber = (date: string) => {
    const [year = 0, month = 1, day = 1] = date.split('-').map(Number)
    return Date.UTC(year, month - 1, day) / MS_PER_DAY
  }
  return toDayNumber(to) - toDayNumber(from)
}

/** The streak after completing a focus session on `today`. */
export function nextStreak(current: Streak, today: string): Streak {
  if (current.lastStudyDate === null) return { streakDays: 1, lastStudyDate: today }

  const gap = daysBetween(current.lastStudyDate, today)
  // Same day, or a time-zone change moved "today" back: nothing changes.
  if (gap <= 0) return current
  if (gap === 1) return { streakDays: current.streakDays + 1, lastStudyDate: today }
  return { streakDays: 1, lastStudyDate: today }
}

/**
 * The streak to show on `today`. It still counts until the end of the day after the last study
 * day, then it is broken (0) until the next completed session starts a new one.
 */
export function visibleStreak(current: Streak, today: string): number {
  if (current.lastStudyDate === null) return 0
  return daysBetween(current.lastStudyDate, today) <= 1 ? current.streakDays : 0
}
