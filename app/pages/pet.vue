<script setup lang="ts">
import { PET_NAME_MAX_LENGTH } from '#shared/constants'
import type { ItemSlot, PetMood } from '#shared/constants'
import { petRenameSchema } from '#shared/schemas/pet'
import type { PetRenameInput } from '#shared/schemas/pet'

useSeoMeta({ title: 'Your pet' })

const pet = usePetStore()
const { mood, line } = usePetMood()
const { sections, isEmpty, pending: isLoadingWardrobe, toggle } = await useInventory()
const { renamePet } = usePet()

const MOOD_LABEL: Record<PetMood, string> = {
  happy: 'Happy',
  sleepy: 'Sleepy',
  sad: 'A little sad',
  neutral: 'Calm',
}

const SLOT_LABEL: Record<ItemSlot, string> = {
  head: 'Head',
  face: 'Face',
  neck: 'Neck',
  background: 'Background',
}

// ---- Rename ----

const isRenameOpen = ref(false)
const { values, errors, formError, pending, submit, reset } = useZodForm(petRenameSchema, {
  name: pet.name,
})

function openRename() {
  reset({ name: pet.name })
  isRenameOpen.value = true
}

async function saveName(input: PetRenameInput) {
  await renamePet(input)
  isRenameOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-title break-all">{{ pet.name }}</h1>
      <UiButton variant="outline" size="sm" icon="pencil" @click="openRename">Rename</UiButton>
    </div>

    <div class="grid gap-6 md:grid-cols-2 md:items-start">
      <PetStage :mood="mood" :message="line" class="md:sticky md:top-24">
        <template #badge>
          <span class="rounded-pill bg-surface px-3 py-1 text-label text-ink-muted shadow-float">
            {{ MOOD_LABEL[mood] }}
          </span>
        </template>
      </PetStage>

      <UiCard class="space-y-6">
        <div class="space-y-1">
          <h2 class="text-heading">Wardrobe</h2>
          <p class="text-body-sm text-ink-muted">Tap an item to put it on or take it off.</p>
        </div>

        <div v-if="isLoadingWardrobe && isEmpty" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <UiSkeleton v-for="index in 3" :key="index" class="aspect-[3/4]" />
        </div>
        <div v-else-if="isEmpty" class="flex flex-col items-center gap-4 py-6 text-center">
          <p class="max-w-xs text-body text-ink-muted">
            Nothing here yet. Earn coins with focus sessions and spend them in the shop!
          </p>
          <UiButton variant="outline" icon="store" to="/shop">Visit the shop</UiButton>
        </div>

        <section v-for="section in sections" :key="section.slot" class="space-y-3">
          <h3 class="text-label text-ink-muted">{{ SLOT_LABEL[section.slot] }}</h3>
          <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <li v-for="item in section.items" :key="item.id">
              <ShopItem
                :name="item.name"
                :item-slot="item.slot"
                :asset-key="item.assetKey"
                :state="item.equipped ? 'equipped' : 'owned'"
                :selected="item.equipped"
                @click="toggle(item)"
              />
            </li>
          </ul>
        </section>
      </UiCard>
    </div>

    <UiSheet v-model:open="isRenameOpen" title="Rename your pet">
      <form class="space-y-4" novalidate @submit.prevent="submit(saveName)">
        <UiFormField
          v-slot="field"
          label="Name"
          :help="`Up to ${PET_NAME_MAX_LENGTH} characters.`"
          :error="errors.name"
        >
          <UiInput
            v-model="values.name"
            v-bind="field"
            :maxlength="PET_NAME_MAX_LENGTH"
            autocomplete="off"
          />
        </UiFormField>
        <UiAlert v-if="formError">{{ formError }}</UiAlert>
        <div class="flex flex-col gap-2">
          <UiButton type="submit" block :loading="pending">Save name</UiButton>
          <UiButton block variant="outline" @click="isRenameOpen = false">Cancel</UiButton>
        </div>
      </form>
    </UiSheet>
  </div>
</template>
