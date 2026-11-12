import { describe, expect, it } from 'vitest'
import { sessionIdParamsSchema, sessionStartSchema } from './session'

const messages = (input: unknown) =>
  sessionStartSchema.safeParse(input).error?.issues.map((issue) => issue.message) ?? []

describe('sessionStartSchema', () => {
  it('accepts a 25-minute focus session with a task', () => {
    expect(sessionStartSchema.parse({ mode: 'focus', plannedMin: 25, taskId: 3 })).toEqual({
      mode: 'focus',
      plannedMin: 25,
      taskId: 3,
    })
  })

  it('checks the length against the limits of each mode', () => {
    expect(messages({ mode: 'focus', plannedMin: 10 })).toEqual([
      'This session can last 15 to 60 minutes.',
    ])
    expect(messages({ mode: 'short', plannedMin: 5 })).toEqual([])
    expect(messages({ mode: 'short', plannedMin: 25 })).toEqual([
      'This session can last 3 to 15 minutes.',
    ])
    expect(messages({ mode: 'long', plannedMin: 30 })).toEqual([])
  })

  it('rejects unknown modes and fractional minutes', () => {
    expect(messages({ mode: 'nap', plannedMin: 25 })).toContain('Unknown session mode.')
    expect(sessionStartSchema.safeParse({ mode: 'focus', plannedMin: 25.5 }).success).toBe(false)
  })
})

describe('sessionIdParamsSchema', () => {
  it('turns the route param into a number', () => {
    expect(sessionIdParamsSchema.parse({ id: '42' })).toEqual({ id: 42 })
  })

  it('rejects ids that are not positive whole numbers', () => {
    for (const id of ['abc', '0', '-1', '1.5']) {
      expect(sessionIdParamsSchema.safeParse({ id }).success).toBe(false)
    }
  })
})
