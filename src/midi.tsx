import { getSynthStub } from './synth'
import { getNote } from './synth/utils'

export function refreshMIDIDevices() {
  if (typeof window === 'undefined' || !window.navigator.requestMIDIAccess) {
    return
  }
  window.navigator
    .requestMIDIAccess()
    .then((midiAccess) => {
      console.log('MIDI Ready!')
      for (let entry of midiAccess.inputs) {
        console.log('MIDI input device: ' + entry[1].id)
        entry[1].onmidimessage = onMidiMessage
      }
    })
    .catch((error) => {
      console.log('Error accessing MIDI devices: ' + error)
    })
}

refreshMIDIDevices()

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
  pressedNotes = new Map<number, number>()
  synth = getSynthStub('acoustic_grand_piano')
  listeners: Array<Function> = []
  virtualKeyboard = false

  constructor() {
    if (typeof window === 'object') {
      window.addEventListener('keydown', (e) => this.handleKeyDown(e))
      window.addEventListener('keyup', (e) => this.handleKeyUp(e))
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    if (!this.virtualKeyboard) {
      return
    }

    // Some OSes / browsers will automatically repeat a letter when held down.
    // We don't want to count those.
    if (e.repeat) {
      return
    }

    const key = e.key
    if (key === 'ArrowUp') {
      this.octave = Math.min(7, this.octave + 1)
      this.pressedNotes.clear()
      this.notify()
    } else if (key === 'ArrowDown') {
      this.octave = Math.max(1, this.octave - 1)
      this.pressedNotes.clear()
      this.notify()
    } else if (key in qwertyKeyConfig) {
      const note = qwertyKeyConfig[key]
      this.press(getNote(note + this.octave), 80)
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (!this.virtualKeyboard) {
      return
    }

    const key = e.key
    if (key in qwertyKeyConfig) {
      const note = qwertyKeyConfig[key]
      this.release(getNote(note + this.octave))
    }
  }

  getPressedNotes(): Map<number, number> {
    return this.pressedNotes
  }

  press(note: number, velocity: number) {
    this.pressedNotes.set(note, Date.now())
    this.synth?.playNote(note, velocity)

    this.notify()
  }

  release(note: number) {
    this.pressedNotes.delete(note)
    this.synth?.stopNote(note)
    this.notify()
  }

  notify() {
    const clone = new Map(this.pressedNotes)
    this.listeners.forEach((fn) => fn(clone))
  }

  subscribe(cb: Function) {
    this.listeners.push(cb)
  }

  unsubscribe(cb: Function) {
    let i = this.listeners.indexOf(cb)
    this.listeners.splice(i, 1)
  }
}

const provider = new MidiState()

function onMidiMessage(e: WebMidi.MIDIMessageEvent) {
  const msg: MidiEvent | null = parseMidiMessage(e)
  console.log(msg)
  if (!msg) {
    return
  }
  const { note, velocity } = msg
  if (msg.type === 'on' && msg.velocity > 0) {
    provider.press(note, velocity)
  } else {
    provider.release(note)
  }
}
export default provider
