<script setup lang="ts">
import type { CoinFlight } from '~/composables/useRewardFeedback'

/** One coin flight: a few coin stickers on a curved path, one after another. */
const props = defineProps<{ flight: CoinFlight }>()

const { coinLanded } = useRewardFeedback()
const motion = useMotion()
const coins = useTemplateRef<HTMLElement[]>('coins')

const STAGGER_MS = 70
const TRAVEL_MS = 650
const ARC_PX = 80

onMounted(() => {
  const dx = props.flight.to.x - props.flight.from.x
  const dy = props.flight.to.y - props.flight.from.y
  ;(coins.value ?? []).forEach((coin, index) => {
    // A little spread, so the coins don't follow one line.
    const spread = (index % 3) - 1
    const animation = motion.play(
      coin,
      [
        { transform: 'translate(0, 0) scale(0.4)', opacity: 0, easing: 'ease-out' },
        {
          transform: `translate(${dx * 0.12 + spread * 14}px, ${dy * 0.12 - 20}px) scale(1)`,
          opacity: 1,
          offset: 0.15,
          easing: 'ease-out',
        },
        {
          transform: `translate(${dx * 0.5 + spread * 18}px, ${dy * 0.5 - ARC_PX}px) scale(1)`,
          opacity: 1,
          offset: 0.55,
          easing: 'ease-in',
        },
        { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 1 },
      ],
      { duration: TRAVEL_MS, easing: 'linear', delay: index * STAGGER_MS, fill: 'both' },
    )
    if (animation)
      animation.finished.then(
        () => coinLanded(props.flight, index),
        () => {},
      )
    else coinLanded(props.flight, index)
  })
})
</script>

<template>
  <span
    v-for="index in props.flight.count"
    ref="coins"
    :key="index"
    class="fixed grid size-6 place-items-center rounded-pill border-2 border-sun-edge bg-sun text-on-sun shadow-float"
    :style="{ left: `${props.flight.from.x - 12}px`, top: `${props.flight.from.y - 12}px` }"
  >
    <UiIcon name="coins" :size="16" />
  </span>
</template>
