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
  return keyDetailsMap[key].notes
}

// From
function inferKey(): KEY_SIGNATURE {
  return 'C'
}

type KeyAlterationMap = {
  [keyname in KEY_SIGNATURE]: KeyDetails
}

export type KeyDetails = {
  type: 'sharp' | 'flat'
  notes: Note[]
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

let keyDetailsMap: KeyAlterationMap = getKeyDetailsMap()
function getKeyDetailsMap(): KeyAlterationMap {
  const alterMap: KeyAlterationMap = {
    // Sharps
    C: { notes: [], type: 'sharp' },
    G: { notes: ['F'], type: 'sharp' },
    D: { notes: ['F', 'C'], type: 'sharp' },
    A: { notes: ['F', 'C', 'G'], type: 'sharp' },
    E: { notes: ['F', 'C', 'G', 'D'], type: 'sharp' },
    B: { notes: ['F', 'C', 'G', 'D', 'A'], type: 'sharp' },
    'F#': { notes: ['F', 'C', 'G', 'D', 'A', 'E'], type: 'sharp' },
    'C#': { notes: ['F', 'C', 'G', 'D', 'A', 'E', 'B'], type: 'sharp' },

    // Flats
    F: { notes: ['B'], type: 'flat' },
    Bb: { notes: ['B', 'E'], type: 'flat' },
    Eb: { notes: ['B', 'E', 'A'], type: 'flat' },
    Ab: { notes: ['B', 'E', 'A', 'D'], type: 'flat' },
    Db: { notes: ['B', 'E', 'A', 'D', 'G'], type: 'flat' },
    Gb: { notes: ['B', 'E', 'A', 'D', 'G', 'C'], type: 'flat' },
    Cb: { notes: ['B', 'E', 'A', 'D', 'G', 'C', 'F'], type: 'flat' },
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

export function getKeyDetails(key: KEY_SIGNATURE): KeyDetails {
  return keyDetailsMap[key]
}

export function getKeySignatureFromMidi(key: number, scale: number): KEY_SIGNATURE {
  return midiToSigMap[key]
}

// The sound fonts need the key in C Major with only flat accidentals.
// No sharps.
export function getKeyForSoundfont(note: number) {
  const soundFontIndex = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  return soundFontIndex[note % 12] + getOctave(note)
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
const noteToKey: { [note: number]: string } = {}

// noteToKey specifically for soundfonts.
;(function () {
  const A0 = 21 // first note
  const C8 = 108 // last note
  const number2Key = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  for (let n = A0; n <= C8; n++) {
    const octave = ((n - 12) / 12) >> 0
    const name = number2Key[n % 12] + octave
    keyToNote[name] = n
    noteToKey[n] = name
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
