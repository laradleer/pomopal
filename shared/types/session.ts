import type { AchievementKey, SessionMode, SessionStatus } from '../constants'

/** A focus session or break as the API returns it. Dates are ISO strings. */
export type FocusSessionDto = {
  id: number
  mode: SessionMode
  plannedMin: number
  taskId: number | null
  startedAt: string
  endedAt: string | null
  status: SessionStatus
  xpEarned: number
  coinsEarned: number
}

/** What a completed session earned. */
export type SessionRewards = {
  xp: number
  coins: number
  levelUp: boolean
  newLevel: number
  /** Badges this session unlocked (usually none). */
  achievements: AchievementKey[]
}

/** POST /api/sessions/:id/complete */
export type CompleteSessionResult = {
  session: FocusSessionDto
  rewards: SessionRewards
}
