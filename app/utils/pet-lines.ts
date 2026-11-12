import type { PetMood } from '#shared/constants'
import type { TimerPhase } from '#shared/timer'

/**
 * What the pet says. Short, warm, never blaming (docs/04-design-system.md → Voice).
 * One fixed line per situation, so the server and the browser render the same text.
 */
const PHASE_LINES: Partial<Record<TimerPhase, string>> = {
  focusing: "Shh, I'm focusing with you.",
  paused: "Take your time. I'll wait right here.",
  shortBreak: 'Stretch and drink some water. Back in a few minutes!',
  longBreak: 'Four sessions! You earned a real rest.',
}

const IDLE_LINES: Record<PetMood, string> = {
  neutral: "Ready when you are. Let's start a focus session!",
  happy: 'That was great! Ready for another round?',
  sad: "Oops, that one didn't count. Want to try again?",
  sleepy: 'Yawn… one more round?',
}

export function petLine(phase: TimerPhase, mood: PetMood): string {
  return PHASE_LINES[phase] ?? IDLE_LINES[mood]
}
