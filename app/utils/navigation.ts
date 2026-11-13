/** The five main screens, in the order of the tab bar (phone) and the navigation rail (desktop). */
export const MAIN_TABS = [
  { to: '/home', label: 'Timer', icon: 'timer' },
  { to: '/tasks', label: 'Tasks', icon: 'list-checks' },
  { to: '/pet', label: 'Pet', icon: 'paw-print' },
  { to: '/shop', label: 'Shop', icon: 'store' },
  { to: '/stats', label: 'Stats', icon: 'chart-column' },
] as const

/** Position of a path in MAIN_TABS, or -1 for other pages (settings, login …). */
export function tabIndex(path: string): number {
  return MAIN_TABS.findIndex((tab) => path === tab.to || path.startsWith(`${tab.to}/`))
}
