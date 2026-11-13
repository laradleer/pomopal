import { z } from 'zod'

/** `:id` in /api/inventory/:id/… (the inventory row, not the shop item). */
export const inventoryIdParamsSchema = z.object({
  id: z.coerce.number({ error: 'Unknown item.' }).int().positive({ error: 'Unknown item.' }),
})
