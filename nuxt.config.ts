// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  css: ['~/assets/css/main.css'],

  // Rubik (display) and Nunito (body) from Google Fonts, downloaded at build time and
  // served from our own domain. latin-ext covers Turkish and other accented letters.
  fonts: {
    defaults: {
      subsets: ['latin', 'latin-ext'],
    },
    families: [
      { name: 'Rubik', provider: 'google', weights: [600, 700, 800] },
      { name: 'Nunito', provider: 'google', weights: [500, 600, 700, 800] },
    ],
  },

  // Lucide icons from the locally installed set: rendered as inline SVG during SSR, and only
  // the icons used in the code are bundled for the browser. Use them through <UiIcon>.
  icon: {
    // Not "Icon": inside ui/Icon.vue that name would refer to the file itself.
    componentName: 'NuxtIcon',
    mode: 'svg',
    serverBundle: { collections: ['lucide'] },
    clientBundle: { scan: true },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },
})
