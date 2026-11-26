import type { StatsRange } from '../constants'

/** One calendar day on the stats page. */
export type StatsDayDto = {
  /** "YYYY-MM-DD" in the student's time zone. */
  date: string
  /** Planned minutes of the focus sessions completed that day. */
  focusMinutes: number
  /** Focus sessions completed that day. */
  focusSessions: number
}

/** GET /api/stats: one entry per day, oldest first and today last. Days without study are 0. */
export type StatsDto = {
  range: StatsRange
  days: StatsDayDto[]
}
