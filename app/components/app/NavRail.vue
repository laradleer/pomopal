<script setup lang="ts">
/**
 * Desktop navigation (≥1024px): a rail on the left with the logo and the five main screens.
 * Replaces the floating tab bar there. The active pill slides between items like the tab bar's.
 */
const route = useRoute()
const activeIndex = computed(() => tabIndex(route.path))
</script>

<template>
  <nav
    aria-label="Main"
    class="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col items-center gap-8 border-r border-border bg-surface py-5 lg:flex"
  >
    <NuxtLink to="/home" class="grid size-11 place-items-center rounded-md bg-tomato text-on-brand">
      <UiIcon name="timer" :size="24" label="PomoPal home" />
    </NuxtLink>

    <ul class="relative flex flex-col gap-2">
      <li
        aria-hidden="true"
        class="rail-pill pointer-events-none absolute top-0 left-0 h-16 w-full rounded-lg bg-tomato-tint transition-[translate,opacity] duration-(--duration-move) ease-soft"
        :class="activeIndex === -1 && 'opacity-0'"
        :style="{ translate: `0 calc(${Math.max(activeIndex, 0)} * (100% + 0.5rem))` }"
      />
      <li v-for="tab in MAIN_TABS" :key="tab.to" class="relative">
        <NuxtLink
          :to="tab.to"
          class="flex h-16 w-18 flex-col items-center justify-center gap-1 rounded-lg text-body-sm text-ink-muted transition-colors hover:text-ink aria-[current=page]:text-tomato"
        >
          <UiIcon :name="tab.icon" :size="24" />
          {{ tab.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
