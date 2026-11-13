<script setup lang="ts">
import { TIMER_LIMITS } from '#shared/constants'
import { timerSettingsSchema } from '#shared/schemas/settings'

useSeoMeta({ title: 'Settings' })

const user = useUserStore()
const profile = useProfileStore()
const { signOut } = await useAuthActions()
const { saveTimerSettings } = useTimerSettings()
const motion = useMotion()
const sound = useSound()
const sounds = computed({
  get: () => sound.isEnabled.value,
  set: (value: boolean) => sound.setEnabled(value),
})

const animations = computed({
  get: () => motion.isEnabled.value && !motion.prefersReduced.value,
  set: (value: boolean) => motion.setEnabled(value),
})
const animationsHelp = computed(() =>
  motion.prefersReduced.value
    ? 'Your device asks for less motion, so animations stay off.'
    : "Moving effects, rewards and your pet's animations.",
)

const { values, errors, formError, pending, submit } = useZodForm(timerSettingsSchema, {
  focusMin: profile.timerMinutes.focus,
  shortBreakMin: profile.timerMinutes.short,
  longBreakMin: profile.timerMinutes.long,
})

const fields = [
  {
    key: 'focusMin',
    label: 'Focus',
    name: 'focus length',
    limits: TIMER_LIMITS.focus,
    step: 5,
  },
  {
    key: 'shortBreakMin',
    label: 'Short break',
    name: 'short break length',
    limits: TIMER_LIMITS.shortBreak,
    step: 1,
  },
  {
    key: 'longBreakMin',
    label: 'Long break',
    name: 'long break length',
    limits: TIMER_LIMITS.longBreak,
    step: 5,
  },
] as const

const signingOut = ref(false)

async function onSignOut() {
  signingOut.value = true
  await signOut()
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-title">Settings</h1>

    <div class="grid gap-6 md:grid-cols-2 md:items-start">
      <UiCard>
        <form class="space-y-5" novalidate @submit.prevent="submit(saveTimerSettings)">
          <div class="space-y-1">
            <h2 class="text-heading">Timer</h2>
            <p class="text-body-sm text-ink-muted">New lengths start with your next session.</p>
          </div>

          <UiFormField
            v-for="field in fields"
            :key="field.key"
            v-slot="attrs"
            :label="field.label"
            :help="`${field.limits.min} to ${field.limits.max} minutes`"
            :error="errors[field.key]"
          >
            <UiStepper
              v-model="values[field.key]"
              v-bind="attrs"
              :min="field.limits.min"
              :max="field.limits.max"
              :step="field.step"
              :name="field.name"
              unit="min"
            />
          </UiFormField>

          <UiAlert v-if="formError">{{ formError }}</UiAlert>
          <UiButton type="submit" block icon="check" :loading="pending">Save timer</UiButton>
        </form>
      </UiCard>

      <div class="space-y-6">
        <UiCard class="space-y-4">
          <h2 class="text-heading">App</h2>
          <UiSwitch
            v-model="animations"
            label="Animations"
            :description="animationsHelp"
            :disabled="motion.prefersReduced.value"
          />
          <UiSwitch
            v-model="sounds"
            label="Sounds"
            description="Soft sounds for rewards and the end of a session."
          />
        </UiCard>

        <UiCard class="space-y-4">
          <h2 class="text-heading">Account</h2>
          <dl class="space-y-1 text-body">
            <div class="flex gap-2">
              <dt class="text-ink-muted">Name</dt>
              <dd>{{ user.me?.user.name }}</dd>
            </div>
            <div class="flex gap-2">
              <dt class="text-ink-muted">Email</dt>
              <dd class="break-all">{{ user.me?.user.email }}</dd>
            </div>
          </dl>
          <UiButton variant="outline" icon="log-out" :loading="signingOut" @click="onSignOut">
            Log out
          </UiButton>
        </UiCard>
      </div>
    </div>
  </div>
</template>
