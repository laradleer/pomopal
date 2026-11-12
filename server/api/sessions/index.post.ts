import { sessionStartSchema } from '#shared/schemas/session'
import { startSession } from '~~/server/services/sessions'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = await readValidBody(event, sessionStartSchema)
  setResponseStatus(event, 201)
  return startSession(user.id, input, new Date())
})
