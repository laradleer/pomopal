<script setup lang="ts">
// Today's totals, the streak and the level on top, the last 7 days as a bar chart below (#26).
useSeoMeta({ title: 'Stats' })

const profile = useProfileStore()
const pet = usePetStore()
const { days, today, week, pending } = await useStats()

const isLoading = computed(() => pending.value && days.value.length === 0)

// Streak and level come from the profile (already loaded); today's numbers wait for the stats.
const tiles = computed(() => [
  {
    label: 'Focus today',
    value: formatMinutes(today.value.focusMinutes),
    icon: 'timer',
    iconClass: 'bg-tomato-tint text-tomato',
    isFromStats: true,
  },
  {
    label: today.value.focusSessions === 1 ? 'Session today' : 'Sessions today',
    value: today.value.focusSessions,
    icon: 'circle-check',
    iconClass: 'bg-leaf-tint text-leaf',
    isFromStats: true,
  },
  {
    label: 'Day streak',
    value: profile.streakDays,
    icon: 'flame',
    iconClass: 'bg-sun-tint text-sun-ink',
    isFromStats: false,
  },
  {
    label: 'Level',
    value: profile.level,
    icon: 'star',
    iconClass: 'bg-grape-tint text-grape',
    isFromStats: false,
  },
])
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-title">Stats</h1>

    <ul class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <li v-for="tile in tiles" :key="tile.icon">
        <UiCard :padded="false" class="flex items-center gap-3 p-4">
          <span
            class="grid size-10 shrink-0 place-items-center rounded-pill"
            :class="tile.iconClass"
          >
            <UiIcon :name="tile.icon" />
          </span>
          <div class="min-w-0">
            <UiSkeleton v-if="isLoading && tile.isFromStats" class="h-7 w-16" />
            <p v-else class="text-heading tabular-nums">{{ tile.value }}</p>
            <p class="text-body-sm text-ink-muted">{{ tile.label }}</p>
          </div>
        </UiCard>
      </li>
    </ul>

    <UiCard class="space-y-5">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 class="text-heading">Last 7 days</h2>
        <p v-if="!isLoading" class="text-label text-ink-muted">
          {{ formatMinutes(week.focusMinutes) }} · {{ week.focusSessions }}
          {{ week.focusSessions === 1 ? 'session' : 'sessions' }}
        </p>
      </div>

      <UiSkeleton v-if="isLoading" class="h-56" />
      <div
        v-else-if="week.focusSessions === 0"
        class="flex flex-col items-start gap-4 rounded-xl bg-canvas-warm px-4 py-6 sm:px-6 sm:py-8"
      >
        <PetGreeting
          :species="pet.species"
          mood="sleepy"
          :name="pet.name"
          :equipped="pet.equipped"
          message="No sessions this week yet. Let's grow your first bar!"
        />
        <UiButton variant="outline" icon="timer" to="/home">Start a session</UiButton>
      </div>
      <StatsWeekChart v-else :days="days" />
    </UiCard>
  </div>
</template>
