<script setup lang="ts">
/** Floating pill navigation at the bottom: Timer · Tasks · Pet · Shop · Stats. */
const tabs = [
  { to: '/home', label: 'Timer', icon: 'timer' },
  { to: '/tasks', label: 'Tasks', icon: 'list-checks' },
  { to: '/pet', label: 'Pet', icon: 'paw-print' },
  { to: '/shop', label: 'Shop', icon: 'store' },
  { to: '/stats', label: 'Stats', icon: 'chart-column' },
]
</script>

<template>
  <nav
    aria-label="Main"
    class="fixed inset-x-0 bottom-4 z-40 mx-auto mb-[env(safe-area-inset-bottom)] w-fit rounded-pill border border-border bg-surface p-1.5 shadow-float"
  >
    <ul class="flex items-center gap-1">
      <li v-for="tab in tabs" :key="tab.to">
        <!-- NuxtLink sets aria-current="page" on the active tab; the styles follow it. -->
        <NuxtLink
          :to="tab.to"
          class="flex w-16 flex-col items-center gap-0.5 rounded-pill py-1.5 text-body-sm text-ink-muted transition-colors hover:text-ink aria-[current=page]:bg-tomato-tint aria-[current=page]:text-tomato sm:w-20"
        >
          <UiIcon :name="tab.icon" :size="20" />
          {{ tab.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
