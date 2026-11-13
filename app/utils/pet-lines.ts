import type { PetMood } from '#shared/constants'
import type { TimerPhase } from '#shared/timer'
import type { ShopItemDto } from '#shared/types/shop'

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

/** What the pet says about the item being previewed in the shop. */
export function shopLine(item: ShopItemDto | null, coins: number): string {
  if (!item) return 'Tap something to see how it looks on me!'
  const name = item.name.toLowerCase()
  if (item.owned) return `I already have the ${name}! I can wear it from the Pet page.`
  if (item.locked) return `The ${name} unlocks at level ${item.requiredLevel}. Keep studying!`
  if (!item.affordable) {
    return `I love the ${name}! We need ${item.price - coins} more coins. One more session?`
  }
  return `Ooh, the ${name}! It costs ${item.price} coins.`
}

/** What the pet says right after buying an item. */
export function boughtLine(item: ShopItemDto): string {
  return `Yay, thank you! Put the ${item.name.toLowerCase()} on me from the Pet page.`
}
