<script setup lang="ts">
import type { TaskDto } from '#shared/types/task'

/** "Today's tasks" on the home page: the first open tasks, ticked off right here. */
const props = defineProps<{ tasks: TaskDto[] }>()

const emit = defineEmits<{ toggle: [task: TaskDto, done: boolean] }>()

const MAX_VISIBLE = 4

const visible = computed(() => props.tasks.slice(0, MAX_VISIBLE))
const hiddenCount = computed(() => Math.max(0, props.tasks.length - MAX_VISIBLE))
</script>

<template>
  <UiCard class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-heading">Today's tasks</h2>
      <NuxtLink
        to="/tasks"
        class="text-body-sm font-bold text-tomato underline-offset-4 hover:underline"
      >
        See all
      </NuxtLink>
    </div>

    <template v-if="visible.length > 0">
      <ul class="space-y-3">
        <TaskRow
          v-for="task in visible"
          :key="task.id"
          :task="task"
          compact
          @toggle="(done) => emit('toggle', task, done)"
        />
      </ul>
      <p v-if="hiddenCount > 0" class="text-body-sm text-ink-muted">
        and {{ hiddenCount }} more on the Tasks page
      </p>
    </template>

    <div v-else class="flex flex-col items-start gap-3">
      <p class="text-body text-ink-muted">Nothing planned yet. What are you studying today?</p>
      <UiButton variant="outline" size="sm" icon="plus" to="/tasks">Add a task</UiButton>
    </div>
  </UiCard>
</template>
