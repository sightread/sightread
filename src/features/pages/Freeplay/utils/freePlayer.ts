import { Song } from '@/types'
import { isBrowser } from '@/utils'
import { getPitch } from '@/features/parsers'
import { SongNote } from '@/types'

export default class FreePlayer {
  time: number = 0
  lastTime: number = 0
  raf: number | undefined
  song: Song
  active: Map<number, number> // Map from midiNote --> time created.

  constructor() {
    this.time = Number.MAX_SAFE_INTEGER
    this.lastTime = 0
    this.active = new Map()
    this.song = {
      bpms: [],
      tracks: { 1: { instrument: 'piano' } },
      measures: [],
      notes: [],
      duration: 0,
      items: [],
    }
    this.song.items = this.song.notes // Hack
    if (isBrowser()) {
      this.loop()
    }
  }

  start() {
    this.time = Number.MAX_SAFE_INTEGER
    this.lastTime = Date.now()
    this.active.clear()
    this.loop()
  }

  stop() {
    if (typeof this.raf === 'number') {
      cancelAnimationFrame(this.raf)
    }
  }

  loop() {
    this.raf = requestAnimationFrame(() => {
      const now = Date.now()
      const dt = now - this.lastTime
      this.time -= dt
      this.lastTime = now

      // Extend each note.
      for (let [midiNote, pressedTime] of this.active.entries()) {
        let note = this.song.notes.find((n) => n.midiNote === midiNote)
        if (note) {
          note.time = this.getTime()
          note.duration = pressedTime - note.time
        }
      }
      this.loop()
    })
  }

  addNote(midiNote: number, velocity: number = 80) {
    const time = this.getTime()
    const note: SongNote = {
      midiNote,
      velocity,
      type: 'note',
      pitch: getPitch(midiNote),
      track: 1,
      time,
      duration: 0,
    }
    this.song.notes.unshift(note)
    this.active.set(midiNote, time)
  }
  releaseNote(midiNote: number) {
    this.active.delete(midiNote)
  }

  // In seconds
  getTime() {
    return this.time / 1000
  }
}
