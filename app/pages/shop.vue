<script setup lang="ts">
import type { ItemSlot } from '#shared/constants'

useSeoMeta({ title: 'Shop' })

const pet = usePetStore()
const profile = useProfileStore()
const { mood } = usePetMood()
const { itemsInSlot, slot, selected, select, buy, isBuying, reply } = await useShop()

const SLOT_TABS = [
  { value: 'head', label: 'Head' },
  { value: 'face', label: 'Face' },
  { value: 'neck', label: 'Neck' },
  { value: 'background', label: 'Background' },
] as const satisfies readonly { value: ItemSlot; label: string }[]

/** The pet wearing the selected item, to try it on before buying. */
const preview = computed(() =>
  selected.value ? { [selected.value.slot]: selected.value.assetKey } : {},
)
const line = computed(() => reply.value ?? shopLine(selected.value, profile.coins))
const canBuySelected = computed(() =>
  Boolean(selected.value && !selected.value.owned && !selected.value.locked),
)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-title">Shop</h1>

    <div class="grid gap-6 md:grid-cols-2 md:items-start">
      <!-- Try-on stage -->
      <section
        aria-label="Preview"
        class="flex flex-col items-center gap-4 rounded-xl bg-canvas-warm px-6 py-8 md:sticky md:top-24"
      >
        <PetView
          :species="pet.species"
          :mood="mood"
          :name="pet.name"
          :equipped="preview"
          :size="180"
        />
        <PetBubble class="w-full">{{ line }}</PetBubble>
        <UiButton
          v-if="selected && canBuySelected"
          block
          icon="coins"
          :loading="isBuying"
          @click="buy(selected)"
        >
          Buy for {{ selected.price }} coins
        </UiButton>
      </section>

      <section class="space-y-4">
        <UiTabs v-model="slot" :options="SLOT_TABS" label="Item type" />
        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <li v-for="item in itemsInSlot" :key="item.id">
            <ShopItem
              :name="item.name"
              :item-slot="item.slot"
              :asset-key="item.assetKey"
              :state="item.owned ? 'owned' : item.locked ? 'locked' : 'forSale'"
              :price="item.price"
              :required-level="item.requiredLevel"
              :affordable="item.affordable"
              :selected="item.id === selected?.id"
              @click="select(item)"
            />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
