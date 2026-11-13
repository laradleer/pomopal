import type { ItemSlot } from '#shared/constants'
import type { BuyResult, ShopItemDto } from '#shared/types/shop'

/**
 * The shop: items by slot, the one being previewed, and buying. The pet answers in its bubble
 * (`reply`): a thank-you after buying, or the friendly error when buying fails.
 */
export async function useShop() {
  const user = useUserStore()

  const {
    data: items,
    pending,
    refresh,
  } = await useFetch<ShopItemDto[]>('/api/shop', { key: 'shop', default: () => [] })

  const slot = ref<ItemSlot>('head')
  const selectedId = ref<number | null>(null)
  /** What the pet says after a purchase; null shows the line for the selected item. */
  const reply = ref<string | null>(null)
  const isBuying = ref(false)

  const itemsInSlot = computed(() => items.value.filter((item) => item.slot === slot.value))
  const selected = computed(() => items.value.find((item) => item.id === selectedId.value) ?? null)

  function select(item: ShopItemDto) {
    selectedId.value = item.id
    reply.value = null
  }

  async function buy(item: ShopItemDto): Promise<void> {
    if (isBuying.value) return
    isBuying.value = true
    try {
      await $fetch<BuyResult>(`/api/shop/${item.id}/buy`, { method: 'POST' })
      // The coin chip and the tiles update together.
      await Promise.all([user.refresh(), refresh()])
      reply.value = boughtLine(item)
    } catch (error) {
      reply.value = apiErrorMessage(error)
    } finally {
      isBuying.value = false
    }
  }

  return { items, itemsInSlot, pending, slot, selected, select, buy, isBuying, reply }
}
