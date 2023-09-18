import { isBrowser } from '@/utils'
import gmInstruments from './instruments'
import { getAudioContext, getKeyForSoundfont, getRecordingDestinationNode } from './utils'
import { SoundFont, Synth, InstrumentName } from './types'
import { loadInstrument, soundfonts } from './loadInstrument'

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
    console.error('Invalid instrument: ', instrument, 'reverting to acoustic_grand_piano.')
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
  playNote(note: number) {
    this.synth?.playNote(note)
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
  audioContext: AudioContext
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
    this.audioContext = getAudioContext()
  }

  playNote(note: number, velocity = 127 / 2) {
    const key = getKeyForSoundfont(note)
    const sourceNode = this.audioContext.createBufferSource()
    sourceNode.buffer = this.soundfont[key]

    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = (velocity / 127) * this.masterVolume

    sourceNode.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    const recordingDestinationNode = getRecordingDestinationNode();
    if (recordingDestinationNode) gainNode.connect(recordingDestinationNode)
    sourceNode.start()

    this.playing.set(note, { gainNode, velocity, sourceNode })
  }

  stopNote(note: number) {
    if (!this.playing.has(note)) {
      return
    }
    const currTime = this.audioContext.currentTime
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

  getRecordingDestinationNode() {
    return this.getRecordingDestinationNode;
  }
}
