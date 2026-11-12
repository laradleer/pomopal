<script setup lang="ts">
/**
 * Full-screen level-up celebration. A native <dialog>, so focus moves into it and Esc closes it.
 * Opens when useRewardFeedback().celebrate() sees a level-up.
 */
const { levelUp, dismissLevelUp } = useRewardFeedback()
const pet = usePetStore()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

watch(
  levelUp,
  (level) => {
    const element = dialog.value
    if (!element) return
    if (level !== null && !element.open) element.showModal()
    if (level === null && element.open) element.close()
  },
  { flush: 'post' },
)
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="level-up-title"
    class="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-grape p-0 text-on-brand backdrop:bg-scrim"
    @close="dismissLevelUp"
  >
    <div
      class="mx-auto flex h-full max-w-phone flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <span
        class="grid size-24 place-items-center rounded-pill border-b-4 border-sun-edge bg-sun text-on-sun motion-safe:animate-pop"
        aria-hidden="true"
      >
        <UiIcon name="star" :size="24" />
      </span>
      <div class="space-y-2">
        <p class="text-label">Level up!</p>
        <h2 id="level-up-title" class="text-display-xl">Level {{ levelUp }}</h2>
      </div>
      <p class="text-body-lg">
        You and {{ pet.name }} earned bonus coins. New items may be waiting in the shop!
      </p>
      <UiButton variant="outline" block @click="dismissLevelUp">Yay!</UiButton>
    </div>
  </dialog>
</template>
