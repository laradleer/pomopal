<script setup lang="ts">
// Living style guide for the design tokens. Only available in development.
definePageMeta({
  auth: false,
  middleware: () => {
    if (!import.meta.dev) {
      return abortNavigation(createError({ statusCode: 404, statusMessage: 'Page not found' }))
    }
  },
})

useSeoMeta({ title: 'Design tokens' })

type Theme = 'light' | 'dark'
const theme = ref<Theme>('light')
useHead({ htmlAttrs: { 'data-theme': theme } })

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const colorGroups = [
  {
    name: 'Surfaces',
    tokens: ['canvas', 'canvas-warm', 'surface', 'surface-sunken', 'border', 'border-strong'],
  },
  {
    name: 'Ink',
    tokens: ['ink', 'ink-muted', 'ink-button', 'ink-button-edge', 'on-ink-button'],
  },
  { name: 'Focus · brand', tokens: ['tomato', 'tomato-edge', 'tomato-tint'] },
  { name: 'Short break · success', tokens: ['leaf', 'leaf-edge', 'leaf-tint'] },
  { name: 'XP · level', tokens: ['grape', 'grape-edge', 'grape-tint'] },
  { name: 'Long break · info', tokens: ['sky', 'sky-tint'] },
  { name: 'Coins · streak', tokens: ['sun', 'sun-edge', 'sun-ink', 'sun-tint', 'on-sun'] },
  { name: 'Other', tokens: ['berry', 'on-brand', 'focus-ring', 'scrim'] },
] as const

// Brand colours with the text colour that must be used on them.
const pairings = [
  { label: 'Start focus', bg: 'bg-tomato', text: 'text-on-brand', edge: 'border-tomato-edge' },
  { label: 'Take a break', bg: 'bg-leaf', text: 'text-on-brand', edge: 'border-leaf-edge' },
  { label: 'Level 5', bg: 'bg-grape', text: 'text-on-brand', edge: 'border-grape-edge' },
  { label: 'Long break', bg: 'bg-sky', text: 'text-on-brand', edge: 'border-sky' },
  { label: '120 coins', bg: 'bg-sun', text: 'text-on-sun', edge: 'border-sun-edge' },
  {
    label: 'Start',
    bg: 'bg-ink-button',
    text: 'text-on-ink-button',
    edge: 'border-ink-button-edge',
  },
]

const typeStyles = [
  { className: 'text-display-xl', spec: 'Rubik 44/48 · 800', sample: 'Level up!' },
  { className: 'text-timer', spec: 'Rubik 72/72 · 700 · tabular', sample: '24:59' },
  { className: 'text-title', spec: 'Rubik 28/34 · 800', sample: 'Hi, ready to focus?' },
  { className: 'text-heading', spec: 'Rubik 20/26 · 700', sample: "Today's tasks" },
  { className: 'text-label', spec: 'Rubik 14/16 · 700 · uppercase', sample: 'Start focus' },
  {
    className: 'text-body-lg',
    spec: 'Nunito 18/28 · 600',
    sample: 'Choose a friend to study with.',
  },
  {
    className: 'text-body',
    spec: 'Nunito 16/24 · 500',
    sample: 'Nice! +10 coins. Ready for another round?',
  },
  { className: 'text-body-sm', spec: 'Nunito 14/20 · 500', sample: 'Unlocks at level 10' },
  { className: 'text-stat', spec: 'Nunito 18/22 · 800 · tabular', sample: '1,250' },
]

const radii = [
  { className: 'rounded-sm', label: 'sm · 10px' },
  { className: 'rounded-md', label: 'md · 16px' },
  { className: 'rounded-lg', label: 'lg · 24px' },
  { className: 'rounded-xl', label: 'xl · 32px' },
  { className: 'rounded-pill', label: 'pill' },
]
</script>

<template>
  <main class="mx-auto max-w-app space-y-12 px-4 py-8">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-title">Design tokens</h1>
        <p class="text-body-sm text-ink-muted">docs/04-design-system.md · dev only</p>
      </div>
      <button
        type="button"
        class="rounded-pill border border-border-strong bg-surface px-4 py-2 text-label"
        @click="toggleTheme"
      >
        {{ theme === 'light' ? 'Dark' : 'Light' }} theme
      </button>
    </header>

    <section class="space-y-6">
      <h2 class="text-heading">Colours</h2>
      <div v-for="group in colorGroups" :key="group.name" class="space-y-3">
        <h3 class="text-label text-ink-muted">{{ group.name }}</h3>
        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <li v-for="token in group.tokens" :key="token" class="space-y-2">
            <div
              class="h-16 rounded-md border"
              :style="{ backgroundColor: `var(--color-${token})` }"
            />
            <code class="block text-body-sm">{{ token }}</code>
          </li>
        </ul>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-heading">Brand pairings</h2>
      <p class="text-body-sm text-ink-muted">
        Background with the text colour it must use, and the 4px darker bottom edge.
      </p>
      <div class="flex flex-wrap gap-3">
        <span
          v-for="pair in pairings"
          :key="pair.label"
          class="rounded-md border-b-4 px-4 py-3 text-label"
          :class="[pair.bg, pair.text, pair.edge]"
        >
          {{ pair.label }}
        </span>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-heading">Type</h2>
      <dl class="divide-y divide-border rounded-lg border bg-surface">
        <div
          v-for="style in typeStyles"
          :key="style.className"
          class="grid gap-1 p-4 md:grid-cols-[14rem_1fr] md:items-baseline"
        >
          <dt class="text-body-sm text-ink-muted">
            <code>{{ style.className }}</code>
            <span class="block">{{ style.spec }}</span>
          </dt>
          <dd :class="style.className">{{ style.sample }}</dd>
        </div>
      </dl>
    </section>

    <section class="grid gap-8 md:grid-cols-2">
      <div class="space-y-4">
        <h2 class="text-heading">Radius</h2>
        <ul class="flex flex-wrap gap-3">
          <li
            v-for="radius in radii"
            :key="radius.className"
            class="flex h-20 w-24 items-end border bg-surface-sunken p-2 text-body-sm"
            :class="radius.className"
          >
            {{ radius.label }}
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h2 class="text-heading">Shadow and motion</h2>
        <div class="flex flex-wrap items-center gap-4">
          <span class="rounded-pill bg-surface px-4 py-3 text-body-sm shadow-float">
            shadow-float
          </span>
          <span class="animate-pop rounded-pill bg-sun-tint px-4 py-3 text-stat text-sun-ink">
            +10 coins
          </span>
        </div>
      </div>
    </section>

    <DevComponentGallery />
  </main>
</template>
