import type { SessionMode } from '#shared/constants'
import { levelForXp } from '#shared/levels'

/** +1 XP per planned focus minute (a 25-minute session gives 25 XP). */
export const XP_PER_FOCUS_MINUTE = 1
/** +10 coins per completed focus session. */
export const COINS_PER_FOCUS_SESSION = 10
/** +50 coins for every level gained. */
export const COINS_PER_LEVEL_UP = 50

export type Progress = { xp: number; level: number; coins: number }

export type RewardResult = {
  /** The profile after the rewards. */
  progress: Progress
  /** What this session earned, level-up bonus included. */
  earned: { xp: number; coins: number }
  levelsGained: number
}

/** What a completed session earns before any level-up bonus. Breaks earn nothing. */
export function sessionRewards(
  mode: SessionMode,
  plannedMin: number,
): { xp: number; coins: number } {
  if (mode !== 'focus') return { xp: 0, coins: 0 }
  return { xp: plannedMin * XP_PER_FOCUS_MINUTE, coins: COINS_PER_FOCUS_SESSION }
}

/**
 * Adds a session's rewards to the profile. The level follows from the total XP, so several
 * level-ups at once work, and each one adds the bonus coins.
 */
export function applyRewards(
  current: Progress,
  mode: SessionMode,
  plannedMin: number,
): RewardResult {
  const base = sessionRewards(mode, plannedMin)
  const xp = current.xp + base.xp
  const level = Math.max(current.level, levelForXp(xp))
  const levelsGained = level - current.level
  const coinsEarned = base.coins + levelsGained * COINS_PER_LEVEL_UP

  return {
    progress: { xp, level, coins: current.coins + coinsEarned },
    earned: { xp: base.xp, coins: coinsEarned },
    levelsGained,
  }
}
