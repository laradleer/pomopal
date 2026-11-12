import type { PetMood, PetSpecies } from '../constants'

/** The response of GET /api/me: who is signed in, their progress and their pet. */
export type Me = {
  user: MeUser
  profile: MeProfile
  /** `null` until onboarding is done. */
  pet: MePet | null
}

export type MeUser = {
  id: string
  name: string
  email: string
  image: string | null
}

export type MeProfile = {
  displayName: string | null
  xp: number
  level: number
  coins: number
  streakDays: number
  /** `YYYY-MM-DD`, or `null` before the first completed session. */
  lastStudyDate: string | null
  focusMin: number
  shortBreakMin: number
  longBreakMin: number
}

export type MePet = {
  id: number
  species: PetSpecies
  name: string
  mood: PetMood
}
