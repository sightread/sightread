import { Song } from '@/types'
import { clone } from '@/utils'

export type Resolution = number
export function scaleResolution(song: Song | undefined, res: number): Song | undefined {
  if (!song) {
    return song
  }
  if (res === 0) {
    return { ...song }
  }
  const originalSong = song
  song = clone(song)

  const notes = song.notes
  const prevNotes = new Map()
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i]
    const prevNote = prevNotes.get(note.track)
    const measure = song.measures[note.measure - 1]
    const minNoteDuration = measure.duration * res

    // If prev note is now overlapping, remove this note.
    if (prevNote && prevNote.time + prevNote.duration > note.time) {
      notes.splice(i--, 1)
      continue
    }

    if (note.duration < minNoteDuration) {
      note.duration = Math.min(minNoteDuration, measure.time + measure.duration - note.time)
      prevNotes.set(note.track, note)
    }
  }
  song.items = sort([...notes, ...song.measures])
  return song
}

function sort<T extends { time: number }>(arr: T[]): T[] {
  return arr.sort((i1, i2) => i1.time - i2.time)
}
