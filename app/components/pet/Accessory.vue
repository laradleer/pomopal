<script setup lang="ts">
/**
 * The drawing of one shop item, by its `assetKey` (server/db/shop-items.ts). Renders SVG shapes
 * only, so it goes inside an <svg>: <PetView> puts it on the pet's anchors, <ShopItemArt> shows it
 * on its own. Hats, glasses and neck items are drawn around (0, 0), backgrounds fill 0–200.
 * Unknown keys draw nothing.
 */
const props = defineProps<{ assetKey: string }>()

/** A soft four-point sparkle centred on (x, y). */
function sparkle(x: number, y: number, size: number): string {
  return `M${x} ${y - size} Q${x} ${y} ${x + size} ${y} Q${x} ${y} ${x} ${y + size} Q${x} ${y} ${x - size} ${y} Q${x} ${y} ${x} ${y - size} Z`
}

const LIBRARY_BOOKS = [
  // Top shelf (stands on y = 64), left and right of the pet's head
  { x: 14, y: 30, w: 10, h: 34, color: 'fill-pet-red' },
  { x: 25, y: 36, w: 9, h: 28, color: 'fill-pet-blue' },
  { x: 35, y: 26, w: 11, h: 38, color: 'fill-pet-green' },
  { x: 142, y: 32, w: 10, h: 32, color: 'fill-pet-purple' },
  { x: 153, y: 26, w: 11, h: 38, color: 'fill-pet-red' },
  { x: 165, y: 36, w: 9, h: 28, color: 'fill-pet-gold' },
  { x: 175, y: 30, w: 10, h: 34, color: 'fill-pet-blue' },
  // Bottom shelf (stands on y = 120)
  { x: 12, y: 86, w: 10, h: 34, color: 'fill-pet-blue' },
  { x: 23, y: 92, w: 9, h: 28, color: 'fill-pet-gold' },
  { x: 33, y: 88, w: 10, h: 32, color: 'fill-pet-purple' },
  { x: 158, y: 90, w: 10, h: 30, color: 'fill-pet-green' },
  { x: 169, y: 86, w: 11, h: 34, color: 'fill-pet-red' },
  { x: 181, y: 94, w: 9, h: 26, color: 'fill-pet-blue' },
]

const NIGHT_STARS = [
  { x: 24, y: 30, r: 2 },
  { x: 52, y: 16, r: 1.5 },
  { x: 40, y: 62, r: 1.5 },
  { x: 16, y: 104, r: 2 },
  { x: 30, y: 140, r: 1.5 },
  { x: 120, y: 18, r: 1.5 },
  { x: 186, y: 76, r: 2 },
  { x: 170, y: 118, r: 1.5 },
  { x: 188, y: 142, r: 1.5 },
]

/** The rounded 200 × 200 frame of every background, as a path (no clip-path ids needed). */
const FRAME = 'M24 0 H176 Q200 0 200 24 V176 Q200 200 176 200 H24 Q0 200 0 176 V24 Q0 0 24 0 Z'
/** The floor or hills along the bottom of a background, inside the rounded corners. */
const GROUND_EDGE = 'V176 Q200 200 176 200 H24 Q0 200 0 176 Z'
</script>

<template>
  <!-- ===== Head (anchor: top of the head) ===== -->
  <g v-if="props.assetKey === 'party-hat'" transform="rotate(-8)">
    <path
      d="M-20 6 L2 -40 L20 6 Z"
      stroke-width="4"
      stroke-linejoin="round"
      class="fill-pet-blue stroke-pet-blue"
    />
    <path d="M-13.4 -7.8 H14.6 L11.9 -14.7 H-10.1 Z" class="fill-pet-gold" />
    <path d="M-6.4 -22.5 H8.8 L6.5 -28.5 H-3.5 Z" class="fill-pet-gold" />
    <ellipse cx="0" cy="6" rx="23" ry="4.5" class="fill-pet-gold" />
    <circle cx="2" cy="-41" r="6" class="fill-pet-red" />
  </g>

  <g v-else-if="props.assetKey === 'beanie'">
    <path d="M-38 8 C -38 -30 38 -30 38 8 Z" class="fill-pet-red" />
    <rect x="-40" y="0" width="80" height="14" rx="7" class="fill-pet-red-shade" />
    <g stroke-width="2" stroke-linecap="round" class="stroke-pet-red">
      <path d="M-28 4 V10" />
      <path d="M-18 4 V10" />
      <path d="M-8 4 V10" />
      <path d="M2 4 V10" />
      <path d="M12 4 V10" />
      <path d="M22 4 V10" />
      <path d="M32 4 V10" />
    </g>
    <circle cx="0" cy="-24" r="8" class="fill-pet-cream" />
  </g>

  <g v-else-if="props.assetKey === 'wizard-hat'">
    <ellipse cx="0" cy="6" rx="46" ry="8" class="fill-pet-purple-shade" />
    <path
      d="M-24 6 L6 -42 L24 6 Z"
      stroke-width="5"
      stroke-linejoin="round"
      class="fill-pet-purple stroke-pet-purple"
    />
    <path d="M-21 -2 H21 L23.5 4 H-23.5 Z" class="fill-pet-gold" />
    <path :d="sparkle(-6, -12, 6)" class="fill-pet-gold" />
    <path :d="sparkle(8, -26, 4.5)" class="fill-pet-gold" />
  </g>

  <!-- ===== Face (anchor: between the eyes; eyes at x = ±22) ===== -->
  <g
    v-else-if="props.assetKey === 'round-glasses'"
    fill="none"
    stroke-linecap="round"
    class="stroke-pet-line"
  >
    <circle cx="-22" cy="0" r="14" stroke-width="3.5" class="fill-pet-cream" fill-opacity="0.25" />
    <circle cx="22" cy="0" r="14" stroke-width="3.5" class="fill-pet-cream" fill-opacity="0.25" />
    <path d="M-8 -2 Q0 -7 8 -2" stroke-width="3" />
    <path d="M-36 -2 L-50 -6" stroke-width="3" />
    <path d="M36 -2 L50 -6" stroke-width="3" />
  </g>

  <g v-else-if="props.assetKey === 'sunglasses'">
    <path d="M-40 -8 H40" stroke-width="4" stroke-linecap="round" class="stroke-pet-line" />
    <path d="M-38 -8 H-8 V2 Q-8 14 -22 14 Q-38 14 -38 2 Z" class="fill-pet-line" />
    <path d="M38 -8 H8 V2 Q8 14 22 14 Q38 14 38 2 Z" class="fill-pet-line" />
    <g stroke-width="2.5" stroke-linecap="round" class="stroke-pet-cream opacity-60">
      <path d="M-33 -2 L-27 -2" />
      <path d="M13 -2 L19 -2" />
    </g>
  </g>

  <!-- ===== Neck (anchor: under the chin, behind the head) ===== -->
  <g v-else-if="props.assetKey === 'bandana'">
    <path
      d="M-34 6 H34 L0 40 Z"
      stroke-width="6"
      stroke-linejoin="round"
      class="fill-pet-red stroke-pet-red"
    />
    <g class="fill-pet-cream">
      <circle cx="-14" cy="14" r="2.5" />
      <circle cx="0" cy="14" r="2.5" />
      <circle cx="14" cy="14" r="2.5" />
      <circle cx="-7" cy="23" r="2.5" />
      <circle cx="7" cy="23" r="2.5" />
      <circle cx="0" cy="31" r="2.5" />
    </g>
  </g>

  <g v-else-if="props.assetKey === 'bow-tie'">
    <g stroke-width="4" stroke-linejoin="round" class="fill-pet-blue stroke-pet-blue">
      <path d="M-2 16 L-22 6 Q-26 16 -22 26 Z" />
      <path d="M2 16 L22 6 Q26 16 22 26 Z" />
    </g>
    <rect x="-6" y="10" width="12" height="12" rx="4" class="fill-pet-blue-shade" />
  </g>

  <g v-else-if="props.assetKey === 'gold-medal'">
    <path
      d="M-20 4 L0 22 L20 4"
      fill="none"
      stroke-width="7"
      stroke-linejoin="round"
      stroke-linecap="round"
      class="stroke-pet-blue"
    />
    <circle cx="0" cy="30" r="10" stroke-width="2.5" class="fill-pet-gold stroke-pet-gold-shade" />
    <path :d="sparkle(0, 30, 5)" class="fill-pet-gold-shade" />
  </g>

  <!-- ===== Background (fills the whole 200 × 200 box, behind the pet) ===== -->
  <g v-else-if="props.assetKey === 'library'">
    <path :d="FRAME" class="fill-pet-wall" />
    <rect
      v-for="(book, index) in LIBRARY_BOOKS"
      :key="index"
      :x="book.x"
      :y="book.y"
      :width="book.w"
      :height="book.h"
      rx="2"
      :class="book.color"
    />
    <rect x="8" y="64" width="184" height="7" rx="2" class="fill-pet-wood" />
    <rect x="8" y="120" width="184" height="7" rx="2" class="fill-pet-wood" />
    <path :d="`M0 166 H200 ${GROUND_EDGE}`" class="fill-pet-wood-shade" />
  </g>

  <!-- The default room (not sold in the shop): a wall with a window and a plant, a wooden floor -->
  <g v-else-if="props.assetKey === 'room'">
    <path :d="FRAME" class="fill-pet-wall" />
    <rect
      x="132"
      y="24"
      width="46"
      height="50"
      rx="6"
      stroke-width="5"
      class="fill-pet-cream stroke-pet-wood"
    />
    <rect x="137" y="29" width="36" height="40" rx="2" class="fill-pet-blue opacity-25" />
    <path d="M155 26 V72 M134 49 H176" stroke-width="4" class="stroke-pet-wood" />
    <rect
      x="24"
      y="34"
      width="38"
      height="30"
      rx="3"
      stroke-width="4"
      class="fill-pet-gold stroke-pet-wood"
    />
    <circle cx="36" cy="46" r="5" class="fill-pet-cream" />
    <path d="M28 60 L40 50 L48 56 L58 46 V60 Z" class="fill-pet-green opacity-80" />
    <ellipse cx="24" cy="128" rx="9" ry="16" class="fill-pet-green" />
    <ellipse cx="36" cy="124" rx="9" ry="18" class="fill-pet-green" />
    <rect x="18" y="136" width="26" height="30" rx="4" class="fill-pet-red-shade" />
    <path :d="`M0 166 H200 ${GROUND_EDGE}`" class="fill-pet-wood" />
    <ellipse cx="100" cy="184" rx="66" ry="9" class="fill-pet-blush opacity-50" />
  </g>

  <g v-else-if="props.assetKey === 'night-sky'">
    <path :d="FRAME" class="fill-pet-night" />
    <circle
      v-for="(star, index) in NIGHT_STARS"
      :key="index"
      :cx="star.x"
      :cy="star.y"
      :r="star.r"
      class="fill-pet-star"
    />
    <path :d="sparkle(150, 96, 6)" class="fill-pet-star" />
    <path :d="sparkle(32, 84, 5)" class="fill-pet-star" />
    <circle cx="160" cy="40" r="17" class="fill-pet-star" />
    <circle cx="169" cy="33" r="15" class="fill-pet-night" />
    <path :d="`M0 168 Q50 150 100 166 T200 158 ${GROUND_EDGE}`" class="fill-pet-night-shade" />
  </g>
</template>
