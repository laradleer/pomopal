import { sessionIdParamsSchema } from '#shared/schemas/session'
import { abandonSession } from '~~/server/services/sessions'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { id } = getValidParams(event, sessionIdParamsSchema)
  return abandonSession(user.id, id, new Date())
})
