import { describe, expect, it } from 'vitest'
import { taskCreateSchema, taskIdParamsSchema, taskUpdateSchema } from './task'

const firstMessage = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message

describe('taskCreateSchema', () => {
  it('trims the title', () => {
    expect(taskCreateSchema.parse({ title: '  Read chapter 3 ' })).toEqual({
      title: 'Read chapter 3',
    })
  })

  it('asks for a name when the title is blank', () => {
    expect(firstMessage(taskCreateSchema.safeParse({ title: '   ' }))).toBe('Give the task a name.')
  })

  it('refuses titles over 120 characters', () => {
    expect(taskCreateSchema.safeParse({ title: 'x'.repeat(121) }).success).toBe(false)
    expect(taskCreateSchema.safeParse({ title: 'x'.repeat(120) }).success).toBe(true)
  })
})

describe('taskUpdateSchema', () => {
  it('accepts a new title, a done flag, or both', () => {
    expect(taskUpdateSchema.parse({ done: true })).toEqual({ done: true })
    expect(taskUpdateSchema.parse({ title: 'Essay' })).toEqual({ title: 'Essay' })
    expect(taskUpdateSchema.parse({ title: 'Essay', done: false })).toEqual({
      title: 'Essay',
      done: false,
    })
  })

  it('refuses an empty change', () => {
    expect(firstMessage(taskUpdateSchema.safeParse({}))).toBe('Nothing to change.')
  })
})

describe('taskIdParamsSchema', () => {
  it('reads a positive id from the URL', () => {
    expect(taskIdParamsSchema.parse({ id: '12' })).toEqual({ id: 12 })
    expect(taskIdParamsSchema.safeParse({ id: 'x' }).success).toBe(false)
  })
})
