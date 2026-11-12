<script setup lang="ts">
// Pages set a short title ("Shop"); the tab shows "Shop · PomoPal". No title → "PomoPal".
useHead({
  titleTemplate: (title) => (title ? `${title} · PomoPal` : 'PomoPal'),
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToaster />
</template>
