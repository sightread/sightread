import { getSynth, getSynthStub, Synth } from 'src/synth'
import { Song, Track, SongNote, SongConfig, PlayableSong } from 'src/types'
import { gmInstruments, InstrumentName } from 'src/synth/instruments'
import { useEffect, useState } from 'react'
import { CanvasItem } from 'src/canvas/types'
import { clamp, getNoteSizes, inferHands, isBlack, mapValues, range } from 'src/utils'
import { getPersistedSongSettings } from 'src/persist'

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

  return { startNote, endNote }
}

interface Lanes {
  [note: number]: { left: number; width: number }
}
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

export function useSynth(
  instrument: InstrumentName,
): { loading: boolean; error: boolean; synth: Synth } {
  const [loadError, setLoadError] = useState({ loading: true, error: false })

  useEffect(() => {
    let cancelled = false
    setLoadError({ loading: true, error: false })
    getSynth(instrument)
      .then(() => {
        if (!cancelled) {
          setLoadError({ loading: false, error: false })
        }
      })
      .catch((err) => {
        if (cancelled) {
          return
        }
        console.error(`Could not load synth. Error: ${err}`)
        setLoadError({ loading: false, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [instrument])

  return { ...loadError, synth: getSynthStub(instrument) }
}

export function getHandSettings(song: PlayableSong | undefined) {
  if (!song) {
    return {}
  }

  return mapValues(song.config, (trackSetting) => {
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

  const tracks = song.tracks
  const { left, right } = inferHands(song, /* isTeachMid */ file.includes('lesson'))

  return mapValues(tracks, (track, trackId) => {
    const id = parseInt(trackId)
    const hand = left === id ? 'left' : right === id ? 'right' : 'none'
    return {
      track,
      hand,
      count: song.notes.filter((n) => n.track === id).length,
      instrument: getInstrument(track),
      sound: true,
    }
  })
}

export function whiteNoteHeight(pianoRollContainerWidth: number): number {
  const whiteWidth = pianoRollContainerWidth / 52
  return (220 / 30) * whiteWidth
}
