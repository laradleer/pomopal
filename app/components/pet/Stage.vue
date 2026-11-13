<script setup lang="ts">
import type { PetMood } from '#shared/constants'
import type { EquippedItems } from '#shared/types/shop'

/**
 * The pet's room: the student's mascot (live) in its room, with its speech bubble on top.
 * The same stage is used on home, /pet and /shop, so the mascot looks the same everywhere.
 *
 * The room is the equipped background, or the default room. Its drawing is shown whole
 * (never cropped), centred on the floor; the stage's own wall and floor colours fill the sides,
 * so it fits any stage width.
 *
 *   <PetStage :mood="mood" :message="line" />
 */
const props = withDefaults(
  defineProps<{
    mood: PetMood
    message: string
    /** What the pet wears; defaults to its own items (the shop passes a try-on preview). */
    equipped?: EquippedItems
    /** Lower stage, e.g. on home while a session runs, so the timer stays the main thing. */
    compact?: boolean
  }>(),
  { equipped: undefined, compact: false },
)

defineSlots<{
  /** Bottom-left corner, e.g. the mood label. */
  badge?(): unknown
}>()

const pet = usePetStore()

const outfit = computed(() => props.equipped ?? pet.equipped)
const room = computed(() => outfit.value.background ?? 'room')
/** The pet itself wears everything but the background, which is the room. */
const worn = computed(() => ({ ...outfit.value, background: undefined }))

// Wall and floor colours of each room, matching its drawing.
const ROOM_COLORS: Record<string, { wall: string; floor: string }> = {
  room: { wall: 'bg-pet-wall', floor: 'bg-pet-wood' },
  library: { wall: 'bg-pet-wall', floor: 'bg-pet-wood-shade' },
  'night-sky': { wall: 'bg-pet-night', floor: 'bg-pet-night-shade' },
}
const colors = computed(() => ROOM_COLORS[room.value] ?? ROOM_COLORS.room)
</script>

<template>
  <section
    :aria-label="`${pet.name}'s room`"
    class="relative isolate aspect-square w-full overflow-hidden rounded-xl transition-[max-height] duration-(--duration-move) ease-soft md:aspect-[4/3]"
    :class="[colors?.wall, props.compact ? 'max-h-[30svh]' : 'max-h-[52svh]']"
  >
    <!-- Floor band under the drawing's floor (its bottom 17%), so the sides continue it -->
    <div class="absolute inset-x-0 bottom-0 h-[17%]" :class="colors?.floor" aria-hidden="true" />
    <Transition
      enter-active-class="transition-opacity duration-(--duration-move)"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-(--duration-move)"
      leave-to-class="opacity-0"
    >
      <svg
        :key="room"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMax meet"
        class="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <PetAccessory :asset-key="room" />
      </svg>
    </Transition>

    <div class="absolute inset-x-4 top-4 flex justify-center">
      <PetBubble class="max-w-sm">{{ props.message }}</PetBubble>
    </div>

    <div v-if="$slots.badge" class="absolute bottom-4 left-4 z-10">
      <slot name="badge" />
    </div>

    <div class="absolute inset-x-0 bottom-[3%] flex h-full items-end justify-center">
      <PetView
        :species="pet.species"
        :mood="props.mood"
        :name="pet.name"
        :equipped="worn"
        :size="200"
        class="h-[68%] w-auto max-w-[60%]"
        live
      />
    </div>
  </section>
</template>
