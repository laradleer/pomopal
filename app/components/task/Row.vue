<script setup lang="ts">
import type { TaskDto } from '#shared/types/task'

/**
 * One task: checkbox, title and how many focus sessions it got. The full row (on /tasks) also
 * has edit and delete buttons; `compact` (the home card) only has the checkbox.
 */
const props = withDefaults(defineProps<{ task: TaskDto; compact?: boolean }>(), {
  compact: false,
})

const emit = defineEmits<{
  toggle: [done: boolean]
  edit: []
  remove: []
}>()

const checkboxId = useId()

const sessionsLabel = computed(() => {
  const count = props.task.sessionsCount
  return `${count} focus ${count === 1 ? 'session' : 'sessions'}`
})

function onChange(event: Event) {
  emit('toggle', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <li
    class="flex items-center gap-3"
    :class="!props.compact && 'rounded-md border border-border bg-surface py-3 pr-2 pl-4'"
  >
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="props.task.done"
      class="size-5 shrink-0 cursor-pointer accent-leaf"
      @change="onChange"
    />
    <label :for="checkboxId" class="min-w-0 flex-1 cursor-pointer">
      <span
        class="block text-body break-words"
        :class="props.task.done ? 'text-ink-muted line-through' : 'text-ink'"
      >
        {{ props.task.title }}
      </span>
      <span class="flex items-center gap-1 text-body-sm text-ink-muted">
        <UiIcon name="timer" :size="16" />
        {{ sessionsLabel }}
      </span>
    </label>

    <template v-if="!props.compact">
      <button
        type="button"
        :aria-label="`Edit “${props.task.title}”`"
        class="grid size-10 shrink-0 place-items-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-ink"
        @click="emit('edit')"
      >
        <UiIcon name="pencil" :size="20" />
      </button>
      <button
        type="button"
        :aria-label="`Delete “${props.task.title}”`"
        class="grid size-10 shrink-0 place-items-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-berry"
        @click="emit('remove')"
      >
        <UiIcon name="trash-2" :size="20" />
      </button>
    </template>
  </li>
</template>
