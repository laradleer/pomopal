/**
 * Every error code the API can return, with its HTTP status.
 * The server throws them with `apiError(code)`; the client reads them with `getErrorCode(error)`
 * and turns them into a friendly pet message.
 *
 * Status rules:
 * - 401/403/404: who you are and what you can see
 * - 409: it already exists, or it is in the wrong state
 * - 422: the request is valid, but a game rule says no
 */
export const errorStatus = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 400,
  PET_ALREADY_EXISTS: 409,
  SESSION_NOT_RUNNING: 409,
  ALREADY_OWNED: 409,
  SESSION_TOO_SHORT: 422,
  LEVEL_TOO_LOW: 422,
  NOT_ENOUGH_COINS: 422,
} as const satisfies Record<string, number>

export type ErrorCode = keyof typeof errorStatus

/** The `data` field of every API error response. */
export type ApiErrorData = { code: ErrorCode }

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && Object.hasOwn(errorStatus, value)
}

/**
 * Reads the error code from a failed `$fetch` / `useFetch` call.
 * Returns `undefined` for network errors or errors without a known code.
 */
export function getErrorCode(error: unknown): ErrorCode | undefined {
  const code = (error as { data?: { data?: { code?: unknown } } } | null | undefined)?.data?.data
    ?.code
  return isErrorCode(code) ? code : undefined
}
