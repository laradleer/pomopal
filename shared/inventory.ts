import type { InventoryDto, InventoryItemDto } from './types/inventory'

/** An inventory with every slot present and empty. */
export function emptyInventory(): InventoryDto {
  return { head: [], face: [], neck: [], background: [] }
}

/** Groups owned items by slot, keeping their order. */
export function groupBySlot(items: readonly InventoryItemDto[]): InventoryDto {
  const inventory = emptyInventory()
  for (const item of items) inventory[item.slot].push(item)
  return inventory
}
