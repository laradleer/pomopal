import { and, eq, sql } from 'drizzle-orm'
import { DAILY_GOAL_SESSIONS } from '#shared/constants'
import { localDate } from '#shared/streak'
import type { TodayDto } from '#shared/types/today'
import { focusSession } from '~~/server/db/schema'

/** Completed focus sessions that ended today (the calendar day in `timeZone`). */
export async function getToday(userId: string, now: Date, timeZone: string): Promise<TodayDto> {
  const today = localDate(now, timeZone)
  const [row] = await useDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(focusSession)
    .where(
      and(
        eq(focusSession.userId, userId),
        eq(focusSession.mode, 'focus'),
        eq(focusSession.status, 'completed'),
        sql`(${focusSession.endedAt} at time zone ${timeZone})::date = ${today}::date`,
      ),
    )
  return { focusSessions: row?.count ?? 0, goal: DAILY_GOAL_SESSIONS }
}
