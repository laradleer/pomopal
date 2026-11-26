import type { AchievementDto } from '#shared/types/achievement'

/**
 * The badges on the pet page (#32): every badge with its title, icon and progress. A finished
 * focus session refreshes them (the 'achievements' key), and the unlock toast comes from
 * useRewardFeedback().celebrate().
 */
export async function useAchievements() {
  const { data, pending } = await useFetch<AchievementDto[]>('/api/achievements', {
    key: 'achievements',
    default: () => [],
  })

  const badges = computed(() =>
    data.value.map((badge) => {
      const info = ACHIEVEMENT_INFO[badge.key]
      return {
        ...badge,
        title: info.title,
        icon: info.icon,
        description: info.describe(badge.goal),
        progressText: info.progress(badge.current, badge.goal),
        isUnlocked: badge.unlockedAt !== null,
      }
    }),
  )
  const unlockedCount = computed(() => badges.value.filter((badge) => badge.isUnlocked).length)

  return { badges, unlockedCount, pending }
}
