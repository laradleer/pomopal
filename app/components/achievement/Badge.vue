<script setup lang="ts">
/**
 * One badge on the pet page: a sun sticker with a darker rim once unlocked, a grey one with a
 * progress bar while locked. A badge that was just unlocked (`isNew`) pops in.
 */
const props = defineProps<{
  title: string
  description: string
  icon: string
  current: number
  goal: number
  progressText: string
  isUnlocked: boolean
  isNew: boolean
}>()
</script>

<template>
  <div class="flex items-start gap-3">
    <span
      class="grid size-12 shrink-0 place-items-center rounded-pill"
      :class="[
        props.isUnlocked ? 'bg-sun text-on-sun edge-sun-edge' : 'bg-surface-sunken text-ink-muted',
        props.isNew && 'motion-safe:animate-pop',
      ]"
    >
      <UiIcon :name="props.isUnlocked ? props.icon : 'lock'" :size="24" />
    </span>
    <div class="min-w-0 flex-1 space-y-1">
      <p class="text-label" :class="!props.isUnlocked && 'text-ink-muted'">
        {{ props.title }}
        <span v-if="!props.isUnlocked" class="sr-only">(locked)</span>
      </p>
      <p class="text-body-sm text-ink-muted">{{ props.description }}</p>
      <UiProgressBar
        v-if="!props.isUnlocked"
        color="leaf"
        label="Progress"
        :value="props.current"
        :max="props.goal"
        :value-text="props.progressText"
        class="pt-1"
      />
    </div>
  </div>
</template>
