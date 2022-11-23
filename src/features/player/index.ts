// TODO: handle when users don't have an AudioContext supporting browser
import { computed, signal, Signal } from '@preact/signals-react'
import { SongNote, Song, SongConfig, SongMeasure, MidiStateEvent } from '@/types'
import { InstrumentName } from '@/features/synth'
import { getHands, isBrowser } from '@/utils'
import { getSynth, Synth } from '../synth'
import midi from '../midi'
import { getAudioContext } from '../synth/utils'

let player: Player

interface Score {
  perfect: Signal<number>
  good: Signal<number>
  miss: Signal<number>
  durationHeld: Signal<number>
  pointless: Signal<number>
  combined: Signal<number>
  accuracy: Signal<number>
}

function getInitialScore(): Score {
  const perfect = signal(0)
  const good = signal(0)
  const miss = signal(0)
  const pointless = signal(0)
  const durationHeld = signal(0)
  const combined = computed(
    () => perfect.value * 100 + good.value * 50 - pointless.value * 100 + durationHeld.value,
  )
  const accuracy = computed(() => {
    if (perfect.value + good.value + miss.value === 0) {
      return 100
    }
    return +(
      (100 * (perfect.value + good.value)) /
      (perfect.value + good.value + miss.value)
    ).toFixed(0)
  })

  return { perfect, good, miss, pointless, durationHeld, combined, accuracy }
}

export type PlayerState = 'CannotPlay' | 'Playing' | 'Paused'
class Player {
  state: Signal<PlayerState> = signal('CannotPlay')
  score: Score = getInitialScore()
  song?: Song
  playInterval: any = null
  currentSongTime = 0
  // TODO: Determine if MIDI always assumes BPM means quarter notes per minute.
  // Add link to documentation if so.
  currentBpm = 0
  currentIndex = 0
  lastIntervalFiredTime = 0
  playing: Array<SongNote> = []
  synths: Array<Synth> = []
  volume = 1
  handlers: any = {}
  bpmModifier = 1
  range: null | [number, number] = null
  hand = 'both'
  wait = false
  songHands: { left?: number; right?: number } = {}

  midiPressedNotes: Set<number> = new Set()
  lateNotes: Map<number, number> = new Map()
  earlyNotes: Map<number, number> = new Map()

  constructor() {
    midi.subscribe((midiEvent) => this.processMidiEvent(midiEvent))
  }

  clearMissedNotes_() {
    let missedNotes = 0
    for (const [midiNote, missedTime] of this.lateNotes.entries()) {
      const diff = ((this.currentSongTime - missedTime) * 1000) / this.bpmModifier
      if (diff > 100) {
        this.lateNotes.delete(midiNote)
        missedNotes++
      }
    }
    this.score.miss.value += missedNotes
  }

  processMidiEvent(midiEvent: MidiStateEvent) {
    if (!this.song) {
      return
    }

    const midiNote = midiEvent.note
    if (midiEvent.type === 'up') {
      this.midiPressedNotes.delete(midiNote)
      return
    } else {
      this.midiPressedNotes.add(midiNote)
    }

    // First check if the note already passed.
    this.clearMissedNotes_()
    const missedNote = this.lateNotes.get(midiNote)
    if (missedNote) {
      const currentTime = this.currentSongTime
      this.lateNotes.delete(midiNote)
      const diff = (1000 * (currentTime - missedNote)) / this.bpmModifier
      if (diff < 50) {
        console.log('Perfect (late)', diff)
        this.score.perfect.value++
        return
      } else if (diff < 100) {
        console.log('Good (late)', diff)
        this.score.good.value++
        return
      }
    }

    // Now handle if the note is upcoming, aka it was hit early
    let upcomingNote
    for (
      let i = this.currentIndex;
      i < this.song.notes.length && (this.song.notes[i].time - this.currentSongTime) * 1000 < 100;
      i++
    ) {
      const note = this.song.notes[i]
      if (note.midiNote === midiNote) {
        upcomingNote = note
        break
      }
    }
    if (upcomingNote && !this.earlyNotes.has(midiNote)) {
      const diff = ((upcomingNote.time - this.currentSongTime) * 1000) / this.bpmModifier
      if (diff < 50) {
        console.log('Perfect (early)', diff)
        this.score.perfect.value++
      } else if (diff < 100) {
        console.log('Good (early)', diff)
        this.score.good.value++
      }
      this.earlyNotes.set(midiNote, upcomingNote.time)
      return
    }

    this.score.pointless.value++
    console.log('Pointless hit!')
  }

  static player(): Player {
    if (!player) {
      player = new Player()
    }
    return player
  }

  setWait(wait: boolean) {
    this.wait = wait
  }

  isPlaying() {
    return this.state.value === 'Playing'
  }

  init(): void {
    this.currentBpm = 0
    this.bpmModifier = 1
    this.currentSongTime = 0
    this.currentIndex = 0
    this.playing = []
  }

  async setSong(song: Song, songConfig: SongConfig) {
    this.stop()
    this.song = song
    this.songHands = getHands(songConfig)
    this.state.value = 'CannotPlay'

    const synths: Promise<Synth>[] = []
    Object.entries(song.tracks).forEach(async ([trackId, config]) => {
      const instrument =
        songConfig.tracks[+trackId]?.instrument ?? config.program ?? config.instrument ?? 0
      synths[+trackId] = getSynth(instrument)
      const vol = songConfig.tracks[+trackId]?.sound ? 1 : 0
      this.setTrackVolume(+trackId, vol)
    })
    await Promise.all(synths).then((s) => {
      this.synths = s
      this.state.value = 'Paused'
    })
  }

  setVolume(vol: number) {
    this.synths?.forEach((synth) => {
      synth?.setMasterVolume(vol)
    })
    if (this.song?.backing) {
      this.song.backing.volume = 0.15 * vol
    }
  }

  setTrackVolume(track: number | string, vol: number) {
    this.synths?.[+track]?.setMasterVolume(vol)
  }

  async setTrackInstrument(track: number | string, instrument: InstrumentName) {
    const synth = await getSynth(instrument)
    this.synths[+track] = synth
  }

  isActiveHand(note: SongNote) {
    const { left, right } = this.songHands

    // Not even a L/R hand track.
    if (left !== note.track && right !== note.track) {
      return false
    }

    return (
      this.hand === 'both' ||
      (this.hand === 'left' && note.track === left) ||
      (this.hand === 'right' && note.track === right)
    )
  }

  getTimeForVisuals() {
    const offset = 0 // getAudioContext().outputLatency

    if (this.song?.backing) {
      return this.song.backing.currentTime
    }

    if (!this.isPlaying()) {
      return Math.max(0, this.currentSongTime - offset)
    }

    if (this.wait && this.lateNotes.size !== 0) {
      return this.currentSongTime - offset
    }

    const now = performance.now()
    const dt = now - this.lastIntervalFiredTime
    return Math.max(0, this.currentSongTime + dt / 1000 - offset)
  }

  getBpm() {
    const currBpm = this.song?.bpms[this.currentBpm]?.bpm ?? 120
    return currBpm * this.bpmModifier
  }

  increaseBpm() {
    const delta = 0.05
    this.bpmModifier = parseFloat((this.bpmModifier + delta).toFixed(2))
    if (this.song?.backing) {
      this.song.backing.playbackRate = this.bpmModifier
    }
  }

  decreaseBpm() {
    const delta = 0.05
    this.bpmModifier = parseFloat((this.bpmModifier - delta).toFixed(2))
    if (this.song?.backing) {
      this.song.backing.playbackRate = this.bpmModifier
    }
  }

  getBpmModifier() {
    return this.bpmModifier
  }

  setHand(hand: any) {
    this.hand = hand
  }

  getBpmIndexForTime(time: number) {
    if (!this.song) {
      return 0
    }

    const index = this.song.bpms.findIndex((m) => m.time > time) - 1
    if (index < 0) {
      return this.song.bpms.length - 1
    }
    return index
  }

  getMeasureForTime(time: number): SongMeasure {
    if (!this.song) {
      return { type: 'measure', number: 0, duration: 0, time: 0 }
    }

    let index = this.song.measures.findIndex((m) => m.time > time) - 1
    if (index < 0) {
      index = this.song.measures.length - 1
    }
    return this.song.measures[index]
  }

  play() {
    if (this.isPlaying() || this.state.value === 'CannotPlay') {
      return
    }

    if (this.song?.backing) {
      const backingTrack = this.song.backing
      backingTrack.volume = 0.15
      backingTrack.play()
    }
    this.state.value = 'Playing'

    this.lastIntervalFiredTime = performance.now()
    this.playInterval = setInterval(() => this.playLoop_(), 1)
    // continue playing everything we were in the middle of, but at a lower vol
    this.playing.forEach((note) => this.playNote(note))
  }

  playNote(note: SongNote) {
    this.synths[note.track].playNote(note.midiNote, note.velocity)
  }

  stopNotes(notes: Array<SongNote>) {
    if (notes.length === 0 || this.synths.length === 0) {
      return
    }
    for (let note of notes) {
      this.synths[note.track].stopNote(note.midiNote)
    }
  }

  updateTime_() {
    if (this.song?.backing) {
      return (this.currentSongTime =
        this.song.backing.currentTime + getAudioContext().outputLatency)
    }

    let dt = 0
    if (this.isPlaying()) {
      const now = performance.now()
      dt = (now - this.lastIntervalFiredTime) * this.bpmModifier
      this.lastIntervalFiredTime = now
      this.currentSongTime += dt / 1000
    }

    return this.currentSongTime
  }

  playLoop_() {
    if (!this.song) {
      return
    }

    const prevTime = this.currentSongTime
    let time = this.updateTime_()

    // If at the end of the song, stop playing.
    if (this.currentSongTime >= this.getDuration()) {
      this.pause()
    }

    // If a range is selected and you just got past it then zoom back
    if (this.range) {
      let [start, stop] = this.range
      if (prevTime <= stop && stop <= time) {
        this.seek(start - 0.5)
        return
      }
    }

    if (this.song.bpms[this.currentBpm + 1]?.time < time) {
      this.currentBpm++
    }
    const stillPlaying = (n: SongNote) => n.time + n.duration > time
    this.stopNotes(this.playing.filter((n) => !stillPlaying(n)))
    this.playing = this.playing.filter(stillPlaying)

    // Update scoring details
    this.clearMissedNotes_()
    const heldNotes = this.playing.filter((n) => this.midiPressedNotes.has(n.midiNote)).length
    if (heldNotes > 0) {
      this.score.durationHeld.value += heldNotes
    }

    while (this.song.notes[this.currentIndex]?.time < time) {
      const note = this.song.notes[this.currentIndex]

      if (this.isActiveHand(note)) {
        if (this.wait && this.lateNotes.has(note.midiNote)) {
          this.currentSongTime = note.time
          return
        } else if (this.earlyNotes.has(note.midiNote)) {
          this.earlyNotes.delete(note.midiNote)
        } else if (prevTime < note.time) {
          // Only mark as late during the tick in which it is first played.
          this.lateNotes.set(note.midiNote, this.currentSongTime)
        }
      }
      this.playing.push(note)
      this.playNote(note)
      this.currentIndex++
    }
  }

  toggle() {
    if (this.isPlaying()) {
      this.pause()
      return
    }
    this.play()
  }

  stopAllSounds() {
    this.stopNotes(this.playing)
  }

  pause() {
    if (!this.isPlaying()) {
      return
    }
    this.state.value = 'Paused'
    clearInterval(this.playInterval)
    this.song?.backing?.pause()
    this.playInterval = null
    this.stopAllSounds()
  }

  stop() {
    this.pause()
    this.reset_()
  }

  reset_() {
    this.currentSongTime = 0
    this.currentIndex = 0
    this.playing = []
    this.range = null
    this.earlyNotes.clear()
    this.lateNotes.clear()
    if (this.song?.backing) {
      this.song.backing.currentTime = 0
    }

    this.score.good.value = 0
    this.score.miss.value = 0
    this.score.perfect.value = 0
    this.score.pointless.value = 0
    this.score.durationHeld.value = 0
  }

  seek(time: number) {
    if (!this.song) {
      return
    }

    this.stopAllSounds()
    this.currentSongTime = time
    if (this.song.backing) {
      this.song.backing.currentTime = time
    }
    this.playing = this.song.notes.filter((note) => {
      return note.time < this.currentSongTime && this.currentSongTime < note.time + note.duration
    })
    this.currentIndex = this.song.notes.findIndex((note) => note.time >= this.currentSongTime)
    this.currentBpm = this.getBpmIndexForTime(time)
  }

  /* Convert between songtime and real human time. Includes bpm calculations*/
  getRealTimeDuration(starttime: number, endtime: number) {
    return endtime - starttime
  }

  getDuration() {
    return this.song?.duration ?? 0
  }

  setRange(range?: { start: number; end: number }) {
    if (!range) {
      this.range = null
      return
    }

    const { start, end } = range
    this.range = [Math.min(start, end), Math.max(start, end)]
  }
}

if (isBrowser()) {
  ;(window as any).SR = Player.player()
}

export default Player
