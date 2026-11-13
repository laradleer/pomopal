<script setup lang="ts">
import type { ItemSlot } from '#shared/constants'

/**
 * Item tile for the shop and the wardrobe. States:
 *   forSale   price tag (muted when the coins aren't enough yet)
 *   owned     green outline
 *   equipped  green outline and tint, "Wearing"
 *   locked    dimmed art, "Unlocks at Lv N"
 * A tile is a toggle button: `selected` marks the one being previewed or worn.
 */
type ShopItemState = 'forSale' | 'owned' | 'equipped' | 'locked'

const props = withDefaults(
  defineProps<{
    name: string
    itemSlot: ItemSlot
    assetKey: string
    state: ShopItemState
    price?: number
    requiredLevel?: number
    affordable?: boolean
    selected?: boolean
  }>(),
  { price: 0, requiredLevel: 1, affordable: true, selected: false },
)

const emit = defineEmits<{ click: [] }>()

const tile = useTemplateRef<HTMLButtonElement>('tile')
const motion = useMotion()

function onClick() {
  // A locked item gives a small "not yet" shake (the pet's bubble says when it unlocks).
  if (props.state === 'locked') {
    motion.play(
      tile.value,
      [
        { translate: '0 0' },
        { translate: '-6px 0' },
        { translate: '5px 0' },
        { translate: '-3px 0' },
        { translate: '0 0' },
      ],
      { duration: 'move', easing: 'linear' },
    )
  }
  emit('click')
}

const STATE_CLASSES: Record<ShopItemState, string> = {
  forSale: 'border-border bg-surface',
  owned: 'border-leaf bg-surface',
  equipped: 'border-leaf bg-leaf-tint',
  locked: 'border-border bg-surface',
}
</script>

<template>
  <button
    ref="tile"
    type="button"
    :aria-pressed="props.selected"
    class="flex h-full w-full flex-col items-center gap-2 rounded-md border p-3 text-center transition-colors hover:border-border-strong aria-pressed:outline-3 aria-pressed:outline-offset-2"
    :class="[
      STATE_CLASSES[props.state],
      props.state === 'equipped' ? 'aria-pressed:outline-leaf' : 'aria-pressed:outline-tomato',
    ]"
    @click="onClick"
  >
    <span
      class="grid aspect-square w-full place-items-center rounded-sm bg-canvas-warm p-3"
      :class="props.state === 'locked' && 'opacity-40 grayscale'"
    >
      <ShopItemArt :asset-key="props.assetKey" :item-slot="props.itemSlot" class="size-full" />
    </span>

    <span class="line-clamp-1 text-body-sm font-bold text-ink">{{ props.name }}</span>

    <span
      v-if="props.state === 'forSale'"
      class="inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-body-sm font-bold"
      :class="props.affordable ? 'bg-sun-tint text-sun-ink' : 'bg-surface-sunken text-ink-muted'"
    >
      <UiIcon name="coins" :size="16" />
      {{ props.price }}
      <span class="sr-only">coins</span>
    </span>
    <span
      v-else-if="props.state === 'locked'"
      class="inline-flex items-center gap-1 text-body-sm text-ink-muted"
    >
      <UiIcon name="lock" :size="16" />
      Unlocks at Lv {{ props.requiredLevel }}
    </span>
    <span v-else class="inline-flex items-center gap-1 text-body-sm font-bold text-leaf">
      <UiIcon :name="props.state === 'equipped' ? 'sparkles' : 'check'" :size="16" />
      {{ props.state === 'equipped' ? 'Wearing' : 'Owned' }}
    </span>
  </button>
</template>
