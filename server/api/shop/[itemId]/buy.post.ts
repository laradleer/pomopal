import { shopItemParamsSchema } from '#shared/schemas/shop'
import { buyItem } from '~~/server/services/shop'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { itemId } = getValidParams(event, shopItemParamsSchema)
  return buyItem(user.id, itemId)
})
