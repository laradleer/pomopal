<script setup lang="ts">
import type { PetMood, PetSpecies } from '#shared/constants'
import {
  FALL_ASLEEP_AFTER_MS,
  POKE_WINDOW_MS,
  isPokeFrenzy,
  poseForPhase,
} from '#shared/pet-animation'
import type { PetAction, PetPose } from '#shared/pet-animation'
import type { EquippedItems } from '#shared/types/shop'

/**
 * The cat or dog, drawn in SVG (200 × 200) in one flat, rounded style, with four moods.
 *
 * It is alive (docs/04-design-system.md → Motion): it breathes, sways its tail, blinks and
 * twitches an ear now and then, and each mood changes how it moves. With `live`, it is the
 * student's mascot: it reads a book while they focus and plays the reactions sent with
 * usePetAnimator() (celebrate, sad). Every other pet (onboarding, login, /dev/ui) only idles.
 *
 * `equipped` draws the pet's items (<PetAccessory>). Each one goes in a named slot that is
 * already placed on the pet's anchors, so every item fits both species and moves with the pet.
 * A slot's content can be replaced, e.g. to preview something else. Draw accessories around (0, 0):
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
    /** What the pet wears, by slot. */
    equipped?: EquippedItems
    /** The student's mascot: follows the timer, plays reactions and can be played with. */
    live?: boolean
    /** Wags and bounces, e.g. while hovered in the onboarding picker. */
    excited?: boolean
    /** Increase it to make this pet celebrate once (works without `live`). */
    cheer?: number
  }>(),
  { size: 120, name: undefined, equipped: () => ({}), live: false, excited: false, cheer: 0 },
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

// ---- Pose: only the live mascot follows the timer ----

const timer = useTimerStore()
const pose = computed<PetPose>(() => (props.live ? poseForPhase(timer.phase) : 'idle'))

// ---- Blinking and ear twitches (browser only, random, so they start after mount) ----

const motion = useMotion()
const isBlinking = ref(false)
/** Stroking makes the pet close its eyes happily; dizzy eyes are spirals (#76). */
const isPurring = ref(false)
const isDizzy = ref(false)
const faceMood = computed<PetMood>(() => (isPurring.value ? 'happy' : props.mood))
const hasOpenEyes = computed(
  () => !isDizzy.value && (faceMood.value === 'neutral' || faceMood.value === 'sad'),
)
const leftEar = useTemplateRef<SVGGElement>('leftEar')
const rightEar = useTemplateRef<SVGGElement>('rightEar')
const timers = new Set<ReturnType<typeof setTimeout>>()

function later(ms: number, run: () => void) {
  const id = setTimeout(() => {
    timers.delete(id)
    run()
  }, ms)
  timers.add(id)
}

const between = (min: number, max: number) => min + Math.random() * (max - min)

function blink() {
  if (motion.isReduced.value || !hasOpenEyes.value) return
  isBlinking.value = true
  later(110, () => {
    isBlinking.value = false
    // Now and then a quick double blink.
    if (Math.random() < 0.2) later(140, blink)
  })
}

function twitchEar() {
  const isLeft = Math.random() < 0.5
  const ear = isLeft ? leftEar.value : rightEar.value
  const direction = isLeft ? -1 : 1
  // `add` keeps any mood pose (drooping ears) underneath the twitch.
  motion.play(
    ear,
    [
      { rotate: '0deg' },
      { rotate: `${direction * 12}deg`, offset: 0.3 },
      { rotate: `${direction * -4}deg`, offset: 0.65 },
      { rotate: '0deg' },
    ],
    { duration: 380, easing: 'linear', composite: 'add' },
  )
}

function scheduleBlink() {
  later(between(2000, 6000), () => {
    blink()
    scheduleBlink()
  })
}

function scheduleTwitch() {
  later(between(8000, 15000), () => {
    twitchEar()
    scheduleTwitch()
  })
}

// ---- Looking at the pointer and at taps (live mascot only) ----

const svg = useTemplateRef<SVGSVGElement>('svg')
const look = usePointerLook(svg, () => props.live)
/** Closed eyes (happy, sleepy) don't show the pupils moving; the head still turns. */
const eyeOffset = computed(() =>
  hasOpenEyes.value ? `${look.eyes.value.x}px ${look.eyes.value.y}px` : '0px 0px',
)

// ---- Reactions (live mascot only) ----

const animator = usePetAnimator()
const sound = useSound()
const whole = useTemplateRef<SVGGElement>('whole')
const shadow = useTemplateRef<SVGEllipseElement>('shadow')
const isCelebrating = ref(false)

function playReaction(action: PetAction): Animation | null {
  if (action === 'celebrate') {
    // Squash, jump with a stretch, land with a squash, small second bounce.
    const jump = motion.play(
      whole.value,
      [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(0) scale(1.08, 0.9)', offset: 0.15 },
        { transform: 'translateY(-26px) scale(0.94, 1.08)', offset: 0.4 },
        { transform: 'translateY(0) scale(1.06, 0.93)', offset: 0.62 },
        { transform: 'translateY(-6px) scale(1, 1)', offset: 0.8 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      { duration: 900, easing: 'linear' },
    )
    motion.play(
      shadow.value,
      [
        { scale: '1 1' },
        { scale: '1.1 1', offset: 0.15 },
        { scale: '0.7 1', offset: 0.4 },
        { scale: '1.1 1', offset: 0.62 },
        { scale: '0.9 1', offset: 0.8 },
        { scale: '1 1' },
      ],
      { duration: 900, easing: 'linear' },
    )
    isCelebrating.value = jump !== null
    return jump
  }
  if (action === 'giggle') {
    // Squash, wiggle, back.
    return motion.play(
      whole.value,
      [
        { transform: 'scale(1, 1) rotate(0deg)' },
        { transform: 'scale(1.07, 0.9) rotate(0deg)', offset: 0.2 },
        { transform: 'scale(0.97, 1.05) rotate(-4deg)', offset: 0.45 },
        { transform: 'scale(1, 1) rotate(4deg)', offset: 0.7 },
        { transform: 'scale(1, 1) rotate(0deg)' },
      ],
      { duration: 600, easing: 'linear' },
    )
  }
  if (action === 'dizzy') {
    return motion.play(
      whole.value,
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-8deg)', offset: 0.15 },
        { transform: 'rotate(8deg)', offset: 0.35 },
        { transform: 'rotate(-6deg)', offset: 0.55 },
        { transform: 'rotate(5deg)', offset: 0.75 },
        { transform: 'rotate(0deg)' },
      ],
      { duration: 1400, easing: 'in-out-soft' },
    )
  }
  if (action === 'wake') {
    // A big stretch.
    return motion.play(
      whole.value,
      [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(-4px) scale(0.96, 1.1)', offset: 0.45 },
        { transform: 'translateY(0) scale(1.03, 0.97)', offset: 0.75 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      { duration: 900, easing: 'in-out-soft' },
    )
  }
  // Sad: sink a little, a small slow head shake, then back up.
  return motion.play(
    whole.value,
    [
      { transform: 'translateY(0) scale(1, 1) rotate(0deg)' },
      { transform: 'translateY(5px) scale(1.03, 0.95) rotate(0deg)', offset: 0.3 },
      { transform: 'translateY(5px) scale(1.03, 0.95) rotate(-2deg)', offset: 0.5 },
      { transform: 'translateY(5px) scale(1.03, 0.95) rotate(2deg)', offset: 0.7 },
      { transform: 'translateY(0) scale(1, 1) rotate(0deg)' },
    ],
    { duration: 1300, easing: 'in-out-soft' },
  )
}

watch(
  () => (props.live ? animator.action.value : null),
  async (action) => {
    if (!action) return
    const animation = playReaction(action)
    await animation?.finished.catch(() => undefined)
    isCelebrating.value = false
    animator.done()
  },
)

// Any pet can be asked to celebrate once through `cheer` (onboarding: the chosen pet jumps).
watch(
  () => props.cheer,
  async (next, previous) => {
    if (next <= previous) return
    await playReaction('celebrate')?.finished.catch(() => undefined)
    isCelebrating.value = false
  },
)

// ---- Playing with the live pet (#76): tap, stroke, poke, falling asleep ----

const TAP_COOLDOWN_MS = 250
const STROKE_DISTANCE_PX = 60
const HEART_EVERY_PX = 45

const hearts = ref<{ id: number; x: number; y: number }[]>([])
let nextHeartId = 0

function addHeart() {
  if (motion.isReduced.value) return
  const id = ++nextHeartId
  hearts.value = [...hearts.value, { id, x: between(70, 130), y: between(40, 72) }]
  later(1000, () => (hearts.value = hearts.value.filter((heart) => heart.id !== id)))
}

let taps: number[] = []
let lastTapAt = -Infinity

function tap() {
  // A dizzy pet needs a moment before it can play again.
  if (!props.live || isDizzy.value) return
  if (wakeUp()) return
  const now = performance.now()
  if (now - lastTapAt < TAP_COOLDOWN_MS) return
  lastTapAt = now
  taps = [...taps, now].filter((at) => now - at <= POKE_WINDOW_MS)
  if (isPokeFrenzy(taps, now)) {
    taps = []
    isDizzy.value = true
    later(2200, () => (isDizzy.value = false))
    animator.send('dizzy')
    animator.say(DIZZY_LINE)
    return
  }
  animator.send('giggle')
  sound.play('giggle')
  addHeart()
  addHeart()
  animator.say(tapLine())
}

/** Stroking: dragging across the pet (sideways on touch screens, so pages still scroll). */
let stroke: { x: number; y: number; distance: number; sinceHeart: number } | null = null
let isClickAfterStroke = false

function onPointerDown(event: PointerEvent) {
  if (!props.live) return
  stroke = { x: event.clientX, y: event.clientY, distance: 0, sinceHeart: 0 }
}

function onPointerMove(event: PointerEvent) {
  if (!stroke) return
  const moved = Math.hypot(event.clientX - stroke.x, event.clientY - stroke.y)
  stroke = {
    x: event.clientX,
    y: event.clientY,
    distance: stroke.distance + moved,
    sinceHeart: stroke.sinceHeart + moved,
  }
  if (stroke.distance < STROKE_DISTANCE_PX) return
  if (!isPurring.value) {
    wakeUp()
    isPurring.value = true
    animator.say(strokeLine(props.species))
  }
  if (stroke.sinceHeart >= HEART_EVERY_PX) {
    stroke.sinceHeart = 0
    addHeart()
  }
}

function onPointerUp() {
  if (stroke && stroke.distance >= STROKE_DISTANCE_PX) {
    isClickAfterStroke = true
    later(1200, () => (isPurring.value = false))
  }
  stroke = null
}

function onClick() {
  // The click that ends a stroke is not a tap.
  if (isClickAfterStroke) {
    isClickAfterStroke = false
    return
  }
  tap()
}

/** Wakes the pet if it is asleep (with a stretch). Returns whether it was asleep. */
function wakeUp(): boolean {
  if (!animator.isAsleep.value) return false
  animator.setAsleep(false)
  animator.send('wake')
  animator.say(WAKE_LINE)
  restartIdleTimer()
  return true
}

/** After a minute without input (and no session running), the live pet falls asleep. */
let idleTimer: ReturnType<typeof setTimeout> | undefined
function restartIdleTimer() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    if (pose.value === 'idle') animator.setAsleep(true)
  }, FALL_ASLEEP_AFTER_MS)
}
function onActivity() {
  if (animator.isAsleep.value) wakeUp()
  else restartIdleTimer()
}
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'pointermove', 'wheel'] as const

// A session starting wakes the pet without a fuss.
watch(pose, (next) => {
  if (next !== 'idle' && animator.isAsleep.value) animator.setAsleep(false)
})

onMounted(() => {
  if (props.live) {
    // Reactions sent while no mascot was on screen are old news.
    animator.clear()
    animator.setAsleep(false)
    restartIdleTimer()
    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, onActivity, { passive: true })
  }
  scheduleBlink()
  scheduleTwitch()
})

onBeforeUnmount(() => {
  for (const id of timers) clearTimeout(id)
  timers.clear()
  clearTimeout(idleTimer)
  if (props.live) {
    for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, onActivity)
  }
})

/** A heart shape centred on (x, y). */
const heartPath = (x: number, y: number) =>
  `M${x} ${y + 6} C${x - 10} ${y - 2} ${x - 6} ${y - 12} ${x} ${y - 5} C${x + 6} ${y - 12} ${x + 10} ${y - 2} ${x} ${y + 6} Z`

// Sparkles around the pet while it celebrates.
const SPARKLES = [
  { x: 36, y: 56, size: 9, delay: '0ms' },
  { x: 166, y: 48, size: 11, delay: '90ms' },
  { x: 26, y: 118, size: 7, delay: '180ms' },
  { x: 176, y: 108, size: 8, delay: '60ms' },
]
const sparklePath = (x: number, y: number, size: number) =>
  `M${x} ${y - size} Q${x} ${y} ${x + size} ${y} Q${x} ${y} ${x} ${y + size} Q${x} ${y} ${x - size} ${y} Q${x} ${y} ${x} ${y - size} Z`
</script>

<template>
  <svg
    ref="svg"
    viewBox="0 0 200 200"
    :width="props.size"
    :height="props.size"
    :role="props.live ? 'button' : 'img'"
    :tabindex="props.live ? 0 : undefined"
    :aria-label="props.live ? `Pet ${props.name ?? 'your pet'}. ${label}` : label"
    :data-pet="props.live ? 'live' : undefined"
    class="shrink-0 overflow-visible"
    :class="props.live && 'cursor-pointer touch-pan-y select-none'"
    @click="onClick"
    @keydown.enter.prevent="tap"
    @keydown.space.prevent="tap"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
  >
    <g>
      <slot name="background">
        <Transition name="accessory-fade">
          <PetAccessory
            v-if="props.equipped.background"
            :key="props.equipped.background"
            :asset-key="props.equipped.background"
          />
        </Transition>
      </slot>
    </g>

    <!-- Shadow stays on the floor when the pet jumps -->
    <ellipse
      ref="shadow"
      cx="100"
      cy="190"
      rx="50"
      ry="6"
      class="pet-shadow fill-pet-line opacity-10"
    />

    <g
      ref="whole"
      class="pet-whole"
      :class="[`mood-${faceMood}`, `pose-${pose}`, props.excited && 'is-excited']"
    >
      <!-- Tail -->
      <g class="pet-tail" :class="`pet-tail-${props.species}`">
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
      </g>

      <!-- Body, belly, paws: they breathe -->
      <g class="pet-body">
        <ellipse cx="100" cy="160" rx="48" ry="32" :class="fur.fill" />
        <ellipse cx="100" cy="166" rx="26" ry="20" class="fill-pet-cream" />
        <ellipse cx="82" cy="186" rx="13" ry="8" :class="fur.fill" />
        <ellipse cx="118" cy="186" rx="13" ry="8" :class="fur.fill" />

        <!-- Neck accessories sit on the body, under the chin -->
        <g transform="translate(100 142)">
          <slot name="neck">
            <Transition name="accessory-drop">
              <PetAccessory
                v-if="props.equipped.neck"
                :key="props.equipped.neck"
                :asset-key="props.equipped.neck"
              />
            </Transition>
          </slot>
        </g>

        <!-- A book to read while the student focuses -->
        <g v-if="pose === 'focusing'" stroke-width="2" stroke-linejoin="round">
          <path
            d="M100 170 Q89 165 76 168 V185 Q89 182 100 187 Z"
            class="fill-pet-cream stroke-pet-line"
          />
          <path
            d="M100 170 Q111 165 124 168 V185 Q111 182 100 187 Z"
            class="fill-pet-cream stroke-pet-line"
          />
          <path
            d="M82 174 H94 M82 179 H94 M106 174 H118 M106 179 H118"
            class="stroke-pet-line opacity-30"
          />
        </g>
      </g>

      <!-- Head: tilts with the mood and bobs with each breath. Hats and glasses move with it. -->
      <g class="pet-head-pose">
        <g class="pet-head-look" :style="{ rotate: `${look.head.value}deg` }">
          <g class="pet-head-bob">
            <!-- Ears: cat ears sit behind the head, dog ears hang over it (drawn later) -->
            <template v-if="props.species === 'cat'">
              <g ref="leftEar" class="pet-ear pet-ear-cat-left">
                <path
                  d="M52 80 L60 26 L98 54 Z"
                  stroke-width="8"
                  stroke-linejoin="round"
                  :class="[fur.fill, fur.stroke]"
                />
                <path d="M63 66 L67 40 L88 55 Z" class="fill-pet-blush" />
              </g>
              <g ref="rightEar" class="pet-ear pet-ear-cat-right">
                <path
                  d="M148 80 L140 26 L102 54 Z"
                  stroke-width="8"
                  stroke-linejoin="round"
                  :class="[fur.fill, fur.stroke]"
                />
                <path d="M137 66 L133 40 L112 55 Z" class="fill-pet-blush" />
              </g>
            </template>

            <!-- Head -->
            <circle cx="100" cy="98" r="54" :class="fur.fill" />

            <!-- Cat stripes / dog ears -->
            <g v-if="props.species === 'cat'" stroke-width="5" stroke-linecap="round" fill="none">
              <path d="M100 46 V58" class="stroke-pet-cat-shade" />
              <path d="M86 48 L89 58" class="stroke-pet-cat-shade" />
              <path d="M114 48 L111 58" class="stroke-pet-cat-shade" />
            </g>
            <template v-else>
              <g ref="leftEar" class="pet-ear pet-ear-dog-left" :class="fur.shade">
                <path d="M56 60 C 34 62 28 104 42 126 C 56 122 64 92 74 66 Z" />
              </g>
              <g ref="rightEar" class="pet-ear pet-ear-dog-right" :class="fur.shade">
                <path d="M144 60 C 166 62 172 104 158 126 C 144 122 136 92 126 66 Z" />
              </g>
            </template>

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
            <g class="fill-pet-blush" :class="faceMood === 'happy' ? 'opacity-75' : 'opacity-35'">
              <circle cx="62" cy="114" r="8" />
              <circle cx="138" cy="114" r="8" />
            </g>

            <!-- Eyes: they blink, and look down at the book while reading -->
            <g
              class="pet-eyes"
              :class="{ 'is-blinking': isBlinking, 'is-reading': pose === 'focusing' }"
            >
              <g :style="{ translate: eyeOffset }">
                <g
                  v-if="isDizzy"
                  fill="none"
                  stroke-width="3"
                  stroke-linecap="round"
                  class="stroke-pet-line"
                >
                  <path d="M78 96 m-7 0 a7 7 0 1 1 7 7 a4.5 4.5 0 1 1 -4.5 -4.5 a2 2 0 1 1 2 2" />
                  <path d="M122 96 m-7 0 a7 7 0 1 1 7 7 a4.5 4.5 0 1 1 -4.5 -4.5 a2 2 0 1 1 2 2" />
                </g>
                <g
                  v-else-if="faceMood === 'happy'"
                  fill="none"
                  stroke-width="4.5"
                  stroke-linecap="round"
                  class="stroke-pet-line"
                >
                  <path d="M70 99 Q78 88 86 99" />
                  <path d="M114 99 Q122 88 130 99" />
                </g>
                <g
                  v-else-if="faceMood === 'sleepy'"
                  fill="none"
                  stroke-width="4"
                  stroke-linecap="round"
                  class="stroke-pet-line"
                >
                  <path d="M70 96 Q78 103 86 96" />
                  <path d="M114 96 Q122 103 130 96" />
                </g>
                <g v-else>
                  <circle cx="78" :cy="faceMood === 'sad' ? 98 : 96" r="7" class="fill-pet-line" />
                  <circle cx="122" :cy="faceMood === 'sad' ? 98 : 96" r="7" class="fill-pet-line" />
                  <circle
                    cx="80.5"
                    :cy="faceMood === 'sad' ? 95.5 : 93.5"
                    r="2.5"
                    class="fill-pet-cream"
                  />
                  <circle
                    cx="124.5"
                    :cy="faceMood === 'sad' ? 95.5 : 93.5"
                    r="2.5"
                    class="fill-pet-cream"
                  />
                </g>
              </g>
            </g>

            <!-- Sad brows and a tear -->
            <g v-if="faceMood === 'sad'">
              <g fill="none" stroke-width="3.5" stroke-linecap="round" class="stroke-pet-line">
                <path d="M66 86 L86 80" />
                <path d="M134 86 L114 80" />
              </g>
              <path
                d="M131 106 C 127 114 127 119 131 120 C 135 119 135 114 131 106 Z"
                class="fill-sky"
              />
            </g>

            <!-- Nose -->
            <path
              v-if="props.species === 'cat'"
              d="M94 110 Q100 106 106 110 Q100 117 94 110 Z"
              class="fill-pet-blush"
            />
            <ellipse v-else cx="100" cy="110" rx="9" ry="6.5" class="fill-pet-line" />

            <!-- Mouth -->
            <g v-if="faceMood === 'happy'">
              <path d="M88 121 Q100 140 112 121 Z" class="fill-pet-line" />
              <ellipse cx="100" cy="131" rx="6" ry="4" class="fill-pet-blush" />
            </g>
            <path
              v-else-if="faceMood === 'sad'"
              d="M90 130 Q100 121 110 130"
              fill="none"
              stroke-width="3"
              stroke-linecap="round"
              class="stroke-pet-line"
            />
            <ellipse
              v-else-if="faceMood === 'sleepy'"
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

            <!-- Sleepy Zs float up -->
            <g
              v-if="faceMood === 'sleepy'"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="pet-zs stroke-pet-line"
            >
              <path d="M152 36 h14 l-14 16 h14" stroke-width="3.5" />
              <path d="M172 14 h9 l-9 10 h9" stroke-width="3" />
            </g>

            <!-- Head and face accessories -->
            <g transform="translate(100 46)">
              <slot name="head">
                <Transition name="accessory-drop">
                  <PetAccessory
                    v-if="props.equipped.head"
                    :key="props.equipped.head"
                    :asset-key="props.equipped.head"
                  />
                </Transition>
              </slot>
            </g>
            <g transform="translate(100 96)">
              <slot name="face">
                <Transition name="accessory-drop">
                  <PetAccessory
                    v-if="props.equipped.face"
                    :key="props.equipped.face"
                    :asset-key="props.equipped.face"
                  />
                </Transition>
              </slot>
            </g>
          </g>
        </g>
      </g>
    </g>

    <!-- Sparkles while celebrating -->
    <g v-if="isCelebrating" class="fill-pet-gold" aria-hidden="true">
      <path
        v-for="(sparkle, index) in SPARKLES"
        :key="index"
        :d="sparklePath(sparkle.x, sparkle.y, sparkle.size)"
        class="pet-sparkle"
        :style="{ animationDelay: sparkle.delay }"
      />
    </g>

    <!-- Hearts when the pet is tapped or stroked -->
    <g class="fill-pet-blush" aria-hidden="true">
      <path
        v-for="heart in hearts"
        :key="heart.id"
        :d="heartPath(heart.x, heart.y)"
        class="pet-heart"
      />
    </g>
  </svg>
</template>

<style scoped>
/*
 * Idle animations (docs/04-design-system.md → Motion). Pivots are in the 200 × 200 drawing's
 * units (transform-box: view-box), so they stay right at any size. Loops use the individual
 * transform properties (scale, rotate, translate), so a mood pose and a loop can share a group.
 * Reduced motion stops every loop through the global rule in main.css.
 */
.pet-whole,
.pet-shadow,
.pet-tail,
.pet-body,
.pet-head-pose,
.pet-head-look,
.pet-head-bob,
.pet-ear,
.pet-eyes,
.pet-zs path {
  transform-box: view-box;
}

.pet-whole {
  transform-origin: 100px 192px;
}
.pet-shadow {
  transform-origin: 100px 190px;
}

/* Breathing: the body swells a little, the head rises with it */
.pet-body {
  --breath: 0.025;
  transform-origin: 100px 192px;
  animation: breathe 3.6s var(--ease-in-out-soft) infinite;
}
.pet-head-bob {
  animation: head-bob 3.6s var(--ease-in-out-soft) infinite;
}
.pet-head-look {
  transform-origin: 100px 150px;
}
.pet-head-pose {
  transform-origin: 100px 150px;
  transition:
    rotate var(--duration-move) var(--ease-soft),
    translate var(--duration-move) var(--ease-soft);
}

/* Tail sway, pivoting where the tail meets the body */
.pet-tail {
  animation: tail-sway 2.8s var(--ease-in-out-soft) infinite;
}
.pet-tail-cat {
  transform-origin: 144px 166px;
}
.pet-tail-dog {
  transform-origin: 146px 160px;
}

/* Ears pivot at their base (cat) or where they hang from (dog) */
.pet-ear {
  transition: rotate var(--duration-move) var(--ease-soft);
}
.pet-ear-cat-left {
  transform-origin: 72px 70px;
}
.pet-ear-cat-right {
  transform-origin: 128px 70px;
}
.pet-ear-dog-left {
  transform-origin: 64px 62px;
}
.pet-ear-dog-right {
  transform-origin: 136px 62px;
}

/* Eyes: a blink squashes them shut; reading looks down at the book */
.pet-eyes {
  transform-origin: 100px 96px;
  transition:
    scale 70ms ease-in,
    translate var(--duration-move) var(--ease-soft);
}
.pet-eyes.is-blinking {
  scale: 1 0.1;
}
.pet-eyes.is-reading {
  translate: 0 3px;
}

/* ---- Moods ---- */

.mood-happy .pet-body,
.mood-happy .pet-head-bob {
  animation-duration: 2.2s;
}
.mood-happy .pet-tail {
  animation-duration: 0.9s;
}

.mood-sleepy .pet-body {
  --breath: 0.04;
}
.mood-sleepy .pet-body,
.mood-sleepy .pet-head-bob {
  animation-duration: 5.2s;
}
.mood-sleepy .pet-tail {
  animation-duration: 6s;
}
.mood-sleepy .pet-head-pose {
  rotate: -4deg;
}

.mood-sad .pet-body,
.mood-sad .pet-head-bob {
  animation-duration: 4.6s;
}
.mood-sad .pet-tail {
  animation-duration: 5.5s;
}
.mood-sad .pet-head-pose {
  rotate: 3deg;
  translate: 0 3px;
}
.mood-sad .pet-ear-cat-left {
  rotate: -14deg;
}
.mood-sad .pet-ear-cat-right {
  rotate: 14deg;
}
.mood-sad .pet-ear-dog-left {
  rotate: 10deg;
}
.mood-sad .pet-ear-dog-right {
  rotate: -10deg;
}

/* ---- Poses ---- */

/* Focusing: calm and slow, head a little down towards the book */
.pose-focusing .pet-body,
.pose-focusing .pet-head-bob {
  animation-duration: 4.8s;
}
.pose-focusing .pet-tail {
  animation-duration: 6s;
}
.pose-focusing .pet-head-pose {
  rotate: 0deg;
  translate: 0 2px;
}

/* ---- Accessories: put on with a drop and a squash, taken off with a pop ---- */

.accessory-drop-enter-active,
.accessory-drop-leave-active {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.accessory-drop-enter-active {
  animation: accessory-drop 520ms var(--ease-soft);
}
.accessory-drop-leave-active {
  animation: accessory-pop var(--duration-move) ease-in both;
}
.accessory-fade-enter-active,
.accessory-fade-leave-active {
  transition: opacity var(--duration-move) var(--ease-soft);
}
.accessory-fade-enter-from,
.accessory-fade-leave-to {
  opacity: 0;
}

/* Excited (e.g. hovered in the onboarding picker): a quick wag and a little bounce */
.is-excited .pet-tail {
  animation-duration: 0.5s;
}
.is-excited .pet-head-bob {
  animation: head-bob 0.6s var(--ease-in-out-soft) infinite;
}

/* ---- Decorations ---- */

.pet-zs path {
  animation: z-float 3.2s ease-in-out infinite;
}
.pet-zs path:nth-child(2) {
  animation-delay: 1.6s;
}

.pet-sparkle {
  transform-origin: center;
  transform-box: fill-box;
  animation: sparkle 800ms var(--ease-pop) both;
}

@keyframes breathe {
  0%,
  100% {
    scale: 1 1;
  }
  50% {
    scale: 1.01 calc(1 + var(--breath));
  }
}

@keyframes head-bob {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -1.5px;
  }
}

@keyframes tail-sway {
  0%,
  100% {
    rotate: -6deg;
  }
  50% {
    rotate: 8deg;
  }
}

@keyframes z-float {
  0% {
    translate: 0 4px;
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    translate: 6px -10px;
    opacity: 0;
  }
}

@keyframes accessory-drop {
  0% {
    translate: 0 -36px;
    opacity: 0;
  }
  55% {
    translate: 0 0;
    scale: 1 1;
    opacity: 1;
  }
  75% {
    scale: 1.12 0.85;
  }
  100% {
    scale: 1 1;
  }
}

@keyframes accessory-pop {
  0% {
    scale: 1;
    opacity: 1;
  }
  35% {
    scale: 1.15;
  }
  100% {
    scale: 0;
    opacity: 0;
  }
}

.pet-heart {
  transform-box: fill-box;
  transform-origin: center;
  animation: heart-float 1s var(--ease-soft) both;
}

@keyframes heart-float {
  0% {
    translate: 0 6px;
    scale: 0.4;
    opacity: 0;
  }
  25% {
    scale: 1.1;
    opacity: 1;
  }
  100% {
    translate: 0 -28px;
    scale: 0.9;
    opacity: 0;
  }
}

@keyframes sparkle {
  0% {
    scale: 0;
    opacity: 0;
  }
  40% {
    scale: 1.2;
    opacity: 1;
  }
  100% {
    scale: 0.6;
    opacity: 0;
  }
}
</style>
