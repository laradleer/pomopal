<script setup lang="ts">
/** Level and XP bar on the home page. The bar fills over 400ms when XP comes in. */
const profile = useProfileStore()

const xpLeft = computed(() => profile.progress.xpForNextLevel - profile.progress.xpIntoLevel)
</script>

<template>
  <UiCard tone="level" class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-heading">Level {{ profile.level }}</h2>
      <span class="text-label text-grape">{{ xpLeft }} XP to go</span>
    </div>
    <UiProgressBar
      color="grape"
      :label="`Progress to level ${profile.level + 1}`"
      :value="profile.progress.xpIntoLevel"
      :max="profile.progress.xpForNextLevel"
      :value-text="`${profile.progress.xpIntoLevel} / ${profile.progress.xpForNextLevel} XP`"
    />
  </UiCard>
</template>
