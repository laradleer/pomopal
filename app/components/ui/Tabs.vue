<script setup lang="ts" generic="Value extends string">
/**
 * Segmented control: a row of toggle buttons where exactly one is active.
 *
 *   <UiTabs v-model="slot" label="Item type" :options="[{ value: 'head', label: 'Head' }, …]" />
 *
 * `activeClass` colours the active tab's text (default ink), e.g. tomato for Focus.
 */
const model = defineModel<Value>({ required: true })

const props = withDefaults(
  defineProps<{
    options: readonly { value: Value; label: string; activeClass?: string }[]
    /** Accessible name of the group. */
    label: string
    disabled?: boolean
  }>(),
  { disabled: false },
)
</script>

<template>
  <div
    role="group"
    :aria-label="props.label"
    class="flex w-full rounded-pill bg-surface-sunken p-1"
    :class="props.disabled && 'opacity-60'"
  >
    <button
      v-for="option in props.options"
      :key="option.value"
      type="button"
      :disabled="props.disabled"
      :aria-pressed="model === option.value"
      class="flex-1 rounded-pill px-3 py-2 text-body-sm font-bold text-ink-muted transition-colors enabled:hover:text-ink disabled:cursor-not-allowed aria-pressed:border aria-pressed:border-border aria-pressed:bg-surface"
      :class="model === option.value && (option.activeClass ?? 'text-ink')"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
