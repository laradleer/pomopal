import { listShop } from '~~/server/services/shop'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return listShop(user.id)
})
