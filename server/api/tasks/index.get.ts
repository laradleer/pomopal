import { listTasks } from '~~/server/services/tasks'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return listTasks(user.id)
})
