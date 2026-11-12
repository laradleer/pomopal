<script setup lang="ts">
import type { SessionMode } from '#shared/constants'

/** Focus · Short break · Long break. Locked while a session runs. */
const model = defineModel<SessionMode>({ required: true })

const props = withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const tabs: { mode: SessionMode; label: string; activeClass: string }[] = [
  { mode: 'focus', label: 'Focus', activeClass: 'text-tomato' },
  { mode: 'short', label: 'Short break', activeClass: 'text-leaf' },
  { mode: 'long', label: 'Long break', activeClass: 'text-sky' },
]
</script>

<template>
  <div
    role="group"
    aria-label="Timer mode"
    class="flex w-full max-w-sm rounded-pill bg-surface-sunken p-1"
    :class="props.disabled && 'opacity-60'"
  >
    <button
      v-for="tab in tabs"
      :key="tab.mode"
      type="button"
      :disabled="props.disabled"
      :aria-pressed="model === tab.mode"
      class="flex-1 rounded-pill px-3 py-2 text-body-sm font-bold text-ink-muted transition-colors enabled:hover:text-ink disabled:cursor-not-allowed aria-pressed:border aria-pressed:border-border aria-pressed:bg-surface"
      :class="model === tab.mode && tab.activeClass"
      @click="model = tab.mode"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
