import { describe, expect, it } from 'vitest'
import { levelForXp, levelProgress, totalXpForLevel, xpForNextLevel } from './levels'

describe('level curve', () => {
  it('needs 100 × n XP to go from level n to n + 1', () => {
    expect(xpForNextLevel(1)).toBe(100)
    expect(xpForNextLevel(2)).toBe(200)
    expect(xpForNextLevel(5)).toBe(500)
  })

  it('adds up the steps to reach a level', () => {
    expect([1, 2, 3, 4, 5].map(totalXpForLevel)).toEqual([0, 100, 300, 600, 1000])
  })

  it('finds the level for a total amount of XP', () => {
    expect(levelForXp(0)).toBe(1)
    expect(levelForXp(99)).toBe(1)
    expect(levelForXp(100)).toBe(2)
    expect(levelForXp(299)).toBe(2)
    expect(levelForXp(300)).toBe(3)
    expect(levelForXp(1000)).toBe(5)
  })

  it('shows progress inside the current level', () => {
    expect(levelProgress(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 100 })
    expect(levelProgress(125)).toEqual({ level: 2, xpIntoLevel: 25, xpForNextLevel: 200 })
    expect(levelProgress(300)).toEqual({ level: 3, xpIntoLevel: 0, xpForNextLevel: 300 })
  })
})
