<script setup lang="ts">
/**
 * Stat pill: icon + number, e.g. the streak, level and coin chips in the top bar.
 * The number pops when it changes. `label` is read by screen readers after the number ("120 coins").
 */
type Tone = 'sun' | 'grape' | 'tomato' | 'leaf' | 'neutral'

const props = withDefaults(
  defineProps<{
    icon: string
    value: number | string
    label: string
    tone?: Tone
  }>(),
  { tone: 'neutral' },
)

const toneClasses: Record<Tone, string> = {
  sun: 'bg-sun-tint text-sun-ink',
  grape: 'bg-grape-tint text-grape',
  tomato: 'bg-tomato-tint text-tomato',
  leaf: 'bg-leaf-tint text-leaf',
  neutral: 'border border-border bg-surface text-ink',
}

const iconClasses: Record<Tone, string> = {
  sun: 'text-sun-edge',
  grape: '',
  tomato: '',
  leaf: '',
  neutral: 'text-ink-muted',
}

// Re-keying the number restarts the pop animation; no pop on first render.
const pops = ref(0)
watch(
  () => props.value,
  () => pops.value++,
)
</script>

<template>
  <span
    class="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-stat"
    :class="toneClasses[props.tone]"
  >
    <UiIcon :name="props.icon" :size="20" :class="iconClasses[props.tone]" />
    <span :key="pops" class="inline-block" :class="pops > 0 && 'motion-safe:animate-pop'">
      {{ props.value }}
    </span>
    <span class="sr-only">{{ props.label }}</span>
  </span>
</template>
