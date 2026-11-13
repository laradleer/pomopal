<script setup lang="ts">
import type { ItemSlot } from '#shared/constants'

/** One shop item drawn on its own (no pet), framed for its slot. Decorative: the tile names it. */
const props = defineProps<{ assetKey: string; itemSlot: ItemSlot }>()

// Each slot's drawings live in a different area around (0, 0) (see <PetAccessory>).
const VIEW_BOX: Record<ItemSlot, string> = {
  head: '-50 -50 100 66',
  face: '-54 -24 108 48',
  neck: '-40 -2 80 48',
  background: '0 0 200 200',
}
</script>

<template>
  <svg :viewBox="VIEW_BOX[props.itemSlot]" aria-hidden="true" class="overflow-visible">
    <PetAccessory :asset-key="props.assetKey" />
  </svg>
</template>
