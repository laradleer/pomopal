import { and, eq, gte, sql } from 'drizzle-orm'
import { localDate } from '#shared/streak'
import type { StatsDto } from '#shared/types/stats'
import { focusSession } from '~~/server/db/schema'
import { fillDays, lastDays, STATS_WEEK_DAYS } from '~~/server/services/rules/stats'

const MS_PER_DAY = 86_400_000

/**
 * Focus minutes and sessions for each of the last 7 days (the calendar days in `timeZone`), like
 * the daily goal: completed focus sessions count on the day they ended. A session's minutes are
 * its planned length, since it can only complete once that time has really passed.
 */
export async function getWeekStats(userId: string, now: Date, timeZone: string): Promise<StatsDto> {
  const dates = lastDays(localDate(now, timeZone), STATS_WEEK_DAYS)
  const day = sql`(${focusSession.endedAt} at time zone ${timeZone})::date`

  const rows = await useDb()
    .select({
      date: sql<string>`to_char(${day}, 'YYYY-MM-DD')`,
      focusMinutes: sql<number>`sum(${focusSession.plannedMin})::int`,
      focusSessions: sql<number>`count(*)::int`,
    })
    .from(focusSession)
    .where(
      and(
        eq(focusSession.userId, userId),
        eq(focusSession.mode, 'focus'),
        eq(focusSession.status, 'completed'),
        // Lets Postgres use the (user, started_at) index. The week began less than 7 days ago; the
        // extra day covers a session that started the evening before, and daylight saving.
        gte(focusSession.startedAt, new Date(now.getTime() - (STATS_WEEK_DAYS + 1) * MS_PER_DAY)),
        sql`${day} >= ${dates[0]}::date`,
      ),
    )
    // By the first column: the time zone is a query parameter, so Postgres can't match a
    // repeated `day` expression in GROUP BY to the one in SELECT.
    .groupBy(sql`1`)

  return { range: 'week', days: fillDays(dates, rows) }
}
