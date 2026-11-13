import { ITEM_SLOTS } from '#shared/constants'
import { emptyInventory } from '#shared/inventory'
import type { InventoryDto, InventoryItemDto } from '#shared/types/inventory'

/**
 * The wardrobe: owned items by slot, and putting them on or taking them off. After each change
 * the user store is refreshed, so the pet wears the item everywhere in the app.
 */
export async function useInventory() {
  const user = useUserStore()
  const toast = useToast()

  const { data: inventory, pending } = await useFetch<InventoryDto>('/api/inventory', {
    key: 'inventory',
    default: emptyInventory,
  })

  /** Slots with at least one item, in the usual slot order. */
  const sections = computed(() =>
    ITEM_SLOTS.map((slot) => ({ slot, items: inventory.value[slot] })).filter(
      (section) => section.items.length > 0,
    ),
  )
  const isEmpty = computed(() => sections.value.length === 0)
  const isSaving = ref(false)

  /** Puts the item on (taking off the other one in its slot), or takes it off if it is worn. */
  async function toggle(item: InventoryItemDto): Promise<void> {
    if (isSaving.value) return
    isSaving.value = true
    try {
      const action = item.equipped ? 'unequip' : 'equip'
      inventory.value = await $fetch<InventoryDto>(`/api/inventory/${item.id}/${action}`, {
        method: 'POST',
      })
      await user.refresh()
    } catch (error) {
      toast.show(apiErrorMessage(error), { tone: 'error' })
    } finally {
      isSaving.value = false
    }
  }

  return { inventory, sections, isEmpty, pending, isSaving, toggle }
}
