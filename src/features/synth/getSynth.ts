import { isBrowser } from '@/utils'
import midi from '../midi'
import gmInstruments from './instruments'
import { loadInstrument, soundfonts } from './loadInstrument'
import { InstrumentName, SoundFont, Synth } from './types'
import { getAudioContext, getKeyForSoundfont, isAudioContextEnabled } from './utils'

function isValidInstrument(instrument: InstrumentName | undefined) {
  return instrument && gmInstruments.find((s) => s === instrument)
}

export async function getSynth(instrument: InstrumentName | number): Promise<Synth> {
  if (!isBrowser()) {
    return {
      playNote() {},
      stopNote() {},
      setMasterVolume() {},
      getInstrument() {
        return gmInstruments[0]
      },
    }
  }

  if (typeof instrument === 'number') {
    instrument = gmInstruments[instrument]
  }
  if (!isValidInstrument(instrument)) {
    console.log('Invalid instrument: ', instrument, 'reverting to acoustic_grand_piano.')
    instrument = gmInstruments[0]
  }

  await loadInstrument(instrument)
  return new InstrumentSynth(instrument)
}

export function getSynthStub(instrument: InstrumentName | number): Synth {
  return new SynthStub(instrument)
}

// TODO one synth per instrument
class SynthStub implements Synth {
  synth: Synth | undefined
  masterVolume: number

  constructor(instrument: InstrumentName | number) {
    this.masterVolume = 1.0
    getSynth(instrument).then((s) => {
      this.synth = s
      this.synth.setMasterVolume(this.masterVolume)
    })
  }
  playNote(note: number, velocity?: number) {
    this.synth?.playNote(note, velocity)
  }
  stopNote(note: number) {
    this.synth?.stopNote(note)
  }
  setMasterVolume(vol: number) {
    this.masterVolume = vol
    this.synth?.setMasterVolume(vol)
  }

  getInstrument(): InstrumentName {
    return this.synth?.getInstrument() ?? gmInstruments[0]
  }
}

class InstrumentSynth implements Synth {
  /** Must be one of the 127 GM Instruments */
  soundfont: SoundFont
  masterVolume: number
  instrument: InstrumentName

  /** Map from note to currently BufferSource */
  playing: Map<
    number,
    { gainNode: GainNode; velocity: number; sourceNode: AudioBufferSourceNode }
  > = new Map()

  constructor(instrument: InstrumentName) {
    const soundfont = soundfonts[instrument]
    if (!soundfont) {
      throw new Error('May not instantiate a synth before its instrument has loaded: ' + instrument)
    }
    this.instrument = instrument
    this.soundfont = soundfont
    this.masterVolume = 1
  }

  playNote(note: number, velocity: number = 127 / 2) {
    midi.pressOutput(note, this.masterVolume)
    if (!isAudioContextEnabled()) {
      return
    }
    const key = getKeyForSoundfont(note)
    const audioContext = getAudioContext()
    const sourceNode = audioContext.createBufferSource()
    sourceNode.buffer = this.soundfont[key]

    const gainNode = audioContext.createGain()
    gainNode.gain.value = (velocity / 127) * this.masterVolume

    sourceNode.connect(gainNode)
    gainNode.connect(audioContext.destination)
    sourceNode.start()

    this.playing.set(note, { gainNode, velocity, sourceNode })
  }

  stopNote(note: number) {
    midi.releaseOutput(note)
    if (!this.playing.has(note)) {
      return
    }
    if (!isAudioContextEnabled()) {
      return
    }
    const audioContext = getAudioContext()
    const currTime = audioContext.currentTime
    const { gainNode, sourceNode } = this.playing.get(note)!

    // cannot be 0, instead using the lowest possible value
    gainNode.gain.exponentialRampToValueAtTime(
      gainNode.gain.value === 0 ? parseFloat('1.40130e-44') : gainNode.gain.value,
      currTime,
    )
    gainNode.gain.exponentialRampToValueAtTime(0.01, currTime + 0.5)
    sourceNode.stop(currTime + 0.5)

    this.playing.delete(note)
  }

  setMasterVolume(volume: number) {
    this.masterVolume = volume
    for (let { gainNode, velocity } of this.playing.values()) {
      gainNode.gain.value = (velocity / 127) * this.masterVolume
    }
  }

  getInstrument() {
    return this.instrument
  }
}
