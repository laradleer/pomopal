import { statsQuerySchema } from '#shared/schemas/stats'
import { getWeekStats } from '~~/server/services/stats'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  // `range` is validated, but 'week' is the only one so far.
  const { timeZone } = getValidQuery(event, statsQuerySchema)
  return getWeekStats(user.id, new Date(), timeZone ?? 'UTC')
})
