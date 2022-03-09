import { getNote } from '@/features/theory'
import { MidiStateEvent } from '@/types'

// TODO: create ui for selecting midi device instead of grabbing
// all of them.

export async function setupMidiDeviceListeners() {
  if (typeof window === 'undefined' || !window.navigator.requestMIDIAccess) {
    return
  }
  try {
    const midiAccess = await window.navigator.requestMIDIAccess()
    const attachListeners = (inputs: WebMidi.MIDIInputMap) => {
      for (let entry of inputs) {
        entry[1].onmidimessage = onMidiMessage
      }
    }

    attachListeners(midiAccess.inputs)
    midiAccess.addEventListener('statechange', () => {
      attachListeners(midiAccess.inputs)
    })
  } catch (error) {
    console.error('Error accessing MIDI devices: ' + error)
  }
}

setupMidiDeviceListeners()

type MidiEvent = {
  type: 'on' | 'off'
  velocity: number
  note: number
}

function parseMidiMessage(event: WebMidi.MIDIMessageEvent): MidiEvent | null {
  const data = event.data
  if (data.length !== 3) {
    return null
  }

  let status = data[0]
  let command = status >>> 4
  return {
    type: command === 0x9 ? 'on' : 'off',
    note: data[1],
    velocity: data[2],
  }
}

const qwertyKeyConfig: { [key: string]: string } = {
  // White Notes
  f: 'C',
  g: 'D',
  h: 'E',
  j: 'F',
  k: 'G',
  l: 'A',
  ';': 'B',
  // Black notes
  t: 'Db',
  y: 'Eb',
  i: 'Gb',
  o: 'Ab',
  p: 'Bb',
}

class MidiState {
  octave = 4
  pressedNotes = new Map<number, { time: number; vel: number }>()
  listeners: Array<Function> = []

  constructor() {
    if (typeof window === 'object') {
      window.addEventListener('keydown', (e) => this.handleKeyDown(e))
      window.addEventListener('keyup', (e) => this.handleKeyUp(e))
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    // Some OSes / browsers will automatically repeat a letter when held down.
    // We don't want to count those.
    if (e.repeat) {
      return
    }

    // TODO: what if octave switch while note is held down
    // must release all currently pressed notes.
    const key = e.key.toLowerCase()
    if (key === 'arrowup') {
      this.octave = Math.min(7, this.octave + 1)
    } else if (key === 'arrowdown') {
      this.octave = Math.max(1, this.octave - 1)
    } else if (key in qwertyKeyConfig) {
      const note = qwertyKeyConfig[key]
      this.press(getNote(note + this.octave), 80)
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase()
    if (key in qwertyKeyConfig) {
      const note = qwertyKeyConfig[key]
      this.release(getNote(note + this.octave))
    }
  }

  getPressedNotes(): ReadonlyMap<number, { time: number; vel: number }> {
    return this.pressedNotes
  }

  press(note: number, velocity: number) {
    const time = Date.now()
    this.pressedNotes.set(note, { time, vel: velocity })
    this.notify({ note, velocity, type: 'down', time })
  }

  release(note: number) {
    this.pressedNotes.delete(note)
    this.notify({ note, type: 'up', time: Date.now() })
  }

  notify(e: MidiStateEvent) {
    this.listeners.forEach((fn) => fn(e))
  }

  subscribe(cb: (e: MidiStateEvent) => void) {
    this.listeners.push(cb)
  }

  unsubscribe(cb: Function) {
    let i = this.listeners.indexOf(cb)
    this.listeners.splice(i, 1)
  }
}

const midiState = new MidiState()

function onMidiMessage(e: WebMidi.MIDIMessageEvent) {
  const msg: MidiEvent | null = parseMidiMessage(e)
  if (!msg) {
    return
  }
  const { note, velocity } = msg
  if (msg.type === 'on' && msg.velocity > 0) {
    midiState.press(note, velocity)
  } else {
    midiState.release(note)
  }
}

export default midiState
