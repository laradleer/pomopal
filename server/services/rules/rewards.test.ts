import { describe, expect, it } from 'vitest'
import { applyRewards, sessionRewards } from './rewards'

const fresh = { xp: 0, level: 1, coins: 0 }

describe('sessionRewards', () => {
  it('gives 1 XP per planned minute and 10 coins for a focus session', () => {
    expect(sessionRewards('focus', 25)).toEqual({ xp: 25, coins: 10 })
    expect(sessionRewards('focus', 50)).toEqual({ xp: 50, coins: 10 })
  })

  it('gives nothing for breaks', () => {
    expect(sessionRewards('short', 5)).toEqual({ xp: 0, coins: 0 })
    expect(sessionRewards('long', 15)).toEqual({ xp: 0, coins: 0 })
  })
})

describe('applyRewards', () => {
  it('adds XP and coins without a level-up', () => {
    expect(applyRewards(fresh, 'focus', 25)).toEqual({
      progress: { xp: 25, level: 1, coins: 10 },
      earned: { xp: 25, coins: 10 },
      levelsGained: 0,
    })
  })

  it('levels up at exactly 100 XP and adds the 50-coin bonus', () => {
    const result = applyRewards({ xp: 75, level: 1, coins: 30 }, 'focus', 25)
    expect(result.progress).toEqual({ xp: 100, level: 2, coins: 30 + 10 + 50 })
    expect(result.earned).toEqual({ xp: 25, coins: 60 })
    expect(result.levelsGained).toBe(1)
  })

  it('handles several level-ups at once', () => {
    // 290 + 60 = 350 XP: level 1 → 3 (300 XP), two bonuses.
    const result = applyRewards({ xp: 290, level: 1, coins: 0 }, 'focus', 60)
    expect(result.progress.level).toBe(3)
    expect(result.levelsGained).toBe(2)
    expect(result.earned.coins).toBe(10 + 2 * 50)
  })

  it('leaves the profile as it is for a break', () => {
    const current = { xp: 120, level: 2, coins: 40 }
    expect(applyRewards(current, 'short', 5)).toEqual({
      progress: current,
      earned: { xp: 0, coins: 0 },
      levelsGained: 0,
    })
  })

  it('never lowers a level', () => {
    const result = applyRewards({ xp: 50, level: 3, coins: 0 }, 'focus', 25)
    expect(result.progress.level).toBe(3)
    expect(result.levelsGained).toBe(0)
  })
})
