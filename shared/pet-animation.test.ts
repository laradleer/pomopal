import { describe, expect, it } from 'vitest'
import {
  PET_ACTION_QUEUE_MAX,
  POKE_WINDOW_MS,
  enqueueAction,
  isPokeFrenzy,
  poseForPhase,
} from './pet-animation'

describe('poseForPhase', () => {
  it('reads quietly while focusing, also when paused', () => {
    expect(poseForPhase('focusing')).toBe('focusing')
    expect(poseForPhase('paused')).toBe('focusing')
  })

  it('rests during both breaks and idles otherwise', () => {
    expect(poseForPhase('shortBreak')).toBe('resting')
    expect(poseForPhase('longBreak')).toBe('resting')
    expect(poseForPhase('idle')).toBe('idle')
  })
})

describe('enqueueAction', () => {
  it('plays reactions in order', () => {
    expect(enqueueAction(['sad'], 'celebrate')).toEqual(['sad', 'celebrate'])
  })

  it('plays the same reaction twice in a row only once', () => {
    expect(enqueueAction(['celebrate'], 'celebrate')).toEqual(['celebrate'])
  })

  it('drops the oldest reaction when the queue is full', () => {
    const full = enqueueAction(enqueueAction([], 'celebrate'), 'sad')
    expect(full).toHaveLength(PET_ACTION_QUEUE_MAX)
    expect(enqueueAction(full, 'celebrate')).toEqual(['sad', 'celebrate'])
  })

  it('never changes the queue it was given', () => {
    const queue = ['sad'] as const
    enqueueAction(queue, 'celebrate')
    expect(queue).toEqual(['sad'])
  })
})

describe('isPokeFrenzy', () => {
  it('gets dizzy from five quick taps', () => {
    expect(isPokeFrenzy([0, 300, 600, 900, 1200], 1200)).toBe(true)
  })

  it('stays calm with four taps, or with taps spread out', () => {
    expect(isPokeFrenzy([0, 300, 600, 900], 900)).toBe(false)
    expect(isPokeFrenzy([0, 1000, 2000, 3000, 4000], 4000)).toBe(false)
  })

  it('only counts taps inside the window', () => {
    const now = 10_000
    const old = now - POKE_WINDOW_MS - 1
    expect(isPokeFrenzy([old, now - 400, now - 300, now - 200, now], now)).toBe(false)
  })
})
