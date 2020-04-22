// TODO: handle when users don't have an AudioContext supporting browser

import { Song } from "./utils"

let audioContext = new AudioContext()

class Player {
  song!: Song
  bpm: number = 120 // right now assuming bpm means quarter notes per minute
  playInterval: any = null
  currentSongTime = 0
  currentMeasure = 0
  manuallySeekedMeasure = 0
  currentIndex = 0
  lastIntervalFiredTime = 0
  notes: Array<any> = []
  playing: Array<any> = []
  synth = new WebAudioFontSynth()
  volume = 1
  handlers: any = {}

  setSong(song: Song) {
    this.song = song
    this.notes = song.notes.sort((note1, note2) => note1.time - note2.time)
    if (song.bpm) {
      this.bpm = song.bpm
    }
  }

  setVolume(vol: number) {
    if (vol === 0) {
      this.stopAllSounds()
    }
    this.volume = vol
  }

  getTime() {
    const isPlaying = !!this.playInterval

    // this getter also steps the time forward.
    let dt = 0
    if (isPlaying) {
      const now = performance.now()
      dt = now - this.lastIntervalFiredTime
      this.lastIntervalFiredTime = now
      this.currentSongTime += (dt / 1000 / 60) * this.bpm * this.song.divisions
    }

    return this.currentSongTime
  }

  play() {
    let pressedChanged = false

    // If at the end of the song, then reset.
    if (this.currentIndex >= this.notes.length) {
      this.stop()
    }

    if (!this.playInterval) {
      this.lastIntervalFiredTime = performance.now()
      this.playInterval = setInterval(() => this.play(), 16)
      // continue playing everything we were in the middle of, but at a lower vol
      this.playing.forEach((note) => this.synth.playNoteValue(note.noteValue, this.volume / 4))
      pressedChanged = this.playing.length > 0
    }
    const time = this.getTime()

    if (this.song.measures[this.currentMeasure + 1]?.time < time) {
      this.currentMeasure++
    }

    this.playing = this.playing.filter((note) => {
      if (note.time + note.duration > time) {
        return true
      }
      pressedChanged = true
      this.synth.stopNoteValue(note.noteValue)
      return false
    })

    while (this.notes[this.currentIndex]?.time <= time) {
      const note = this.notes[this.currentIndex]
      this.synth.playNoteValue(note.noteValue, this.volume / 2)
      this.playing.push(note)
      this.currentIndex++
      pressedChanged = true
    }

    if (pressedChanged) {
      ;(this as any).onChange?.({})
    }
  }

  getMeasure() {
    return this.currentMeasure
  }

  stopAllSounds() {
    this.playing.forEach((note) => {
      this.synth.stopNoteValue(note.noteValue)
    })
  }

  pause() {
    clearInterval(this.playInterval)
    this.stopAllSounds()
    this.playInterval = null
  }

  stop() {
    this.pause()
    this.currentSongTime = 0
    this.currentIndex = 0
    this.playing = []
  }

  seek(measure: number) {
    if (!this.song.measures[measure]) {
      throw new Error(`Could not find measure: ${measure}`)
    }
    this.stopAllSounds()
    this.currentSongTime = this.song.measures[measure].time
    this.playing = this.notes.filter((note) => {
      return note.time <= this.currentSongTime && note.time + note.duration > this.currentSongTime
    })
    if (!!this.playInterval) {
      this.playing.forEach((note) => this.synth.playNoteValue(note.noteValue), this.volume / 2)
    }
    this.currentIndex = this.notes.findIndex((note) => note.time > this.currentSongTime)
    this.currentMeasure = this.manuallySeekedMeasure = measure
    ;(this as any).onChange?.()
  }

  getPressedKeys() {
    let ret: any = {}
    this.playing.forEach((note) => (ret[note.noteValue] = note))
    return ret
  }
}

export class WebAudioFontSynth {
  audioContext = new AudioContext()
  tone = (window as any)._tone_0000_JCLive_sf2_file
  player: any = null
  playing: Map<number, any> = new Map()

  constructor() {
    this.player = new (window as any).WebAudioFontPlayer()
    this.player.loader.decodeAfterLoading(this.audioContext, "_tone_0000_JCLive_sf2_file")
  }

  playNoteValue(noteValue: number, velocity: number = 0.5) {
    if (velocity === 0) {
      velocity = 0.001
    }

    this.stopNoteValue(noteValue)

    // Pitch has to be from 0-127 in midi.
    // Convert to midi note numbers (see https://en.scratch-wiki.info/wiki/MIDI_Notes)
    let pitch = noteValue + 10 + 12
    const envelope = this.player.queueWaveTable(
      this.audioContext,
      this.audioContext.destination,
      this.tone,
      0,
      pitch,
      /* duration */ 123456789,
      velocity,
    )

    this.playing.set(noteValue, envelope)
  }

  stopNoteValue(noteValue: number) {
    if (this.playing.get(noteValue)) {
      this.playing.get(noteValue).cancel()
      this.playing.delete(noteValue)
    }
  }
}

export class Synth {
  masterGainNode = audioContext.createGain()
  oscilattors: Map<number, OscillatorNode> = new Map()
  constructor() {
    this.masterGainNode.connect(audioContext.destination)
  }

  playNoteValue(noteValue: number) {
    this.playNote(getNoteFrequencies(noteValue))
  }

  stopNoteValue(noteValue: number) {
    if (!this.oscilattors.has(getNoteFrequencies(noteValue))) {
      return
    }
    this.stopNote(getNoteFrequencies(noteValue))
  }

  playNote(freq: number) {
    let osc = audioContext.createOscillator()
    osc.connect(this.masterGainNode)
    osc.frequency.value = freq
    osc.type = "sawtooth" // TODO: less shitty sounds plz
    this.oscilattors.set(freq, osc)
    osc.start()
  }

  stopNote(freq: number) {
    if (this.oscilattors.has(freq)) {
      this.oscilattors.get(freq)!.stop()
      this.oscilattors.delete(freq)
    }
  }
}

export default Player

let noteTable = createNoteTable().flatMap((arr: any) => Object.values(arr))
function getNoteFrequencies(noteValue: number) {
  return noteTable[noteValue]
}

// Copy / Pasted from MDN
function createNoteTable() {
  let noteFreq: any = []
  for (let i = 0; i < 9; i++) {
    noteFreq[i] = []
  }

  noteFreq[0]["A"] = 27.5
  noteFreq[0]["A#"] = 29.135235094880619
  noteFreq[0]["B"] = 30.867706328507756

  noteFreq[1]["C"] = 32.703195662574829
  noteFreq[1]["C#"] = 34.647828872109012
  noteFreq[1]["D"] = 36.708095989675945
  noteFreq[1]["D#"] = 38.890872965260113
  noteFreq[1]["E"] = 41.203444614108741
  noteFreq[1]["F"] = 43.653528929125485
  noteFreq[1]["F#"] = 46.249302838954299
  noteFreq[1]["G"] = 48.999429497718661
  noteFreq[1]["G#"] = 51.913087197493142
  noteFreq[1]["A"] = 55.0
  noteFreq[1]["A#"] = 58.270470189761239
  noteFreq[1]["B"] = 61.735412657015513
  noteFreq[2]["C"] = 65.406391325149658
  noteFreq[2]["C#"] = 69.295657744218024
  noteFreq[2]["D"] = 73.41619197935189
  noteFreq[2]["D#"] = 77.781745930520227
  noteFreq[2]["E"] = 82.406889228217482
  noteFreq[2]["F"] = 87.307057858250971
  noteFreq[2]["F#"] = 92.498605677908599
  noteFreq[2]["G"] = 97.998858995437323
  noteFreq[2]["G#"] = 103.826174394986284
  noteFreq[2]["A"] = 110.0
  noteFreq[2]["A#"] = 116.540940379522479
  noteFreq[2]["B"] = 123.470825314031027

  noteFreq[3]["C"] = 130.812782650299317
  noteFreq[3]["C#"] = 138.591315488436048
  noteFreq[3]["D"] = 146.83238395870378
  noteFreq[3]["D#"] = 155.563491861040455
  noteFreq[3]["E"] = 164.813778456434964
  noteFreq[3]["F"] = 174.614115716501942
  noteFreq[3]["F#"] = 184.997211355817199
  noteFreq[3]["G"] = 195.997717990874647
  noteFreq[3]["G#"] = 207.652348789972569
  noteFreq[3]["A"] = 220.0
  noteFreq[3]["A#"] = 233.081880759044958
  noteFreq[3]["B"] = 246.941650628062055

  noteFreq[4]["C"] = 261.625565300598634
  noteFreq[4]["C#"] = 277.182630976872096
  noteFreq[4]["D"] = 293.66476791740756
  noteFreq[4]["D#"] = 311.12698372208091
  noteFreq[4]["E"] = 329.627556912869929
  noteFreq[4]["F"] = 349.228231433003884
  noteFreq[4]["F#"] = 369.994422711634398
  noteFreq[4]["G"] = 391.995435981749294
  noteFreq[4]["G#"] = 415.304697579945138
  noteFreq[4]["A"] = 440.0
  noteFreq[4]["A#"] = 466.163761518089916
  noteFreq[4]["B"] = 493.883301256124111

  noteFreq[5]["C"] = 523.251130601197269
  noteFreq[5]["C#"] = 554.365261953744192
  noteFreq[5]["D"] = 587.32953583481512
  noteFreq[5]["D#"] = 622.253967444161821
  noteFreq[5]["E"] = 659.255113825739859
  noteFreq[5]["F"] = 698.456462866007768
  noteFreq[5]["F#"] = 739.988845423268797
  noteFreq[5]["G"] = 783.990871963498588
  noteFreq[5]["G#"] = 830.609395159890277
  noteFreq[5]["A"] = 880.0
  noteFreq[5]["A#"] = 932.327523036179832
  noteFreq[5]["B"] = 987.766602512248223

  noteFreq[6]["C"] = 1046.502261202394538
  noteFreq[6]["C#"] = 1108.730523907488384
  noteFreq[6]["D"] = 1174.659071669630241
  noteFreq[6]["D#"] = 1244.507934888323642
  noteFreq[6]["E"] = 1318.510227651479718
  noteFreq[6]["F"] = 1396.912925732015537
  noteFreq[6]["F#"] = 1479.977690846537595
  noteFreq[6]["G"] = 1567.981743926997176
  noteFreq[6]["G#"] = 1661.218790319780554
  noteFreq[6]["A"] = 1760.0
  noteFreq[6]["A#"] = 1864.655046072359665
  noteFreq[6]["B"] = 1975.533205024496447
  noteFreq[7]["C"] = 2093.004522404789077
  noteFreq[7]["C#"] = 2217.461047814976769
  noteFreq[7]["D"] = 2349.318143339260482
  noteFreq[7]["D#"] = 2489.015869776647285
  noteFreq[7]["E"] = 2637.020455302959437
  noteFreq[7]["F"] = 2793.825851464031075
  noteFreq[7]["F#"] = 2959.955381693075191
  noteFreq[7]["G"] = 3135.963487853994352
  noteFreq[7]["G#"] = 3322.437580639561108
  noteFreq[7]["A"] = 3520.0
  noteFreq[7]["A#"] = 3729.310092144719331
  noteFreq[7]["B"] = 3951.066410048992894

  noteFreq[8]["C"] = 4186.009044809578154
  return noteFreq
}
