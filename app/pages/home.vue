<script setup lang="ts">
// Phones: the pet's room first, then the timer, then progress. From md: up, progress moves to a
// column on the right (docs/04-design-system.md → Layout).
useSeoMeta({ title: 'Home' })

const profile = useProfileStore()
const timer = useTimerStore()
const { mood, line } = usePetMood()
const { openTasks, setDone } = await useTasks()
</script>

<template>
  <div
    class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:grid-cols-[minmax(0,1fr)_22rem]"
  >
    <div class="space-y-6">
      <h1 class="text-title">Hi, {{ profile.displayName }}!</h1>
      <PetStage :mood="mood" :message="line" :compact="timer.isActive" />
      <TimerPanel :tasks="openTasks" />
    </div>
    <aside class="space-y-6 md:pt-14" aria-label="Your progress">
      <RewardLevelCard />
      <RewardDailyGoal />
      <TaskTodayCard :tasks="openTasks" @toggle="setDone" />
      <ShopNextUnlock />
    </aside>
  </div>
</template>
