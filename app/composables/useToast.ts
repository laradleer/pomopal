export type ToastTone = 'info' | 'success' | 'error'

export type Toast = {
  id: number
  message: string
  tone: ToastTone
  icon?: string
}

type ToastOptions = {
  tone?: ToastTone
  /** Lucide icon name; each tone has a default. */
  icon?: string
  /** Milliseconds before it disappears. */
  duration?: number
}

const DEFAULT_DURATION_MS = 3000
const MAX_VISIBLE = 3
let nextId = 0

/**
 * Short messages at the bottom of the screen, shown by <UiToaster> in app.vue.
 *
 *   const toast = useToast()
 *   toast.show('Saved!', { tone: 'success' })
 */
export function useToast() {
  const toasts = useState<Toast[]>('ui:toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string, options: ToastOptions = {}) {
    if (import.meta.server) return
    const toast: Toast = {
      id: ++nextId,
      message,
      tone: options.tone ?? 'info',
      icon: options.icon,
    }
    toasts.value = [...toasts.value.slice(-(MAX_VISIBLE - 1)), toast]
    setTimeout(() => dismiss(toast.id), options.duration ?? DEFAULT_DURATION_MS)
  }

  return { toasts: readonly(toasts), show, dismiss }
}
