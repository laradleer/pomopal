<script setup lang="ts">
/** Placeholder card for pages whose feature is still being built. */
const props = defineProps<{ icon: string; message: string }>()
</script>

<template>
  <UiCard class="flex flex-col items-center gap-3 py-12 text-center">
    <span class="grid size-14 place-items-center rounded-pill bg-sun-tint text-sun-ink">
      <UiIcon :name="props.icon" :size="24" />
    </span>
    <p class="max-w-xs text-body text-ink-muted">{{ props.message }}</p>
  </UiCard>
</template>
