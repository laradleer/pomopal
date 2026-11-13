import type { TaskCreateInput } from '#shared/schemas/task'
import type { TaskDto } from '#shared/types/task'

/**
 * The task list (shared by /tasks, the home card and the timer's task picker through the
 * 'tasks' key). Form actions throw friendly messages for useZodForm; quick actions (tick off,
 * delete) show a toast when they fail.
 */
export async function useTasks() {
  const toast = useToast()

  const {
    data: tasks,
    pending,
    refresh,
  } = await useFetch<TaskDto[]>('/api/tasks', { key: 'tasks', default: () => [] })

  const openTasks = computed(() => tasks.value.filter((task) => !task.done))
  const doneTasks = computed(() => tasks.value.filter((task) => task.done))

  async function addTask(input: TaskCreateInput): Promise<void> {
    try {
      await $fetch<TaskDto>('/api/tasks', { method: 'POST', body: input })
    } catch (error) {
      throw new Error(apiErrorMessage(error), { cause: error })
    }
    await refresh()
  }

  async function renameTask(task: TaskDto, input: TaskCreateInput): Promise<void> {
    try {
      await $fetch<TaskDto>(`/api/tasks/${task.id}`, { method: 'PATCH', body: input })
    } catch (error) {
      throw new Error(apiErrorMessage(error), { cause: error })
    }
    await refresh()
  }

  async function setDone(task: TaskDto, done: boolean): Promise<void> {
    try {
      await $fetch<TaskDto>(`/api/tasks/${task.id}`, { method: 'PATCH', body: { done } })
      if (done) toast.show(`Nice! "${task.title}" is done.`, { tone: 'success' })
    } catch (error) {
      toast.show(apiErrorMessage(error), { tone: 'error' })
    }
    // Also after a failure, so the checkbox shows the real state again.
    await refresh()
  }

  async function deleteTask(task: TaskDto): Promise<void> {
    try {
      await $fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    } catch (error) {
      toast.show(apiErrorMessage(error), { tone: 'error' })
    }
    await refresh()
  }

  return { tasks, openTasks, doneTasks, pending, addTask, renameTask, setDone, deleteTask }
}
