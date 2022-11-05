import { Song, SongMeasure, SongNote } from '@/types'
import { isBrowser } from '@/utils'
import { parseMidi } from '../parsers'

function splitMeasures(song: Song): SongNote[][] {
  let { notes, measures } = song
  notes = notes.slice(0)
  measures = measures.slice(0)

  measures.shift()

  let notesByMeasure: SongNote[][] = [[]]
  while (notes.length) {
    const note = notes.shift()!
    if (note?.time < measures[0].time) {
      notesByMeasure.at(-1)?.push(note)
    } else {
      notesByMeasure.push([note])
      measures.shift()
    }
  }

  return notesByMeasure
}

function normalizeMeasures(measures: SongNote[][]): SongNote[][] {
  measures = structuredClone(measures)
  for (const measure of measures) {
    let firstNoteTime = measure[0].time
    for (const note of measure) {
      note.time -= firstNoteTime
    }
  }
  return measures
}

type Chord =
  | 'aHigh'
  | 'amHigh'
  | 'amLow'
  | 'cHigh'
  | 'cLow'
  | 'dHigh'
  | 'dLow'
  | 'emHigh'
  | 'emLow'
  | 'gHigh'
  | 'gLow'

const midiFiles: { [chord in Chord]: string } = {
  aHigh: 'A_High_Lvl_3.mid',
  amHigh: 'Am_High_Lvl_3.mid',
  amLow: 'Am_Low_Lvl_3.mid',
  cHigh: 'C_High_Lvl_3.mid',
  cLow: 'C_Low_Lvl_3.mid',
  dHigh: 'D_High_Lvl_3.mid',
  dLow: 'D_Low_Lvl_3.mid',
  emHigh: 'Em_High_Lvl_3.mid',
  emLow: 'Em_Low_Lvl_3.mid',
  gHigh: 'G_High_Lvl_3.mid',
  gLow: 'G_Low_Lvl_3.mid',
}

let cachedMeasuresPerChord: Map<Chord, SongNote[][]>
async function getMeasuresPerChord() {
  if (cachedMeasuresPerChord) {
    return cachedMeasuresPerChord
  }
  const measurePerChord: Map<Chord, SongNote[][]> = new Map()

  await Promise.all(
    Object.entries(midiFiles).map(([chord, filename]: any) => {
      return fetch(`/music/irish/${filename}`)
        .then((response) => response.arrayBuffer())
        .then(parseMidi)
        .then((song) => {
          measurePerChord.set(chord, normalizeMeasures(splitMeasures(song)))
        })
    }),
  )
  return (cachedMeasuresPerChord = measurePerChord)
}

const dMajorChordProgression: Chord[] = [
  // First act
  'emLow',
  'gLow',
  'emLow',
  'gLow',
  'emLow',
  'gLow',
  'gLow',
  'emLow',
  'emLow',
  'gLow',
  'emLow',
  'gLow',
  'emLow',
  'gLow',
  'gLow',
  'emLow',

  // Second act
  'emHigh',
  'aHigh',
  'emHigh',
  'gHigh',
  'emHigh',
  'aHigh',
  'gHigh',
  'emHigh',
  'emHigh',
  'aHigh',
  'emHigh',
  'gHigh',
  'emHigh',
  'aHigh',
  'gHigh',
  'emHigh',
]

const dMinorChordProgression: Chord[] = [
  // First Act
  'dLow',
  'emLow',
  'dLow',
  'gLow',
  'dLow',
  'emLow',
  'gLow',
  'dLow',

  'dLow',
  'emLow',
  'dLow',
  'gLow',
  'dLow',
  'emLow',
  'gLow',
  'dLow',
  'dLow',
  'emLow',
  'dLow',
  'gLow',
  'dLow',
  'emLow',
  'gLow',
  'dLow',

  // Second Act
  'dHigh',
  'emHigh',
  'dHigh',
  'gHigh',
  'dHigh',
  'emHigh',
  'gHigh',
  'dHigh',
  'dHigh',
  'emHigh',
  'dHigh',
  'gHigh',
  'dHigh',
  'emHigh',
  'gHigh',
  'dHigh',
]

export async function getGeneratedSong(type: 'dMaj' | 'dMin'): Promise<Song> {
  const chordMap = await getMeasuresPerChord()
  const progression = type === 'dMaj' ? dMajorChordProgression : dMinorChordProgression

  let measures: SongMeasure[] = [{ type: 'measure', time: 0, number: 1 }]
  let measureNumber = 1
  let time = 0
  const notes = progression.flatMap((c) => {
    const notes = structuredClone(randomChoice(chordMap.get(c)!)!)
    for (const note of notes) {
      note.time += time
    }
    const last = notes.at(-1)!
    time = last.time + last.duration
    measures.push({ type: 'measure', time, number: ++measureNumber })
    return notes
  })

  // console.log(chordMap)
  // console.log(notes)
  return {
    duration: time,
    measures,
    notes,
    tracks: { 0: {}, 1: {} },
    bpms: [],
    timeSignature: { numerator: 4, denominator: 4 },
    keySignature: 'C',
    items: sort([...measures, ...notes]),
  }
}

function sort<T extends { time: number }>(arr: T[]): T[] {
  return arr.sort((i1, i2) => i1.time - i2.time)
}

function randomChoice<T>(arr: T[]): T | undefined {
  if (!arr || !arr.length) {
    console.log('shouldnt happen')
    return
  }

  return arr[Math.floor(Math.random() * arr.length)]
}
