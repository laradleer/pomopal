import { getErrorCode } from '#shared/errors'
import type { ErrorCode } from '#shared/errors'

/**
 * What the user reads when something fails. Short, warm, never blaming (the pet is talking).
 * Every API error code needs a message here; TypeScript enforces that.
 */
const API_ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: 'Please log in again.',
  FORBIDDEN: "That isn't available to you.",
  NOT_FOUND: "Hmm, I couldn't find that.",
  VALIDATION_FAILED: 'Something in the form needs another look.',
  PET_ALREADY_EXISTS: 'You already have a pet!',
  SESSION_NOT_RUNNING: 'That session has already ended.',
  ALREADY_OWNED: 'You already own this one.',
  SESSION_TOO_SHORT: 'That session ended a little too early to count.',
  LEVEL_TOO_LOW: 'Level up a bit more to unlock this.',
  NOT_ENOUGH_COINS: 'Not enough coins yet. One more session?',
}

/** Better Auth error codes we expect on the login and sign-up pages. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match. Try again?",
  USER_ALREADY_EXISTS: 'There is already an account with this email. Want to log in instead?',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'There is already an account with this email. Want to log in instead?',
  INVALID_EMAIL: "That doesn't look like an email address.",
  PASSWORD_TOO_SHORT: 'Your password needs at least 8 characters.',
  PASSWORD_TOO_LONG: 'That password is too long.',
}

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.'

/** Message for a failed call to our own API ($fetch / useFetch error). */
export function apiErrorMessage(error: unknown): string {
  const code = getErrorCode(error)
  return code ? API_ERROR_MESSAGES[code] : GENERIC_ERROR_MESSAGE
}

/** Message for an error returned by the Better Auth client. */
export function authErrorMessage(error: { code?: string; status?: number } | null): string {
  if (error?.status === 429) return 'Too many tries. Take a short break, then try again.'
  return (error?.code && AUTH_ERROR_MESSAGES[error.code]) || GENERIC_ERROR_MESSAGE
}
