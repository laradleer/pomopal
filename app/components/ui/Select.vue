<script setup lang="ts">
/**
 * Native select, styled like <UiInput>. Use inside <UiFormField>, which passes the id and
 * aria attributes; every attribute goes to the <select> itself.
 *
 *   <UiSelect v-model="taskId" v-bind="field" :options="[{ value: '', label: 'No task' }, …]" />
 */
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

const props = defineProps<{ options: readonly { value: string; label: string }[] }>()
</script>

<template>
  <div class="relative">
    <select
      v-model="model"
      v-bind="$attrs"
      class="h-12 w-full appearance-none truncate rounded-sm border border-border bg-surface-sunken pr-11 pl-4 text-body text-ink transition-colors focus:border-focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-berry"
    >
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <UiIcon
      name="chevron-down"
      :size="20"
      class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-muted"
    />
  </div>
</template>
