<script setup lang="ts">
/**
 * Number field with − and + buttons, for small ranges like timer lengths. The value can also be
 * typed or changed with the arrow keys. Use inside <UiFormField>; its attributes (id, aria-*) go
 * to the <input>.
 *
 *   <UiStepper v-model="values.focusMin" v-bind="field" :min="15" :max="60" :step="5" unit="min" name="focus length" />
 */
defineOptions({ inheritAttrs: false })

// Empty while the field is cleared; the form schema reports it.
const model = defineModel<number | undefined>({ required: true })

const props = withDefaults(
  defineProps<{
    min: number
    max: number
    step?: number
    /** Shown after the number, e.g. "min". */
    unit?: string
    /** What the buttons change, for screen readers: "Decrease focus length". */
    name: string
  }>(),
  { step: 1, unit: '' },
)

const current = computed(() =>
  typeof model.value === 'number' && Number.isFinite(model.value) ? model.value : props.min,
)

function change(by: number) {
  model.value = Math.min(props.max, Math.max(props.min, current.value + by))
}

const buttonClass =
  'grid size-12 shrink-0 place-items-center rounded-pill border border-border-strong bg-surface text-ink hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40'
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      type="button"
      :class="buttonClass"
      :disabled="current <= props.min"
      :aria-label="`Decrease ${props.name}`"
      @click="change(-props.step)"
    >
      <UiIcon name="minus" />
    </button>
    <div
      class="flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm border border-border bg-surface-sunken px-3 focus-within:border-focus-ring has-aria-invalid:border-berry"
    >
      <input
        v-model.number="model"
        v-bind="$attrs"
        type="number"
        inputmode="numeric"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        class="w-12 appearance-none bg-transparent text-right text-stat text-ink outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span v-if="props.unit" class="text-body text-ink-muted">{{ props.unit }}</span>
    </div>
    <button
      type="button"
      :class="buttonClass"
      :disabled="current >= props.max"
      :aria-label="`Increase ${props.name}`"
      @click="change(props.step)"
    >
      <UiIcon name="plus" />
    </button>
  </div>
</template>
