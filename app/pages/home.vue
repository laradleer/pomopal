<script setup lang="ts">
// Placeholder: the timer, pet and tasks come in #14, #15 and #20.
useSeoMeta({ title: 'Home' })
const user = useUserStore()
</script>

<template>
  <main class="mx-auto max-w-phone px-4 py-12">
    <h1 class="text-title">Hi, {{ user.me?.profile.displayName ?? user.me?.user.name }}!</h1>
    <p class="mt-2 text-body text-ink-muted">
      {{ user.me?.pet?.name }} is ready to study with you.
    </p>
  </main>
</template>
