<script setup lang="ts">
import type { PetMood, PetSpecies } from '#shared/constants'

/**
 * The cat or dog, drawn in SVG (200 × 200) in one flat, rounded style, with four moods.
 *
 * Accessories go in named slots that are already placed on the pet's anchors, so every item
 * fits both species. Draw them around (0, 0):
 *   background  behind the pet (full 200 × 200 box)
 *   neck        centre of the neck, under the chin
 *   head        top of the head
 *   face        between the eyes
 */
const props = withDefaults(
  defineProps<{
    species: PetSpecies
    mood: PetMood
    /** Rendered width and height in px. */
    size?: number
    /** Used for the accessible label, e.g. "Biscuit". */
    name?: string
  }>(),
  { size: 120, name: undefined },
)

defineSlots<{
  background?(): unknown
  neck?(): unknown
  head?(): unknown
  face?(): unknown
}>()

const FUR = {
  cat: { fill: 'fill-pet-cat', stroke: 'stroke-pet-cat', shade: 'fill-pet-cat-shade' },
  dog: { fill: 'fill-pet-dog', stroke: 'stroke-pet-dog', shade: 'fill-pet-dog-shade' },
} as const

const MOOD_WORD: Record<PetMood, string> = {
  happy: 'happy',
  sleepy: 'sleepy',
  sad: 'a little sad',
  neutral: 'calm',
}

const fur = computed(() => FUR[props.species])
const label = computed(
  () => `${props.name ?? `Your ${props.species}`} looks ${MOOD_WORD[props.mood]}`,
)

// Hop once when the pet becomes happy (e.g. after a completed session).
const hops = ref(0)
watch(
  () => props.mood,
  (mood) => {
    if (mood === 'happy') hops.value++
  },
)
</script>

<template>
  <svg
    viewBox="0 0 200 200"
    :width="props.size"
    :height="props.size"
    role="img"
    :aria-label="label"
    class="shrink-0 overflow-visible"
  >
    <g><slot name="background" /></g>

    <g :key="hops" :class="hops > 0 && 'motion-safe:animate-hop'">
      <!-- Shadow -->
      <ellipse cx="100" cy="190" rx="50" ry="6" class="fill-pet-line opacity-10" />

      <!-- Tail -->
      <path
        v-if="props.species === 'cat'"
        d="M144 168 C 178 160 182 120 160 108"
        fill="none"
        stroke-width="14"
        stroke-linecap="round"
        :class="fur.stroke"
      />
      <path
        v-else
        d="M146 162 C 170 160 178 142 170 126"
        fill="none"
        stroke-width="14"
        stroke-linecap="round"
        :class="fur.stroke"
      />

      <!-- Body, belly, paws -->
      <ellipse cx="100" cy="160" rx="48" ry="32" :class="fur.fill" />
      <ellipse cx="100" cy="166" rx="26" ry="20" class="fill-pet-cream" />
      <ellipse cx="82" cy="186" rx="13" ry="8" :class="fur.fill" />
      <ellipse cx="118" cy="186" rx="13" ry="8" :class="fur.fill" />

      <!-- Neck accessories sit on the body, under the chin -->
      <g transform="translate(100 142)"><slot name="neck" /></g>

      <!-- Cat ears sit behind the head -->
      <g v-if="props.species === 'cat'">
        <path
          d="M52 80 L60 26 L98 54 Z"
          stroke-width="8"
          stroke-linejoin="round"
          :class="[fur.fill, fur.stroke]"
        />
        <path
          d="M148 80 L140 26 L102 54 Z"
          stroke-width="8"
          stroke-linejoin="round"
          :class="[fur.fill, fur.stroke]"
        />
        <path d="M63 66 L67 40 L88 55 Z" class="fill-pet-blush" />
        <path d="M137 66 L133 40 L112 55 Z" class="fill-pet-blush" />
      </g>

      <!-- Head -->
      <circle cx="100" cy="98" r="54" :class="fur.fill" />

      <!-- Cat stripes / dog ears (dog ears hang over the head) -->
      <g v-if="props.species === 'cat'" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M100 46 V58" class="stroke-pet-cat-shade" />
        <path d="M86 48 L89 58" class="stroke-pet-cat-shade" />
        <path d="M114 48 L111 58" class="stroke-pet-cat-shade" />
      </g>
      <g v-else :class="fur.shade">
        <path d="M56 60 C 34 62 28 104 42 126 C 56 122 64 92 74 66 Z" />
        <path d="M144 60 C 166 62 172 104 158 126 C 144 122 136 92 126 66 Z" />
      </g>

      <!-- Muzzle -->
      <ellipse
        v-if="props.species === 'dog'"
        cx="100"
        cy="120"
        rx="28"
        ry="21"
        class="fill-pet-cream"
      />
      <g v-else class="fill-pet-cream">
        <ellipse cx="91" cy="119" rx="11" ry="8" />
        <ellipse cx="109" cy="119" rx="11" ry="8" />
      </g>

      <!-- Cheeks -->
      <g class="fill-pet-blush" :class="props.mood === 'happy' ? 'opacity-75' : 'opacity-35'">
        <circle cx="62" cy="114" r="8" />
        <circle cx="138" cy="114" r="8" />
      </g>

      <!-- Eyes -->
      <g
        v-if="props.mood === 'happy'"
        fill="none"
        stroke-width="4.5"
        stroke-linecap="round"
        class="stroke-pet-line"
      >
        <path d="M70 99 Q78 88 86 99" />
        <path d="M114 99 Q122 88 130 99" />
      </g>
      <g
        v-else-if="props.mood === 'sleepy'"
        fill="none"
        stroke-width="4"
        stroke-linecap="round"
        class="stroke-pet-line"
      >
        <path d="M70 96 Q78 103 86 96" />
        <path d="M114 96 Q122 103 130 96" />
      </g>
      <g v-else>
        <circle cx="78" :cy="props.mood === 'sad' ? 98 : 96" r="7" class="fill-pet-line" />
        <circle cx="122" :cy="props.mood === 'sad' ? 98 : 96" r="7" class="fill-pet-line" />
        <circle cx="80.5" :cy="props.mood === 'sad' ? 95.5 : 93.5" r="2.5" class="fill-pet-cream" />
        <circle
          cx="124.5"
          :cy="props.mood === 'sad' ? 95.5 : 93.5"
          r="2.5"
          class="fill-pet-cream"
        />
      </g>

      <!-- Sad brows and a tear -->
      <g v-if="props.mood === 'sad'">
        <g fill="none" stroke-width="3.5" stroke-linecap="round" class="stroke-pet-line">
          <path d="M66 86 L86 80" />
          <path d="M134 86 L114 80" />
        </g>
        <path d="M131 106 C 127 114 127 119 131 120 C 135 119 135 114 131 106 Z" class="fill-sky" />
      </g>

      <!-- Nose -->
      <path
        v-if="props.species === 'cat'"
        d="M94 110 Q100 106 106 110 Q100 117 94 110 Z"
        class="fill-pet-blush"
      />
      <ellipse v-else cx="100" cy="110" rx="9" ry="6.5" class="fill-pet-line" />

      <!-- Mouth -->
      <g v-if="props.mood === 'happy'">
        <path d="M88 121 Q100 140 112 121 Z" class="fill-pet-line" />
        <ellipse cx="100" cy="131" rx="6" ry="4" class="fill-pet-blush" />
      </g>
      <path
        v-else-if="props.mood === 'sad'"
        d="M90 130 Q100 121 110 130"
        fill="none"
        stroke-width="3"
        stroke-linecap="round"
        class="stroke-pet-line"
      />
      <ellipse
        v-else-if="props.mood === 'sleepy'"
        cx="100"
        cy="126"
        rx="4"
        ry="5"
        fill="none"
        stroke-width="3"
        class="stroke-pet-line"
      />
      <path
        v-else
        :d="
          props.species === 'cat'
            ? 'M90 121 Q95 126 100 121 Q105 126 110 121'
            : 'M92 124 Q100 130 108 124'
        "
        fill="none"
        stroke-width="3"
        stroke-linecap="round"
        class="stroke-pet-line"
      />

      <!-- Cat whiskers -->
      <g
        v-if="props.species === 'cat'"
        stroke-width="2"
        stroke-linecap="round"
        class="stroke-pet-line opacity-50"
      >
        <path d="M58 112 L76 115" />
        <path d="M58 122 L76 120" />
        <path d="M142 112 L124 115" />
        <path d="M142 122 L124 120" />
      </g>

      <!-- Sleepy Zs -->
      <g
        v-if="props.mood === 'sleepy'"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="stroke-pet-line"
      >
        <path d="M152 36 h14 l-14 16 h14" stroke-width="3.5" />
        <path d="M172 14 h9 l-9 10 h9" stroke-width="3" />
      </g>

      <!-- Head and face accessories -->
      <g transform="translate(100 46)"><slot name="head" /></g>
      <g transform="translate(100 96)"><slot name="face" /></g>
    </g>
  </svg>
</template>
