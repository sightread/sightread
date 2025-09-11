// TODO: handle when users don't have an AudioContext supporting browser
import { getSynthStub, InstrumentName } from '@/features/synth'
import { MidiStateEvent, Song, SongConfig, SongMeasure, SongNote } from '@/types'
import { getHands, round } from '@/utils'
import { atom, Atom, getDefaultStore, PrimitiveAtom } from 'jotai'
import midi from '../midi'
import { getSynth, Synth } from '../synth'
import { getAudioContext } from '../synth/utils'

function increment(x: number) {
  return x + 1
}

type JotaiStore = ReturnType<typeof getDefaultStore>
const GOOD_RANGE = 300
const PERFECT_RANGE = 50

interface Score {
  perfect: PrimitiveAtom<number>
  good: PrimitiveAtom<number>
  missed: PrimitiveAtom<number>
  durationHeld: PrimitiveAtom<number>
  error: PrimitiveAtom<number>
  combined: Atom<number>
  accuracy: Atom<number>
  streak: PrimitiveAtom<number>
}

function getInitialScore(): Score {
  const perfect = atom(0)
  const good = atom(0)
  const missed = atom(0)
  const error = atom(0)
  const durationHeld = atom(0)
  const streak = atom(0)
  const combined = atom(
    (get) => get(perfect) * 100 + get(good) * 50 - get(error) * 25 + get(durationHeld),
  )

  const accuracy = atom((get) => {
    const total = get(hit) + get(missed) + get(error)

    return total === 0 ? 100 : Math.round((100 * get(hit)) / total)
  })

  const hit = atom((get) => {
    return get(perfect) + get(good)
  })

  return { perfect, good, missed, error, durationHeld, combined, accuracy, streak }
}

export type PlayerState = 'CannotPlay' | 'Playing' | 'Paused'

export class Player {
  store: JotaiStore
  state: PrimitiveAtom<PlayerState> = atom<PlayerState>('CannotPlay')
  score: Score = getInitialScore()
  song: PrimitiveAtom<Song | null> = atom<Song | null>(null)
  playInterval: any = null
  currentSongTime = 0
  volume = atom(1)

  // TODO: Determine if MIDI always assumes BPM means quarter notes per minute.
  // Add link to documentation if so.
  bpmModifier = atom(1)
  currentBpmIndex = atom(0)
  currentBpm: Atom<number> = atom((get) => {
    const currSongBpm = get(this.song)?.bpms[get(this.currentBpmIndex)]?.bpm ?? 120
    return currSongBpm * get(this.bpmModifier)
  })

  metronomeVolume = atom(0)
  metronomeSpeed = atom(1)
  metronomeEmphasizeFirst = atom(false)
  metronomeLastPlayedTick: null | number = null
  metronomeSynth = getSynthStub('woodblock')
  metronomeAccentedSynth = getSynthStub('agogo')

  currentIndex: number = 0
  lastIntervalFiredTime = 0
  playing: Array<SongNote> = []
  synths: Array<Synth> = []
  handlers: any = {}
  range: PrimitiveAtom<null | [number, number]> = atom<null | [number, number]>(null)
  hand = 'both'
  wait = false
  songHands: { left?: number; right?: number } = {}

  hitNotes: Set<SongNote> = new Set()
  missedNotes: Set<SongNote> = new Set()
  midiPressedNotes: Set<number> = new Set()
  lateNotes: Map<number, SongNote> = new Map()
  skipMissedNotes = false

  constructor(store: JotaiStore) {
    this.store = store
    midi.subscribe((midiEvent) => this.processMidiEvent(midiEvent))
  }

  getSong() {
    return this.store.get(this.song)
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
      this.store.set(this.score.streak, 0)
    }
    this.store.set(this.score.missed, (count) => count + missedNotes)
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

    if (this.isPlaying()) {
      this.processScoreData(midiNote)
    }
  }

  processScoreData(midiNote: number) {
    // First check if the note already passed.
    this.clearMissedNotes_()
    const lateNote = this.lateNotes.get(midiNote)
    if (lateNote) {
      const currentTime = this.currentSongTime
      this.lateNotes.delete(midiNote)
      const diff = this.calcDiff(currentTime, lateNote.time)
      const isHit = diff < GOOD_RANGE
      if (diff < PERFECT_RANGE) {
        this.store.set(this.score.perfect, increment)
      } else if (diff < GOOD_RANGE) {
        this.store.set(this.score.good, increment)
      }
      if (isHit) {
        this.store.set(this.score.streak, increment)
        this.hitNotes.add(lateNote)
        if (this.skipMissedNotes) {
          this.playNote(lateNote)
        }
        return
      }
    }

    // Now handle if the note is upcoming, aka it was hit early
    const nextNote = this.getUpcomingNotes()?.find((note) => note.midiNote === midiNote)
    if (nextNote && !isHitNote(this, nextNote)) {
      const diff = this.calcDiff(nextNote.time, this.currentSongTime)
      if (diff < GOOD_RANGE) {
        diff < PERFECT_RANGE
          ? this.store.set(this.score.perfect, increment)
          : this.store.set(this.score.good, increment)

        this.store.set(this.score.streak, increment)
        this.hitNotes.add(nextNote)
        return
      }
    }

    this.store.set(this.score.error, increment)
    this.store.set(this.score.streak, 0)
  }

  // Given two song timestamps, return their difference in milliseconds after adjusting for the bpm modifier
  calcDiff(to: number, from: number) {
    return ((to - from) * 1000) / this.store.get(this.bpmModifier)
  }

  /* Return all notes that are valid to hit */
  getUpcomingNotes() {
    const song = this.getSong()
    const upcomingNotes: SongNote[] = []
    const firstUpcomingNote = song?.notes[this.currentIndex]
    if (!firstUpcomingNote) return upcomingNotes

    for (
      let i = this.currentIndex;
      i < song.notes.length && song.notes[i].time === firstUpcomingNote.time;
      i++
    ) {
      upcomingNotes.push(song.notes[i])
    }

    return upcomingNotes
  }

  setWait(wait: boolean) {
    this.wait = wait
  }

  isPlaying() {
    return this.store.get(this.state) === 'Playing'
  }

  async setSong(song: Song, songConfig: SongConfig) {
    this.stop()
    this.resetMetronome()
    this.store.set(this.song, song)
    this.songHands = getHands(songConfig)
    this.store.set(this.state, 'CannotPlay')

    const synths: Promise<Synth>[] = []
    Object.entries(song.tracks).forEach(async ([trackId, config]) => {
      const instrument =
        songConfig.tracks[+trackId]?.instrument ?? config.program ?? config.instrument ?? 0
      synths[+trackId] = getSynth(instrument)
    })
    await Promise.all(synths).then((s) => {
      this.synths = s
      // setTrackVolume must be called after synths have been set
      Object.entries(song.tracks).forEach(([trackId]) => {
        const vol = songConfig.tracks[+trackId]?.sound ? 1 : 0
        this.setTrackVolume(+trackId, vol)
      })
      this.store.set(this.state, 'Paused')
    })
    // this.skipMissedNotes = songConfig.skipMissedNotes
    this.wait = songConfig.waiting
  }

  setVolume(vol: number) {
    this.store.set(this.volume, vol)
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

    if (this.wait && !isHitNote(this, song.notes[this.currentIndex])) {
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
    this.store.set(this.bpmModifier, round(this.store.get(this.bpmModifier) + delta, 2))
    const backingTrack = this.getSong()?.backing
    if (backingTrack) {
      backingTrack.playbackRate = this.store.get(this.bpmModifier)
    }
  }

  decreaseBpm() {
    const delta = 0.05
    this.store.set(this.bpmModifier, round(this.store.get(this.bpmModifier) - delta, 2))
    const backingTrack = this.getSong()?.backing
    if (backingTrack) {
      backingTrack.playbackRate = this.store.get(this.bpmModifier)
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
    if (this.isPlaying() || this.store.get(this.state) === 'CannotPlay') {
      return
    }

    // If at the end of the song, restart it
    if (this.currentSongTime >= this.getDuration()) {
      this.seek(0)
    }

    const backingTrack = this.getSong()?.backing
    if (backingTrack) {
      backingTrack.volume = 0.15
      backingTrack.play()
    }
    this.store.set(this.state, 'Playing')

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
      dt = (now - this.lastIntervalFiredTime) * this.store.get(this.bpmModifier)
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
      this.seek(this.getDuration())
      this.pause()
    }

    // If a range is selected and you just got past it then zoom back
    const range = this.store.get(this.range)
    if (range) {
      let [start, stop] = range
      if (prevTime <= stop && stop <= time) {
        this.seek(start - 0.5)
        return
      }
    }

    if (song.bpms[this.store.get(this.currentBpmIndex) + 1]?.time < time) {
      this.store.set(this.currentBpmIndex, increment)
    }
    const stillPlaying = (n: SongNote) => n.time + n.duration > time
    this.stopNotes(this.playing.filter((n) => !stillPlaying(n)))
    this.playing = this.playing.filter(stillPlaying)

    // Play metronome sounds
    const latestMetronomeTick = this.getLatestMetronomeTick(time)

    if (this.metronomeLastPlayedTick !== latestMetronomeTick) {
      this.metronomeLastPlayedTick = latestMetronomeTick

      this.metronomeSynth.playNote(
        this.isMetronomeTickAccented(latestMetronomeTick) ? 90 : 75,
        this.store.get(this.metronomeVolume) * 127,
      )
    }

    // Update scoring details
    this.clearMissedNotes_()
    const heldNotes = this.playing.filter(
      (n) => this.midiPressedNotes.has(n.midiNote) && this.hitNotes.has(n),
    ).length
    if (heldNotes > 0) {
      this.store.set(this.score.durationHeld, (duration) => duration + heldNotes)
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
      if (!this.skipMissedNotes || !this.isActiveHand(note) || isHitNote(this, note)) {
        this.playNote(note)
      }
      this.currentIndex++
    }
  }

  getLatestMetronomeTick(time: number) {
    const song = this.getSong()
    if (!song) {
      return 0
    }

    const ticksPerBeat = song.ppq * (4 / (song.timeSignature?.denominator ?? 4))
    const ticksPerMetronome = ticksPerBeat / this.store.get(this.metronomeSpeed)
    const currentTick = song.secondsToTicks(time)

    return Math.trunc(currentTick / ticksPerMetronome) * ticksPerMetronome
  }

  isMetronomeTickAccented(tick: number) {
    const song = this.getSong()
    if (!song) {
      return false
    }
    const beatsPerMeasure = song.timeSignature?.numerator ?? 4
    const ticksPerBeat = song.ppq * (4 / (song.timeSignature?.denominator ?? 4))

    return (
      this.store.get(this.metronomeEmphasizeFirst) && (tick / ticksPerBeat) % beatsPerMeasure === 0
    )
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
    this.store.set(this.state, 'Paused')
    clearInterval(this.playInterval)
    this.store.get(this.song)?.backing?.pause()
    this.playInterval = null
    this.stopAllSounds()
  }

  restart() {
    const range = this.store.get(this.range)
    if (range == null) {
      this.stop()
      return
    }
    const [start, _end] = range
    this.pause()
    this.seek(start)
    this.resetStats_()
  }

  stop() {
    this.pause()
    this.reset_()
  }

  reset_() {
    this.currentSongTime = 0
    this.currentIndex = 0
    this.playing = []
    this.lateNotes.clear()
    this.store.set(this.range, null)
    const backingTrack = this.store.get(this.song)?.backing
    if (backingTrack) {
      backingTrack.currentTime = 0
    }
    this.resetStats_()
  }

  resetStats_() {
    this.hitNotes.clear()
    this.missedNotes.clear()
    this.store.set(this.score.good, 0)
    this.store.set(this.score.missed, 0)
    this.store.set(this.score.perfect, 0)
    this.store.set(this.score.error, 0)
    this.store.set(this.score.durationHeld, 0)
    this.store.set(this.score.streak, 0)
  }

  resetMetronome() {
    this.store.set(this.metronomeVolume, 0)
    this.store.set(this.metronomeSpeed, 1)
    this.store.set(this.metronomeEmphasizeFirst, false)
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
    this.currentIndex = song.notes.findIndex((note) => note.time >= this.currentSongTime)
    this.store.set(this.currentBpmIndex, this.getBpmIndexForTime(time))

    this.metronomeLastPlayedTick = this.getLatestMetronomeTick(time)
    if (this.metronomeLastPlayedTick == song.secondsToTicks(time)) {
      this.metronomeLastPlayedTick--
    }

    this.missedNotes.clear()
    this.hitNotes.clear()
    this.lateNotes.clear()
  }

  /* Convert between songtime and real human time. Includes bpm calculations*/
  getRealTimeDuration(starttime: number, endtime: number) {
    return endtime - starttime
  }

  getDuration() {
    return this.store.get(this.song)?.duration ?? 0
  }

  setRange(range?: { start: number; end: number }) {
    if (!range) {
      this.store.set(this.range, null)
      return
    }

    const { start, end } = range
    this.store.set(this.range, [Math.min(start, end), Math.max(start, end)])
  }
  getRange() {
    return this.range
  }
}

export function isHitNote(player: Player, note?: SongNote) {
  if (!note) return false
  return player.hitNotes.has(note)
}

export function isMissedNote(player: Player, note?: SongNote) {
  if (!note) return false
  return player.missedNotes.has(note)
}
