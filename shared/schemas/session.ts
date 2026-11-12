import { z } from 'zod'
import { MODE_LIMITS, SESSION_MODES } from '../constants'
import { isValidTimeZone } from '../streak'

/** POST /api/sessions: start a focus session or a break. */
export const sessionStartSchema = z
  .object({
    mode: z.enum(SESSION_MODES, { error: 'Unknown session mode.' }),
    plannedMin: z.number({ error: 'Say how many minutes it should last.' }).int(),
    taskId: z.number().int().positive().optional(),
  })
  .superRefine((value, ctx) => {
    const { min, max } = MODE_LIMITS[value.mode]
    if (value.plannedMin < min || value.plannedMin > max) {
      ctx.addIssue({
        code: 'custom',
        path: ['plannedMin'],
        message: `This session can last ${min} to ${max} minutes.`,
      })
    }
  })

/** `:id` in /api/sessions/:id/… */
export const sessionIdParamsSchema = z.object({
  id: z.coerce.number({ error: 'Unknown session.' }).int().positive({ error: 'Unknown session.' }),
})

export type SessionStartInput = z.infer<typeof sessionStartSchema>

/** POST /api/sessions/:id/complete. The browser's time zone decides which day counts for the streak. */
export const sessionCompleteSchema = z.object({
  timeZone: z.string().max(64).refine(isValidTimeZone, { error: 'Unknown time zone.' }).optional(),
})
