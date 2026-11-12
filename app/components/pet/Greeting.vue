<script setup lang="ts">
import type { PetMood, PetSpecies } from '#shared/constants'

/** The pet with a speech bubble next to it: on home, login, sign-up and onboarding. */
const props = withDefaults(
  defineProps<{
    species: PetSpecies
    mood: PetMood
    message: string
    name?: string
    size?: number
  }>(),
  { name: undefined, size: 96 },
)
</script>

<template>
  <div class="flex items-end gap-3">
    <PetView :species="props.species" :mood="props.mood" :name="props.name" :size="props.size" />
    <PetBubble class="mb-4">{{ props.message }}</PetBubble>
  </div>
</template>
