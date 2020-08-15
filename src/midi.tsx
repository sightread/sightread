import { getNoteValue } from './utils'
import { WebAudioFontSynth } from './synth'

export function refreshMIDIDevices() {
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
  octave: number
  step: number
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
    octave: Math.trunc(data[1] / 12),
    step: Math.trunc(data[1] % 12),
    velocity: data[2],
  }
}

const qwertyStepConfig: { [key: string]: { step: string; alter?: number } } = {
  // White Notes
  g: { step: 'C' },
  h: { step: 'D' },
  j: { step: 'E' },
  k: { step: 'F' },
  l: { step: 'G' },
  ';': { step: 'A' },
  // Black notes
  y: { step: 'C', alter: 1 },
  u: { step: 'D', alter: 1 },
  o: { step: 'F', alter: 1 },
  p: { step: 'G', alter: 1 },
}

class MidiState {
  octave = 4
  pressedNotes = new Map<number, number>()
  synth: any = new WebAudioFontSynth()
  listeners: Array<Function> = []
  virtualKeyboard = false

  constructor() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e))
    window.addEventListener('keyup', (e) => this.handleKeyUp(e))
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
    } else if (key in qwertyStepConfig) {
      const note = qwertyStepConfig[key]
      this.press(getNoteValue(note.step, this.octave, note.alter))
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (!this.virtualKeyboard) {
      return
    }

    const key = e.key
    if (key in qwertyStepConfig) {
      const note = qwertyStepConfig[key]
      this.release(getNoteValue(note.step, this.octave, note.alter))
    }
  }

  getPressedNotes(): Map<number, number> {
    return this.pressedNotes
  }

  press(noteValue: number) {
    this.pressedNotes.set(noteValue, Date.now())
    this.synth.playNoteValue(noteValue)
    this.notify()
  }

  release(noteValue: number) {
    this.pressedNotes.delete(noteValue)
    this.synth.stopNoteValue(noteValue)
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
  const noteValue = msg.step + msg.octave * 12 - 21
  if (msg.type === 'on' && msg.velocity > 0) {
    provider.press(noteValue)
  } else {
    provider.release(noteValue)
  }
}
export default provider
