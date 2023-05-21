// TODO: handle when users don't have an AudioContext supporting browser
import { computed, ReadonlySignal, signal, Signal } from '@preact/signals-react'
import { SongNote, Song, SongConfig, SongMeasure, MidiStateEvent } from '@/types'
import { InstrumentName } from '@/features/synth'
import { getHands, isBrowser, round } from '@/utils'
import { getSynth, Synth } from '../synth'
import midi from '../midi'
import { getAudioContext } from '../synth/utils'

let player: Player

const GOOD_RANGE = 300
const PERFECT_RANGE = 150

interface Score {
  perfect: Signal<number>
  good: Signal<number>
  miss: Signal<number>
  durationHeld: Signal<number>
  pointless: Signal<number>
  combined: Signal<number>
  accuracy: Signal<number>
  streak: Signal<number>
}

function getInitialScore(): Score {
  const perfect = signal(0)
  const good = signal(0)
  const miss = signal(0)
  const pointless = signal(0)
  const durationHeld = signal(0)
  const streak = signal(0)
  const combined = computed(
    () => perfect.value * 100 + good.value * 50 - pointless.value * 25 + durationHeld.value,
  )

  const accuracy = computed(() => {
    if (perfect.value + good.value + miss.value === 0) {
      return 100
    }
    return round((100 * (perfect.value + good.value)) / (perfect.value + good.value + miss.value))
  })

  return { perfect, good, miss, pointless, durationHeld, combined, accuracy, streak }
}

export type PlayerState = 'CannotPlay' | 'Playing' | 'Paused'
class Player {
  state: Signal<PlayerState> = signal('CannotPlay')
  score: Score = getInitialScore()
  song: Signal<Song | null> = signal(null)
  playInterval: any = null
  currentSongTime = 0
  volume = signal(1)

  // TODO: Determine if MIDI always assumes BPM means quarter notes per minute.
  // Add link to documentation if so.
  bpmModifier = signal(1)
  currentBpmIndex = signal(0)
  currentBpm: ReadonlySignal<number> = computed(() => {
    const currSongBpm = this.song.value?.bpms[this.currentBpmIndex.value]?.bpm ?? 120
    return currSongBpm * this.bpmModifier.value
  })

  currentIndex: number = 0
  lastIntervalFiredTime = 0
  playing: Array<SongNote> = []
  synths: Array<Synth> = []
  handlers: any = {}
  range: null | [number, number] = null
  hand = 'both'
  wait = false
  songHands: { left?: number; right?: number } = {}

  hitNotes: Set<SongNote> = new Set()
  missedNotes: Set<SongNote> = new Set()
  midiPressedNotes: Set<number> = new Set()
  lateNotes: Map<number, SongNote> = new Map()
  skipMissedNotes = false

  constructor() {
    midi.subscribe((midiEvent) => this.processMidiEvent(midiEvent))
  }

  getSong() {
    return this.song.value
  }

  clearMissedNotes_() {
    let missedNotes = 0
    for (const [midiNote, missedNote] of this.lateNotes.entries()) {
      const diff = this.calcDiff(this.currentSongTime, missedNote.time)
      if (diff > GOOD_RANGE) {
        this.lateNotes.delete(midiNote)
        missedNotes++
        this.missedNotes.add(missedNote)
      }
    }
    if (missedNotes > 0) {
      this.score.streak.value = 0
    }
    this.score.miss.value += missedNotes
  }

  processMidiEvent(midiEvent: MidiStateEvent) {
    const song = this.getSong()
    if (!song) {
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
    const lateNote = this.lateNotes.get(midiNote)
    if (lateNote) {
      const currentTime = this.currentSongTime
      this.lateNotes.delete(midiNote)
      const diff = this.calcDiff(currentTime, lateNote.time)
      const isHit = diff < GOOD_RANGE
      if (diff < PERFECT_RANGE) {
        this.score.perfect.value++
      } else if (diff < GOOD_RANGE) {
        this.score.good.value++
      }
      if (isHit) {
        this.score.streak.value++
        this.hitNotes.add(lateNote)
        if (this.skipMissedNotes) {
          this.playNote(lateNote)
        }
        return
      }
    }

    // Now handle if the note is upcoming, aka it was hit early
    const nextNote = this.getNextNotes()?.find((note) => note.midiNote === midiNote)
    if (nextNote && !isHitNote(nextNote)) {
      const diff = this.calcDiff(nextNote.time, this.currentSongTime)
      if (diff < PERFECT_RANGE) {
        this.score.perfect.value++
      } else if (diff < GOOD_RANGE) {
        this.score.good.value++
      }
      this.score.streak.value++
      this.hitNotes.add(nextNote)
      return
    }

    this.score.pointless.value++
    this.score.streak.value = 0
  }

  // Given two song timestamps, return their difference in milliseconds after adjusting for the bpm modifier
  calcDiff(to: number, from: number) {
    return ((to - from) * 1000) / this.bpmModifier.value
  }

  /* Return all notes that are valid to hit */
  getNextNotes() {
    const song = this.song?.value
    const nextNote = song?.notes[this.currentIndex]
    if (!nextNote) {
      return
    }

    let notes = []
    const isWithinRange = (note: SongNote) => note && this.calcDiff(note.time, nextNote.time) <= GOOD_RANGE
    for (let i = this.currentIndex; isWithinRange(song.notes[i]); i++) {
      notes.push(song.notes[i])
    }
    return notes
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

  async setSong(song: Song, songConfig: SongConfig) {
    this.stop()
    this.song.value = song
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
    // this.skipMissedNotes = songConfig.skipMissedNotes
    this.wait = songConfig.waiting
  }

  setVolume(vol: number) {
    this.volume.value = vol
    this.synths?.forEach((synth) => {
      synth?.setMasterVolume(vol)
    })

    const backingTrack = this.getSong()?.backing
    if (backingTrack) {
      backingTrack.volume = 0.15 * vol
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

  getTime() {
    const offset = 0 // getAudioContext().outputLatency
    const song = this.getSong()
    if (!song) {
      return 0
    }

    if (song?.backing) {
      return song.backing.currentTime
    }

    if (!this.isPlaying()) {
      return Math.max(0, this.currentSongTime - offset)
    }

    if (this.wait && !isHitNote(song.notes[this.currentIndex])) {
      return this.currentSongTime - offset
    }

    const now = performance.now()
    const dt = now - this.lastIntervalFiredTime
    return Math.max(0, this.currentSongTime + dt / 1000 - offset)
  }

  getBpm() {
    return this.currentBpm
  }

  increaseBpm() {
    const delta = 0.05
    this.bpmModifier.value = round(this.bpmModifier.value + delta, 2)
    const backingTrack = this.getSong()?.backing
    if (backingTrack) {
      backingTrack.playbackRate = this.bpmModifier.value
    }
  }

  decreaseBpm() {
    const delta = 0.05
    this.bpmModifier.value = round(this.bpmModifier.value - delta, 2)
    const backingTrack = this.getSong()?.backing
    if (backingTrack) {
      backingTrack.playbackRate = this.bpmModifier.value
    }
  }

  getBpmModifier() {
    return this.bpmModifier
  }

  setHand(hand: any) {
    this.hand = hand
  }

  getBpmIndexForTime(time: number) {
    const song = this.getSong()
    if (!song) {
      return 0
    }

    const index = song.bpms.findIndex((m) => m.time > time) - 1
    if (index < 0) {
      return song.bpms.length - 1
    }
    return index
  }

  getMeasureForTime(time: number): SongMeasure {
    const song = this.getSong()
    if (!song) {
      return { type: 'measure', number: 0, duration: 0, time: 0 }
    }

    let index = song.measures.findIndex((m) => m.time > time) - 1
    if (index < 0) {
      index = song.measures.length - 1
    }
    return song.measures[index]
  }

  play() {
    if (this.isPlaying() || this.state.value === 'CannotPlay') {
      return
    }

    const backingTrack = this.getSong()?.backing
    if (backingTrack) {
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
    const backingTrack = this.getSong()?.backing
    if (backingTrack) {
      const newTime = backingTrack.currentTime + getAudioContext().outputLatency
      this.currentSongTime = newTime
    }

    let dt = 0
    if (this.isPlaying()) {
      const now = performance.now()
      dt = (now - this.lastIntervalFiredTime) * this.bpmModifier.value
      this.lastIntervalFiredTime = now
      this.currentSongTime += dt / 1000
    }

    return this.currentSongTime
  }

  playLoop_() {
    const song = this.getSong()
    if (!song) {
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

    if (song.bpms[this.currentBpmIndex.value + 1]?.time < time) {
      this.currentBpmIndex.value++
    }
    const stillPlaying = (n: SongNote) => n.time + n.duration > time
    this.stopNotes(this.playing.filter((n) => !stillPlaying(n)))
    this.playing = this.playing.filter(stillPlaying)

    // Update scoring details
    this.clearMissedNotes_()
    const heldNotes = this.playing.filter(
      (n) => this.midiPressedNotes.has(n.midiNote) && this.hitNotes.has(n),
    ).length
    if (heldNotes > 0) {
      this.score.durationHeld.value += heldNotes
    }

    while (song.notes[this.currentIndex]?.time < time) {
      const note = song.notes[this.currentIndex]

      if (this.isActiveHand(note)) {
        if (this.wait && !this.hitNotes.has(note)) {
          this.currentSongTime = note.time
          return
        } else if (!this.hitNotes.has(note) && prevTime < note.time) {
          // Only mark as late during the tick in which it is first played.
          this.lateNotes.set(note.midiNote, note)
        }
      }
      this.playing.push(note)
      if (!this.skipMissedNotes || !this.isActiveHand(note) || isHitNote(note)) {
        this.playNote(note)
      }
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
    this.song.value?.backing?.pause()
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
    this.lateNotes.clear()
    if (this.song.value?.backing) {
      this.song.value.backing.currentTime = 0
    }

    this.hitNotes.clear()
    this.missedNotes.clear()
    this.score.good.value = 0
    this.score.miss.value = 0
    this.score.perfect.value = 0
    this.score.pointless.value = 0
    this.score.durationHeld.value = 0
    this.score.streak.value = 0
  }

  seek(time: number) {
    const song = this.getSong()
    if (!song) {
      return
    }

    this.stopAllSounds()
    this.currentSongTime = time
    if (song.backing) {
      song.backing.currentTime = time
    }
    this.playing = song.notes.filter((note) => {
      return note.time < this.currentSongTime && this.currentSongTime < note.time + note.duration
    })
    song.notes.findIndex((note) => note.time >= this.currentSongTime)
    this.currentIndex = song.notes.findIndex((note) => note.time >= this.currentSongTime)
    this.currentBpmIndex.value = this.getBpmIndexForTime(time)

    this.missedNotes.clear()
    this.hitNotes.clear()
    this.lateNotes.clear()
  }

  /* Convert between songtime and real human time. Includes bpm calculations*/
  getRealTimeDuration(starttime: number, endtime: number) {
    return endtime - starttime
  }

  getDuration() {
    return this.song.value?.duration ?? 0
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

export function isHitNote(note?: SongNote) {
  if (!note) return false
  return Player.player().hitNotes.has(note)
}

export function isMissedNote(note?: SongNote) {
  if (!note) return false
  return Player.player().missedNotes.has(note)
}

if (isBrowser()) {
  ;(window as any).SR = Player.player()
}

export default Player
