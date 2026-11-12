<script setup lang="ts">
/** Shows the toasts from useToast(). Mounted once, in app.vue. Sits above the tab bar. */
const { toasts, dismiss } = useToast()
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4"
  >
    <UiToast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :tone="toast.tone"
      :icon="toast.icon"
      class="pointer-events-auto"
      @dismiss="dismiss(toast.id)"
    />
  </div>
</template>
