import { describe, expect, it } from 'vitest'
import { signInSchema, signUpSchema } from './auth'

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message

describe('signUpSchema', () => {
  it('accepts a valid sign-up and trims name and email', () => {
    const result = signUpSchema.safeParse({
      name: '  Kit ',
      email: ' kit@example.com ',
      password: 'correct-horse',
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      name: 'Kit',
      email: 'kit@example.com',
      password: 'correct-horse',
    })
  })

  it('rejects a short password with a friendly message', () => {
    const result = signUpSchema.safeParse({
      name: 'Kit',
      email: 'kit@example.com',
      password: 'abc',
    })
    expect(firstError(result)).toBe('Use at least 8 characters.')
  })

  it('rejects an empty name and an invalid email', () => {
    const result = signUpSchema.safeParse({ name: ' ', email: 'kit', password: 'correct-horse' })
    const messages = result.error?.issues.map((issue) => issue.message)
    expect(messages).toEqual([
      'Tell us what to call you.',
      "That doesn't look like an email address.",
    ])
  })
})

describe('signInSchema', () => {
  it('asks for both fields', () => {
    const result = signInSchema.safeParse({ email: '', password: '' })
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'Enter your email.',
      'Enter your password.',
    ])
  })
})
