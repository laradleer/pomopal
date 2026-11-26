import { ACHIEVEMENT_KEYS } from '#shared/constants'
import type { AchievementKey } from '#shared/constants'

/** First Tomato: the first completed focus session. */
export const FIRST_TOMATO_SESSIONS = 1
/** 5-day streak: focus sessions on 5 days in a row. */
export const STREAK_BADGE_DAYS = 5
/** 10 sessions: ten completed focus sessions. */
export const SESSIONS_BADGE_COUNT = 10
/** Level 5. */
export const LEVEL_BADGE_LEVEL = 5

/** What the badges are measured against. */
export type AchievementStats = {
  /** Completed focus sessions, ever. */
  focusSessions: number
  /** The current streak. */
  streakDays: number
  level: number
}

export type AchievementProgress = { current: number; goal: number }

/** How far the user is towards each badge. `current` never goes past `goal`. */
export function achievementProgress(
  stats: AchievementStats,
): Record<AchievementKey, AchievementProgress> {
  const progress = (current: number, goal: number) => ({ current: Math.min(current, goal), goal })
  return {
    'first-tomato': progress(stats.focusSessions, FIRST_TOMATO_SESSIONS),
    'streak-5': progress(stats.streakDays, STREAK_BADGE_DAYS),
    'sessions-10': progress(stats.focusSessions, SESSIONS_BADGE_COUNT),
    'level-5': progress(stats.level, LEVEL_BADGE_LEVEL),
  }
}

/** Every badge the stats are good enough for, in the usual order (unlocked or not yet). */
export function earnedAchievements(stats: AchievementStats): AchievementKey[] {
  const progress = achievementProgress(stats)
  return ACHIEVEMENT_KEYS.filter((key) => progress[key].current >= progress[key].goal)
}
