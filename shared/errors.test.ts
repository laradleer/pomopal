import { describe, expect, it } from 'vitest'
import { errorStatus, getErrorCode, isErrorCode } from './errors'

describe('isErrorCode', () => {
  it('accepts every known code', () => {
    for (const code of Object.keys(errorStatus)) expect(isErrorCode(code)).toBe(true)
  })

  it('rejects unknown values', () => {
    expect(isErrorCode('NOPE')).toBe(false)
    expect(isErrorCode('toString')).toBe(false)
    expect(isErrorCode(42)).toBe(false)
    expect(isErrorCode(undefined)).toBe(false)
  })
})

describe('getErrorCode', () => {
  it('reads the code from a $fetch error', () => {
    const error = { data: { statusCode: 422, data: { code: 'NOT_ENOUGH_COINS' } } }
    expect(getErrorCode(error)).toBe('NOT_ENOUGH_COINS')
  })

  it('returns undefined when there is no known code', () => {
    expect(getErrorCode(new Error('network down'))).toBeUndefined()
    expect(getErrorCode({ data: { data: { code: 'SOMETHING_ELSE' } } })).toBeUndefined()
    expect(getErrorCode(null)).toBeUndefined()
  })
})
