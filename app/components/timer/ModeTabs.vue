<script setup lang="ts">
import type { SessionMode } from '#shared/constants'

/** Focus · Short break · Long break. Locked while a session runs. */
const model = defineModel<SessionMode>({ required: true })

const props = withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const tabs = [
  { value: 'focus', label: 'Focus', activeClass: 'text-tomato' },
  { value: 'short', label: 'Short break', activeClass: 'text-leaf' },
  { value: 'long', label: 'Long break', activeClass: 'text-sky' },
] as const satisfies readonly { value: SessionMode; label: string; activeClass: string }[]
</script>

<template>
  <UiTabs
    v-model="model"
    :options="tabs"
    label="Timer mode"
    :disabled="props.disabled"
    class="max-w-sm"
  />
</template>
