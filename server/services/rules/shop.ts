import type { ErrorCode } from '#shared/errors'

/** What decides whether an item can be bought. */
export type ItemPrice = { price: number; requiredLevel: number }
/** What the buyer brings: their level and coins. */
export type Buyer = { level: number; coins: number }

export type ShopItemFlags = {
  owned: boolean
  locked: boolean
  affordable: boolean
}

export type BuyCheck =
  | { ok: true }
  | { ok: false; code: Extract<ErrorCode, 'ALREADY_OWNED' | 'LEVEL_TOO_LOW' | 'NOT_ENOUGH_COINS'> }

/** An item is unlocked once the buyer reaches its required level. */
export function isUnlockedFor(item: ItemPrice, level: number): boolean {
  return level >= item.requiredLevel
}

/** The flags the shop shows on every tile. */
export function shopItemFlags(item: ItemPrice, buyer: Buyer, owned: boolean): ShopItemFlags {
  return {
    owned,
    locked: !isUnlockedFor(item, buyer.level),
    affordable: buyer.coins >= item.price,
  }
}

/** Whether the buyer may buy the item. Checked in this order: already owned, level, coins. */
export function canBuy(item: ItemPrice, buyer: Buyer, owned: boolean): BuyCheck {
  if (owned) return { ok: false, code: 'ALREADY_OWNED' }
  if (!isUnlockedFor(item, buyer.level)) return { ok: false, code: 'LEVEL_TOO_LOW' }
  if (buyer.coins < item.price) return { ok: false, code: 'NOT_ENOUGH_COINS' }
  return { ok: true }
}
