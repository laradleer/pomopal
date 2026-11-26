import { describe, expect, it } from 'vitest'
import { achievementsQuerySchema } from './achievement'

describe('achievementsQuerySchema', () => {
  it('accepts a real time zone, or none', () => {
    expect(achievementsQuerySchema.parse({ timeZone: 'Europe/Istanbul' })).toEqual({
      timeZone: 'Europe/Istanbul',
    })
    expect(achievementsQuerySchema.parse({})).toEqual({})
  })

  it('refuses an unknown time zone', () => {
    expect(achievementsQuerySchema.safeParse({ timeZone: 'Mars/Olympus' }).success).toBe(false)
  })
})
