<script setup lang="ts">
/**
 * 14px progress ring with the countdown in the middle (default slot).
 * Tomato for focus, leaf for the short break, sky for the long break.
 */
type Color = 'tomato' | 'leaf' | 'sky'

const props = defineProps<{
  /** 0 to 1 */
  progress: number
  color: Color
}>()

defineSlots<{ default?(): unknown }>()

// Drawn in a 120×120 box and shown at 18rem, so a 6-unit stroke is ~14px on screen.
const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const strokeClass: Record<Color, string> = {
  tomato: 'stroke-tomato',
  leaf: 'stroke-leaf',
  sky: 'stroke-sky',
}

const dashOffset = computed(() => {
  const clamped = Math.min(1, Math.max(0, props.progress))
  return CIRCUMFERENCE * (1 - clamped)
})
</script>

<template>
  <div class="relative grid aspect-square w-full max-w-72 place-items-center">
    <svg viewBox="0 0 120 120" class="absolute inset-0 size-full -rotate-90" aria-hidden="true">
      <circle
        cx="60"
        cy="60"
        :r="RADIUS"
        fill="none"
        stroke-width="6"
        class="stroke-surface-sunken"
      />
      <circle
        cx="60"
        cy="60"
        :r="RADIUS"
        fill="none"
        stroke-width="6"
        stroke-linecap="round"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
        class="transition-[stroke-dashoffset] duration-300 ease-linear"
        :class="strokeClass[props.color]"
      />
    </svg>
    <div class="relative flex flex-col items-center gap-1">
      <slot />
    </div>
  </div>
</template>
