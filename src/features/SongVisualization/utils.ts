import { Song, Track, SongNote, SongConfig, SongMeasure } from '@/types'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { clamp, mapValues } from '@/utils'
import { getPersistedSongSettings, setPersistedSongSettings } from '@/features/persist'
import { isBlack } from '../theory'
import { getHandIndexesForTeachMid, parserInferHands } from '../parsers'

export function getSongRange(song: { notes: SongNote[] } | undefined) {
  const notes = song?.notes ?? []
  let startNote = notes[0]?.midiNote ?? 21
  let endNote = notes[0]?.midiNote ?? 108

  for (let { midiNote } of notes) {
    startNote = Math.min(startNote, midiNote)
    endNote = Math.max(endNote, midiNote)
  }

  startNote = clamp(startNote - 2, { min: 21, max: 107 })
  endNote = clamp(endNote + 2, { min: startNote + 1, max: 108 })

  // If the prev/next note is black, we need to include it as well.
  // Since black notes are partially on the adjacent notes as well.
  if (isBlack(startNote - 1)) {
    startNote--
  }
  if (isBlack(endNote + 1)) {
    endNote++
  }

  return { startNote, endNote }
}

export function getHandSettings(config: SongConfig | undefined) {
  if (!config) {
    return {}
  }
  return mapValues(config.tracks, (trackSetting) => {
    return { hand: trackSetting.hand }
  })
}

function getInstrument(track: Track): InstrumentName {
  return ((track.instrument || track.name) as InstrumentName) || gmInstruments[track.program ?? 0]
}

export function getSongSettings(file: string, song: Song): SongConfig {
  let persisted = getPersistedSongSettings(file)
  if (persisted) {
    return persisted
  }

  const { left, right } = inferHands(song, /* isTeachMid */ file.includes('lesson'))
  const tracks = mapValues(song.tracks, (track, trackId) => {
    const id = parseInt(trackId)
    const hand = left === id ? 'left' : right === id ? 'right' : 'none'
    return {
      track,
      hand: hand as any,
      count: song.notes.filter((n) => n.track === id).length,
      instrument: getInstrument(track),
      sound: true,
    }
  })

  const songSettings: SongConfig = {
    left: true,
    right: true,
    waiting: false,
    noteLetter: false,
    visualization: 'falling-notes',
    tracks,
  }
  setPersistedSongSettings(file, songSettings)
  return songSettings
}

function inferHands(song: Song, isTeachMidi: boolean): { left?: number; right?: number } {
  return isTeachMidi ? getHandIndexesForTeachMid(song) : parserInferHands(song)
}
