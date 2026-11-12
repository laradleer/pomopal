import type { ItemSlot } from '../constants'

/** An item in GET /api/shop, with what it means for the signed-in user. */
export type ShopItemDto = {
  id: number
  /** Stable name of the drawing, e.g. "party-hat". */
  assetKey: string
  name: string
  slot: ItemSlot
  price: number
  requiredLevel: number
  owned: boolean
  /** The user's level is still below `requiredLevel`. */
  locked: boolean
  /** The user has enough coins (whatever their level). */
  affordable: boolean
}

/** POST /api/shop/:itemId/buy */
export type BuyResult = {
  /** The coin balance after paying. */
  coins: number
  /** The new inventory row, so the item can be worn right away. */
  inventoryItemId: number
}
