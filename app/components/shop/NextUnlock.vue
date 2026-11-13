<script setup lang="ts">
/** "Next unlock" on home: the next locked shop item and the XP still missing. Links to the shop. */
const { item, xpMissing } = await useNextUnlock()
</script>

<template>
  <UiCard as="section" class="space-y-3">
    <h2 class="text-heading">Next unlock</h2>
    <NuxtLink
      v-if="item"
      to="/shop"
      class="flex items-center gap-4 rounded-md p-1 hover:bg-surface-sunken"
    >
      <span class="grid size-16 shrink-0 place-items-center rounded-sm bg-canvas-warm p-2">
        <ShopItemArt :asset-key="item.assetKey" :item-slot="item.slot" class="size-full" />
      </span>
      <span class="min-w-0">
        <span class="block text-body font-bold text-ink"
          >{{ item.name }} at level {{ item.requiredLevel }}</span
        >
        <span class="block text-body-sm text-ink-muted">{{ xpMissing }} XP to go</span>
      </span>
    </NuxtLink>
    <p v-else class="text-body text-ink-muted">You unlocked everything in the shop. Amazing!</p>
  </UiCard>
</template>
