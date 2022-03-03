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
