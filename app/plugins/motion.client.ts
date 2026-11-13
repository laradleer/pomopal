/**
 * Keeps <html> in step with the motion state (see useMotion):
 *   data-motion="reduced"   the OS asks for less motion, or the Animations switch is off
 *   data-tab-hidden         the tab is in the background, so CSS loops pause
 *
 * The saved switch and the OS setting are read only after hydration: the server always renders
 * "animations on", so changing the state earlier would make the HTML disagree with the browser.
 */
export default defineNuxtPlugin(() => {
  const { isReduced, restore } = useMotion()
  const prefersReduced = useState<boolean>('motion:prefers-reduced')
  const root = document.documentElement

  watch(isReduced, (reduced) => {
    if (reduced) root.dataset.motion = 'reduced'
    else delete root.dataset.motion
  })

  onNuxtReady(() => {
    restore()
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced.value = query.matches
    query.addEventListener('change', (event) => {
      prefersReduced.value = event.matches
    })
  })

  const syncVisibility = () => {
    if (document.hidden) root.dataset.tabHidden = ''
    else delete root.dataset.tabHidden
  }
  document.addEventListener('visibilitychange', syncVisibility)
  syncVisibility()
})
