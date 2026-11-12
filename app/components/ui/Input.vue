<script setup lang="ts">
/**
 * Text input. Use inside <UiFormField>, which passes the id, aria-describedby and
 * aria-invalid (red border) through v-bind. Other attributes (name, autocomplete, required …)
 * go straight to the <input>.
 */
const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
  }>(),
  { type: 'text' },
)
</script>

<template>
  <input
    v-model="model"
    :type="props.type"
    class="h-12 w-full rounded-sm border border-border bg-surface-sunken px-4 text-body text-ink transition-colors placeholder:text-ink-muted focus:border-focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-berry"
  />
</template>
