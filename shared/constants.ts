/**
 * Values used by both the server and the browser: database enums, check constraints,
 * zod schemas and UI all read them from here, so they can never drift apart.
 */

export const PET_SPECIES = ['cat', 'dog'] as const
export type PetSpecies = (typeof PET_SPECIES)[number]

export const PET_MOODS = ['happy', 'sleepy', 'sad', 'neutral'] as const
export type PetMood = (typeof PET_MOODS)[number]

export const SESSION_MODES = ['focus', 'short', 'long'] as const
export type SessionMode = (typeof SESSION_MODES)[number]

export const SESSION_STATUSES = ['running', 'completed', 'abandoned'] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const ITEM_SLOTS = ['head', 'face', 'neck', 'background'] as const
export type ItemSlot = (typeof ITEM_SLOTS)[number]

/** Timer lengths in minutes: allowed range and default. */
export const TIMER_LIMITS = {
  focus: { min: 15, max: 60, default: 25 },
  shortBreak: { min: 3, max: 15, default: 5 },
  longBreak: { min: 10, max: 30, default: 15 },
} as const

export const PET_NAME_MAX_LENGTH = 20
export const TASK_TITLE_MAX_LENGTH = 120
