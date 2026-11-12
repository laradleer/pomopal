<script setup lang="ts">
useSeoMeta({ title: 'Your pet' })

const pet = usePetStore()
const { mood, line } = usePetMood()

const MOOD_LABEL = { happy: 'Happy', sleepy: 'Sleepy', sad: 'A little sad', neutral: 'Calm' }
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-title">{{ pet.name }}</h1>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Pet stage -->
      <section class="flex flex-col items-center gap-4 rounded-xl bg-canvas-warm px-6 py-10">
        <PetView :species="pet.species" :mood="mood" :name="pet.name" :size="220" />
        <span class="rounded-pill bg-surface px-3 py-1 text-label text-ink-muted">
          {{ MOOD_LABEL[mood] }}
        </span>
        <PetBubble>{{ line }}</PetBubble>
      </section>

      <AppComingSoon
        icon="paw-print"
        message="Your wardrobe will be here: dress up your pet with what you buy in the shop."
      />
    </div>
  </div>
</template>
