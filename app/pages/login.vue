<script setup lang="ts">
import { signInSchema } from '#shared/schemas/auth'

definePageMeta({ auth: 'guest', layout: 'auth' })
useSeoMeta({ title: 'Log in' })

const route = useRoute()
const { googleEnabled, signIn, signInWithGoogle } = await useAuthActions()
const { values, errors, formError, pending, submit } = useZodForm(signInSchema, {
  email: '',
  password: '',
})
</script>

<template>
  <div>
    <AuthGreeting message="Welcome back! Ready for another round?" />

    <h1 class="mt-8 text-title">Log in</h1>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit(signIn)">
      <UiFormField v-slot="field" label="Email" :error="errors.email">
        <UiInput v-model="values.email" v-bind="field" type="email" autocomplete="email" />
      </UiFormField>
      <UiFormField v-slot="field" label="Password" :error="errors.password">
        <UiInput
          v-model="values.password"
          v-bind="field"
          type="password"
          autocomplete="current-password"
        />
      </UiFormField>
      <UiAlert v-if="formError">{{ formError }}</UiAlert>
      <UiButton type="submit" block :loading="pending">Log in</UiButton>
    </form>

    <AuthGoogleSection v-if="googleEnabled" class="mt-6" :action="signInWithGoogle" />

    <p class="mt-8 text-center text-body text-ink-muted">
      New here?
      <NuxtLink
        :to="{ path: '/signup', query: route.query }"
        class="font-bold text-tomato underline-offset-4 hover:underline"
      >
        Create an account
      </NuxtLink>
    </p>
  </div>
</template>
