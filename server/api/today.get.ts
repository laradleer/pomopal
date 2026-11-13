import { todayQuerySchema } from '#shared/schemas/today'
import { getToday } from '~~/server/services/today'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { timeZone } = getValidQuery(event, todayQuerySchema)
  return getToday(user.id, new Date(), timeZone ?? 'UTC')
})
