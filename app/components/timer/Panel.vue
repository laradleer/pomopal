<script setup lang="ts">
import type { SessionMode } from '#shared/constants'
import { FOCUS_SESSIONS_PER_CYCLE } from '#shared/timer'
import type { TimerPhase } from '#shared/timer'

/** The timer card on the home page: mode tabs, ring, cycle dots and controls. */
const timer = useTimerStore()
const pet = usePetStore()

const isQuitSheetOpen = ref(false)

const selectedMode = computed({
  get: () => timer.mode,
  set: (mode: SessionMode) => timer.selectMode(mode),
})

const RING_COLOR: Record<SessionMode, 'tomato' | 'leaf' | 'sky'> = {
  focus: 'tomato',
  short: 'leaf',
  long: 'sky',
}

const CARD_TONE: Record<TimerPhase, 'plain' | 'focus' | 'break'> = {
  idle: 'plain',
  focusing: 'focus',
  paused: 'focus',
  shortBreak: 'break',
  longBreak: 'break',
}

const START_LABEL: Record<SessionMode, string> = {
  focus: 'Start focus',
  short: 'Start short break',
  long: 'Start long break',
}

const sessionNumber = computed(() =>
  Math.min(timer.completedInCycle + (timer.phase === 'idle' ? 1 : 0), FOCUS_SESSIONS_PER_CYCLE),
)

function confirmQuit() {
  isQuitSheetOpen.value = false
  timer.quit()
}
</script>

<template>
  <UiCard :tone="CARD_TONE[timer.phase]" class="flex flex-col items-center gap-6">
    <TimerModeTabs v-model="selectedMode" :disabled="timer.isActive" />

    <TimerRing :progress="timer.progress" :color="RING_COLOR[timer.mode]">
      <span class="text-timer" role="timer" :aria-label="`${timer.clock} left`">
        {{ timer.clock }}
      </span>
      <span class="text-label text-ink-muted">{{ timer.phaseLabel }}</span>
    </TimerRing>

    <div
      class="flex items-center gap-2"
      :aria-label="`Session ${sessionNumber} of ${FOCUS_SESSIONS_PER_CYCLE}`"
    >
      <span
        v-for="dot in FOCUS_SESSIONS_PER_CYCLE"
        :key="dot"
        class="size-2.5 rounded-pill"
        :class="dot <= timer.completedInCycle ? 'bg-tomato' : 'bg-border-strong'"
        aria-hidden="true"
      />
    </div>

    <div class="flex w-full max-w-sm flex-col gap-2">
      <UiButton
        v-if="timer.phase === 'idle'"
        block
        icon="play"
        :variant="timer.mode === 'focus' ? 'primary' : 'leaf'"
        @click="timer.start()"
      >
        {{ START_LABEL[timer.mode] }}
      </UiButton>

      <template v-else-if="timer.phase === 'focusing' || timer.phase === 'paused'">
        <UiButton
          v-if="timer.phase === 'focusing'"
          block
          variant="ink"
          icon="pause"
          @click="timer.pause()"
        >
          Pause
        </UiButton>
        <UiButton v-else block icon="play" @click="timer.resume()">Resume</UiButton>
        <UiButton block variant="outline" @click="isQuitSheetOpen = true">Quit</UiButton>
      </template>

      <UiButton v-else block variant="outline" icon="skip-forward" @click="timer.skipBreak()">
        Skip break
      </UiButton>
    </div>

    <UiSheet
      v-model:open="isQuitSheetOpen"
      title="Quit this session?"
      :description="`${pet.name} will be a little sad, but you can start again anytime.`"
    >
      <template #actions>
        <UiButton block @click="isQuitSheetOpen = false">Keep going</UiButton>
        <UiButton block variant="outline" @click="confirmQuit">Quit session</UiButton>
      </template>
    </UiSheet>
  </UiCard>
</template>
