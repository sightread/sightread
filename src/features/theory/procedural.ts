import { Song, SongMeasure, SongNote } from '@/types'
import { Deferred, isBrowser } from '@/utils'
import { parseMidi } from '../parsers'
import { getRandomNote, KEY_SIGNATURE } from './keySignature'

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

interface Measure {
  number: number
  notes: SongNote[]
  duration: number
}

function splitMeasures(song: Song): Measure[] {
  const measures: Measure[] = []
  for (const note of song.notes) {
    measures[note.measure - 1] ??= {
      duration: song.measures[note.measure - 1].duration,
      number: note.measure,
      notes: [],
    }
    measures[note.measure - 1].notes.push(note)
  }

  // Now normalize the measures s.t. each starts at time 0.
  for (const measure of measures) {
    let firstNoteTime = measure.notes[0].time
    for (const note of measure.notes) {
      note.time -= firstNoteTime
    }
  }

  return measures
}

// TODO: create symmetry with splitMeasure
function joinMeasures(measures: Measure[]): { notes: SongNote[]; measures: SongMeasure[] } {
  const songNotes: SongNote[] = []
  const songMeasures: SongMeasure[] = []

  let measureStart = 0
  for (const measure of measures) {
    songMeasures.push({
      type: 'measure',
      number: songMeasures.length,
      duration: measure.duration,
      time: measureStart,
    })
    for (const note of structuredClone(measure.notes) as SongNote[]) {
      note.time += measureStart
      songNotes.push(note)
    }
    measureStart += measure.duration
  }

  return { notes: songNotes, measures: songMeasures }
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

let cachedMeasuresPerChord: Map<Chord, Measure[]>
async function getMeasuresPerChord() {
  if (cachedMeasuresPerChord) {
    return cachedMeasuresPerChord
  }
  const measurePerChord: Map<Chord, Measure[]> = new Map()

  await Promise.all(
    Object.entries(midiFiles).map(([chord, filename]: any) => {
      return fetch(`/music/irish/${filename}`)
        .then((response) => response.arrayBuffer())
        .then(parseMidi)
        .then((song) => {
          measurePerChord.set(chord, splitMeasures(song))
        })
        .catch((err) => console.error(err))
    }),
  )
  return (cachedMeasuresPerChord = measurePerChord)
}

const dMajorBacking = 'DM (Full BPM 120) v1.0 DB.mp3'
const eMinorBacking = 'EM (Full BPM 120) v1.0 DB.mp3'

type ChordProgression = 'eMinor' | 'dMajor' | 'random'

async function getBackingTrack(type: ChordProgression): Promise<HTMLAudioElement> {
  const url = `/music/irish/backing/${type === 'eMinor' ? eMinorBacking : dMajorBacking}`
  const track = new Audio(url)
  const deferred: Deferred<HTMLAudioElement> = new Deferred()
  track.addEventListener('canplaythrough', () => deferred.resolve(track))
  track.addEventListener('error', (err) => deferred.reject(err as any))

  return deferred.promise
}

export async function getGeneratedSong(type: ChordProgression): Promise<Song> {
  if (type === 'random') {
    return getRandomSong()
  }

  const [chordMap, backing] = await Promise.all([getMeasuresPerChord(), getBackingTrack(type)])
  const progression = type === 'eMinor' ? dMajorChordProgression : dMinorChordProgression

  const { notes, measures } = joinMeasures(progression.map((c) => randomChoice(chordMap.get(c)!)!))
  const duration = measures.reduce((sum, m) => sum + m.duration, 0)

  return {
    duration,
    notes,
    measures,
    tracks: { 0: {}, 1: {} },
    bpms: [],
    timeSignature: { numerator: 6, denominator: 8 },
    keySignature: 'C',
    items: sort([...measures, ...notes]),
    backing,
  }
}

function getRandomSong(): Song {
  const clef = 'treble'
  let minOctave = 4
  let maxOctave = 5
  // if (clef === 'bass') {
  //   minOctave = 2
  //   maxOctave = 3
  // }

  const duration = 20
  let time = 0
  const notes: SongNote[] = []
  const measures: SongMeasure[] = []
  Array.from({ length: duration * 4 }).forEach(() => {
    const note: SongNote = {
      type: 'note',
      track: 0,
      time,
      duration: 0.25,
      midiNote: getRandomNote(minOctave, maxOctave, 'C'),
      measure: time / 1,
    }
    notes.push(note)
    time += 0.25
  })
  for (let i = 0; i < duration; i += 1) {
    const measure: SongMeasure = { type: 'measure', number: measures.length, time: i, duration: 1 }
    measures.push(measure)
  }

  return {
    duration,
    notes,
    measures,
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
