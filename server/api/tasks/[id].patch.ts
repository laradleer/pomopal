import { taskIdParamsSchema, taskUpdateSchema } from '#shared/schemas/task'
import { updateTask } from '~~/server/services/tasks'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { id } = getValidParams(event, taskIdParamsSchema)
  const input = await readValidBody(event, taskUpdateSchema)
  return updateTask(user.id, id, input)
})
