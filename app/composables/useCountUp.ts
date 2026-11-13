import type { MotionDuration } from '~/composables/useMotion'

/**
 * A number that counts to its new value instead of jumping, e.g. XP after a session.
 *
 *   const shownXp = useCountUp(() => profile.progress.xpIntoLevel)
 *
 * Counts only in the browser, and only up: going down (a new level, spending coins) and reduced
 * motion change the number at once.
 */
export function useCountUp(source: () => number, duration: MotionDuration | number = 'celebrate') {
  const motion = useMotion()
  const shown = ref(source())
  let frame = 0

  watch(source, (target, previous) => {
    cancelAnimationFrame(frame)
    if (import.meta.server || motion.isReduced.value || target < previous) {
      shown.value = target
      return
    }
    const from = shown.value
    const total = durationMs(duration)
    const startedAt = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / total)
      // Ease out: fast at first, settling on the new value.
      shown.value = Math.round(from + (target - from) * (1 - (1 - progress) ** 3))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  })

  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return shown
}
