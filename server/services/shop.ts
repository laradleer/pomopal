import { and, asc, eq, gte, sql } from 'drizzle-orm'
import type { BuyResult, ShopItemDto } from '#shared/types/shop'
import type { DbOrTx } from '~~/server/db/client'
import { inventoryItem, profile, shopItem } from '~~/server/db/schema'
import { canBuy, shopItemFlags } from '~~/server/services/rules/shop'

async function getBuyer(db: DbOrTx, userId: string) {
  const buyer = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
    columns: { level: true, coins: true },
  })
  if (!buyer) throw apiError('NOT_FOUND', 'Profile not found')
  return buyer
}

/** Every item, lowest level and price first, with the user's owned, locked and affordable flags. */
export async function listShop(userId: string): Promise<ShopItemDto[]> {
  const db = useDb()
  const [buyer, items, ownedRows] = await Promise.all([
    getBuyer(db, userId),
    db
      .select()
      .from(shopItem)
      .orderBy(asc(shopItem.requiredLevel), asc(shopItem.price), asc(shopItem.id)),
    db
      .select({ itemId: inventoryItem.itemId })
      .from(inventoryItem)
      .where(eq(inventoryItem.userId, userId)),
  ])

  const ownedIds = new Set(ownedRows.map((row) => row.itemId))
  return items.map((item) => ({
    id: item.id,
    assetKey: item.assetKey,
    name: item.name,
    slot: item.slot,
    price: item.price,
    requiredLevel: item.requiredLevel,
    ...shopItemFlags(item, buyer, ownedIds.has(item.id)),
  }))
}

/**
 * Buys an item in one transaction: check the rules (`canBuy`), add it to the inventory, pay.
 * Two safety nets make double clicks harmless: the unique (user, item) index lets only one
 * insert through, and the coins are taken with one `UPDATE … WHERE coins >= price`, so two
 * purchases at once can never spend more than the balance. If paying fails, the insert is
 * rolled back with the rest of the transaction.
 */
export async function buyItem(userId: string, itemId: number): Promise<BuyResult> {
  return useDb().transaction(async (tx) => {
    const item = await tx.query.shopItem.findFirst({ where: eq(shopItem.id, itemId) })
    if (!item) throw apiError('NOT_FOUND', 'Item not found')

    const buyer = await getBuyer(tx, userId)
    const ownedRow = await tx.query.inventoryItem.findFirst({
      where: and(eq(inventoryItem.userId, userId), eq(inventoryItem.itemId, itemId)),
      columns: { id: true },
    })

    const check = canBuy(item, buyer, Boolean(ownedRow))
    if (!check.ok) throw apiError(check.code)

    const [bought] = await tx
      .insert(inventoryItem)
      .values({ userId, itemId })
      .onConflictDoNothing({ target: [inventoryItem.userId, inventoryItem.itemId] })
      .returning({ id: inventoryItem.id })
    if (!bought) throw apiError('ALREADY_OWNED')

    const [paid] = await tx
      .update(profile)
      .set({ coins: sql`${profile.coins} - ${item.price}` })
      .where(and(eq(profile.userId, userId), gte(profile.coins, item.price)))
      .returning({ coins: profile.coins })
    if (!paid) throw apiError('NOT_ENOUGH_COINS')

    return { coins: paid.coins, inventoryItemId: bought.id }
  })
}
