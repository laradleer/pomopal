import { describe, expect, it } from 'vitest'
import { isSessionValid } from './session'

const start = new Date('2026-11-15T10:00:00Z')
const at = (time: string) => new Date(`2026-11-15T${time}Z`)

describe('isSessionValid', () => {
  it('accepts a session that ran the full 25 minutes', () => {
    expect(isSessionValid(start, 25, at('10:25:00'))).toBe(true)
  })

  it('accepts a session that ends exactly 30 seconds early', () => {
    expect(isSessionValid(start, 25, at('10:24:30'))).toBe(true)
  })

  it('rejects a session that ends 31 seconds early', () => {
    expect(isSessionValid(start, 25, at('10:24:29'))).toBe(false)
  })

  it('rejects a session completed right after starting', () => {
    expect(isSessionValid(start, 25, at('10:00:05'))).toBe(false)
  })

  it('accepts a session that took longer because it was paused', () => {
    expect(isSessionValid(start, 25, at('10:40:00'))).toBe(true)
  })

  it('uses the planned length of each session', () => {
    expect(isSessionValid(start, 5, at('10:04:30'))).toBe(true)
    expect(isSessionValid(start, 50, at('10:30:00'))).toBe(false)
  })
})
