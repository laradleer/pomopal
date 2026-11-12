import { sql } from 'drizzle-orm'
import type { Database } from './client'
import { shopItem } from './schema'
import { SHOP_ITEMS } from './shop-items'

/**
 * Inserts new shop items and updates changed ones, matched by `assetKey`.
 * Idempotent: running it twice changes nothing. Items are never deleted, because users may own them.
 */
export async function seedShopItems(db: Database): Promise<number> {
  await db
    .insert(shopItem)
    .values([...SHOP_ITEMS])
    .onConflictDoUpdate({
      target: shopItem.assetKey,
      set: {
        name: sql`excluded.name`,
        slot: sql`excluded.slot`,
        price: sql`excluded.price`,
        requiredLevel: sql`excluded.required_level`,
      },
    })
  return SHOP_ITEMS.length
}
