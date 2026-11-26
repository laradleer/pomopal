/**
 * Light, dark or the same as the device (#27). Settings → App → Theme.
 *
 * Kept in a cookie, not in localStorage like the Animations switch: the server reads it, so the
 * first HTML already has the chosen colours and a dark page never flashes white. "system" leaves
 * <html> without data-theme, so `color-scheme: light dark` follows the OS (main.css).
 */
export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

const ONE_YEAR_S = 60 * 60 * 24 * 365

function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme)
}

export function useTheme() {
  const cookie = useCookie<string>('pomopal-theme', {
    default: () => 'system',
    maxAge: ONE_YEAR_S,
    sameSite: 'lax',
  })

  const theme = computed<Theme>({
    get: () => (isTheme(cookie.value) ? cookie.value : 'system'),
    set: (value) => {
      cookie.value = value
    },
  })

  return { theme }
}
