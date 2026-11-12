<script setup lang="ts">
/**
 * Outlined bento tile with 24px corners and no shadow. Tinted tones for focus, break and level.
 * Never put a card inside a card.
 */
type Tone = 'plain' | 'focus' | 'break' | 'level'

const props = withDefaults(
  defineProps<{
    tone?: Tone
    as?: string
    padded?: boolean
  }>(),
  { tone: 'plain', as: 'section', padded: true },
)

const toneClasses: Record<Tone, string> = {
  plain: 'border-border bg-surface',
  focus: 'border-transparent bg-tomato-tint',
  break: 'border-transparent bg-leaf-tint',
  level: 'border-transparent bg-grape-tint',
}
</script>

<template>
  <component
    :is="props.as"
    class="rounded-lg border"
    :class="[toneClasses[props.tone], props.padded && 'p-6']"
  >
    <slot />
  </component>
</template>
