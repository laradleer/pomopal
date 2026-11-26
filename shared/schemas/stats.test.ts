import { describe, expect, it } from 'vitest'
import { statsQuerySchema } from './stats'

describe('statsQuerySchema', () => {
  it('defaults to the week', () => {
    expect(statsQuerySchema.parse({})).toEqual({ range: 'week' })
  })

  it('accepts the week and a real time zone', () => {
    expect(statsQuerySchema.parse({ range: 'week', timeZone: 'Europe/Istanbul' })).toEqual({
      range: 'week',
      timeZone: 'Europe/Istanbul',
    })
  })

  it('refuses an unknown range or time zone', () => {
    expect(statsQuerySchema.safeParse({ range: 'year' }).success).toBe(false)
    expect(statsQuerySchema.safeParse({ timeZone: 'Mars/Olympus' }).success).toBe(false)
  })
})
