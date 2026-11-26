import { and, asc, count, eq } from 'drizzle-orm'
import { ACHIEVEMENT_KEYS } from '#shared/constants'
import type { AchievementKey } from '#shared/constants'
import type { AchievementDto } from '#shared/types/achievement'
import type { DbOrTx } from '~~/server/db/client'
import { achievement, focusSession, profile } from '~~/server/db/schema'
import { achievementProgress, earnedAchievements } from '~~/server/services/rules/achievements'
import type { AchievementStats } from '~~/server/services/rules/achievements'

/** The numbers the badges are measured against, read from the user's profile and sessions. */
async function getAchievementStats(db: DbOrTx, userId: string): Promise<AchievementStats> {
  const [[sessions], current] = await Promise.all([
    db
      .select({ total: count() })
      .from(focusSession)
      .where(
        and(
          eq(focusSession.userId, userId),
          eq(focusSession.mode, 'focus'),
          eq(focusSession.status, 'completed'),
        ),
      ),
    db.query.profile.findFirst({
      where: eq(profile.userId, userId),
      columns: { streakDays: true, level: true },
    }),
  ])
  return {
    focusSessions: sessions?.total ?? 0,
    streakDays: current?.streakDays ?? 0,
    level: current?.level ?? 1,
  }
}

/**
 * Unlocks every badge the user has earned and doesn't have yet, and returns only the new ones.
 * One atomic insert that skips badges already owned, so two requests at once can't unlock a
 * badge twice. Call it inside the transaction that changed the stats, after the change.
 */
export async function unlockAchievements(
  tx: DbOrTx,
  userId: string,
  now: Date,
): Promise<AchievementKey[]> {
  const earned = earnedAchievements(await getAchievementStats(tx, userId))
  if (earned.length === 0) return []

  const inserted = await tx
    .insert(achievement)
    .values(earned.map((key) => ({ userId, key, unlockedAt: now })))
    .onConflictDoNothing()
    .returning({ key: achievement.key })
  const isNew = new Set(inserted.map((row) => row.key))
  return earned.filter((key) => isNew.has(key))
}

/** Every badge, unlocked or not, with how far the user is towards it. */
export async function listAchievements(userId: string): Promise<AchievementDto[]> {
  const db = useDb()
  const [stats, unlocked] = await Promise.all([
    getAchievementStats(db, userId),
    db
      .select({ key: achievement.key, unlockedAt: achievement.unlockedAt })
      .from(achievement)
      .where(eq(achievement.userId, userId))
      .orderBy(asc(achievement.unlockedAt)),
  ])
  const progress = achievementProgress(stats)
  const unlockedAt = new Map(unlocked.map((row) => [row.key, row.unlockedAt.toISOString()]))

  return ACHIEVEMENT_KEYS.map((key) => {
    const at = unlockedAt.get(key) ?? null
    // An unlocked badge stays full, even if the streak has broken since.
    const current = at ? progress[key].goal : progress[key].current
    return { key, unlockedAt: at, current, goal: progress[key].goal }
  })
}
