/**
 * Puts the chosen theme on <html> (data-theme="light" | "dark"), on the server too, so the page
 * arrives in the right colours. "system" sets nothing and the OS decides (see useTheme).
 */
export default defineNuxtPlugin(() => {
  const { theme } = useTheme()
  useHead({
    htmlAttrs: {
      'data-theme': computed(() => (theme.value === 'system' ? undefined : theme.value)),
    },
  })
})
