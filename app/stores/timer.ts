import type { SessionMode } from '#shared/constants'
import { formatClock, initialTimerState, timerRemainingMs, timerTransition } from '#shared/timer'
import type { TimerEvent, TimerPhase, TimerState } from '#shared/timer'
import type { CompleteSessionResult, FocusSessionDto } from '#shared/types/session'

const TICK_MS = 250

const PHASE_LABEL: Record<TimerPhase, string> = {
  idle: 'Ready',
  focusing: 'Focus',
  paused: 'Paused',
  shortBreak: 'Short break',
  longBreak: 'Long break',
}

/**
 * The Pomodoro timer. Transitions come from the pure machine in shared/timer.ts; this store adds
 * the clock and the server calls. The clock never waits for the server: focus sessions are saved
 * in the background, and a failed save only shows a toast.
 */
export const useTimerStore = defineStore('timer', () => {
  const profile = useProfileStore()
  const pet = usePetStore()
  const user = useUserStore()
  const toast = useToast()

  const durations = computed(() => profile.timerMinutes)
  const state = ref<TimerState>(initialTimerState(durations.value))
  const now = ref(Date.now())
  /** Last result of a focus session, for the pet's mood (#20). */
  const lastResult = ref<'completed' | 'abandoned' | null>(null)
  /** Rewards from the last completed session, for the reward toast (#19). */
  const lastRewards = ref<CompleteSessionResult['rewards'] | null>(null)

  /** Resolves to the server id of the running focus session (null if saving failed). */
  let savedSession: Promise<number | null> | null = null
  let ticker: ReturnType<typeof setInterval> | undefined

  const phase = computed(() => state.value.phase)
  const mode = computed(() => state.value.mode)
  const completedInCycle = computed(() => state.value.completedInCycle)
  const remainingMs = computed(() => timerRemainingMs(state.value, now.value))
  const progress = computed(() => 1 - remainingMs.value / state.value.durationMs)
  const clock = computed(() => formatClock(remainingMs.value))
  const phaseLabel = computed(() => PHASE_LABEL[state.value.phase])
  /** Anything but idle: a session or break is going on (also while paused). */
  const isActive = computed(() => state.value.phase !== 'idle')

  function send(event: TimerEvent) {
    state.value = timerTransition(state.value, event, durations.value)
    now.value = Date.now()
    syncTicker()
  }

  // ---- Clock ----

  function syncTicker() {
    if (import.meta.server) return
    const shouldTick = state.value.endsAt !== null
    if (shouldTick && !ticker) ticker = setInterval(tick, TICK_MS)
    if (!shouldTick && ticker) {
      clearInterval(ticker)
      ticker = undefined
    }
  }

  function tick() {
    now.value = Date.now()
    if (state.value.endsAt !== null && now.value >= state.value.endsAt) onTimeUp()
  }

  // Browsers slow down timers in background tabs; catch up as soon as the tab is visible again.
  if (import.meta.client) {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tick()
    })
  }

  // New settings apply to the next session.
  watch(durations, () => {
    if (state.value.phase === 'idle') send({ type: 'selectMode', mode: state.value.mode })
  })

  // ---- Actions ----

  function selectMode(next: SessionMode) {
    send({ type: 'selectMode', mode: next })
  }

  function start() {
    const startingMode = state.value.mode
    send({ type: 'start', now: Date.now() })
    if (startingMode === 'focus') savedSession = saveStart()
  }

  function pause() {
    send({ type: 'pause', now: Date.now() })
  }

  function resume() {
    send({ type: 'resume', now: Date.now() })
  }

  function quit() {
    const wasFocus = state.value.phase === 'focusing' || state.value.phase === 'paused'
    send({ type: 'quit' })
    if (!wasFocus) return
    lastResult.value = 'abandoned'
    void saveEnd('abandon')
  }

  function skipBreak() {
    send({ type: 'skip' })
  }

  function onTimeUp() {
    const finished = state.value.phase
    send({ type: 'timeUp' })
    if (finished === 'focusing') {
      lastResult.value = 'completed'
      toast.show(`Nice work! ${pet.name} is proud of you. Time for a break.`, {
        tone: 'success',
        icon: 'sparkles',
      })
      void saveEnd('complete')
    } else {
      toast.show('Break is over. Ready for another round?', { icon: 'timer' })
    }
  }

  // ---- Server ----

  async function saveStart(): Promise<number | null> {
    try {
      const session = await $fetch<FocusSessionDto>('/api/sessions', {
        method: 'POST',
        body: { mode: 'focus', plannedMin: durations.value.focus },
      })
      return session.id
    } catch (error) {
      toast.show(`${apiErrorMessage(error)} This session won't be saved.`, { tone: 'error' })
      return null
    }
  }

  async function saveEnd(action: 'complete' | 'abandon') {
    const id = await savedSession
    savedSession = null
    if (id === null) return
    try {
      if (action === 'complete') {
        const result = await $fetch<CompleteSessionResult>(`/api/sessions/${id}/complete`, {
          method: 'POST',
          // The streak counts calendar days in the user's own time zone.
          body: { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        })
        lastRewards.value = result.rewards
      } else {
        await $fetch<FocusSessionDto>(`/api/sessions/${id}/abandon`, { method: 'POST' })
      }
      // Profile (XP, coins, streak) and pet mood changed on the server.
      await user.refresh()
    } catch (error) {
      toast.show(apiErrorMessage(error), { tone: 'error' })
    }
  }

  return {
    state,
    now,
    lastResult,
    lastRewards,
    phase,
    mode,
    completedInCycle,
    remainingMs,
    progress,
    clock,
    phaseLabel,
    isActive,
    selectMode,
    start,
    pause,
    resume,
    quit,
    skipBreak,
  }
})
