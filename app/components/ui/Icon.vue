<script setup lang="ts">
/**
 * A Lucide icon (rounded, 2px stroke). `name` is the Lucide name without prefix: "flame", "coins".
 * Decorative by default (hidden from screen readers); pass `label` when the icon carries meaning alone.
 */
const props = withDefaults(
  defineProps<{
    name: string
    size?: 16 | 20 | 24
    label?: string
  }>(),
  { size: 20, label: undefined },
)
</script>

<template>
  <NuxtIcon
    :name="`lucide:${props.name}`"
    :size="`${props.size}px`"
    class="shrink-0"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
    :aria-hidden="props.label ? undefined : 'true'"
  />
</template>
