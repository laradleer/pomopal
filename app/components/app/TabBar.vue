<script setup lang="ts">
/**
 * Floating pill navigation at the bottom: Timer · Tasks · Pet · Shop · Stats (phones and
 * tablets). The active pill slides to the new tab: with View Transitions it is its own
 * transition group (`tab-pill`), otherwise a CSS transition moves it.
 */
const route = useRoute()
const activeIndex = computed(() => tabIndex(route.path))
</script>

<template>
  <nav
    aria-label="Main"
    class="tab-bar fixed inset-x-0 bottom-4 z-40 mx-auto mb-[env(safe-area-inset-bottom)] w-fit rounded-pill border border-border bg-surface p-1.5 shadow-float"
  >
    <ul class="relative flex items-center gap-1">
      <!-- The sliding active pill, one tab wide -->
      <li
        aria-hidden="true"
        class="tab-pill pointer-events-none absolute top-0 left-0 h-full w-16 rounded-pill bg-tomato-tint transition-[translate,opacity] duration-(--duration-move) ease-soft sm:w-20"
        :class="activeIndex === -1 && 'opacity-0'"
        :style="{ translate: `calc(${Math.max(activeIndex, 0)} * (100% + 0.25rem)) 0` }"
      />
      <li v-for="tab in MAIN_TABS" :key="tab.to" class="relative">
        <!-- NuxtLink sets aria-current="page" on the active tab; the styles follow it. -->
        <NuxtLink
          :to="tab.to"
          class="flex w-16 flex-col items-center gap-0.5 rounded-pill py-1.5 text-body-sm text-ink-muted transition-colors hover:text-ink aria-[current=page]:text-tomato sm:w-20"
        >
          <UiIcon :name="tab.icon" :size="20" />
          {{ tab.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
