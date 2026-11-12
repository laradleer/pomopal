<script setup lang="ts">
/**
 * Bottom sheet for confirmations ("Quit this session?"). Built on the native <dialog>, so focus
 * is trapped, Esc closes it and the page behind is inert. Clicking the dimmed area closes it too.
 *
 *   <UiSheet v-model:open="isOpen" title="Quit this session?">
 *     <template #actions> … </template>
 *   </UiSheet>
 */
const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  { description: undefined },
)

defineSlots<{
  default?(): unknown
  actions?(): unknown
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const titleId = useId()
const descriptionId = useId()

function sync(isOpen: boolean) {
  const element = dialog.value
  if (!element) return
  if (isOpen && !element.open) element.showModal()
  if (!isOpen && element.open) element.close()
}

watch(open, sync, { flush: 'post' })
onMounted(() => sync(open.value))

/** The dialog closed itself (Esc, or element.close()): keep v-model in step. */
function onClose() {
  open.value = false
}

/** A click on the dialog itself (not its panel) is a click on the dimmed area. */
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}
</script>

<template>
  <dialog
    ref="dialog"
    :aria-labelledby="titleId"
    :aria-describedby="props.description ? descriptionId : undefined"
    class="m-0 mt-auto w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-scrim open:flex open:justify-center"
    @close="onClose"
    @click="onClick"
  >
    <div
      class="max-h-[85dvh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface px-6 pt-3 pb-8 text-ink motion-safe:animate-sheet-in"
    >
      <div class="mx-auto mb-5 h-1.5 w-10 rounded-pill bg-border-strong" aria-hidden="true" />
      <h2 :id="titleId" class="text-heading">{{ props.title }}</h2>
      <p v-if="props.description" :id="descriptionId" class="mt-1 text-body text-ink-muted">
        {{ props.description }}
      </p>
      <div v-if="$slots.default" class="mt-4">
        <slot />
      </div>
      <div v-if="$slots.actions" class="mt-6 flex flex-col gap-2">
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>
