export type KEY_SIGNATURE =
  | 'Cb'
  | 'Gb'
  | 'Db'
  | 'Ab'
  | 'Eb'
  | 'Bb'
  | 'F'
  | 'C'
  | 'G'
  | 'D'
  | 'A'
  | 'E'
  | 'B'
  | 'F#'
  | 'C#'

export function getKeySignatures(): KEY_SIGNATURE[] {
  return ['Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#']
}

export type Note = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

function getSharps(key: KEY_SIGNATURE): Set<Note> {
  return keyAlterationMap[key].notes
}

// From
function inferKey(): KEY_SIGNATURE {
  return 'C'
}

type KeyAlterationMap = {
  [keyname in KEY_SIGNATURE]: KeyAlterations
}

export type KeyAlterations = {
  type: 'sharp' | 'flat'
  notes: Set<Note>
}

const keyToNotes: { [sig in KEY_SIGNATURE]: string[] } = {
  // Sharps
  C: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  G: ['C', 'C#', 'D', 'D#', 'E', 'F♮', 'F', 'G', 'G#', 'A', 'A#', 'B'],
  D: ['C♮', 'C', 'D', 'D#', 'E', 'F♮', 'F', 'G', 'G#', 'A', 'A#', 'B'],
  A: ['C♮', 'C', 'D', 'D#', 'E', 'F♮', 'F', 'G♮', 'G', 'A', 'A#', 'B'],
  E: ['C♮', 'C', 'D♮', 'D', 'E', 'F♮', 'F', 'G♮', 'G', 'A', 'A#', 'B'],
  B: ['C♮', 'C', 'D♮', 'D', 'E', 'F♮', 'F', 'G♮', 'G', 'A♮', 'A', 'B'],
  'F#': ['C♮', 'C', 'D♮', 'D', 'E♮', 'E', 'F', 'G♮', 'G', 'A♮', 'A', 'B'],
  'C#': ['B', 'C', 'D♮', 'D', 'E♮', 'E', 'F', 'G♮', 'G', 'A♮', 'A', 'B♮'],

  // Flats
  F: ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B', 'B♮'],
  Bb: ['C', 'D♭', 'D', 'E', 'E♮', 'F', 'G♭', 'G', 'A♭', 'A', 'B', 'B♮'],
  Eb: ['C', 'D♭', 'D', 'E', 'E♮', 'F', 'G♭', 'G', 'A', 'A♮', 'B', 'B♮'],
  Ab: ['C', 'D', 'D♮', 'E', 'E♮', 'F', 'G♭', 'G', 'A', 'A♮', 'B', 'B♮'],
  Db: ['C', 'D', 'D♮', 'E', 'E♮', 'F', 'G', 'G♮', 'A', 'A♮', 'B', 'B♮'],
  Gb: ['C♮', 'D', 'D♮', 'E', 'E♮', 'F', 'G', 'G♮', 'A', 'A♮', 'B', 'C'],
  Cb: ['C♮', 'D', 'D♮', 'E', 'E', 'F♮', 'G', 'G♮', 'A', 'A♮', 'B', 'C'],
}

let keyAlterationMap: KeyAlterationMap = getKeyAlterationMap()
function getKeyAlterationMap(): KeyAlterationMap {
  const alterMap: KeyAlterationMap = {
    // Sharps
    C: { notes: new Set(), type: 'sharp' },
    G: { notes: new Set(['F']), type: 'sharp' },
    D: { notes: new Set(['F', 'C']), type: 'sharp' },
    A: { notes: new Set(['F', 'C', 'G']), type: 'sharp' },
    E: { notes: new Set(['F', 'C', 'G', 'D']), type: 'sharp' },
    B: { notes: new Set(['F', 'C', 'G', 'D', 'A']), type: 'sharp' },
    'F#': { notes: new Set(['F', 'C', 'G', 'D', 'A', 'E']), type: 'sharp' },
    'C#': { notes: new Set(['F', 'C', 'G', 'D', 'A', 'E', 'B']), type: 'sharp' },

    // Flats
    F: { notes: new Set(['B']), type: 'flat' },
    Bb: { notes: new Set(['B', 'E']), type: 'flat' },
    Eb: { notes: new Set(['B', 'E', 'A']), type: 'flat' },
    Ab: { notes: new Set(['B', 'E', 'A', 'D']), type: 'flat' },
    Db: { notes: new Set(['B', 'E', 'A', 'D', 'G']), type: 'flat' },
    Gb: { notes: new Set(['B', 'E', 'A', 'D', 'G', 'C']), type: 'flat' },
    Cb: { notes: new Set(['B', 'E', 'A', 'D', 'G', 'C', 'F']), type: 'flat' },
  }

  return alterMap
}

const midiToSigMap: { [num: number]: KEY_SIGNATURE } = {
  '-7': 'Cb',
  '-6': 'Gb',
  '-5': 'Db',
  '-4': 'Ab',
  '-3': 'Eb',
  '-2': 'Bb',
  '-1': 'F',
  '0': 'C',
  '1': 'G',
  '2': 'D',
  '3': 'A',
  '4': 'E',
  '5': 'B',
  '6': 'F#',
  '7': 'C#',
}

export function getKeyAlterations(key: KEY_SIGNATURE): KeyAlterations {
  return keyAlterationMap[key]
}

export function getKeySignatureFromMidi(key: number, scale: number): KEY_SIGNATURE {
  return midiToSigMap[key]
}

export function getKeyForSoundfont(note: number) {
  const soundFontIndex = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  return soundFontIndex[note % 12] + getOctave(note)
}

if (typeof window !== 'undefined') {
  ;(window as any).getNote = getNote
  ;(window as any).getKey = getKey
}

function circleOfFifths(fifth: number) {
  fifth = fifth % 8
  const cScale = [0, 2, 4, 5, 7, 9, 11]
  const fifthSemitones = 7
  return cScale.map((n) => (((n + fifth * fifthSemitones) % 12) + 12) % 12)
}

//
//  TO BE MOVED

// E.g. A0 --> 0, C8 --> 108.
const keyToNote: { [key: string]: number } = {}
const noteToKeyFlat: { [note: number]: string } = {}
const noteToKeySharp: { [note: number]: string } = {}

;(function () {
  const A0 = 21 // first note
  const C8 = 108 // last note
  const number2keyFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  const number2keySharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  for (let n = A0; n <= C8; n++) {
    const octave = ((n - 12) / 12) >> 0
    const nameFlat = number2keyFlat[n % 12] + octave
    const nameSharp = number2keySharp[n % 12] + octave
    keyToNote[nameFlat] = n
    noteToKeyFlat[n] = nameFlat
    noteToKeySharp[n] = nameSharp
  }
})()

export function getNote(key: string): number {
  return keyToNote[key]
}

export function getKey(note: number, keySignature: KEY_SIGNATURE = 'C'): string {
  return keyToNotes[keySignature][note % 12]
}

export function getOctave(note: number): number {
  return Math.floor((note - 12) / 12)
}
