<script setup lang="ts">
/**
 * 12px pill progress bar, always with a visible label.
 * Grape for XP, leaf for goals, tomato for the session.
 */
type Color = 'grape' | 'leaf' | 'tomato'

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    label: string
    valueText?: string
    color?: Color
  }>(),
  { max: 100, valueText: undefined, color: 'grape' },
)

const fillClasses: Record<Color, string> = {
  grape: 'bg-grape',
  leaf: 'bg-leaf',
  tomato: 'bg-tomato',
}

const labelId = useId()
const percent = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-baseline justify-between gap-3 text-body-sm">
      <span :id="labelId">{{ props.label }}</span>
      <span v-if="props.valueText" class="text-ink-muted tabular-nums">{{ props.valueText }}</span>
    </div>
    <div
      role="progressbar"
      :aria-labelledby="labelId"
      aria-valuemin="0"
      :aria-valuemax="props.max"
      :aria-valuenow="props.value"
      :aria-valuetext="props.valueText"
      class="h-3 overflow-hidden rounded-pill bg-surface-sunken"
    >
      <div
        class="h-full rounded-pill transition-[width] duration-400 ease-out"
        :class="fillClasses[props.color]"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
