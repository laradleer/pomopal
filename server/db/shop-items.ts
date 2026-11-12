import type { NewShopItem } from './schema'

/**
 * Everything in the shop. `assetKey` is the stable id: the seed matches on it, and the
 * frontend uses it to find the item's drawing. Change prices and levels here, never in SQL.
 *
 * Pacing: a 25-minute session pays 10 coins, a level-up pays 50, so a level 1 student can
 * buy the party hat after 3 sessions.
 */
export const SHOP_ITEMS = [
  { assetKey: 'party-hat', name: 'Party hat', slot: 'head', price: 30, requiredLevel: 1 },
  { assetKey: 'beanie', name: 'Cozy beanie', slot: 'head', price: 60, requiredLevel: 2 },
  { assetKey: 'wizard-hat', name: 'Wizard hat', slot: 'head', price: 150, requiredLevel: 5 },
  { assetKey: 'round-glasses', name: 'Round glasses', slot: 'face', price: 40, requiredLevel: 1 },
  { assetKey: 'sunglasses', name: 'Sunglasses', slot: 'face', price: 90, requiredLevel: 3 },
  { assetKey: 'bandana', name: 'Red bandana', slot: 'neck', price: 40, requiredLevel: 1 },
  { assetKey: 'bow-tie', name: 'Bow tie', slot: 'neck', price: 70, requiredLevel: 2 },
  { assetKey: 'gold-medal', name: 'Gold medal', slot: 'neck', price: 200, requiredLevel: 5 },
  { assetKey: 'library', name: 'Cozy library', slot: 'background', price: 120, requiredLevel: 3 },
  { assetKey: 'night-sky', name: 'Night sky', slot: 'background', price: 180, requiredLevel: 4 },
] as const satisfies readonly NewShopItem[]
