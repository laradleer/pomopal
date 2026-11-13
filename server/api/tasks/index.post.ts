import { taskCreateSchema } from '#shared/schemas/task'
import { createTask } from '~~/server/services/tasks'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = await readValidBody(event, taskCreateSchema)
  setResponseStatus(event, 201)
  return createTask(user.id, input)
})
