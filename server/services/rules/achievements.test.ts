import { describe, expect, it } from 'vitest'
import { achievementProgress, earnedAchievements } from './achievements'

const newcomer = { focusSessions: 0, streakDays: 0, level: 1 }

describe('earnedAchievements', () => {
  it('gives nothing before the first focus session', () => {
    expect(earnedAchievements(newcomer)).toEqual([])
  })

  it('gives First Tomato for the first focus session', () => {
    expect(earnedAchievements({ focusSessions: 1, streakDays: 1, level: 1 })).toEqual([
      'first-tomato',
    ])
  })

  it('gives the streak badge at exactly 5 days in a row', () => {
    expect(earnedAchievements({ focusSessions: 4, streakDays: 4, level: 1 })).not.toContain(
      'streak-5',
    )
    expect(earnedAchievements({ focusSessions: 5, streakDays: 5, level: 1 })).toContain('streak-5')
  })

  it('gives the sessions badge at exactly 10 focus sessions', () => {
    expect(earnedAchievements({ focusSessions: 9, streakDays: 1, level: 1 })).not.toContain(
      'sessions-10',
    )
    expect(earnedAchievements({ focusSessions: 10, streakDays: 1, level: 1 })).toContain(
      'sessions-10',
    )
  })

  it('gives the level badge from level 5 on', () => {
    expect(earnedAchievements({ focusSessions: 1, streakDays: 1, level: 4 })).not.toContain(
      'level-5',
    )
    expect(earnedAchievements({ focusSessions: 1, streakDays: 1, level: 7 })).toContain('level-5')
  })

  it('lists several badges in the usual order', () => {
    expect(earnedAchievements({ focusSessions: 40, streakDays: 6, level: 5 })).toEqual([
      'first-tomato',
      'streak-5',
      'sessions-10',
      'level-5',
    ])
  })
})

describe('achievementProgress', () => {
  it('starts every badge at its lowest value', () => {
    expect(achievementProgress(newcomer)).toEqual({
      'first-tomato': { current: 0, goal: 1 },
      'streak-5': { current: 0, goal: 5 },
      'sessions-10': { current: 0, goal: 10 },
      'level-5': { current: 1, goal: 5 },
    })
  })

  it('stops counting at the goal', () => {
    const progress = achievementProgress({ focusSessions: 25, streakDays: 12, level: 9 })
    expect(progress['sessions-10']).toEqual({ current: 10, goal: 10 })
    expect(progress['streak-5']).toEqual({ current: 5, goal: 5 })
    expect(progress['level-5']).toEqual({ current: 5, goal: 5 })
  })
})
