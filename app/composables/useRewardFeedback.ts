import type { SessionRewards } from '#shared/types/session'

/**
 * Turns a session's rewards into feedback: the reward toast ("+10 coins · +25 XP") and, on a
 * level-up, the full-screen celebration shown by <RewardLevelUp> in the default layout.
 */
export function useRewardFeedback() {
  const toast = useToast()
  /** The new level while the celebration is open, else null. */
  const levelUp = useState<number | null>('reward:levelUp', () => null)

  function celebrate(rewards: SessionRewards) {
    if (rewards.xp > 0 || rewards.coins > 0) {
      toast.show(`+${rewards.coins} coins · +${rewards.xp} XP`, { tone: 'reward' })
    }
    if (rewards.levelUp) levelUp.value = rewards.newLevel
  }

  function dismissLevelUp() {
    levelUp.value = null
  }

  return { levelUp: readonly(levelUp), celebrate, dismissLevelUp }
}
