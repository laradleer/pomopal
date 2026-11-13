import { and, asc, desc, eq } from 'drizzle-orm'
import type { TaskCreateInput, TaskUpdateInput } from '#shared/schemas/task'
import type { TaskDto } from '#shared/types/task'
import { task } from '~~/server/db/schema'
import type { Task } from '~~/server/db/schema'

function toTaskDto(row: Task): TaskDto {
  return {
    id: row.id,
    title: row.title,
    done: row.done,
    sessionsCount: row.sessionsCount,
    createdAt: row.createdAt.toISOString(),
  }
}

/** The user's tasks: open ones first, newest first. */
export async function listTasks(userId: string): Promise<TaskDto[]> {
  const rows = await useDb()
    .select()
    .from(task)
    .where(eq(task.userId, userId))
    .orderBy(asc(task.done), desc(task.createdAt), desc(task.id))
  return rows.map(toTaskDto)
}

export async function createTask(userId: string, input: TaskCreateInput): Promise<TaskDto> {
  const [created] = await useDb().insert(task).values({ userId, title: input.title }).returning()
  if (!created) throw new Error('Task insert returned no row')
  return toTaskDto(created)
}

/** Renames a task or ticks it off. Only the user's own tasks. */
export async function updateTask(
  userId: string,
  id: number,
  input: TaskUpdateInput,
): Promise<TaskDto> {
  const [updated] = await useDb()
    .update(task)
    .set(input)
    .where(and(eq(task.id, id), eq(task.userId, userId)))
    .returning()
  if (!updated) throw apiError('NOT_FOUND', 'Task not found')
  return toTaskDto(updated)
}

/** Deletes a task. Its sessions stay (their task link becomes empty). */
export async function deleteTask(userId: string, id: number): Promise<void> {
  const [deleted] = await useDb()
    .delete(task)
    .where(and(eq(task.id, id), eq(task.userId, userId)))
    .returning({ id: task.id })
  if (!deleted) throw apiError('NOT_FOUND', 'Task not found')
}
