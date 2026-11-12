// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/fonts', '@pinia/nuxt'],

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

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },
})
