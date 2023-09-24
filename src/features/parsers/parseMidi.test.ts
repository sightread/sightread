import * as jasmid from '@sightread/jasmid.ts'
import parseMidi from './parseMidi'

describe('testing utils', () => {
  it('makeHeader', () => {
    const file: Uint8Array = new Uint8Array(
      makeHeader({ formatType: 0, trackCount: 2, ticksPerBeat: 4 }),
    )
    const parsed = jasmid.parseMidiFile(file.buffer)
    expect(parsed.header).toEqual({
      formatType: 0,
      ticksPerBeat: 4,
      trackCount: 2,
    })
  })
})

describe('parseMidi', () => {
  it('throws on an empty midi file', () => {
    expect(() => parseMidi(new ArrayBuffer(0))).toThrow()
  })

  it('can parse a midi file with only a header', () => {
    const file: Uint8Array = new Uint8Array(
      makeHeader({ formatType: 0, trackCount: 2, ticksPerBeat: 4 }),
    )
    expect(parseMidi(file.buffer)).toEqual({
      bpms: [],
      duration: 0,
      items: [],
      keySignature: 'C',
      measures: [],
      notes: [],
      timeSignature: {
        denominator: 4,
        numerator: 4,
      },
      tracks: {},
    })
  })
})

function makeHeader({
  formatType,
  trackCount,
  ticksPerBeat,
}: {
  formatType: number
  trackCount: number
  ticksPerBeat: number
}) {
  const data = new DataView(new Uint8Array(6).buffer)
  data.setUint16(0, formatType)
  data.setUint16(2, trackCount)
  data.setUint16(4, ticksPerBeat)
  return makeMidiChunk({ id: 'MThd', data: data.buffer })
}

function makeMidiInt(int: number) {
  throw new Error('todo')
}

function makeMidiChunk({ id, data }: { id: string; data: ArrayBuffer }) {
  const idLen = 4
  const dataLenLen = 4
  const buffer = new Uint8Array(idLen + dataLenLen + data.byteLength)
  const view = new DataView(buffer.buffer)
  const encoded = new TextEncoder().encode(id)

  buffer.set(encoded, 0)
  view.setUint32(4, data.byteLength)
  buffer.set(toUint8(data), 8)
  return buffer.buffer
}

function toUint8(inputBuf: ArrayBuffer): Uint8Array {
  const inputView = new DataView(inputBuf)
  const len = inputView.byteLength
  const outputBytes = new Uint8Array(len)
  const outputView = new DataView(outputBytes.buffer)
  for (let i = 0; i < inputView.byteLength; i++) {
    outputView.setUint8(i, inputView.getUint8(i))
  }
  return outputBytes
}

export {}
