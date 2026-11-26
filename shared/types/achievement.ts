import type { AchievementKey } from '../constants'

/** A badge in GET /api/achievements, with how far the user is towards it. */
export type AchievementDto = {
  key: AchievementKey
  /** ISO date, or `null` while the badge is still locked. */
  unlockedAt: string | null
  /** Progress towards `goal` (never more than `goal`). */
  current: number
  goal: number
}
