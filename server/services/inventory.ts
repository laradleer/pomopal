import { and, asc, eq, inArray, sql } from 'drizzle-orm'
import { groupBySlot } from '#shared/inventory'
import type { InventoryDto } from '#shared/types/inventory'
import type { EquippedItems } from '#shared/types/shop'
import type { DbOrTx } from '~~/server/db/client'
import { inventoryItem, shopItem } from '~~/server/db/schema'

/** Everything the user owns, grouped by slot, oldest purchase first. */
export async function getInventory(db: DbOrTx, userId: string): Promise<InventoryDto> {
  const rows = await db
    .select({
      id: inventoryItem.id,
      itemId: inventoryItem.itemId,
      assetKey: shopItem.assetKey,
      name: shopItem.name,
      slot: shopItem.slot,
      equipped: inventoryItem.equipped,
    })
    .from(inventoryItem)
    .innerJoin(shopItem, eq(inventoryItem.itemId, shopItem.id))
    .where(eq(inventoryItem.userId, userId))
    .orderBy(asc(inventoryItem.boughtAt), asc(inventoryItem.id))

  return groupBySlot(rows)
}

/** What the pet wears: the asset key of the equipped item in each slot. */
export async function getEquipped(db: DbOrTx, userId: string): Promise<EquippedItems> {
  const rows = await db
    .select({ slot: shopItem.slot, assetKey: shopItem.assetKey })
    .from(inventoryItem)
    .innerJoin(shopItem, eq(inventoryItem.itemId, shopItem.id))
    .where(and(eq(inventoryItem.userId, userId), eq(inventoryItem.equipped, true)))
  return Object.fromEntries(rows.map((row) => [row.slot, row.assetKey]))
}

/**
 * Puts an owned item on the pet and takes off the other item in the same slot, in one
 * transaction. All of the user's items in that slot are locked first (in id order, so two
 * requests can't deadlock), then one UPDATE leaves exactly this one equipped. Two quick taps on
 * different hats therefore end with one hat, never two.
 */
export async function equipItem(userId: string, id: number): Promise<InventoryDto> {
  return useDb().transaction(async (tx) => {
    const [target] = await tx
      .select({ slot: shopItem.slot })
      .from(inventoryItem)
      .innerJoin(shopItem, eq(inventoryItem.itemId, shopItem.id))
      .where(and(eq(inventoryItem.id, id), eq(inventoryItem.userId, userId)))
    if (!target) throw apiError('NOT_FOUND', 'Item not found')

    const sameSlot = await tx
      .select({ id: inventoryItem.id })
      .from(inventoryItem)
      .innerJoin(shopItem, eq(inventoryItem.itemId, shopItem.id))
      .where(and(eq(inventoryItem.userId, userId), eq(shopItem.slot, target.slot)))
      .orderBy(asc(inventoryItem.id))
      .for('update', { of: inventoryItem })

    await tx
      .update(inventoryItem)
      .set({ equipped: sql`${inventoryItem.id} = ${id}` })
      .where(
        inArray(
          inventoryItem.id,
          sameSlot.map((row) => row.id),
        ),
      )

    return getInventory(tx, userId)
  })
}

/** Takes an owned item off the pet. Taking off an item that isn't worn changes nothing. */
export async function unequipItem(userId: string, id: number): Promise<InventoryDto> {
  const db = useDb()
  const [updated] = await db
    .update(inventoryItem)
    .set({ equipped: false })
    .where(and(eq(inventoryItem.id, id), eq(inventoryItem.userId, userId)))
    .returning({ id: inventoryItem.id })
  if (!updated) throw apiError('NOT_FOUND', 'Item not found')
  return getInventory(db, userId)
}

/** GET /api/inventory */
export async function listInventory(userId: string): Promise<InventoryDto> {
  return getInventory(useDb(), userId)
}
