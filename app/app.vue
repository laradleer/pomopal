<script setup lang="ts">
// Pages set a short title ("Shop"); the tab shows "Shop · PomoPal". No title → "PomoPal".
// While a session or break runs, the tab shows the countdown on every page: "24:59 Focus · PomoPal".
const timer = useTimerStore()

useHead(
  computed(() => {
    const countdown = timer.isActive ? `${timer.clock} ${timer.phaseLabel}` : null
    return {
      titleTemplate: (title?: string) => {
        if (countdown) return `${countdown} · PomoPal`
        return title ? `${title} · PomoPal` : 'PomoPal'
      },
    }
  }),
)
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToaster />
  <AppLoader />
</template>
