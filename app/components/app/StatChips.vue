<script setup lang="ts">
/** Streak → level → coins in the top bar. Each pops when its value changes. */
const profile = useProfileStore()

onMounted(() => profile.syncToday())
</script>

<template>
  <div class="flex items-center gap-1.5 sm:gap-2">
    <UiChip icon="flame" :value="profile.streakDays" label="day streak" tone="sun" />
    <UiChip icon="star" :value="profile.level" label="level" tone="grape" />
    <UiChip icon="coins" :value="profile.coins" label="coins" tone="sun" />
  </div>
</template>
