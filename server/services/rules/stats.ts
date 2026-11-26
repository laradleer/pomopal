import type { StatsDayDto } from '#shared/types/stats'

/** Days on the weekly chart, today included. */
export const STATS_WEEK_DAYS = 7

const MS_PER_DAY = 86_400_000

/** The `count` calendar days up to and including `today`, oldest first (all "YYYY-MM-DD"). */
export function lastDays(today: string, count: number): string[] {
  const [year = 0, month = 1, day = 1] = today.split('-').map(Number)
  const todayMs = Date.UTC(year, month - 1, day)
  return Array.from({ length: count }, (_, index) =>
    new Date(todayMs - (count - 1 - index) * MS_PER_DAY).toISOString().slice(0, 10),
  )
}

/** One entry for each of `dates`, in that order: 0 for days without study. Other rows are ignored. */
export function fillDays(dates: string[], rows: StatsDayDto[]): StatsDayDto[] {
  const byDate = new Map(rows.map((row) => [row.date, row]))
  return dates.map((date) => byDate.get(date) ?? { date, focusMinutes: 0, focusSessions: 0 })
}
