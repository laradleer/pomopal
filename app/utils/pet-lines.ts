import type { PetMood, PetSpecies } from '#shared/constants'
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

// ---- Playing with the pet (#76) ----

const TAP_LINES = [
  'Hehe, that tickles!',
  'Hi there! Ready to study together?',
  'Boop! You found my nose.',
  'I like it when you visit me.',
  'Wheee! Again, again!',
]

/** What the pet says when it is tapped: one of a few friendly lines. */
export function tapLine(): string {
  return TAP_LINES[Math.floor(Math.random() * TAP_LINES.length)] ?? 'Hehe, that tickles!'
}

export function strokeLine(species: PetSpecies): string {
  return species === 'cat' ? 'Purrr… that feels so nice.' : 'Wag wag! That feels so nice.'
}

export const DIZZY_LINE = 'Whoa… the room is spinning!'
export const WAKE_LINE = 'Yawn… oh, hi! I was just resting my eyes.'
export const SLEEPING_LINE = 'Zzz… (tap me to wake me up)'
