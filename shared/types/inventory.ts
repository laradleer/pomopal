import type { ItemSlot } from '../constants'

/** An item the user owns. `id` is the inventory row (used to equip), `itemId` the shop item. */
export type InventoryItemDto = {
  id: number
  itemId: number
  assetKey: string
  name: string
  slot: ItemSlot
  equipped: boolean
}

/** GET /api/inventory (and the answer of equip / unequip): owned items grouped by slot. */
export type InventoryDto = Record<ItemSlot, InventoryItemDto[]>
