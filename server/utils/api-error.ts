import { errorStatus } from '#shared/errors'
import type { ApiErrorData, ErrorCode } from '#shared/errors'

/**
 * Creates a typed API error. Always `throw` the result:
 *
 *   throw apiError('NOT_ENOUGH_COINS')
 *
 * The status comes from `shared/errors.ts`, so the same code always gets the same status.
 */
export function apiError(code: ErrorCode, message: string = code) {
  return createError<ApiErrorData>({
    statusCode: errorStatus[code],
    statusMessage: code,
    message,
    data: { code },
  })
}
