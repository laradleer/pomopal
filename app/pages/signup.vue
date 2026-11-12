<script setup lang="ts">
import { PASSWORD_MIN_LENGTH, signUpSchema } from '#shared/schemas/auth'

definePageMeta({ auth: 'guest', layout: 'auth' })
useSeoMeta({ title: 'Sign up' })

const route = useRoute()
const { googleEnabled, signUp, signInWithGoogle } = await useAuthActions()
const { values, errors, formError, pending, submit } = useZodForm(signUpSchema, {
  name: '',
  email: '',
  password: '',
})
</script>

<template>
  <div>
    <PetGreeting
      species="dog"
      mood="happy"
      message="Hi! I'm so happy you're here. Let's study together!"
    />

    <h1 class="mt-8 text-title">Create your account</h1>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit(signUp)">
      <UiFormField v-slot="field" label="What should we call you?" :error="errors.name">
        <UiInput v-model="values.name" v-bind="field" autocomplete="given-name" />
      </UiFormField>
      <UiFormField v-slot="field" label="Email" :error="errors.email">
        <UiInput v-model="values.email" v-bind="field" type="email" autocomplete="email" />
      </UiFormField>
      <UiFormField
        v-slot="field"
        label="Password"
        :help="`At least ${PASSWORD_MIN_LENGTH} characters.`"
        :error="errors.password"
      >
        <UiInput
          v-model="values.password"
          v-bind="field"
          type="password"
          autocomplete="new-password"
        />
      </UiFormField>
      <UiAlert v-if="formError">{{ formError }}</UiAlert>
      <UiButton type="submit" block :loading="pending">Create account</UiButton>
    </form>

    <AuthGoogleSection v-if="googleEnabled" class="mt-6" :action="signInWithGoogle" />

    <p class="mt-8 text-center text-body text-ink-muted">
      Already have an account?
      <NuxtLink
        :to="{ path: '/login', query: route.query }"
        class="font-bold text-tomato underline-offset-4 hover:underline"
      >
        Log in
      </NuxtLink>
    </p>
  </div>
</template>
