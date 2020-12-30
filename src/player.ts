// TODO: handle when users don't have an AudioContext supporting browser

import { SongNote, PlayableSong } from './types'
import { getSynth, Synth } from './synth'
import midi from './midi'
import { InstrumentName } from './synth/instruments'

let player: Player

class Player {
  song!: PlayableSong
  playInterval: any = null
  currentSongTime = 0
  // right now assuming bpm means quarter notes per minute
  currentBpm = 0
  currentIndex = 0
  lastIntervalFiredTime = 0
  notes: Array<any> = []
  playing: Array<any> = []
  synths: Array<Synth> = []
  volume = 1
  handlers: any = {}
  bpmModifier = 1
  range: null | [number, number] = null
  hand = 'both'
  listeners: Array<Function> = []
  wait = false
  lastPressedKeys = new Map<number, number>()
  dirty = false
  instrumentsLoaded = false

  static player(): Player {
    if (!player) {
      player = new Player()
    }
    return player
  }

  setWait(wait: boolean) {
    this.wait = wait
  }

  init(): void {
    this.currentBpm = 0
    this.bpmModifier = 1
    this.currentSongTime = 0
    this.currentIndex = 0
    this.currentSongTime = 0
    this.playing = []
  }

  async setSong(song: PlayableSong) {
    this.song = song
    this.instrumentsLoaded = false
    this.notes = song.notes.sort((note1: SongNote, note2) => note1.time - note2.time)

    const synths: Promise<Synth>[] = []
    Object.entries(song.tracks).forEach(async ([trackId, { program, instrument }]) => {
      synths[+trackId] = getSynth((program ?? instrument ?? 0) as any)
    })
    await Promise.all(synths).then((s) => {
      this.instrumentsLoaded = true
      this.synths = s
    })
  }

  setVolume(vol: number) {
    this.synths?.forEach((synth) => {
      synth?.setMasterVolume(vol)
    })
  }
  setTrackVolume(track: number | string, vol: number) {
    this.synths?.[+track]?.setMasterVolume(vol)
  }
  async setTrackInstrument(track: number | string, instrument: InstrumentName) {
    const synth = await getSynth(instrument)
    this.synths[+track] = synth
  }
  isActiveHand(note: SongNote) {
    return (
      this.hand === 'both' ||
      (this.hand === 'left' && note.track === this.song.config.left) ||
      (this.hand === 'right' && note.track === this.song.config.right)
    )
  }

  isActiveTrack(note: SongNote) {
    return this.song.config.left === note.track || this.song.config.right === note.track
  }

  getTime() {
    if (!this.playInterval) {
      return this.currentSongTime
    }
    const nextNote = this.song?.notes[this.currentIndex]
    if (this.wait && nextNote && this.isActiveHand(nextNote)) {
      const isntPressed =
        !midi.getPressedNotes().has(nextNote.midiNote) ||
        midi.getPressedNotes().get(nextNote.midiNote) ===
          this.lastPressedKeys.get(nextNote.midiNote)
      if (isntPressed) {
        return this.currentSongTime
      }
    }

    const now = performance.now()
    const dt = now - this.lastIntervalFiredTime
    return this.currentSongTime + dt / 1000
  }
  // ms * |___1s___|
  //      | 1000ms |

  getBpm() {
    const currBpm = this.song?.bpms[this.currentBpm]?.bpm ?? 120
    return currBpm * this.bpmModifier
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
    const index = this.song.bpms.findIndex((m) => m.time > time) - 1
    if (index < 0) {
      return this.song.bpms.length - 1
    }
    return index
  }

  getMeasureForTime(time: number) {
    if (!this.song?.measures) {
      console.log('measures have not been loaded')
      return
    }
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
    this.playInterval = setInterval(() => this.playLoop_(), 1)
    // continue playing everything we were in the middle of, but at a lower vol
    this.playing.forEach((note) => this.playNote(note))
    this.notify()
  }

  playNote(note: SongNote) {
    this.synths[note.track].playNote(note.midiNote, note.velocity)
    if (this.isActiveTrack(note)) {
      this.dirty = true
    }
  }

  stopNotes(notes: Array<SongNote>) {
    if (notes.length === 0 || this.synths.length === 0) {
      return
    }
    for (let note of notes) {
      this.synths[note.track].stopNote(note.midiNote)
    }
    this.dirty = true
  }

  startTimeInterval(interval: number): void {
    this.lastIntervalFiredTime = performance.now()
    this.playInterval = setInterval(() => this.timeStep(), interval)
  }

  timeStep(this: this) {
    this.updateTime_()
  }

  updateTime_() {
    const isPlaying = !!this.playInterval
    let dt = 0
    if (isPlaying) {
      const now = performance.now()
      dt = (now - this.lastIntervalFiredTime) * this.bpmModifier
      this.lastIntervalFiredTime = now
      this.currentSongTime += dt / 1000
    }

    return this.currentSongTime
  }

  playLoop_() {
    const prevTime = this.currentSongTime
    const time = this.updateTime_()

    // If at the end of the song, then reset.
    if (this.currentSongTime >= this.getDuration()) {
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
    this.stopNotes(this.playing.filter((n) => !stillPlaying(n)))
    this.playing = this.playing.filter(stillPlaying)

    while (this.notes[this.currentIndex]?.time < time) {
      const note = this.notes[this.currentIndex]

      if (this.wait && this.isActiveHand(note)) {
        if (
          !midi.getPressedNotes().has(note.midiNote) ||
          midi.getPressedNotes().get(note.midiNote) === this.lastPressedKeys.get(note.midiNote)
        ) {
          this.currentSongTime = note.time
          return
        }
        this.lastPressedKeys.set(note.midiNote, midi.getPressedNotes().get(note.midiNote)!)
      }
      this.playing.push(note)
      this.playNote(note)
      this.currentIndex++
    }
    this.notify()
  }

  stopAllSounds() {
    this.stopNotes(this.playing)
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
    this.notify(true)
  }

  seek(time: number) {
    this.stopAllSounds()
    this.currentSongTime = time
    this.playing = this.notes.filter((note) => {
      return note.time <= this.currentSongTime && note.time + note.duration > this.currentSongTime
    })
    if (!!this.playInterval) {
      this.playing.forEach((note) => this.playNote(note))
    }
    this.currentIndex = this.notes.findIndex((note) => note.time > this.currentSongTime)
    this.currentBpm = this.getBpmIndexForTime(time)
    this.notify()
  }

  /* Convert between songtime and real human time. Includes bpm calculations*/
  getRealTimeDuration(starttime: number, endtime: number) {
    return endtime - starttime
  }

  getPressedKeys() {
    let ret: any = {}
    for (let note of this.playing.filter((n) => this.isActiveTrack(n))) {
      ret[note.midiNote] = note
    }

    return ret
  }

  getDuration() {
    return this.song?.duration ?? 0
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
    this.listeners.splice(i, 1)
  }
  notify(force = false) {
    if (!this.dirty && !force) {
      return
    }
    this.dirty = false
    this.listeners.forEach((fn) => fn(this.getPressedKeys()))
  }
}
export default Player
