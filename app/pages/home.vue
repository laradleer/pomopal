<script setup lang="ts">
useSeoMeta({ title: 'Home' })

const profile = useProfileStore()
const pet = usePetStore()
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-title">Hi, {{ profile.displayName }}!</h1>
      <p class="mt-1 text-body text-ink-muted">{{ pet.name }} is ready to study with you.</p>
    </header>

    <!-- Bento: one column on phones, two from md: up. -->
    <div class="grid gap-6 md:grid-cols-2">
      <AppComingSoon icon="timer" message="The focus timer lands here." />
      <AppComingSoon icon="list-checks" message="Today's tasks will show up here." />
    </div>
  </div>
</template>
