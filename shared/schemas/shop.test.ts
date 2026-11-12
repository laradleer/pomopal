import { describe, expect, it } from 'vitest'
import { shopItemParamsSchema } from './shop'

describe('shopItemParamsSchema', () => {
  it('reads the item id from the URL', () => {
    expect(shopItemParamsSchema.parse({ itemId: '7' })).toEqual({ itemId: 7 })
  })

  it('rejects ids that are not positive whole numbers', () => {
    for (const itemId of ['abc', '0', '-3', '1.5']) {
      expect(shopItemParamsSchema.safeParse({ itemId }).success).toBe(false)
    }
  })
})
