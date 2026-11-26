import { z } from 'zod'
import { STATS_RANGES } from '../constants'
import { isValidTimeZone } from '../streak'

/** GET /api/stats?range=week&timeZone=Europe/Istanbul. Days are calendar days in the student's zone. */
export const statsQuerySchema = z.object({
  range: z.enum(STATS_RANGES).default('week'),
  timeZone: z.string().max(64).refine(isValidTimeZone, { error: 'Unknown time zone.' }).optional(),
})
