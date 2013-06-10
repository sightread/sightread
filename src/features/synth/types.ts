import gmInstruments from './instruments'

export type SoundFont = { [key: string]: AudioBuffer }
export type InstrumentName = typeof gmInstruments[number]

export interface Synth {
  playNote(note: number, velocity?: number): void
  stopNote(note: number, velocity?: number): void
  setMasterVolume(vol: number): void
  getInstrument(): InstrumentName
}
