import { describe, expect, it } from 'vitest'
import { emptyInventory, groupBySlot } from './inventory'
import type { InventoryItemDto } from './types/inventory'

const item = (id: number, slot: InventoryItemDto['slot']): InventoryItemDto => ({
  id,
  itemId: id,
  assetKey: `item-${id}`,
  name: `Item ${id}`,
  slot,
  equipped: false,
})

describe('groupBySlot', () => {
  it('has every slot, even with nothing owned', () => {
    expect(groupBySlot([])).toEqual(emptyInventory())
  })

  it('puts each item in its slot and keeps the order', () => {
    const inventory = groupBySlot([item(1, 'head'), item(2, 'neck'), item(3, 'head')])
    expect(inventory.head.map((owned) => owned.id)).toEqual([1, 3])
    expect(inventory.neck.map((owned) => owned.id)).toEqual([2])
    expect(inventory.face).toEqual([])
  })
})
