import { describe, expect, it } from 'vitest'
import { ITEM_SLOTS } from '../../shared/constants'
import { SHOP_ITEMS } from './shop-items'

describe('SHOP_ITEMS', () => {
  it('has 8 to 10 items', () => {
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(8)
    expect(SHOP_ITEMS.length).toBeLessThanOrEqual(10)
  })

  it('uses each asset key once', () => {
    const keys = SHOP_ITEMS.map((item) => item.assetKey)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('has items for every slot', () => {
    for (const slot of ITEM_SLOTS) {
      expect(SHOP_ITEMS.some((item) => item.slot === slot)).toBe(true)
    }
  })

  it('has something a new student can buy', () => {
    expect(SHOP_ITEMS.some((item) => item.slot === 'head' && item.requiredLevel === 1)).toBe(true)
  })

  it('has valid prices and levels', () => {
    for (const item of SHOP_ITEMS) {
      expect(item.price).toBeGreaterThanOrEqual(0)
      expect(item.requiredLevel).toBeGreaterThanOrEqual(1)
    }
  })
})
