<script setup lang="ts">
/**
 * Streak → level → coins in the top bar (#77). Each pops when its value changes.
 * - The streak flame flickers, grows at 3 and 7 days, and turns grey with a hint while today's
 *   session is still missing (kind, never a warning).
 * - The level chip opens a small popover with the XP bar.
 * - While earned coins fly in, the coin chip counts up as they land (useRewardFeedback).
 */
const profile = useProfileStore()
const { heldCoins } = useRewardFeedback()

onMounted(() => profile.syncToday())

const isStreakWaiting = computed(() => profile.streakDays > 0 && !profile.hasStudiedToday)
const flameClass = computed(() => {
  if (profile.streakDays === 0 || isStreakWaiting.value) return undefined
  const size = profile.streakDays >= 7 ? 'scale-125' : profile.streakDays >= 3 ? 'scale-110' : ''
  return `${size} motion-safe:animate-flicker`
})
const streakLabel = computed(() =>
  isStreakWaiting.value
    ? `day streak. Study today to keep your ${profile.streakDays}-day streak`
    : 'day streak',
)
</script>

<template>
  <div class="flex items-center gap-1.5 sm:gap-2">
    <UiChip
      icon="flame"
      :value="profile.streakDays"
      :label="streakLabel"
      :tone="isStreakWaiting ? 'neutral' : 'sun'"
      :icon-class="flameClass"
      :title="
        isStreakWaiting ? `Study today to keep your ${profile.streakDays}-day streak` : undefined
      "
    />
    <button
      type="button"
      popovertarget="xp-popover"
      class="rounded-pill"
      :aria-label="`Level ${profile.level}: show XP`"
    >
      <UiChip icon="star" :value="profile.level" label="level" tone="grape" />
    </button>
    <UiChip
      icon="coins"
      :value="heldCoins ?? profile.coins"
      label="coins"
      tone="sun"
      data-chip="coins"
    />

    <div
      id="xp-popover"
      popover
      class="fixed inset-auto top-18 right-4 m-0 w-72 rounded-lg border border-border bg-surface p-4 text-ink shadow-float"
    >
      <UiProgressBar
        color="grape"
        :label="`Level ${profile.level}`"
        :value="profile.progress.xpIntoLevel"
        :max="profile.progress.xpForNextLevel"
        :value-text="`${profile.progress.xpIntoLevel} / ${profile.progress.xpForNextLevel} XP`"
      />
      <p class="mt-2 text-body-sm text-ink-muted">
        {{ profile.progress.xpForNextLevel - profile.progress.xpIntoLevel }} XP to level
        {{ profile.level + 1 }}. Every focus minute is 1 XP.
      </p>
    </div>
  </div>
</template>
