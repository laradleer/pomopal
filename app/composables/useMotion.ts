/**
 * Motion for the whole app (docs/04-design-system.md → Motion).
 *
 *   const { isReduced, play } = useMotion()
 *   play(element, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }], { duration: 'quick' })
 *
 * - `isReduced` is true when the OS asks for less motion or the "Animations" switch in settings
 *   is off. CSS follows the same state through `data-motion="reduced"` on <html> (and Tailwind's
 *   motion-safe / motion-reduce variants), set by plugins/motion.client.ts.
 * - `play()` runs a Web Animation with the design tokens from main.css and does nothing (returns
 *   null) when motion is reduced, so callers never need their own checks.
 */
export type MotionDuration = 'tap' | 'quick' | 'move' | 'celebrate'
export type MotionEase = 'pop' | 'soft' | 'in-out-soft' | 'spring'

type PlayOptions = Omit<KeyframeAnimationOptions, 'duration' | 'easing'> & {
  duration?: MotionDuration | number
  easing?: MotionEase
}

const STORAGE_KEY = 'pomopal:animations'

/** Reads a motion token from main.css once, e.g. --duration-move → 320. */
const tokenCache = new Map<string, string>()
function cssToken(name: string): string {
  let value = tokenCache.get(name)
  if (value === undefined) {
    value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    tokenCache.set(name, value)
  }
  return value
}

export function durationMs(duration: MotionDuration | number): number {
  if (typeof duration === 'number') return duration
  return Number.parseFloat(cssToken(`--duration-${duration}`)) || 0
}

export function useMotion() {
  /** The user's switch in settings (remembered in this browser). */
  const isEnabled = useState('motion:enabled', () => true)
  /** The OS setting (prefers-reduced-motion). */
  const prefersReduced = useState('motion:prefers-reduced', () => false)

  const isReduced = computed(() => !isEnabled.value || prefersReduced.value)

  function setEnabled(value: boolean) {
    isEnabled.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  }

  /** Called once by plugins/motion.client.ts. */
  function restore() {
    try {
      isEnabled.value = localStorage.getItem(STORAGE_KEY) !== 'off'
    } catch {
      isEnabled.value = true
    }
  }

  function play(
    element: Element | null | undefined,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: PlayOptions = {},
  ): Animation | null {
    if (import.meta.server || isReduced.value || !element) return null
    const { duration = 'move', easing = 'soft', ...rest } = options
    return element.animate(keyframes, {
      ...rest,
      duration: durationMs(duration),
      easing: cssToken(`--ease-${easing}`) || 'ease-out',
    })
  }

  return {
    isEnabled: readonly(isEnabled),
    prefersReduced: readonly(prefersReduced),
    isReduced,
    setEnabled,
    restore,
    play,
  }
}
