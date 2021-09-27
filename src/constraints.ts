import { PlayableSong, Song, SongNote } from './types'
import { getHands } from './utils'

export function simultaneousNotes(notes: SongNote[], n: number): SongNote[] {
  var currentNotes: SongNote[] = []
  var notesToKeep: SongNote[] = []

  function clearExpired(time: number) {
    currentNotes = currentNotes.filter((note) => {
      var endTime = note.time + note.duration
      console.log({ endTime, note })
      return endTime >= time
    })
  }

  for (let note of notes) {
    clearExpired(note.time)

    if (currentNotes.length < n) {
      currentNotes.push(note)
      notesToKeep.push(note)
    }
  }
  return notesToKeep
}

export function notesPerSecond(notes: SongNote[], nps: number): SongNote[] {
  var expireTime = -Infinity
  var notesToKeep = []

  for (let note of notes) {
    if (note.time > expireTime) {
      expireTime = note.time + 1 / nps
      notesToKeep.push(note)
    }
  }

  return notesToKeep
}

// Notes Per Second: [1,2,3,4,5, N where N = maxvalue in the song]
// NPS(s, 3) --> NPS(NPS(NPS(s, 5), 4), 3)

type ConstraintsConfig = {
  nps: number
  simultaneous: number
}

export function constrain(song: PlayableSong, constraints: ConstraintsConfig): PlayableSong {
  const hands = getHands(song)
  let leftNotes = song.notes.filter((n) => n.track === hands.left)
  let rightNotes = song.notes.filter((n) => n.track === hands.right)

  const { nps, simultaneous } = constraints
  leftNotes = notesPerSecond(simultaneousNotes(leftNotes, simultaneous), nps)
  rightNotes = notesPerSecond(simultaneousNotes(rightNotes, simultaneous), nps)

  const items = song.items
    .filter((item) => item.type === 'measure')
    .concat(leftNotes)
    .concat(rightNotes)
    .sort((i1, i2) => i1.time - i2.time)
  const notes: SongNote[] = items.filter((item) => item.type === 'note') as SongNote[]
  return { ...song, notes, items }
}
