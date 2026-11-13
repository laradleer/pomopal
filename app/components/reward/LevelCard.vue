<script setup lang="ts">
/**
 * Level and XP bar on the home page. When XP comes in, the bar fills (400ms) and the number counts
 * up. On a level-up the bar first fills to the end and pulses, then starts the new level.
 */
const profile = useProfileStore()
const motion = useMotion()

const shownXp = useCountUp(() => profile.progress.xpIntoLevel)
const xpLeft = computed(() => profile.progress.xpForNextLevel - profile.progress.xpIntoLevel)

const LEVEL_FINISH_MS = 900
const isFinishingLevel = ref(false)
let finishTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => profile.level,
  (level, previous) => {
    if (level <= previous || motion.isReduced.value) return
    isFinishingLevel.value = true
    clearTimeout(finishTimer)
    finishTimer = setTimeout(() => (isFinishingLevel.value = false), LEVEL_FINISH_MS)
  },
)
onBeforeUnmount(() => clearTimeout(finishTimer))
</script>

<template>
  <UiCard tone="level" class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-heading">
        Level
        <span :key="profile.level" class="inline-block motion-safe:animate-pop">
          {{ profile.level }}
        </span>
      </h2>
      <span class="text-label text-grape">{{ xpLeft }} XP to go</span>
    </div>
    <UiProgressBar
      color="grape"
      :class="isFinishingLevel && 'motion-safe:animate-pulse'"
      :label="`Progress to level ${profile.level + 1}`"
      :value="isFinishingLevel ? 1 : shownXp"
      :max="isFinishingLevel ? 1 : profile.progress.xpForNextLevel"
      :value-text="
        isFinishingLevel ? 'Level up!' : `${shownXp} / ${profile.progress.xpForNextLevel} XP`
      "
    />
  </UiCard>
</template>
