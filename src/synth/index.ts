import { isBrowser } from '../utils'
import { gmInstruments, InstrumentName } from './instruments'
import { getAudioContext, getKey, parseMidiJsSoundfont } from './utils'

type SoundFont = { [key: string]: AudioBuffer }
const soundfonts: { [key in InstrumentName]?: SoundFont } = {}
const downloading: { [key in InstrumentName]?: Promise<void> } = {}

async function loadInstrument(instrument: InstrumentName) {
  // Already downloaded.
  if (soundfonts[instrument]) {
    return Promise.resolve()
  }
  // In-progress already.
  if (downloading[instrument]) {
    return downloading[instrument]
  }

  const sfFetch = fetch(
    `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${instrument}-mp3.js`,
  )

  let doneDownloadingRes: any
  downloading[instrument] = new Promise((res) => (doneDownloadingRes = res))
  try {
    let sf = await parseMidiJsSoundfont(await (await sfFetch).text())
    soundfonts[instrument] = sf
    delete downloading[instrument]
    doneDownloadingRes()
  } catch (err) {
    console.error(`Error fetching soundfont for: ${instrument}`)
  }
}

interface Synth {
  playNote(note: number, velocity?: number): void
  stopNote(note: number, velocity?: number): void

  setMasterVolume(vol: number): void
}

async function getSynth(instrument: InstrumentName | number): Promise<Synth> {
  if (!isBrowser()) {
    return { playNote() {}, stopNote() {}, setMasterVolume() {} }
  }

  if (typeof instrument === 'number') {
    instrument = gmInstruments[instrument]
  }
  if (!instrument || !gmInstruments.find((s) => s === instrument)) {
    console.error('Invalid instrument: ', instrument, 'reverting to acoustic_grand_piano.')
    instrument = gmInstruments[0]
  }

  await loadInstrument(instrument)
  return new InstrumentSynth(instrument)
}

function getSynthStub(instrument: InstrumentName | number): Synth {
  return new SynthStub(instrument)
}

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
}

class InstrumentSynth implements Synth {
  /** Must be one of the 127 GM Instruments */
  soundfont: SoundFont
  audioContext: AudioContext
  masterVolume: number

  /** Map from note to currently BufferSource */
  playing: Map<number, { node: GainNode; velocity: number }> = new Map()
  constructor(instrument: InstrumentName) {
    const soundfont = soundfonts[instrument]
    if (!soundfont) {
      throw new Error('May not instantiate a synth before its instrument has loaded: ' + instrument)
    }

    this.soundfont = soundfont
    this.masterVolume = 1
    this.audioContext = getAudioContext()
  }

  playNote(note: number, velocity = 127 / 2) {
    const key = getKey(note)
    const source = this.audioContext.createBufferSource()
    source.buffer = this.soundfont[key]

    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = (velocity / 127) * this.masterVolume

    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    source.start()

    this.playing.set(note, { node: gainNode, velocity })
  }

  stopNote(note: number) {
    if (!this.playing.has(note)) {
      return
    }
    const { node: audioNode } = this.playing.get(note)!
    audioNode.disconnect()
    this.playing.delete(note)
  }

  setMasterVolume(volume: number) {
    this.masterVolume = volume
    for (let { node, velocity } of this.playing.values()) {
      node.gain.value = (velocity / 127) * this.masterVolume
    }
  }
}

export { getSynth, getSynthStub }
export type { Synth }
