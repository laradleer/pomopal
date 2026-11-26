import { listAchievements } from '~~/server/services/achievements'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return listAchievements(user.id)
})
