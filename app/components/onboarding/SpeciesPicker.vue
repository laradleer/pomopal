<script setup lang="ts">
import { PET_SPECIES } from '#shared/constants'
import type { PetSpecies } from '#shared/constants'

/**
 * Cat or dog, as two big pressable tiles. Real radio inputs underneath, so arrow keys,
 * Space and screen readers work as expected.
 */
const model = defineModel<PetSpecies | undefined>()

const props = withDefaults(defineProps<{ error?: string }>(), { error: undefined })

const options: Record<PetSpecies, { label: string; blurb: string }> = {
  cat: { label: 'Cat', blurb: 'Calm and curious' },
  dog: { label: 'Dog', blurb: 'Loyal and cheerful' },
}

const errorId = useId()
</script>

<template>
  <fieldset :aria-describedby="props.error ? errorId : undefined">
    <legend class="text-body-sm text-ink">Pick your study buddy</legend>
    <div class="mt-1.5 grid grid-cols-2 gap-3">
      <label
        v-for="species in PET_SPECIES"
        :key="species"
        class="mb-1 flex pressable cursor-pointer flex-col items-center gap-2 rounded-lg border bg-surface p-5 text-center edge-border-strong has-checked:border-tomato has-checked:bg-tomato-tint has-checked:edge-tomato-edge has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring"
        :class="props.error ? 'border-berry' : 'border-border-strong'"
      >
        <input v-model="model" type="radio" name="species" :value="species" class="sr-only" />
        <PetView
          :species="species"
          :mood="model === species ? 'happy' : 'neutral'"
          :size="88"
          aria-hidden="true"
        />
        <span class="text-heading">{{ options[species].label }}</span>
        <span class="text-body-sm text-ink-muted">{{ options[species].blurb }}</span>
      </label>
    </div>
    <p
      v-if="props.error"
      :id="errorId"
      class="mt-1.5 flex items-center gap-1.5 text-body-sm text-berry"
    >
      <UiIcon name="circle-alert" :size="16" />
      {{ props.error }}
    </p>
  </fieldset>
</template>
