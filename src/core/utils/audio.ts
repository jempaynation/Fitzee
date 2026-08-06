let audioContext: AudioContext | null = null

type AudioContextConstructor = new () => AudioContext

const MUSIC_NOTES = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23] as const
const MUSIC_NOTE_DURATION_SECONDS = 0.34
const MUSIC_STEP_SECONDS = 0.58

let musicContext: AudioContext | null = null
let musicTimer: number | null = null
let musicStartPending = false
let musicRequested = false
let musicGeneration = 0
let musicNoteIndex = 0
let musicNextNoteAt = 0
const musicOscillators = new Set<OscillatorNode>()

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null
  const audioWindow = window as typeof window & {
    webkitAudioContext?: AudioContextConstructor
  }
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null
}

function scheduleMusicNote(context: AudioContext, generation: number): void {
  if (
    !musicRequested ||
    generation !== musicGeneration ||
    context.state !== 'running'
  ) {
    musicTimer = null
    return
  }

  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const noteStart = Math.max(context.currentTime + 0.025, musicNextNoteAt)
  const noteEnd = noteStart + MUSIC_NOTE_DURATION_SECONDS

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(MUSIC_NOTES[musicNoteIndex], noteStart)
  gain.gain.setValueAtTime(0.0001, noteStart)
  gain.gain.exponentialRampToValueAtTime(0.018, noteStart + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)
  oscillator.connect(gain)
  gain.connect(context.destination)

  musicOscillators.add(oscillator)
  oscillator.addEventListener(
    'ended',
    () => {
      musicOscillators.delete(oscillator)
      oscillator.disconnect()
      gain.disconnect()
    },
    { once: true },
  )
  oscillator.start(noteStart)
  oscillator.stop(noteEnd + 0.01)

  musicNoteIndex = (musicNoteIndex + 1) % MUSIC_NOTES.length
  musicNextNoteAt = noteStart + MUSIC_STEP_SECONDS
  const nextDelay = Math.max(
    80,
    (musicNextNoteAt - context.currentTime - 0.04) * 1000,
  )
  musicTimer = window.setTimeout(
    () => scheduleMusicNote(context, generation),
    nextDelay,
  )
}

/**
 * Starts the local background melody. Call synchronously from a user gesture so
 * browsers are allowed to create or resume the music-only audio context.
 */
export function startBackgroundMusic(): void {
  musicRequested = true
  if (musicTimer !== null || musicStartPending) return

  const AudioContextClass = getAudioContextConstructor()
  if (!AudioContextClass) return

  try {
    if (!musicContext || musicContext.state === 'closed') {
      musicContext = new AudioContextClass()
    }
    const context = musicContext
    const generation = ++musicGeneration
    musicStartPending = true

    const begin = () => {
      musicStartPending = false
      if (
        !musicRequested ||
        generation !== musicGeneration ||
        context.state !== 'running' ||
        musicTimer !== null
      ) {
        return
      }
      musicNextNoteAt = context.currentTime
      scheduleMusicNote(context, generation)
    }

    if (context.state === 'suspended') {
      void context.resume().then(begin).catch(() => {
        musicStartPending = false
      })
    } else {
      begin()
    }
  } catch {
    musicStartPending = false
    // Background music is progressive enhancement; the app remains playable.
  }
}

export function stopBackgroundMusic(): void {
  musicRequested = false
  musicStartPending = false
  musicGeneration += 1

  if (musicTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(musicTimer)
    musicTimer = null
  }

  for (const oscillator of musicOscillators) {
    try {
      oscillator.stop()
    } catch {
      // The oscillator may already have reached its scheduled stop time.
    }
  }
  musicOscillators.clear()
  musicNoteIndex = 0
  musicNextNoteAt = 0

  if (musicContext?.state === 'running') {
    void musicContext.suspend().catch(() => {
      // Stopping the scheduler and oscillators already silences the melody.
    })
  }
}

function playToneSequence(
  enabled: boolean,
  notes: readonly { frequency: number; offset: number; duration: number }[],
  volume: number,
): void {
  if (!enabled || typeof window === 'undefined') return

  try {
    const AudioContextClass = getAudioContextConstructor()
    if (!AudioContextClass) return
    audioContext ??= new AudioContextClass()
    const startAt = audioContext.currentTime
    for (const note of notes) {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const noteStart = startAt + note.offset
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(note.frequency, noteStart)
      gain.gain.setValueAtTime(0.0001, noteStart)
      gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.012)
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + note.duration,
      )
      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start(noteStart)
      oscillator.stop(noteStart + note.duration + 0.01)
    }
  } catch {
    // Audio feedback is progressive enhancement; play must still work.
  }
}

export function playNavigationCue(enabled: boolean): void {
  playToneSequence(enabled, [{ frequency: 700, offset: 0, duration: 0.07 }], 0.045)
}

export function playPieceSnapCue(enabled: boolean): void {
  playToneSequence(
    enabled,
    [
      { frequency: 640, offset: 0, duration: 0.09 },
      { frequency: 850, offset: 0.06, duration: 0.11 },
    ],
    0.055,
  )
}

export function playCompletionCue(enabled: boolean): void {
  playToneSequence(
    enabled,
    [
      { frequency: 523, offset: 0, duration: 0.18 },
      { frequency: 659, offset: 0.13, duration: 0.18 },
      { frequency: 784, offset: 0.26, duration: 0.28 },
    ],
    0.07,
  )
}

export function vibrateSuccess(): void {
  try {
    navigator.vibrate?.(24)
  } catch {
    // Haptics are progressive enhancement.
  }
}

export function playNarration(
  enabled: boolean,
  language: 'en' | 'fil',
  text: string,
): void {
  if (!enabled || typeof speechSynthesis === 'undefined') return
  try {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'fil' ? 'fil-PH' : 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1.08
    speechSynthesis.speak(utterance)
  } catch {
    // Browser voices are progressive enhancement; visual play remains complete.
  }
}
