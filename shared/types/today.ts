/** GET /api/today: the student's progress on today's goal. */
export type TodayDto = {
  /** Completed focus sessions today, in the student's time zone. */
  focusSessions: number
  /** How many focus sessions make the daily goal (DAILY_GOAL_SESSIONS). */
  goal: number
}
