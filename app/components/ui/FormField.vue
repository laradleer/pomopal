<script setup lang="ts">
/**
 * Label + control + helper text or error. Hands the accessibility attributes to the control:
 *
 *   <UiFormField v-slot="field" label="Email" :error="errors.email">
 *     <UiInput v-model="email" v-bind="field" type="email" />
 *   </UiFormField>
 */
type FieldAttrs = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
}

const props = withDefaults(
  defineProps<{
    label: string
    help?: string
    error?: string
    id?: string
  }>(),
  { help: undefined, error: undefined, id: undefined },
)

defineSlots<{ default(field: FieldAttrs): unknown }>()

const generatedId = useId()
const controlId = computed(() => props.id ?? generatedId)
const messageId = computed(() => `${controlId.value}-message`)
const message = computed(() => props.error ?? props.help)

// Passed with v-bind so the keys stay dash-case (named slot props would be camelCased).
const field = computed<FieldAttrs>(() => ({
  id: controlId.value,
  'aria-describedby': message.value ? messageId.value : undefined,
  'aria-invalid': props.error ? 'true' : undefined,
}))
</script>

<template>
  <div class="space-y-1.5">
    <label :for="controlId" class="block text-body-sm text-ink">{{ props.label }}</label>
    <slot v-bind="field" />
    <p
      v-if="message"
      :id="messageId"
      class="flex items-center gap-1.5 text-body-sm"
      :class="props.error ? 'text-berry' : 'text-ink-muted'"
    >
      <UiIcon v-if="props.error" name="circle-alert" :size="16" />
      {{ message }}
    </p>
  </div>
</template>
