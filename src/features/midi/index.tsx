import { getNote } from '@/features/theory'
import { MidiStateEvent } from '@/types'
import { isBrowser } from '@/utils'
import { Midi } from '@tonejs/midi'
import { useRef, useState } from 'react'

export async function getMidiInputs(): Promise<MIDIInputMap> {
  if (!isBrowser() || !window.navigator.requestMIDIAccess) {
    return new Map()
  }

  try {
    const midiAccess = await window.navigator.requestMIDIAccess()
    return midiAccess.inputs
  } catch (error) {
    console.error('Error accessing MIDI devices: ' + error)
    return new Map()
  }
}

export async function getMidiOutputs(): Promise<MIDIOutputMap> {
  if (!isBrowser() || !window.navigator.requestMIDIAccess) {
    return new Map()
  }

  try {
    const midiAccess = await window.navigator.requestMIDIAccess({ sysex: false })
    return midiAccess.outputs
  } catch (error) {
    console.error('Error accessing MIDI devices: ' + error)
    return new Map()
  }
}

const enabledInputDevices: Map<string, MIDIInput> = new Map()
const enabledOutputDevices: Map<string, MIDIOutput> = new Map()

export function isInputMidiDeviceEnabled(device: MIDIInput) {
  return enabledInputDevices.has(device.id)
}
export function isOutputMidiDeviceEnabled(device: MIDIOutput) {
  return enabledOutputDevices.has(device.id)
}

export function enableInputMidiDevice(device: MIDIInput) {
  device.open()
  device.addEventListener('midimessage', onMidiMessage)
  enabledInputDevices.set(device.id, device)
}
export function enableOutputMidiDevice(device: MIDIOutput) {
  device.open()
  enabledOutputDevices.set(device.id, device)
}

export function disableInputMidiDevice(deviceParam: MIDIInput) {
  const device = enabledInputDevices.get(deviceParam.id)
  if (!device) {
    return
  }
  device.removeEventListener('midimessage', onMidiMessage as any)
  device.close()
  enabledInputDevices.delete(device.id)
}

export function disableOutputMidiDevice(deviceParam: MIDIOutput) {
  const device = enabledOutputDevices.get(deviceParam.id)
  if (!device) {
    return
  }
  device.removeEventListener('midimessage', onMidiMessage as any)
  device.close()
  enabledOutputDevices.delete(device.id)
}

setupMidiDeviceListeners()

// Sets up listeners for all non-virtual MIDI input devices.
// Skips "through" ports (often used for routing/echo) to avoid feedback loops.
// Output devices are ignored by default and must be enabled manually.
async function setupMidiDeviceListeners() {
  const inputs = await getMidiInputs()
  for (const device of inputs.values()) {
    if (device.name?.toLowerCase().includes('through')) {
      continue
    }
    enableInputMidiDevice(device)
  }
}

export type MidiEvent = {
  type: 'on' | 'off'
  velocity: number
  note: number
  timeStamp: number
}

function parseMidiMessage(event: MIDIMessageEvent): MidiEvent | null {
  const data = event.data!
  if (data.length !== 3) {
    return null
  }

  let status = data[0]
  let command = status >>> 4
  return {
    type: command === 0x9 ? 'on' : 'off',
    note: data[1],
    velocity: data[2],
    timeStamp: event.timeStamp,
  }
}

function getKeyConfig() {
  const white = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const black = ['Db', 'Eb', 'Gb', 'Ab', 'Bb']

  const layouts = [
    { keys: 'zxcvbnm', notes: white, octave: 3 },
    { keys: 'sdghj', notes: black, octave: 3 },
    { keys: 'qwertyu', notes: white, octave: 4 },
    { keys: '23567', notes: black, octave: 4 },
  ]

  const map: Record<string, [string, number]> = {}
  for (const { keys, notes, octave } of layouts) {
    for (let i = 0; i < keys.length; i++) {
      const c = keys[i]
      const prefix = /\d/.test(c) ? 'Digit' : 'Key'
      const code = prefix + c.toUpperCase()
      map[code] = [notes[i], octave]
    }
  }
  return map
}

const keyboardConfig: { [key: string]: [string, number] } = getKeyConfig()

class MidiState {
  octaveDiff = 0
  pressedNotes = new Map<number, { time: number; vel: number }>()
  keyPressedNotes = new Set<number>()
  listeners: Array<Function> = []

  constructor() {
    if (typeof window === 'object') {
      window.addEventListener('keydown', (e) => this.handleKeyDown(e))
      window.addEventListener('keyup', (e) => this.handleKeyUp(e))
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    let { key, code, metaKey, ctrlKey, altKey } = e

    if (metaKey || ctrlKey || altKey) {
      return
    }
    if (!(code in keyboardConfig) && key !== 'ArrowUp' && key !== 'ArrowDown') {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    // Some OSes / browsers will automatically repeat a letter when held down.
    // We don't want to count those.
    if (e.repeat) {
      return
    }

    if (key === 'ArrowUp') {
      this.octaveDiff = Math.min(4, this.octaveDiff + 2)
      this.keyPressedNotes.forEach((n) => this.release(n))
      this.keyPressedNotes.clear()
    } else if (key === 'ArrowDown') {
      this.octaveDiff = Math.max(-4, this.octaveDiff - 2)
      this.keyPressedNotes.forEach((n) => this.release(n))
      this.keyPressedNotes.clear()
    } else if (code in keyboardConfig) {
      const [note, octave] = keyboardConfig[code]
      const computedOctave = octave + this.octaveDiff
      const computedNote = getNote(note + computedOctave)
      if (computedNote) {
        this.keyPressedNotes.add(computedNote)
        this.press(computedNote, 80)
      }
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    const code = e.code
    if (code in keyboardConfig) {
      const [note, octave] = keyboardConfig[code]
      const computedOctave = octave + this.octaveDiff
      const computedNote = getNote(note + computedOctave)
      this.keyPressedNotes.delete(computedNote)
      this.release(computedNote)
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
  pressOutput(note: number, volume: number) {
    for (const output of enabledOutputDevices) {
      const midiNoteOnCh1 = 144
      const velocity = volume * 127
      var data = [midiNoteOnCh1, note, velocity]
      output[1]?.send(data)
    }
  }

  release(note: number) {
    this.pressedNotes.delete(note)
    this.notify({ note, type: 'up', time: Date.now() })
  }

  releaseOutput(note: number) {
    const midiNoteOffCh1 = 128
    for (const output of enabledOutputDevices) {
      var data = [midiNoteOffCh1, note, 127]
      output[1]?.send(data)
    }
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

function onMidiMessage(e: MIDIMessageEvent) {
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

// This function doesn't yet handle notes left open when record was clicked. It
// should close those notes.
function midiEventsToMidi(events: MidiEvent[]) {
  const midi = new Midi()
  const track = midi.addTrack()
  const openNotes = new Map<number, MidiEvent>()
  for (const event of events) {
    if (event.type === 'on') {
      openNotes.set(event.note, event)
    } else {
      const start = openNotes.get(event.note)
      if (!start) {
        continue
      }
      openNotes.delete(event.note)
      const end = event
      track.addNote({
        midi: start.note,
        time: start.timeStamp / 1000,
        duration: (end.timeStamp - start.timeStamp) / 1000,
        velocity: start.velocity,
        noteOffVelocity: end.velocity,
      })
    }
  }

  return midi.toArray()
}

export function record(midiState: MidiState) {
  const recording: MidiEvent[] = []
  // Offset times so first note in the recording occurs at ts=0
  let initialTime: number | null = null
  function listener(midiStateEvent: MidiStateEvent) {
    if (initialTime === null) {
      initialTime = midiStateEvent.time
    }
    const midiEvent: MidiEvent = {
      type: midiStateEvent.type === 'down' ? 'on' : 'off',
      velocity: midiStateEvent.velocity ?? 127,
      note: midiStateEvent.note,
      timeStamp: midiStateEvent.time - initialTime!,
    }
    recording.push(midiEvent)
  }
  midiState.subscribe(listener)
  return () => {
    midiState.unsubscribe(listener)
    if (recording.length > 0) {
      return midiEventsToMidi(recording)
    }
    return null
  }
}

export function useRecordMidi(state = midiState) {
  const [isRecording, setIsRecording] = useState(false)
  const recordCb = useRef<(() => Uint8Array | null) | null>(null)
  function startRecording() {
    setIsRecording(true)
    // Cleanup whatever recording was already happening
    if (recordCb.current) {
      recordCb.current?.()
    }
    recordCb.current = record(state)
  }
  function stopRecording() {
    setIsRecording(false)
    const midiBytes = recordCb.current?.() ?? new Uint8Array()
    recordCb.current = null
    return midiBytes
  }

  return { startRecording, stopRecording, isRecording }
}

export default midiState
