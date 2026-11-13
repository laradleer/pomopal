/**
 * Before each navigation, notes on <html> whether it goes to a tab further right ("forward") or
 * further left ("back"), so the page transition slides the right way (main.css → Page
 * transitions). Pages outside the tabs just fade.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const root = document.documentElement

  router.beforeEach((to, from) => {
    const next = tabIndex(to.path)
    const previous = tabIndex(from.path)
    if (next === -1 || previous === -1 || next === previous) delete root.dataset.navDirection
    else root.dataset.navDirection = next > previous ? 'forward' : 'back'
  })
})
