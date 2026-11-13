import { inventoryIdParamsSchema } from '#shared/schemas/inventory'
import { equipItem } from '~~/server/services/inventory'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { id } = getValidParams(event, inventoryIdParamsSchema)
  return equipItem(user.id, id)
})
