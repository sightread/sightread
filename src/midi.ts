export function refreshMIDIDevices() {
  window.navigator
    .requestMIDIAccess()
    .then((midiAccess) => {
      console.log("MIDI Ready!")
      for (let entry of midiAccess.inputs) {
        console.log("MIDI input device: " + entry[1].id)
        entry[1].onmidimessage = onMidiMessage
      }
    })
    .catch((error) => {
      console.log("Error accessing MIDI devices: " + error)
    })
}

refreshMIDIDevices()

type MidiEvent = {
  type: "on" | "off"
  velocity: number
  octave: number
  step: number
}
function parseMidiMessage(event: WebMidi.MIDIMessageEvent) {
  const data = event.data
  if (data.length !== 3) {
    return null
  }

  let status = data[0]
  let command = status >>> 4
  return {
    type: command === 0x9 ? "on" : "off",
    octave: Math.trunc(data[1] / 12),
    step: Math.trunc(data[1] % 12),
    velocity: data[2],
  }
}

function onMidiMessage() {}
