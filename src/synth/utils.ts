// The provide a key from midi note number to the key.
// E.g. A0 --> 0, C8 --> 108.
let keyToNote: { [key: string]: number } = {}
let noteToKey: { [note: number]: string } = {}

;(function () {
  const A0 = 0x15 // first note
  const C8 = 0x6c // last note
  const number2key = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  for (let n = A0; n <= C8; n++) {
    const octave = ((n - 12) / 12) >> 0
    const name = number2key[n % 12] + octave
    keyToNote[name] = n
    noteToKey[n] = name
  }
})()

function getNote(key: string): number {
  return keyToNote[key]
}
function getKey(note: number): string {
  return noteToKey[note]
}

// convert a MIDI.js javascript soundfont file to json
async function parseMidiJsSoundfont(text: string): Promise<{ [key: string]: AudioBuffer }> {
  var begin = text.indexOf('MIDI.Soundfont.')
  if (begin < 0) throw Error('Invalid MIDI.js Soundfont format')
  begin = text.indexOf('=', begin) + 2
  var end = text.lastIndexOf(',')
  let json: { [key: string]: string } = JSON.parse(text.slice(begin, end) + '}')
  console.error({ json })

  const audioBufferPromises = Object.entries(json).map(async ([key, dataUri]) => {
    const base64 = dataUri.slice(dataUri.indexOf(',') + 1)
    const arrayBuf = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer
    const audioBuf = new AudioContext().decodeAudioData(arrayBuf)
    return [key, await audioBuf]
  })
  const audioBuffers = await Promise.all(audioBufferPromises)
  return Object.fromEntries(audioBuffers)
}

export { getNote, getKey, parseMidiJsSoundfont }
