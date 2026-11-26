import type { AchievementDto } from '#shared/types/achievement'

/**
 * The badges on the pet page (#32): every badge with its title, icon and progress. A finished
 * focus session refreshes them (the 'achievements' key), and the unlock toast comes from
 * useRewardFeedback().celebrate(). Badges unlocked since the last visit are `isNew` (they pop in
 * once); leaving the page marks them as seen.
 */
export async function useAchievements() {
  const rewardFeedback = useRewardFeedback()

  // Loaded in the browser: the streak badge needs the student's own calendar day.
  const { data, pending } = await useFetch<AchievementDto[]>('/api/achievements', {
    key: 'achievements',
    server: false,
    query: {
      timeZone: import.meta.client ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    },
    default: () => [],
  })
  onScopeDispose(rewardFeedback.markBadgesSeen)

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
        isNew: rewardFeedback.newBadges.value.includes(badge.key),
      }
    }),
  )
  const unlockedCount = computed(() => badges.value.filter((badge) => badge.isUnlocked).length)

  return { badges, unlockedCount, pending }
}
