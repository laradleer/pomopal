<script setup lang="ts">
import { PET_MOODS, PET_SPECIES } from '#shared/constants'
import type { ItemSlot } from '#shared/constants'

// Every Ui* component in every state, for /dev/ui. Dev only.
const toast = useToast()

const coins = ref(120)
const streak = ref(5)
const xp = ref(120)
const xpForNextLevel = 200

const email = ref('')
const password = ref('abc')
const passwordError = computed(() =>
  password.value.length > 0 && password.value.length < 8 ? 'At least 8 characters.' : undefined,
)

const subject = ref('')
const subjects = [
  { value: '', label: 'No task' },
  { value: '1', label: 'Read chapter 3' },
  { value: '2', label: 'Write the lab report' },
]
const focusMinutes = ref<number | undefined>(25)
const isSwitchOn = ref(true)

const isSheetOpen = ref(false)
const lastSheetChoice = ref<string>()

function earnCoins() {
  coins.value += 10
  xp.value = Math.min(xpForNextLevel, xp.value + 25)
  toast.show('Nice! +10 coins · +25 XP', { tone: 'success', icon: 'coins' })
}

function chooseInSheet(choice: string) {
  lastSheetChoice.value = choice
  isSheetOpen.value = false
}

// Every shop item (server/db/shop-items.ts), to check the art on both pets.
const accessories: { assetKey: string; slot: ItemSlot }[] = [
  { assetKey: 'party-hat', slot: 'head' },
  { assetKey: 'beanie', slot: 'head' },
  { assetKey: 'wizard-hat', slot: 'head' },
  { assetKey: 'round-glasses', slot: 'face' },
  { assetKey: 'sunglasses', slot: 'face' },
  { assetKey: 'bandana', slot: 'neck' },
  { assetKey: 'bow-tie', slot: 'neck' },
  { assetKey: 'gold-medal', slot: 'neck' },
  { assetKey: 'library', slot: 'background' },
  { assetKey: 'night-sky', slot: 'background' },
]
const outfits = [
  { head: 'party-hat', face: 'round-glasses', neck: 'bow-tie', background: 'library' },
  { head: 'wizard-hat', face: 'sunglasses', neck: 'gold-medal', background: 'night-sky' },
  { head: 'beanie', neck: 'bandana' },
]

const tabsValue = ref<ItemSlot>('head')
const tabOptions = [
  { value: 'head', label: 'Head' },
  { value: 'face', label: 'Face' },
  { value: 'neck', label: 'Neck' },
  { value: 'background', label: 'Background' },
] as const satisfies readonly { value: ItemSlot; label: string }[]
const selectedTile = ref('party-hat')

const icons = [
  'flame',
  'star',
  'coins',
  'timer',
  'list-checks',
  'paw-print',
  'store',
  'chart-column',
]
</script>

<template>
  <section class="space-y-8">
    <h2 class="text-title">Components</h2>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">PetView · every species and mood</h3>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <template v-for="species in PET_SPECIES" :key="species">
          <figure
            v-for="mood in PET_MOODS"
            :key="`${species}-${mood}`"
            class="flex flex-col items-center gap-2 rounded-lg bg-canvas-warm p-4"
          >
            <PetView :species="species" :mood="mood" :size="120" />
            <figcaption class="text-body-sm text-ink-muted">{{ species }} · {{ mood }}</figcaption>
          </figure>
        </template>
      </div>
      <PetGreeting species="cat" mood="happy" message="That was great! Ready for another round?" />
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">PetAccessory · every shop item on both pets</h3>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <template v-for="item in accessories" :key="item.assetKey">
          <figure
            v-for="species in PET_SPECIES"
            :key="`${item.assetKey}-${species}`"
            class="flex flex-col items-center gap-2 rounded-lg bg-canvas-warm p-4"
          >
            <PetView
              :species="species"
              mood="happy"
              :equipped="{ [item.slot]: item.assetKey }"
              :size="120"
            />
            <figcaption class="text-body-sm text-ink-muted">{{ item.assetKey }}</figcaption>
          </figure>
        </template>
        <template v-for="(outfit, index) in outfits" :key="index">
          <figure
            v-for="species in PET_SPECIES"
            :key="`${index}-${species}`"
            class="flex flex-col items-center gap-2 rounded-lg bg-canvas-warm p-4"
          >
            <PetView :species="species" mood="neutral" :equipped="outfit" :size="120" />
            <figcaption class="text-body-sm text-ink-muted">outfit {{ index + 1 }}</figcaption>
          </figure>
        </template>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">
        UiTabs · ShopItem (for sale, too expensive, owned, wearing, locked)
      </h3>
      <UiTabs v-model="tabsValue" :options="tabOptions" label="Item type" class="max-w-phone" />
      <ul class="grid max-w-app grid-cols-2 gap-3 sm:grid-cols-5">
        <li>
          <ShopItem
            name="Party hat"
            item-slot="head"
            asset-key="party-hat"
            state="forSale"
            :price="30"
            :selected="selectedTile === 'party-hat'"
            @click="selectedTile = 'party-hat'"
          />
        </li>
        <li>
          <ShopItem
            name="Night sky"
            item-slot="background"
            asset-key="night-sky"
            state="forSale"
            :price="180"
            :affordable="false"
            :selected="selectedTile === 'night-sky'"
            @click="selectedTile = 'night-sky'"
          />
        </li>
        <li>
          <ShopItem
            name="Round glasses"
            item-slot="face"
            asset-key="round-glasses"
            state="owned"
            :selected="selectedTile === 'round-glasses'"
            @click="selectedTile = 'round-glasses'"
          />
        </li>
        <li>
          <ShopItem
            name="Bow tie"
            item-slot="neck"
            asset-key="bow-tie"
            state="equipped"
            :selected="selectedTile === 'bow-tie'"
            @click="selectedTile = 'bow-tie'"
          />
        </li>
        <li>
          <ShopItem
            name="Wizard hat"
            item-slot="head"
            asset-key="wizard-hat"
            state="locked"
            :required-level="5"
            :selected="selectedTile === 'wizard-hat'"
            @click="selectedTile = 'wizard-hat'"
          />
        </li>
      </ul>
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">UiButton</h3>
      <div class="flex flex-wrap items-start gap-3">
        <UiButton icon="play">Start focus</UiButton>
        <UiButton variant="leaf">Take a break</UiButton>
        <UiButton variant="grape" icon="star">Level up</UiButton>
        <UiButton variant="outline">Skip</UiButton>
        <UiButton variant="ink">Start</UiButton>
      </div>
      <div class="flex flex-wrap items-start gap-3">
        <UiButton size="sm">Small</UiButton>
        <UiButton loading>Saving</UiButton>
        <UiButton disabled>Disabled</UiButton>
        <UiButton variant="outline" to="/">Link to home</UiButton>
      </div>
      <div class="max-w-phone">
        <UiButton block>Block button</UiButton>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">UiCard</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <UiCard>
          <h4 class="text-heading">Plain</h4>
          <p class="text-body text-ink-muted">Outlined, no shadow.</p>
        </UiCard>
        <UiCard tone="focus">
          <h4 class="text-heading">Focus</h4>
          <p class="text-body text-ink-muted">tomato-tint</p>
        </UiCard>
        <UiCard tone="break">
          <h4 class="text-heading">Break</h4>
          <p class="text-body text-ink-muted">leaf-tint</p>
        </UiCard>
        <UiCard tone="level">
          <h4 class="text-heading">Level</h4>
          <p class="text-body text-ink-muted">grape-tint</p>
        </UiCard>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">UiChip · UiProgressBar · useToast</h3>
      <div class="flex flex-wrap items-center gap-2">
        <UiChip icon="flame" :value="streak" label="day streak" tone="sun" />
        <UiChip icon="star" :value="3" label="level" tone="grape" />
        <UiChip icon="coins" :value="coins" label="coins" tone="sun" />
        <UiChip icon="timer" value="4/4" label="sessions today" />
      </div>
      <div class="max-w-phone space-y-4">
        <UiProgressBar
          label="Level 3"
          :value="xp"
          :max="xpForNextLevel"
          :value-text="`${xp} / ${xpForNextLevel} XP`"
        />
        <UiProgressBar label="Daily goal" :value="3" :max="4" value-text="3 of 4" color="leaf" />
        <UiProgressBar label="Session" :value="60" color="tomato" />
      </div>
      <div class="flex flex-wrap gap-3">
        <UiButton variant="leaf" size="sm" icon="coins" @click="earnCoins">+10 coins</UiButton>
        <UiButton variant="outline" size="sm" @click="streak++">+1 streak</UiButton>
        <UiButton variant="outline" size="sm" @click="toast.show('Settings saved.')">
          Info toast
        </UiButton>
        <UiButton
          variant="outline"
          size="sm"
          @click="toast.show('Could not reach the server.', { tone: 'error' })"
        >
          Error toast
        </UiButton>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">UiFormField · UiInput</h3>
      <form class="max-w-phone space-y-4" @submit.prevent>
        <UiFormField v-slot="field" label="Email" help="We never share it.">
          <UiInput
            v-model="email"
            v-bind="field"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </UiFormField>
        <UiFormField v-slot="field" label="Password" :error="passwordError">
          <UiInput v-model="password" v-bind="field" type="password" />
        </UiFormField>
      </form>
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">UiSelect · UiStepper · UiSwitch</h3>
      <div class="max-w-phone space-y-4">
        <UiFormField v-slot="field" label="What are you studying?">
          <UiSelect v-model="subject" v-bind="field" :options="subjects" />
        </UiFormField>
        <UiFormField v-slot="field" label="Focus" help="15 to 60 minutes">
          <UiStepper
            v-model="focusMinutes"
            v-bind="field"
            :min="15"
            :max="60"
            :step="5"
            name="focus length"
            unit="min"
          />
        </UiFormField>
        <UiSwitch
          v-model="isSwitchOn"
          label="Animations"
          description="Moving effects, rewards and your pet's animations."
        />
        <UiSwitch v-model="isSwitchOn" label="Disabled" disabled />
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">UiSheet</h3>
      <div class="flex items-center gap-4">
        <UiButton variant="outline" @click="isSheetOpen = true">Quit session</UiButton>
        <span v-if="lastSheetChoice" class="text-body-sm text-ink-muted">
          You chose: {{ lastSheetChoice }}
        </span>
      </div>
      <UiSheet
        v-model:open="isSheetOpen"
        title="Quit this session?"
        description="Mochi will be a little sad, but you can start again anytime."
      >
        <template #actions>
          <UiButton block @click="chooseInSheet('keep going')">Keep going</UiButton>
          <UiButton variant="outline" block @click="chooseInSheet('quit')">Quit session</UiButton>
        </template>
      </UiSheet>
    </div>

    <div class="space-y-3">
      <h3 class="text-label text-ink-muted">UiIcon (Lucide, 20 and 24 px)</h3>
      <div class="flex flex-wrap items-center gap-4 text-ink">
        <UiIcon v-for="name in icons" :key="name" :name="name" />
      </div>
      <div class="flex flex-wrap items-center gap-4 text-ink-muted">
        <UiIcon v-for="name in icons" :key="name" :name="name" :size="24" />
      </div>
    </div>
  </section>
</template>
