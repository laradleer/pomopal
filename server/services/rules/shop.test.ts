import { describe, expect, it } from 'vitest'
import { canBuy, isUnlockedFor, shopItemFlags } from './shop'

const partyHat = { price: 30, requiredLevel: 1 }
const wizardHat = { price: 150, requiredLevel: 5 }

describe('isUnlockedFor', () => {
  it('unlocks an item at exactly its required level', () => {
    expect(isUnlockedFor(wizardHat, 4)).toBe(false)
    expect(isUnlockedFor(wizardHat, 5)).toBe(true)
    expect(isUnlockedFor(wizardHat, 9)).toBe(true)
  })
})

describe('shopItemFlags', () => {
  it('marks an item as affordable when the coins cover the price exactly', () => {
    expect(shopItemFlags(partyHat, { level: 1, coins: 30 }, false)).toEqual({
      owned: false,
      locked: false,
      affordable: true,
    })
  })

  it('marks a locked item even when the coins would be enough', () => {
    expect(shopItemFlags(wizardHat, { level: 2, coins: 500 }, false)).toEqual({
      owned: false,
      locked: true,
      affordable: true,
    })
  })

  it('keeps the owned flag as given', () => {
    expect(shopItemFlags(partyHat, { level: 1, coins: 0 }, true).owned).toBe(true)
  })
})

describe('canBuy', () => {
  it('lets a buyer with the level and the coins buy', () => {
    expect(canBuy(partyHat, { level: 1, coins: 30 }, false)).toEqual({ ok: true })
  })

  it('refuses an item that is already owned, before anything else', () => {
    expect(canBuy(wizardHat, { level: 1, coins: 0 }, true)).toEqual({
      ok: false,
      code: 'ALREADY_OWNED',
    })
  })

  it('refuses a locked item before looking at the coins', () => {
    expect(canBuy(wizardHat, { level: 4, coins: 0 }, false)).toEqual({
      ok: false,
      code: 'LEVEL_TOO_LOW',
    })
  })

  it('refuses when the coins are one short', () => {
    expect(canBuy(partyHat, { level: 1, coins: 29 }, false)).toEqual({
      ok: false,
      code: 'NOT_ENOUGH_COINS',
    })
  })
})
