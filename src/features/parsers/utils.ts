// Since this is called from Deno as well, we need to use relative paths.
import { getKey } from '../theory'
import { Song, Tracks, Track } from '../../../src/types'

export function getPitch(midiNote: number): { octave: number; step: string; alter: number } {
  // e.g. Cb3
  const key = getKey(midiNote)
  if (!key) {
    return { step: 'N/A', octave: -1, alter: 0 }
  } else if (key[1] === 'b') {
    return { step: key[0], octave: +key[2], alter: -1 }
  } else {
    return { step: key[0], octave: +key[1], alter: 0 }
  }
}

function findFirstMatchForHand(tracks: Tracks, arr: string[]): number | undefined {
  const trackKeys = Object.keys(tracks).map(Number)
  let found = undefined
  for (const s of arr) {
    found = trackKeys.find((trackNum) => tracks[trackNum].name?.includes(s))
    if (found !== undefined) return found
  }
  return found
}

export function getHandIndexesForTeachMid(song: Song): { left?: number; right?: number } {
  const { tracks } = song
  const lhStudentTrack = findFirstMatchForHand(tracks, ['L.H.'])
  const rhStudentTrack = findFirstMatchForHand(tracks, ['R.H.', 'Student'])
  return { left: lhStudentTrack, right: rhStudentTrack }
}

export function isPiano(t: Track): boolean {
  const program = t.program ?? -1
  return (
    t.instrument?.toLowerCase()?.includes('piano') ||
    t.name?.toLowerCase()?.includes('piano') ||
    (0 <= program && program <= 6)
  )
}
export function parserInferHands(song: Song): { left: number; right: number } {
  const pianoTracks = Object.values(song.tracks).filter((track) => isPiano(track))
  // TODO: force users to choose tracks in this case.

  let t1!: number
  let t2!: number
  if (pianoTracks.length >= 2) {
    if (pianoTracks.length > 2) {
      console.error(
        `Choosing the first two Piano tracks, even though there are ${pianoTracks.length}`,
        song,
      )
    }
    ;[t1, t2] = Object.keys(song.tracks)
      .filter((track) => isPiano(song.tracks[+track]))
      .map(Number)
  } else if (pianoTracks.length < 2) {
    ;[t1, t2] = Object.keys(song.tracks).map(Number)
  }
  // Dumb way to determine r/l hand, calc which has the higher avg score, and flip if guessed wrong.
  const sum = (arr: Array<number>) => arr.reduce((a: number, b: number) => a + b, 0)
  const avg = (arr: Array<number>) => sum(arr) / arr.length
  let t1Avg = avg(song.notes.filter((n) => n.track === t1).map((n) => n.midiNote))
  let t2Avg = avg(song.notes.filter((n) => n.track === t2).map((n) => n.midiNote))
  if (t1Avg < t2Avg) {
    return { left: t1, right: t2 }
  }
  return { left: t2, right: t1 }
}
