/**
 * Sounds (useSound): restores the Sounds switch after hydration (the server always renders "on"),
 * and unlocks audio on the first click or key press, as browsers require.
 */
export default defineNuxtPlugin(() => {
  const { restore, unlock } = useSound()

  onNuxtReady(restore)

  const onFirstGesture = () => {
    unlock()
    window.removeEventListener('pointerdown', onFirstGesture)
    window.removeEventListener('keydown', onFirstGesture)
  }
  window.addEventListener('pointerdown', onFirstGesture)
  window.addEventListener('keydown', onFirstGesture)
})
