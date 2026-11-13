<script setup lang="ts">
import { TASK_TITLE_MAX_LENGTH } from '#shared/constants'
import { taskCreateSchema } from '#shared/schemas/task'
import type { TaskCreateInput } from '#shared/schemas/task'
import type { TaskDto } from '#shared/types/task'

useSeoMeta({ title: 'Tasks' })

const pet = usePetStore()
const { tasks, openTasks, doneTasks, pending, addTask, renameTask, setDone, deleteTask } =
  await useTasks()

// ---- Add ----

const {
  values: newTask,
  errors: newTaskErrors,
  formError: addError,
  pending: isAdding,
  submit: submitAdd,
  reset: resetAdd,
} = useZodForm(taskCreateSchema, { title: '' })

async function add(input: TaskCreateInput) {
  await addTask(input)
  resetAdd()
}

// ---- Edit ----

const editing = ref<TaskDto | null>(null)
const isEditOpen = ref(false)
const {
  values: editValues,
  errors: editErrors,
  formError: editError,
  pending: isSavingEdit,
  submit: submitEdit,
  reset: resetEdit,
} = useZodForm(taskCreateSchema, { title: '' })

function openEdit(task: TaskDto) {
  editing.value = task
  resetEdit({ title: task.title })
  isEditOpen.value = true
}

async function saveEdit(input: TaskCreateInput) {
  if (!editing.value) return
  await renameTask(editing.value, input)
  isEditOpen.value = false
}

// ---- Delete ----

const deleting = ref<TaskDto | null>(null)
const isDeleteOpen = ref(false)

function askDelete(task: TaskDto) {
  deleting.value = task
  isDeleteOpen.value = true
}

async function confirmDelete() {
  isDeleteOpen.value = false
  if (deleting.value) await deleteTask(deleting.value)
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-title">Tasks</h1>

    <form class="space-y-2 md:max-w-phone" novalidate @submit.prevent="submitAdd(add)">
      <UiFormField v-slot="field" label="What are you studying?" :error="newTaskErrors.title">
        <div class="flex items-start gap-2">
          <UiInput
            v-model="newTask.title"
            v-bind="field"
            :maxlength="TASK_TITLE_MAX_LENGTH"
            autocomplete="off"
            placeholder="Read chapter 3"
          />
          <UiButton type="submit" icon="plus" :loading="isAdding">Add</UiButton>
        </div>
      </UiFormField>
      <UiAlert v-if="addError">{{ addError }}</UiAlert>
    </form>

    <div v-if="pending && tasks.length === 0" class="space-y-2 md:max-w-phone">
      <UiSkeleton v-for="index in 3" :key="index" class="h-16" />
    </div>

    <!-- Empty state -->
    <section
      v-else-if="tasks.length === 0"
      class="rounded-xl bg-canvas-warm px-6 py-8"
      aria-label="No tasks yet"
    >
      <PetGreeting
        :species="pet.species"
        mood="happy"
        :name="pet.name"
        :equipped="pet.equipped"
        live
        message="No tasks yet! Add one, then pick it before your next focus session."
      />
    </section>

    <div v-else class="grid gap-6 md:grid-cols-2 md:items-start">
      <section class="space-y-3">
        <h2 class="text-heading">To do</h2>
        <ul v-if="openTasks.length > 0" class="space-y-2">
          <TaskRow
            v-for="task in openTasks"
            :key="task.id"
            :task="task"
            @toggle="(done) => setDone(task, done)"
            @edit="openEdit(task)"
            @remove="askDelete(task)"
          />
        </ul>
        <p v-else class="text-body text-ink-muted">All done. Time for a well-earned break!</p>
      </section>

      <section v-if="doneTasks.length > 0" class="space-y-3">
        <h2 class="text-heading">Done</h2>
        <ul class="space-y-2">
          <TaskRow
            v-for="task in doneTasks"
            :key="task.id"
            :task="task"
            @toggle="(done) => setDone(task, done)"
            @edit="openEdit(task)"
            @remove="askDelete(task)"
          />
        </ul>
      </section>
    </div>

    <UiSheet v-model:open="isEditOpen" title="Edit task">
      <form class="space-y-4" novalidate @submit.prevent="submitEdit(saveEdit)">
        <UiFormField v-slot="field" label="Task" :error="editErrors.title">
          <UiInput
            v-model="editValues.title"
            v-bind="field"
            :maxlength="TASK_TITLE_MAX_LENGTH"
            autocomplete="off"
          />
        </UiFormField>
        <UiAlert v-if="editError">{{ editError }}</UiAlert>
        <div class="flex flex-col gap-2">
          <UiButton type="submit" block :loading="isSavingEdit">Save</UiButton>
          <UiButton block variant="outline" @click="isEditOpen = false">Cancel</UiButton>
        </div>
      </form>
    </UiSheet>

    <UiSheet
      v-model:open="isDeleteOpen"
      title="Delete this task?"
      :description="`“${deleting?.title}” will be gone. Your focus sessions and rewards stay.`"
    >
      <template #actions>
        <UiButton block @click="isDeleteOpen = false">Keep it</UiButton>
        <UiButton block variant="outline" icon="trash-2" @click="confirmDelete">
          Delete task
        </UiButton>
      </template>
    </UiSheet>
  </div>
</template>
