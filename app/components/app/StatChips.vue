<script setup lang="ts">
/**
 * Streak → level → coins in the top bar. Each pops when its value changes. While earned coins fly
 * in, the coin chip counts up as they land (useRewardFeedback).
 */
const profile = useProfileStore()
const { heldCoins } = useRewardFeedback()

onMounted(() => profile.syncToday())
</script>

<template>
  <div class="flex items-center gap-1.5 sm:gap-2">
    <UiChip icon="flame" :value="profile.streakDays" label="day streak" tone="sun" />
    <UiChip icon="star" :value="profile.level" label="level" tone="grape" />
    <UiChip
      icon="coins"
      :value="heldCoins ?? profile.coins"
      label="coins"
      tone="sun"
      data-chip="coins"
    />
  </div>
</template>
