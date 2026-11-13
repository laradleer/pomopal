<script setup lang="ts">
/** Today's goal on home: one dot per focus session, each pops when it fills. */
const { done, goal, isReached } = useDailyGoal()
</script>

<template>
  <UiCard :tone="isReached ? 'break' : 'plain'" class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-heading">Today's goal</h2>
      <UiIcon v-if="isReached" name="trophy" :size="24" class="text-leaf" label="Goal reached" />
    </div>
    <div class="flex items-center gap-2" aria-hidden="true">
      <span
        v-for="dot in goal"
        :key="`${dot}-${dot <= done}`"
        class="size-5 rounded-pill"
        :class="dot <= done ? 'bg-leaf motion-safe:animate-pop' : 'bg-surface-sunken'"
      />
    </div>
    <p class="text-body-sm text-ink-muted">
      {{
        isReached
          ? 'Goal reached! Everything now is a bonus.'
          : `${done} of ${goal} focus sessions today`
      }}
    </p>
  </UiCard>
</template>
