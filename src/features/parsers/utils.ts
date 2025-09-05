// Since this is called from Deno as well, we need to use relative paths.
import { Song, Track } from '../../../src/types'
import { getKey } from '../theory'

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

export function isPiano(t: Track): boolean {
  const program = t.program ?? -1
  return (
    t.instrument?.toLowerCase()?.includes('piano') ||
    t.name?.toLowerCase()?.includes('piano') ||
    (0 <= program && program <= 6)
  )
}
export function parserInferHands(song: Song): { left: number; right: number } {
  // First, check against known likely left/right names for tracks:
  const trackNames = Object.values(song.tracks).map((track) => track.name ?? '')
  const likelyLeft = ['bass', 'left', 'lh', 'L.H.']
  const likelyRight = ['treble', 'lead', 'rh', 'right', 'R.H.', 'Student']
  const likelyLeftTrack = trackNames.find((name) => likelyLeft.includes(name.toLowerCase()))
  const likelyRightTrack = trackNames.find((name) => likelyRight.includes(name.toLowerCase()))
  if (likelyLeftTrack && likelyRightTrack) {
    const leftId = Object.keys(song.tracks).find(
      (id: any) => song.tracks[id].name === likelyLeftTrack,
    )!
    const rightId = Object.keys(song.tracks).find(
      (id: any) => song.tracks[id].name === likelyRightTrack,
    )!
    return {
      left: +leftId,
      right: +rightId,
    }
  }
  const pianoTracks = Array.from(Object.entries(song.tracks))
    .filter(([_id, track]) => isPiano(track))
    .filter(([id, _track]) => {
      const notes = song.notes.filter((note) => note.track === +id)
      return song.notes.filter((note) => note.track === +id).length > 0
    })
  // TODO: force users to choose tracks in this case.

  let t1!: number
  let t2!: number
  if (pianoTracks.length >= 2) {
    if (pianoTracks.length > 2) {
      console.warn(
        `Choosing the first two Piano tracks, even though there are ${pianoTracks.length}`,
      )
    }
    ;[t1, t2] = pianoTracks.map(([trackId, _track]) => +trackId)
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
