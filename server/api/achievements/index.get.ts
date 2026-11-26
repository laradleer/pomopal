import { achievementsQuerySchema } from '#shared/schemas/achievement'
import { listAchievements } from '~~/server/services/achievements'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { timeZone } = getValidQuery(event, achievementsQuerySchema)
  return listAchievements(user.id, new Date(), timeZone ?? 'UTC')
})
