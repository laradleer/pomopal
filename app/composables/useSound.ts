/**
 * Short, soft sounds (#78), made with the Web Audio API: no audio files to download or license.
 *
 *   useSound().play('coin')
 *
 * - Browsers only allow audio after the student interacted with the page, so nothing plays until
 *   the first click or key press (plugins/sound.client.ts calls `unlock()`).
 * - Settings → Sounds turns them off (remembered in this browser).
 * - One sound of each kind at a time: a new coin stops the previous coin, so it never piles up.
 */
export type SoundName = 'tap' | 'coin' | 'task' | 'chime' | 'levelUp' | 'giggle'

type Note = {
  /** Pitch in Hz, and optionally where it slides to. */
  frequency: number
  slideTo?: number
  /** Start and length in seconds. */
  at: number
  length: number
  wave?: OscillatorType
  /** Loudness of this note, 0–1 (the master volume is applied on top). */
  level?: number
}

/** Quiet on purpose: every sound is scaled by this. */
const MASTER_VOLUME = 0.4
const STORAGE_KEY = 'pomopal:sounds'

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5

const SOUNDS: Record<SoundName, Note[]> = {
  // A very soft tick for button presses.
  tap: [{ frequency: 660, at: 0, length: 0.04, wave: 'triangle', level: 0.18 }],
  // A bright two-note coin.
  coin: [
    { frequency: 988, at: 0, length: 0.07, wave: 'square', level: 0.12 },
    { frequency: 1319, at: 0.06, length: 0.14, wave: 'square', level: 0.12 },
  ],
  // A little "pop-up" when a task is ticked off.
  task: [
    { frequency: C5, at: 0, length: 0.08, wave: 'triangle', level: 0.5 },
    { frequency: G5, at: 0.07, length: 0.16, wave: 'triangle', level: 0.5 },
  ],
  // The end of a session or break: a gentle arpeggio, clear even from another tab.
  chime: [
    { frequency: C5, at: 0, length: 0.7, wave: 'sine', level: 0.6 },
    { frequency: E5, at: 0.16, length: 0.7, wave: 'sine', level: 0.6 },
    { frequency: G5, at: 0.32, length: 0.7, wave: 'sine', level: 0.6 },
    { frequency: C6, at: 0.48, length: 0.9, wave: 'sine', level: 0.5 },
  ],
  // A rising fanfare for a new level.
  levelUp: [
    { frequency: 392, at: 0, length: 0.12, wave: 'triangle', level: 0.5 },
    { frequency: C5, at: 0.1, length: 0.12, wave: 'triangle', level: 0.5 },
    { frequency: E5, at: 0.2, length: 0.12, wave: 'triangle', level: 0.5 },
    { frequency: G5, at: 0.3, length: 0.12, wave: 'triangle', level: 0.5 },
    { frequency: C6, at: 0.4, length: 0.6, wave: 'triangle', level: 0.5 },
  ],
  // Three quick upward chirps for the pet's giggle.
  giggle: [
    { frequency: 880, slideTo: 1175, at: 0, length: 0.08, wave: 'sine', level: 0.35 },
    { frequency: 940, slideTo: 1245, at: 0.09, length: 0.08, wave: 'sine', level: 0.35 },
    { frequency: 880, slideTo: 1320, at: 0.18, length: 0.1, wave: 'sine', level: 0.35 },
  ],
}

let context: AudioContext | null = null
const playing = new Map<SoundName, OscillatorNode[]>()

export function useSound() {
  const isEnabled = useState('sound:enabled', () => true)

  function setEnabled(value: boolean) {
    isEnabled.value = value
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  }

  /** Called once after hydration by plugins/sound.client.ts. */
  function restore() {
    try {
      isEnabled.value = localStorage.getItem(STORAGE_KEY) !== 'off'
    } catch {
      isEnabled.value = true
    }
  }

  /** Creates or resumes the audio context; must run inside a user gesture. */
  function unlock() {
    if (import.meta.server) return
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
  }

  function play(name: SoundName) {
    const audio = context
    if (import.meta.server || !isEnabled.value || !audio || audio.state !== 'running') return
    for (const oscillator of playing.get(name) ?? []) {
      try {
        oscillator.stop()
      } catch {
        // Already stopped.
      }
    }

    const start = audio.currentTime
    const output = audio.createGain()
    output.gain.value = MASTER_VOLUME
    output.connect(audio.destination)

    const oscillators = SOUNDS[name].map((note) => {
      const oscillator = audio.createOscillator()
      const envelope = audio.createGain()
      const begin = start + note.at
      const end = begin + note.length
      oscillator.type = note.wave ?? 'sine'
      oscillator.frequency.setValueAtTime(note.frequency, begin)
      if (note.slideTo) oscillator.frequency.exponentialRampToValueAtTime(note.slideTo, end)
      // Quick fade in, smooth fade out: no clicks.
      envelope.gain.setValueAtTime(0, begin)
      envelope.gain.linearRampToValueAtTime(note.level ?? 0.5, begin + 0.01)
      envelope.gain.exponentialRampToValueAtTime(0.0001, end)
      oscillator.connect(envelope).connect(output)
      oscillator.start(begin)
      oscillator.stop(end + 0.02)
      return oscillator
    })
    playing.set(name, oscillators)
  }

  return { isEnabled: readonly(isEnabled), setEnabled, restore, unlock, play }
}
