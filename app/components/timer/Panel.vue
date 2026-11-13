<script setup lang="ts">
import type { SessionMode } from '#shared/constants'
import { FOCUS_SESSIONS_PER_CYCLE } from '#shared/timer'
import type { TimerPhase } from '#shared/timer'
import type { TaskDto } from '#shared/types/task'

/**
 * The timer card on the home page: mode tabs, task picker, ring, cycle dots and controls.
 * `tasks` are the open tasks a focus session can be for.
 */
const props = withDefaults(defineProps<{ tasks?: TaskDto[] }>(), { tasks: () => [] })

const timer = useTimerStore()
const pet = usePetStore()

const isQuitSheetOpen = ref(false)

const selectedMode = computed({
  get: () => timer.mode,
  set: (mode: SessionMode) => timer.selectMode(mode),
})

// The picker works with strings ('' = no task); the store keeps the id.
const selectedTask = computed({
  get: () => (timer.taskId === null ? '' : String(timer.taskId)),
  set: (value: string) => timer.selectTask(value === '' ? null : Number(value)),
})
const taskOptions = computed(() => [
  { value: '', label: 'No task' },
  ...props.tasks.map((task) => ({ value: String(task.id), label: task.title })),
])
const currentTask = computed(() => props.tasks.find((task) => task.id === timer.taskId))
const canPickTask = computed(
  () => timer.phase === 'idle' && timer.mode === 'focus' && props.tasks.length > 0,
)

// A task that was ticked off or deleted can't be picked any more.
watch(
  () => props.tasks,
  (tasks) => {
    if (timer.taskId !== null && !tasks.some((task) => task.id === timer.taskId)) {
      timer.selectTask(null)
    }
  },
)

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

    <UiFormField
      v-if="canPickTask"
      v-slot="field"
      label="What are you studying?"
      class="w-full max-w-sm"
    >
      <UiSelect v-model="selectedTask" v-bind="field" :options="taskOptions" />
    </UiFormField>
    <p
      v-else-if="timer.isActive && timer.mode === 'focus' && currentTask"
      class="flex max-w-sm items-center gap-1.5 text-body text-ink-muted"
    >
      <UiIcon name="list-checks" :size="20" class="shrink-0" />
      <span class="truncate">{{ currentTask.title }}</span>
    </p>

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
