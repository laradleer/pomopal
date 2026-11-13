import { eq } from 'drizzle-orm'
import type { TimerSettings } from '#shared/schemas/settings'
import { profile } from '~~/server/db/schema'

/** Saves the timer lengths on the profile. The check constraints guard the same ranges. */
export async function updateTimerSettings(
  userId: string,
  input: TimerSettings,
): Promise<TimerSettings> {
  const [saved] = await useDb()
    .update(profile)
    .set(input)
    .where(eq(profile.userId, userId))
    .returning({
      focusMin: profile.focusMin,
      shortBreakMin: profile.shortBreakMin,
      longBreakMin: profile.longBreakMin,
    })
  if (!saved) throw apiError('NOT_FOUND', 'Profile not found')
  return saved
}
