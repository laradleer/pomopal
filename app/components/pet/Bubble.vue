<script setup lang="ts">
/** The pet's speech bubble: sky tint, tail pointing left at the pet. One or two short sentences. */
defineSlots<{ default(): unknown }>()
</script>

<template>
  <p
    class="relative rounded-lg bg-sky-tint px-4 py-3 text-body-lg text-ink shadow-float"
    aria-live="polite"
  >
    <span class="absolute bottom-4 -left-1.5 size-3 rotate-45 bg-sky-tint" aria-hidden="true" />
    <slot />
  </p>
</template>
