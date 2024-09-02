import { InstrumentName } from '@/features/synth'
import { KEY_SIGNATURE } from './features/theory'

export type DifficultyLabel =
  | 'Easiest'
  | 'Easier'
  | 'Easy'
  | 'Medium'
  | 'Hard'
  | 'Hardest'
  // "-" stands for Unknown
  | '-'

export type SongSource = 'midishare' | 'upload' | 'builtin' | 'generated' | 'base64' | 'url'
export type SongMetadata = {
  id: string
  file: string
  title: string
  artist: string
  difficulty: number
  duration: number
  source: SongSource
}

export interface Size {
  width: number
  height: number
}

export interface Pitch {
  step: string
  octave: number
  alter: number
}

export interface SongNote {
  type: 'note'
  midiNote: number
  track: number
  time: number
  duration: number
  velocity?: number
  measure: number
}

export interface Bpm {
  time: number
  bpm: number
}

export interface Tracks {
  [id: string]: Track
}

export interface Track {
  instrument?: string
  name?: string
  program?: number
}

export type SongMeasure = {
  type: 'measure'
  time: number
  duration: number
  number: number
}

export type Song = {
  tracks: Tracks
  duration: number
  measures: Array<SongMeasure>
  notes: Array<SongNote>
  bpms: Array<Bpm>
  timeSignature?: { numerator: number; denominator: number }
  keySignature: KEY_SIGNATURE
  items: Array<SongNote | SongMeasure>
  backing?: HTMLAudioElement
}

export type Playlist = {
  id: string
  name: string
  songs: SongMetadata[]
}

export type Clef = 'bass' | 'treble'
export type VisualizationMode = 'falling-notes' | 'sheet'
export type Hand = 'both' | 'left' | 'right' | 'none'
export type SongConfig = {
  left: boolean
  right: boolean
  waiting: boolean
  visualization: VisualizationMode
  noteLetter: boolean
  coloredNotes: boolean
  skipMissedNotes: boolean
  keySignature?: KEY_SIGNATURE
  tracks: {
    [trackId: number]: TrackSetting
  }
}

export type TrackSetting = {
  track: Track
  hand: 'left' | 'right' | 'none'
  sound: boolean
  instrument: InstrumentName
}

export type MidiStateEvent = {
  type: 'down' | 'up'
  note: number
  time: number
  velocity?: number
}

export type HandSettings = {
  [trackId: string]: {
    hand: Hand | 'none'
  }
}
