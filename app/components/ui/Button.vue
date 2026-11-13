<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

/**
 * Chunky button with a 4px darker edge that sinks when pressed.
 * One `primary` per screen. `ink` is the calm dark pill. Pass `to` to render a link.
 */
type Variant = 'primary' | 'leaf' | 'grape' | 'outline' | 'ink'
type Size = 'md' | 'sm'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    to?: RouteLocationRaw
    icon?: string
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    to: undefined,
    icon: undefined,
    loading: false,
    disabled: false,
    block: false,
  },
)

const variantClasses: Record<Variant, string> = {
  primary: 'rounded-md bg-tomato text-on-brand edge-tomato-edge',
  leaf: 'rounded-md bg-leaf text-on-brand edge-leaf-edge',
  grape: 'rounded-md bg-grape text-on-brand edge-grape-edge',
  outline: 'rounded-md border border-border-strong bg-surface text-ink edge-border-strong',
  ink: 'rounded-pill bg-ink-button text-on-ink-button edge-ink-button-edge',
}

const sizeClasses: Record<Size, string> = {
  md: 'h-12 gap-2 px-6',
  sm: 'h-10 gap-1.5 px-4',
}

const NuxtLink = resolveComponent('NuxtLink')
const sound = useSound()

function onPress() {
  if (!isInactive.value) sound.play('tap')
}
const isInactive = computed(() => props.disabled || props.loading)
const isLink = computed(() => Boolean(props.to) && !isInactive.value)
const iconSize = computed(() => (props.size === 'sm' ? 16 : 20))
</script>

<template>
  <component
    :is="isLink ? NuxtLink : 'button'"
    v-bind="isLink ? { to: props.to } : { type: props.type, disabled: isInactive }"
    :aria-busy="props.loading || undefined"
    class="mb-1 inline-flex pressable items-center justify-center text-label whitespace-nowrap select-none hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variantClasses[props.variant], sizeClasses[props.size], props.block && 'w-full']"
    @pointerdown="onPress"
  >
    <UiIcon
      v-if="props.loading"
      name="loader-circle"
      :size="iconSize"
      class="motion-safe:animate-spin"
    />
    <UiIcon v-else-if="props.icon" :name="props.icon" :size="iconSize" />
    <span><slot /></span>
  </component>
</template>
