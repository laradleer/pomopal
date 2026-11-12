<script setup lang="ts">
import type { ToastTone } from '~/composables/useToast'

/** One toast. Rendered by <UiToaster>; to show one, call useToast().show(). */
const props = withDefaults(
  defineProps<{
    message: string
    tone?: ToastTone
    icon?: string
  }>(),
  { tone: 'info', icon: undefined },
)

const emit = defineEmits<{ dismiss: [] }>()

const toneIcon: Record<ToastTone, string> = {
  info: 'info',
  success: 'circle-check',
  error: 'circle-alert',
  reward: 'coins',
}

const toneIconClass: Record<ToastTone, string> = {
  info: 'text-sky',
  success: 'text-leaf',
  error: 'text-berry',
  reward: '',
}
</script>

<template>
  <div
    class="flex w-full max-w-phone items-center gap-3 rounded-lg border py-3 pr-2 pl-4 text-body text-ink shadow-float motion-safe:animate-pop"
    :class="props.tone === 'reward' ? 'border-transparent bg-sun-tint' : 'border-border bg-surface'"
    :role="props.tone === 'error' ? 'alert' : 'status'"
  >
    <!-- Reward: a coin sticker with a darker rim, like the design system's reward stickers. -->
    <span
      v-if="props.tone === 'reward'"
      class="grid size-9 shrink-0 place-items-center rounded-pill border-b-4 border-sun-edge bg-sun text-on-sun"
    >
      <UiIcon :name="props.icon ?? toneIcon.reward" :size="20" />
    </span>
    <UiIcon
      v-else
      :name="props.icon ?? toneIcon[props.tone]"
      :size="20"
      :class="toneIconClass[props.tone]"
    />
    <p class="flex-1" :class="props.tone === 'reward' && 'text-stat text-sun-ink'">
      {{ props.message }}
    </p>
    <button
      type="button"
      class="grid size-8 place-items-center rounded-pill text-ink-muted hover:bg-surface-sunken"
      @click="emit('dismiss')"
    >
      <UiIcon name="x" :size="16" label="Dismiss" />
    </button>
  </div>
</template>
