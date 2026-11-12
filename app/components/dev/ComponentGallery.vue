<script setup lang="ts">
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
