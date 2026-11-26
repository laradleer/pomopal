<script setup lang="ts">
/**
 * Focus minutes per day as tomato bars, today on the right. Hovering a day shows its minutes and
 * sessions. The bars are hidden from screen readers, which get the same numbers as a table.
 */
import type { StatsDay } from '~/composables/useStats'

const props = defineProps<{ days: StatsDay[] }>()

/** The top of the axis: whole half hours up to 2 hours, then whole hours. */
const axisMax = computed(() => {
  const most = Math.max(0, ...props.days.map((day) => day.focusMinutes))
  const step = most <= 120 ? 30 : 60
  return Math.max(step, Math.ceil(most / step) * step)
})
const ticks = computed(() => [axisMax.value, axisMax.value / 2, 0])

function percent(minutes: number) {
  return (minutes / axisMax.value) * 100
}

/** Axis labels stay short: "1 h", "2 h", "45 min", "0". */
function tickText(minutes: number) {
  if (minutes === 0) return '0'
  return minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`
}

function sessionsText(count: number) {
  return `${count} ${count === 1 ? 'session' : 'sessions'}`
}
</script>

<template>
  <figure class="space-y-2">
    <div class="flex gap-2" aria-hidden="true">
      <div class="relative h-48 w-14 shrink-0 text-right text-body-sm text-ink-muted tabular-nums">
        <span
          v-for="tick in ticks"
          :key="tick"
          class="absolute right-0 translate-y-1/2"
          :style="{ bottom: `${percent(tick)}%` }"
        >
          {{ tickText(tick) }}
        </span>
      </div>

      <div class="relative h-48 flex-1">
        <div
          v-for="tick in ticks"
          :key="tick"
          class="absolute inset-x-0 border-t"
          :class="tick === 0 ? 'border-border-strong' : 'border-border'"
          :style="{ bottom: `${percent(tick)}%` }"
        />
        <div class="absolute inset-0 grid grid-cols-7 gap-2">
          <div
            v-for="(day, index) in props.days"
            :key="day.date"
            class="group relative flex items-end justify-center"
          >
            <div
              class="w-full max-w-8 rounded-t-[4px] bg-tomato transition-[height,background-color] duration-(--duration-move) ease-soft group-hover:bg-tomato-edge"
              :style="{ height: `${percent(day.focusMinutes)}%` }"
            />
            <div
              class="pointer-events-none absolute z-10 rounded-sm border border-border bg-surface px-3 py-2 text-body-sm whitespace-nowrap text-ink opacity-0 shadow-float transition-opacity group-hover:opacity-100"
              :class="
                index === 0
                  ? 'left-0'
                  : index === props.days.length - 1
                    ? 'right-0'
                    : 'left-1/2 -translate-x-1/2'
              "
              :style="{ bottom: `calc(${percent(day.focusMinutes)}% + 0.5rem)` }"
            >
              <p class="text-label">{{ day.longLabel }}</p>
              <p class="text-ink-muted">
                {{ formatMinutes(day.focusMinutes) }} · {{ sessionsText(day.focusSessions) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-2" aria-hidden="true">
      <div class="w-14 shrink-0" />
      <div class="grid flex-1 grid-cols-7 gap-2 text-center text-body-sm">
        <span
          v-for="day in props.days"
          :key="day.date"
          :class="day.isToday ? 'text-label text-ink' : 'text-ink-muted'"
        >
          {{ day.shortLabel }}
        </span>
      </div>
    </div>

    <table class="sr-only">
      <caption>
        Focus time per day, last 7 days
      </caption>
      <thead>
        <tr>
          <th scope="col">Day</th>
          <th scope="col">Focus time</th>
          <th scope="col">Sessions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in props.days" :key="day.date">
          <th scope="row">{{ day.longLabel }}</th>
          <td>{{ formatMinutes(day.focusMinutes) }}</td>
          <td>{{ day.focusSessions }}</td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>
