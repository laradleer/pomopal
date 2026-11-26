import type { AchievementKey } from '#shared/constants'

type AchievementInfo = {
  title: string
  /** Lucide icon name. */
  icon: string
  /** What it takes, with the goal from the server. */
  describe: (goal: number) => string
  /** The progress while locked, e.g. "3 / 5 days". */
  progress: (current: number, goal: number) => string
}

/** How each badge looks and reads. The goals come from the server (GET /api/achievements). */
export const ACHIEVEMENT_INFO: Record<AchievementKey, AchievementInfo> = {
  'first-tomato': {
    title: 'First Tomato',
    icon: 'sprout',
    describe: () => 'Finish your first focus session.',
    progress: (current, goal) => `${current} / ${goal} session`,
  },
  'streak-5': {
    title: 'On Fire',
    icon: 'flame',
    describe: (goal) => `Study ${goal} days in a row.`,
    progress: (current, goal) => `${current} / ${goal} days`,
  },
  'sessions-10': {
    title: 'Ten Tomatoes',
    icon: 'trophy',
    describe: (goal) => `Finish ${goal} focus sessions.`,
    progress: (current, goal) => `${current} / ${goal} sessions`,
  },
  'level-5': {
    title: 'Rising Star',
    icon: 'star',
    describe: (goal) => `Reach level ${goal}.`,
    progress: (current, goal) => `Level ${current} of ${goal}`,
  },
}
