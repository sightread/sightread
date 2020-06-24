// TODO: handle when users don't have an AudioContext supporting browser

import { Song, SongNote } from "./utils"
import { WebAudioFontSynth } from "./synth"
import midi from "./midi"

class Player {
  song!: Song
  playInterval: any = null
  currentSongTime = 0
  // right now assuming bpm means quarter notes per minute
  currentBpm = 0
  currentIndex = 0
  lastIntervalFiredTime = 0
  notes: Array<any> = []
  playing: Array<any> = []
  synth = new WebAudioFontSynth()
  volume = 1
  handlers: any = {}
  songDuration = 0
  bpmModifier = 1
  range: null | [number, number] = null
  hand = "both"
  listeners: Array<Function> = []
  wait = false
  lastPressedKeys = new Map<number, number>()
  dirty = false

  setWait(wait: boolean) {
    this.wait = wait
  }
  setSong(song: Song) {
    this.song = song
    this.notes = song.notes.sort((note1, note2) => note1.time - note2.time)
    this.currentBpm = 0
    this.songDuration = 0
    this.currentIndex = 0
    this.currentSongTime = 0
    this.bpmModifier = 1
    for (const note of this.notes) {
      this.songDuration = Math.max(note.time + note.duration, this.songDuration)
    }
    this.playing.length = 0
  }

  setVolume(vol: number) {
    if (vol === 0) {
      this.stopAllSounds()
    }
    this.volume = vol
  }

  getTime() {
    if (!this.playInterval) {
      return this.currentSongTime
    }
    const nextNote = this.song.notes[this.currentIndex]
    if (this.wait && this.isActive(nextNote)) {
      const isntPressed =
        !midi.getPressedNotes().has(nextNote.noteValue) ||
        midi.getPressedNotes().get(nextNote.noteValue) ===
          this.lastPressedKeys.get(nextNote.noteValue)
      if (isntPressed) {
        return this.currentSongTime
      }
    }

    const now = performance.now()
    const dt = now - this.lastIntervalFiredTime
    return this.currentSongTime + (dt / 1000 / 60) * this.getBpm() * this.song.divisions
  }

  getBpm() {
    return this.song?.bpms[this.currentBpm].bpm * this.bpmModifier
  }

  increaseBpm() {
    this.bpmModifier += 0.05
  }

  decreaseBpm() {
    this.bpmModifier -= 0.05
  }

  getBpmModifier() {
    return this.bpmModifier
  }

  setHand(hand: any) {
    this.hand = hand
  }

  getBpmIndexForTime(time: number) {
    let index = this.song.bpms.findIndex((m) => m.time > time) - 1
    if (index < 0) {
      index = this.song.bpms.length - 1
    }
    return index
  }

  getMeasureForTime(time: number) {
    let index = this.song.measures.findIndex((m) => m.time > time) - 1
    if (index < 0) {
      index = this.song.measures.length - 1
    }
    return this.song.measures[index]
  }

  play() {
    if (this.playInterval) {
      return
    }

    this.lastIntervalFiredTime = performance.now()
    this.playInterval = setInterval(() => this.playLoop_(), 16)
    // continue playing everything we were in the middle of, but at a lower vol
    this.playing.forEach((note) => this.playNoteValue(note, this.volume / 4))
    this.notify()
  }

  isActive(note: SongNote) {
    return !(
      (this.hand === "left" && note.staff === 2) ||
      (this.hand === "right" && note.staff === 1)
    )
  }

  playNoteValue(note: SongNote, vol: number) {
    this.synth.playNoteValue(note.noteValue, vol)
    this.dirty = true
  }

  stopNoteValues(notes: Array<SongNote>) {
    if (notes.length === 0) {
      return
    }
    for (let note of notes) {
      this.synth.stopNoteValue(note.noteValue)
    }
    this.dirty = true
  }

  updateTime_() {
    const isPlaying = !!this.playInterval

    let dt = 0
    if (isPlaying) {
      const now = performance.now()
      dt = now - this.lastIntervalFiredTime
      this.lastIntervalFiredTime = now
      this.currentSongTime += (dt / 1000 / 60) * this.getBpm() * this.song.divisions
    }

    return this.currentSongTime
  }

  playLoop_() {
    const prevTime = this.currentSongTime
    const time = this.updateTime_()

    // If at the end of the song, then reset.
    if (this.currentIndex >= this.notes.length && this.playing.length === 0) {
      this.pause()
    }

    // If a range is selected and you just got past it then zoom back
    if (this.range) {
      let [start, stop] = this.range
      if (prevTime <= stop && stop <= time) {
        this.seek(start)
        return
      }
    }

    if (this.song.bpms[this.currentBpm + 1]?.time < time) {
      this.currentBpm++
    }
    const stillPlaying = (n: SongNote) => n.time + n.duration > time
    this.stopNoteValues(this.playing.filter((n) => !stillPlaying(n)))
    this.playing = this.playing.filter(stillPlaying)

    while (this.notes[this.currentIndex]?.time < time) {
      const note = this.notes[this.currentIndex]
      if (!this.isActive(note)) {
        this.currentIndex++
        continue
      }

      if (this.wait) {
        if (
          !midi.getPressedNotes().has(note.noteValue) ||
          midi.getPressedNotes().get(note.noteValue) === this.lastPressedKeys.get(note.noteValue)
        ) {
          this.currentSongTime = note.time
          return
        }
        this.lastPressedKeys.set(note.noteValue, midi.getPressedNotes().get(note.noteValue)!)
      }
      this.playing.push(note)
      this.playNoteValue(note, this.volume / 2)
      this.currentIndex++
    }
    this.notify()
  }

  stopAllSounds() {
    this.stopNoteValues(this.playing)
    this.notify()
  }

  pause() {
    clearInterval(this.playInterval)
    this.playInterval = null
    this.stopAllSounds()
  }

  stop() {
    this.pause()
    this.currentSongTime = 0
    this.currentIndex = 0
    this.playing = []
  }

  seek(time: number) {
    this.stopAllSounds()
    this.currentSongTime = time
    this.playing = this.notes.filter((note) => {
      return note.time <= this.currentSongTime && note.time + note.duration > this.currentSongTime
    })
    if (!!this.playInterval) {
      this.playing.forEach((note) => this.playNoteValue(note, this.volume / 2))
    }
    this.currentIndex = this.notes.findIndex((note) => note.time > this.currentSongTime)
    this.currentBpm = this.getBpmIndexForTime(time)
    this.notify()
  }

  /* Convert between songtime and real human time. Includes bpm calculations*/
  getRealTimeDuration(startTime: number, endTime: number) {
    if (!this.song) {
      return 0
    }
    if (this.song.bpms.length === 1) {
      return (endTime - startTime) / this.song.bpms[0].bpm / this.song.divisions
    }

    let startBpmIndex = this.song.bpms.findIndex((bpm) => bpm.time >= startTime)
    let endBpmIndex = this.song.bpms.findIndex((bpm) => bpm.time >= endTime) - 1
    if (startBpmIndex === -1) {
      startBpmIndex = 0
    }
    if (endBpmIndex < 0) {
      endBpmIndex = this.song.bpms.length - 1
    }

    let realTime = 0
    while (startBpmIndex < endBpmIndex) {
      const startSongTime = this.song.bpms[startBpmIndex].time
      const endSongTime = this.song.bpms[startBpmIndex + 1]?.time

      realTime +=
        (endSongTime - startSongTime) / this.song.bpms[startBpmIndex].bpm / this.song.divisions
      startBpmIndex++
    }
    realTime +=
      (endTime - this.song.bpms[startBpmIndex].time) /
      this.song.bpms[startBpmIndex].bpm /
      this.song.divisions

    return realTime
  }

  getPressedKeys() {
    let ret: any = {}
    for (let note of this.playing) {
      if (!this.isActive(note)) {
        continue
      }
      ret[note.noteValue] = note
    }

    return ret
  }

  getDuration() {
    return this.songDuration
  }

  setRange(range: { start: number; end: number } | null) {
    if (range === null) {
      this.range = range
      return
    }

    const { start, end } = range
    this.range = [Math.min(start, end), Math.max(start, end)]
  }

  subscribe(fn: Function) {
    this.listeners.push(fn)
  }
  unsubscribe(fn: Function) {
    let i = this.listeners.indexOf(fn)
    this.listeners.slice(i, 1)
  }
  notify() {
    if (!this.dirty) {
      return
    }
    this.dirty = false
    this.listeners.forEach((fn) => fn(this.getPressedKeys()))
  }
}
export default Player
