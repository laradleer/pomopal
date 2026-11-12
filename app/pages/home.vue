<script setup lang="ts">
useSeoMeta({ title: 'Home' })

const profile = useProfileStore()
const pet = usePetStore()
const { mood, line } = usePetMood()
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-4">
      <h1 class="text-title">Hi, {{ profile.displayName }}!</h1>
      <PetGreeting :species="pet.species" :mood="mood" :name="pet.name" :message="line" />
    </header>

    <!-- Bento: one column on phones, two from md: up. -->
    <div class="grid gap-6 md:grid-cols-2">
      <TimerPanel />
      <div class="space-y-6">
        <RewardLevelCard />
        <AppComingSoon icon="list-checks" message="Today's tasks will show up here." />
      </div>
    </div>
  </div>
</template>
