import { describe, expect, it } from 'vitest'
import { petCreateSchema, petRenameSchema } from './pet'

const messages = (input: unknown) =>
  petCreateSchema.safeParse(input).error?.issues.map((issue) => issue.message) ?? []

describe('petCreateSchema', () => {
  it('accepts a cat or a dog with a trimmed name', () => {
    expect(petCreateSchema.parse({ species: 'dog', name: '  Rex ' })).toEqual({
      species: 'dog',
      name: 'Rex',
    })
  })

  it('asks for a species and a name when both are missing', () => {
    expect(messages({ species: undefined, name: '   ' })).toEqual([
      'Pick a cat or a dog.',
      'Give your pet a name.',
    ])
  })

  it('rejects other animals', () => {
    expect(messages({ species: 'bird', name: 'Tweety' })).toEqual(['Pick a cat or a dog.'])
  })

  it('allows exactly 20 characters, not 21', () => {
    expect(messages({ species: 'cat', name: 'a'.repeat(20) })).toEqual([])
    expect(messages({ species: 'cat', name: 'a'.repeat(21) })).toEqual([
      'Names can be up to 20 characters.',
    ])
  })
})

describe('petRenameSchema', () => {
  it('only needs a name, trimmed', () => {
    expect(petRenameSchema.parse({ name: ' Biscuit ' })).toEqual({ name: 'Biscuit' })
  })

  it('uses the same name rules as onboarding', () => {
    expect(petRenameSchema.safeParse({ name: '' }).success).toBe(false)
    expect(petRenameSchema.safeParse({ name: 'x'.repeat(21) }).success).toBe(false)
  })
})
