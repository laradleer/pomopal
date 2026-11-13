import { z } from 'zod'
import { isValidTimeZone } from '../streak'

/** GET /api/today?timeZone=Europe/Istanbul. "Today" is the calendar day in the student's zone. */
export const todayQuerySchema = z.object({
  timeZone: z.string().max(64).refine(isValidTimeZone, { error: 'Unknown time zone.' }).optional(),
})
