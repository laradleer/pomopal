<script setup lang="ts">
/**
 * On/off switch with its label and an optional description.
 *
 *   <UiSwitch v-model="isOn" label="Animations" description="Moving effects and the pet's animations." />
 */
const model = defineModel<boolean>({ required: true })

const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    disabled?: boolean
  }>(),
  { description: undefined, disabled: false },
)

const labelId = useId()
const descriptionId = useId()
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="min-w-0">
      <p :id="labelId" class="text-body text-ink">{{ props.label }}</p>
      <p v-if="props.description" :id="descriptionId" class="text-body-sm text-ink-muted">
        {{ props.description }}
      </p>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="model"
      :aria-labelledby="labelId"
      :aria-describedby="props.description ? descriptionId : undefined"
      :disabled="props.disabled"
      class="relative h-8 w-14 shrink-0 rounded-pill transition-colors duration-(--duration-quick) disabled:cursor-not-allowed disabled:opacity-50"
      :class="model ? 'bg-leaf' : 'bg-border-strong'"
      @click="model = !model"
    >
      <span
        class="absolute top-1 left-1 size-6 rounded-pill bg-surface shadow-float transition-transform duration-(--duration-quick) ease-pop"
        :class="model && 'translate-x-6'"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
