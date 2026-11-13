<script setup lang="ts">
/**
 * A burst of confetti falling over its container (position it `absolute inset-0`). Drawn only in
 * the browser and never with reduced motion. Colours are the fixed accessory tokens, so they look
 * the same on any background.
 */
const props = withDefaults(defineProps<{ pieces?: number }>(), { pieces: 32 })

const motion = useMotion()

const COLORS = [
  'bg-pet-red',
  'bg-pet-blue',
  'bg-pet-gold',
  'bg-pet-green',
  'bg-pet-blush',
  'bg-pet-cream',
]

// Random values exist only after mount, so server and browser HTML agree.
const confetti = ref<
  { left: number; delay: number; duration: number; spin: number; color: string }[]
>([])

onMounted(() => {
  if (motion.isReduced.value) return
  confetti.value = Array.from({ length: props.pieces }, (_, index) => ({
    left: Math.random() * 100,
    delay: Math.random() * 400,
    duration: 1400 + Math.random() * 1200,
    spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
    color: COLORS[index % COLORS.length] ?? 'bg-pet-gold',
  }))
})
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <span
      v-for="(piece, index) in confetti"
      :key="index"
      class="confetti absolute -top-4 h-3 w-2 rounded-sm"
      :class="piece.color"
      :style="{
        left: `${piece.left}%`,
        animationDelay: `${piece.delay}ms`,
        animationDuration: `${piece.duration}ms`,
        '--spin': `${piece.spin}deg`,
      }"
    />
  </div>
</template>

<style scoped>
.confetti {
  animation: fall linear both;
}

@keyframes fall {
  0% {
    translate: 0 0;
    rotate: 0deg;
  }
  100% {
    translate: 0 110vh;
    rotate: var(--spin);
  }
}
</style>
