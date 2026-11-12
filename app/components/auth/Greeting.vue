<script setup lang="ts">
/** The pet greeting at the top of the auth pages. Placeholder art until the real pet (#20). */
const props = defineProps<{ message: string }>()
</script>

<template>
  <div class="flex items-end gap-3">
    <div
      class="grid size-16 shrink-0 place-items-center rounded-pill bg-sun-tint text-sun-ink"
      aria-hidden="true"
    >
      <UiIcon name="paw-print" :size="24" />
    </div>
    <p class="relative mb-3 rounded-lg bg-sky-tint px-4 py-3 text-body-lg text-ink shadow-float">
      <span class="absolute bottom-3 -left-1.5 size-3 rotate-45 bg-sky-tint" aria-hidden="true" />
      {{ props.message }}
    </p>
  </div>
</template>
