import { totalXpForLevel } from '#shared/levels'
import type { ShopItemDto } from '#shared/types/shop'

/**
 * The next thing to look forward to (#77): the locked shop item with the lowest required level
 * (cheapest first), and how much XP is still missing. Shares the shop's data ('shop' key).
 */
export async function useNextUnlock() {
  const profile = useProfileStore()

  const { data: items } = await useFetch<ShopItemDto[]>('/api/shop', {
    key: 'shop',
    default: () => [],
  })

  const item = computed(
    () =>
      items.value
        .filter((candidate) => candidate.locked)
        .sort((a, b) => a.requiredLevel - b.requiredLevel || a.price - b.price)[0] ?? null,
  )
  const xpMissing = computed(() =>
    item.value ? Math.max(0, totalXpForLevel(item.value.requiredLevel) - profile.xp) : 0,
  )

  return { item, xpMissing }
}
