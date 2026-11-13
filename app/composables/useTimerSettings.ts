import type { TimerSettings } from '#shared/schemas/settings'

/**
 * Saving the timer lengths. The timer store reads them from the user store, so after a refresh
 * the next session uses them (a running session keeps its length).
 */
export function useTimerSettings() {
  const user = useUserStore()
  const toast = useToast()

  /** Throws a friendly message for useZodForm when saving fails. */
  async function saveTimerSettings(input: TimerSettings): Promise<void> {
    try {
      await $fetch<TimerSettings>('/api/settings', { method: 'PATCH', body: input })
    } catch (error) {
      throw new Error(apiErrorMessage(error), { cause: error })
    }
    await user.refresh()
    toast.show('Saved! Your next session uses the new lengths.', { tone: 'success' })
  }

  return { saveTimerSettings }
}
