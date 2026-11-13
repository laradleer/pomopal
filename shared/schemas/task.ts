import { z } from 'zod'
import { TASK_TITLE_MAX_LENGTH } from '../constants'

const title = z
  .string({ error: 'Give the task a name.' })
  .trim()
  .min(1, { error: 'Give the task a name.' })
  .max(TASK_TITLE_MAX_LENGTH, {
    error: `Tasks can be up to ${TASK_TITLE_MAX_LENGTH} characters.`,
  })

/** POST /api/tasks, and the edit form. */
export const taskCreateSchema = z.object({ title })

/** PATCH /api/tasks/:id: rename it, tick it off, or both. */
export const taskUpdateSchema = z
  .object({
    title: title.optional(),
    done: z.boolean({ error: 'Done must be true or false.' }).optional(),
  })
  .refine((value) => value.title !== undefined || value.done !== undefined, {
    error: 'Nothing to change.',
  })

/** `:id` in /api/tasks/:id */
export const taskIdParamsSchema = z.object({
  id: z.coerce.number({ error: 'Unknown task.' }).int().positive({ error: 'Unknown task.' }),
})

export type TaskCreateInput = z.infer<typeof taskCreateSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
