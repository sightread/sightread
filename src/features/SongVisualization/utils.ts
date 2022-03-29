import { Song, Track, SongNote, SongConfig, SongMeasure } from '@/types'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { clamp, getNoteSizes, inferHands, mapValues, range } from '@/utils'
import { getPersistedSongSettings, setPersistedSongSettings } from '@/features/persist'
import { isBlack } from '../theory'

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

interface Lanes {
  [note: number]: { left: number; width: number }
}
type CanvasItem = SongMeasure | SongNote
export function getNoteLanes(width: number, items: CanvasItem[] | undefined): Lanes {
  const notes: SongNote[] = items
    ? (items.filter((i) => i.type === 'note') as SongNote[])
    : ([{ midiNote: 21 }, { midiNote: 108 }] as SongNote[])
  const { startNote, endNote } = getSongRange({ notes })
  const whiteKeysCount = range(startNote, endNote)
    .map((n) => !isBlack(n))
    .filter(Boolean).length

  const { whiteWidth, blackWidth } = getNoteSizes(width, whiteKeysCount)
  const lanes: Lanes = {}
  let whiteNotes = 0
  for (let note = startNote; note <= endNote; note++) {
    if (isBlack(note)) {
      lanes[note] = { width: blackWidth, left: whiteWidth * whiteNotes - blackWidth / 2 }
    } else {
      lanes[note] = { width: whiteWidth, left: whiteWidth * whiteNotes }
      whiteNotes++
    }
  }

  return lanes
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

export function whiteNoteHeight(pianoRollContainerWidth: number): number {
  const whiteWidth = pianoRollContainerWidth / 52
  return (220 / 30) * whiteWidth
}
