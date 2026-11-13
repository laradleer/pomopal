import { describe, expect, it } from 'vitest'
import { todayQuerySchema } from './today'

describe('todayQuerySchema', () => {
  it('accepts a real time zone, or none', () => {
    expect(todayQuerySchema.parse({ timeZone: 'Europe/Istanbul' })).toEqual({
      timeZone: 'Europe/Istanbul',
    })
    expect(todayQuerySchema.parse({})).toEqual({})
  })

  it('refuses an unknown time zone', () => {
    expect(todayQuerySchema.safeParse({ timeZone: 'Mars/Olympus' }).success).toBe(false)
  })
})
