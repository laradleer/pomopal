// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      // Installable app (#33): public/manifest.webmanifest opens /home full-screen, without the
      // browser bar. The colours are the canvas and tomato tokens (main.css), as hex for the browser.
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#121110', media: '(prefers-color-scheme: dark)' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'PomoPal' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
    },
    // Page transitions with the View Transitions API (main.css → Page transitions). Browsers
    // without it, and users who asked for less motion, get instant navigation.
    viewTransition: true,
  },

  css: ['~/assets/css/main.css'],

  // The app starts at /home; the auth middleware sends signed-out users on to /login.
  routeRules: {
    '/': { redirect: '/home' },
  },

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
    // Type-check the API tests (tests/api) and the Vitest configs with the Node code.
    nodeTsConfig: {
      include: ['../tests/**/*', '../vitest.*.ts'],
    },
  },

  // Loads Nuxt's View Transitions plugin; `app.viewTransition` above turns it on for every page.
  experimental: {
    viewTransition: true,
  },
})
