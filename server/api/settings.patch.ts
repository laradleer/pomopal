import { timerSettingsSchema } from '#shared/schemas/settings'
import { updateTimerSettings } from '~~/server/services/settings'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = await readValidBody(event, timerSettingsSchema)
  return updateTimerSettings(user.id, input)
})
