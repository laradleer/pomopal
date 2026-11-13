import { z } from 'zod'

/** `:itemId` in /api/shop/:itemId/… */
export const shopItemParamsSchema = z.object({
  itemId: z.coerce.number({ error: 'Unknown item.' }).int().positive({ error: 'Unknown item.' }),
})
