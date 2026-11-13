import { taskIdParamsSchema } from '#shared/schemas/task'
import { deleteTask } from '~~/server/services/tasks'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { id } = getValidParams(event, taskIdParamsSchema)
  await deleteTask(user.id, id)
  setResponseStatus(event, 204)
  return null
})
