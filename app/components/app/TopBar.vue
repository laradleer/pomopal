<script setup lang="ts">
/** Logo on the left; stat chips (#19) and settings on the right. */
defineSlots<{ stats?(): unknown }>()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-border bg-canvas/90 backdrop-blur">
    <div class="mx-auto flex h-16 w-full max-w-app items-center justify-between gap-3 px-4">
      <NuxtLink to="/home" class="flex items-center gap-2 text-heading text-ink">
        <span class="grid size-8 place-items-center rounded-md bg-tomato text-on-brand">
          <UiIcon name="timer" :size="20" />
        </span>
        PomoPal
      </NuxtLink>

      <div class="flex items-center gap-2">
        <slot name="stats" />
        <NuxtLink
          to="/settings"
          class="grid size-10 place-items-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-ink"
        >
          <UiIcon name="settings" :size="20" label="Settings" />
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
