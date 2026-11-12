/**
 * The level curve (docs/03-architecture.md → Game rules): going from level n to n + 1 needs
 * 100 × n XP. `profile.xp` is the total XP ever earned; the level follows from it.
 *
 *   Level 1 → 2: 100 XP · 2 → 3: 200 XP · 3 → 4: 300 XP …
 *   Total XP to reach level 2: 100 · level 3: 300 · level 4: 600 · level 5: 1000
 */

export const XP_PER_LEVEL_STEP = 100

/** XP needed to go from `level` to `level + 1`. */
export function xpForNextLevel(level: number): number {
  return XP_PER_LEVEL_STEP * level
}

/** Total XP needed to reach `level` (level 1 needs 0). */
export function totalXpForLevel(level: number): number {
  return (XP_PER_LEVEL_STEP * (level - 1) * level) / 2
}

/** The level a total amount of XP gives. */
export function levelForXp(totalXp: number): number {
  let level = 1
  while (totalXpForLevel(level + 1) <= totalXp) level++
  return level
}

/** Where the user stands inside their current level, for the XP bar. */
export function levelProgress(totalXp: number): {
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
} {
  const level = levelForXp(totalXp)
  return {
    level,
    xpIntoLevel: totalXp - totalXpForLevel(level),
    xpForNextLevel: xpForNextLevel(level),
  }
}
