import { InstrumentName } from './synth/instruments'

export type Pitch = {
  step: string
  octave: number
  alter: number
}

export type SongNote = {
  type: 'note'
  midiNote: number
  track: number
  time: number
  duration: number
  pitch: Pitch
  velocity?: number
}

export type Bpm = { time: number; bpm: number }

export type Tracks = {
  [id: number]: Track
}

export type Track = {
  instrument?: string
  name?: string
  program?: number
}

export type SongMeasure = {
  type: 'measure'
  time: number
  number: number
}
export type Song = {
  tracks: Tracks
  duration: number
  measures: Array<SongMeasure>
  notes: Array<SongNote>
  bpms: Array<Bpm>
  timeSignature?: { numerator: number; denominator: number }
  items: Array<SongNote | SongMeasure>
}

export type Hand = 'both' | 'left' | 'right'
export type SongConfig = {
  [key: number]: TrackSetting
}
export type PlayableSong = Song & { config: SongConfig }

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
