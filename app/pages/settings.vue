<script setup lang="ts">
useSeoMeta({ title: 'Settings' })

const user = useUserStore()
const { signOut } = await useAuthActions()
const signingOut = ref(false)

async function onSignOut() {
  signingOut.value = true
  await signOut()
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-title">Settings</h1>

    <AppComingSoon icon="timer" message="Choose your focus and break lengths. Coming soon." />

    <UiCard class="space-y-4">
      <h2 class="text-heading">Account</h2>
      <dl class="space-y-1 text-body">
        <div class="flex gap-2">
          <dt class="text-ink-muted">Name</dt>
          <dd>{{ user.me?.user.name }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="text-ink-muted">Email</dt>
          <dd>{{ user.me?.user.email }}</dd>
        </div>
      </dl>
      <UiButton variant="outline" icon="log-out" :loading="signingOut" @click="onSignOut">
        Log out
      </UiButton>
    </UiCard>
  </div>
</template>
