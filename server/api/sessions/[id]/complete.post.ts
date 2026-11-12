import { sessionCompleteSchema, sessionIdParamsSchema } from '#shared/schemas/session'
import { completeSession } from '~~/server/services/sessions'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { id } = getValidParams(event, sessionIdParamsSchema)
  const { timeZone } = await readValidBody(event, sessionCompleteSchema)
  return completeSession(user.id, id, new Date(), timeZone ?? 'UTC')
})
