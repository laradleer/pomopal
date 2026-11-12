<script setup lang="ts">
/** A message inside the page, e.g. a form error from the server. Errors are announced at once. */
type Tone = 'error' | 'info'

const props = withDefaults(defineProps<{ tone?: Tone }>(), { tone: 'error' })

const iconByTone: Record<Tone, string> = { error: 'circle-alert', info: 'info' }
const iconClassByTone: Record<Tone, string> = { error: 'text-berry', info: 'text-sky' }
</script>

<template>
  <div
    :role="props.tone === 'error' ? 'alert' : 'status'"
    class="flex items-start gap-2 rounded-md border px-4 py-3 text-body-sm text-ink"
    :class="props.tone === 'error' ? 'border-berry bg-surface' : 'border-transparent bg-sky-tint'"
  >
    <UiIcon
      :name="iconByTone[props.tone]"
      :size="20"
      :class="iconClassByTone[props.tone]"
      class="mt-px"
    />
    <p><slot /></p>
  </div>
</template>
