<script setup lang="ts">
/**
 * The mascot loader: when a navigation or its data takes longer than 300ms, the student's pet
 * trots across a small strip under the top bar (paw prints behind it), instead of a frozen
 * screen. Driven by Nuxt's loading indicator (page:loading:start / end). Lives in app.vue.
 */
const SHOW_AFTER_MS = 300

const { isLoading } = useLoadingIndicator()
const pet = usePetStore()

const isVisible = ref(false)
let showTimer: ReturnType<typeof setTimeout> | undefined

watch(isLoading, (loading) => {
  clearTimeout(showTimer)
  if (loading) showTimer = setTimeout(() => (isVisible.value = true), SHOW_AFTER_MS)
  else isVisible.value = false
})
onBeforeUnmount(() => clearTimeout(showTimer))
</script>

<template>
  <Transition
    enter-active-class="transition-[opacity,translate] duration-(--duration-quick) ease-soft"
    enter-from-class="-translate-y-2 opacity-0"
    leave-active-class="transition-opacity duration-(--duration-quick)"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      role="status"
      class="pointer-events-none fixed inset-x-0 top-20 z-40 mx-auto w-60 overflow-hidden rounded-pill border border-border bg-surface shadow-float"
    >
      <span class="sr-only">Loading…</span>
      <div class="relative h-12" aria-hidden="true">
        <!-- Paw prints left behind -->
        <span
          v-for="index in 6"
          :key="index"
          class="paw absolute bottom-2 size-1.5 rounded-pill bg-border-strong"
          :style="{ left: `${index * 14}%`, animationDelay: `${index * 160}ms` }"
        />
        <div class="trot absolute bottom-0">
          <PetView :species="pet.species" mood="happy" :size="44" :equipped="pet.equipped" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* The pet crosses the strip and bounces with each step; with reduced motion it sits in the middle. */
.trot {
  left: calc(50% - 22px);
  animation:
    trot-across 1.8s linear infinite,
    trot-bounce 300ms var(--ease-in-out-soft) infinite alternate;
}
.paw {
  opacity: 0;
  animation: paw 1.8s linear infinite;
}

@keyframes trot-across {
  from {
    left: -48px;
  }
  to {
    left: 100%;
  }
}

@keyframes trot-bounce {
  to {
    translate: 0 -4px;
  }
}

@keyframes paw {
  0%,
  100% {
    opacity: 0;
  }
  20%,
  60% {
    opacity: 1;
  }
}
</style>
