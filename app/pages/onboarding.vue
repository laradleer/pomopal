<script setup lang="ts">
import { PET_NAME_MAX_LENGTH } from '#shared/constants'
import { petCreateSchema } from '#shared/schemas/pet'

definePageMeta({ auth: 'onboarding', layout: 'auth' })
useSeoMeta({ title: 'Choose your pet' })

const user = useUserStore()
const { createPet } = usePet()
const { values, errors, formError, pending, submit } = useZodForm(petCreateSchema, {
  species: undefined,
  name: '',
})

const firstName = computed(() => user.me?.profile.displayName ?? user.me?.user.name ?? 'there')
const nameLabel = computed(() =>
  values.value.species ? `Name your ${values.value.species}` : 'Name your pet',
)
</script>

<template>
  <div>
    <AuthGreeting :message="`Hi ${firstName}! Who would you like to study with?`" />

    <h1 class="mt-8 text-title">Choose your study buddy</h1>

    <form class="mt-6 space-y-6" novalidate @submit.prevent="submit(createPet)">
      <OnboardingSpeciesPicker v-model="values.species" :error="errors.species" />

      <UiFormField
        v-slot="field"
        :label="nameLabel"
        :help="`Up to ${PET_NAME_MAX_LENGTH} characters.`"
        :error="errors.name"
      >
        <UiInput
          v-model="values.name"
          v-bind="field"
          :maxlength="PET_NAME_MAX_LENGTH"
          autocomplete="off"
          placeholder="Mochi"
        />
      </UiFormField>

      <UiAlert v-if="formError">{{ formError }}</UiAlert>
      <UiButton type="submit" block icon="sparkles" :loading="pending">Let's go!</UiButton>
    </form>
  </div>
</template>
