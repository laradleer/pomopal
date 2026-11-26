import type { StatsDto } from '#shared/types/stats'

const shortDay = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' })
const longDay = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

/**
 * The stats page (#26): focus minutes and sessions for each of the last 7 days, today last.
 * Loaded in the browser only (the days are the student's own calendar days) and refreshed by the
 * timer after each session (the 'stats' key).
 */
export async function useStats() {
  const { data, pending } = await useFetch<StatsDto>('/api/stats', {
    key: 'stats',
    server: false,
    query: {
      range: 'week',
      timeZone: import.meta.client ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    },
    default: (): StatsDto => ({ range: 'week', days: [] }),
  })

  const days = computed(() =>
    data.value.days.map((day, index, all) => {
      // Noon UTC, formatted in UTC: the weekday of the date itself, whatever the browser's zone.
      const at = new Date(`${day.date}T12:00:00Z`)
      const isToday = index === all.length - 1
      return {
        ...day,
        isToday,
        shortLabel: isToday ? 'Today' : shortDay.format(at),
        longLabel: isToday ? `Today, ${longDay.format(at)}` : longDay.format(at),
      }
    }),
  )
  const today = computed(() => {
    const last = data.value.days.at(-1)
    return { focusMinutes: last?.focusMinutes ?? 0, focusSessions: last?.focusSessions ?? 0 }
  })
  const week = computed(() => ({
    focusMinutes: data.value.days.reduce((sum, day) => sum + day.focusMinutes, 0),
    focusSessions: data.value.days.reduce((sum, day) => sum + day.focusSessions, 0),
  }))

  return { days, today, week, pending }
}

export type StatsDay = Awaited<ReturnType<typeof useStats>>['days']['value'][number]
