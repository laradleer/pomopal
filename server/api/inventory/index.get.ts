import { listInventory } from '~~/server/services/inventory'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return listInventory(user.id)
})
