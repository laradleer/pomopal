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
const checkbox = useTemplateRef<HTMLInputElement>('checkbox')
const motion = useMotion()
const sound = useSound()

const sessionsLabel = computed(() => {
  const count = props.task.sessionsCount
  return `${count} focus ${count === 1 ? 'session' : 'sessions'}`
})

function onChange(event: Event) {
  const isDone = (event.target as HTMLInputElement).checked
  // A small pop when a task is ticked off; the strike-through draws itself (CSS below).
  if (isDone) {
    sound.play('task')
    motion.play(checkbox.value, [{ scale: 1 }, { scale: 1.45 }, { scale: 1 }], {
      duration: 'move',
      easing: 'pop',
    })
  }
  emit('toggle', isDone)
}
</script>

<template>
  <li
    class="flex items-center gap-3"
    :class="!props.compact && 'rounded-md border border-border bg-surface py-3 pr-2 pl-4'"
  >
    <input
      :id="checkboxId"
      ref="checkbox"
      type="checkbox"
      :checked="props.task.done"
      class="size-5 shrink-0 cursor-pointer accent-leaf"
      @change="onChange"
    />
    <label :for="checkboxId" class="min-w-0 flex-1 cursor-pointer">
      <span class="block text-body break-words">
        <span
          class="task-title transition-colors duration-(--duration-move)"
          :class="props.task.done ? 'is-done text-ink-muted' : 'text-ink'"
        >
          {{ props.task.title }}
        </span>
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

<style scoped>
/* The strike-through draws from left to right, on every line of a long title. */
.task-title {
  background: linear-gradient(currentColor, currentColor) no-repeat 0 55% / 0% 2px;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  transition: background-size var(--duration-move) var(--ease-soft);
}
.task-title.is-done {
  background-size: 100% 2px;
}
</style>
