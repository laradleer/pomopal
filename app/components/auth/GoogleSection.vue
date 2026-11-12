<script setup lang="ts">
/** "or" divider + Continue with Google. Shown only when Google is configured on the server. */
const props = defineProps<{ action: () => Promise<void> }>()

const pending = ref(false)
const error = ref<string>()

async function continueWithGoogle() {
  pending.value = true
  error.value = undefined
  try {
    await props.action()
    // On success the browser is leaving for Google; stay "pending" until it does.
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : GENERIC_ERROR_MESSAGE
    pending.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3 text-body-sm text-ink-muted" aria-hidden="true">
      <span class="h-px flex-1 bg-border" />
      or
      <span class="h-px flex-1 bg-border" />
    </div>
    <UiAlert v-if="error">{{ error }}</UiAlert>
    <UiButton variant="outline" block :loading="pending" @click="continueWithGoogle">
      Continue with Google
    </UiButton>
  </div>
</template>
