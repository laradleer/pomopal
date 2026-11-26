import { z } from 'zod'
import { isValidTimeZone } from '../streak'

/** GET /api/achievements?timeZone=Europe/Istanbul. The zone decides whether the streak still counts. */
export const achievementsQuerySchema = z.object({
  timeZone: z.string().max(64).refine(isValidTimeZone, { error: 'Unknown time zone.' }).optional(),
})
