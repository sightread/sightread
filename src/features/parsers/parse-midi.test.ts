import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { getKeySignatureFromMidi } from '../theory/key-signature'
import parseMidi, { getScoreDuration } from './parse-midi'
import serializeMidi from './serialize-midi'

describe('parseMidi (score-meta fixtures)', () => {
  const fixtureDir = path.join(process.cwd(), 'tests/mscore-meta')
  const songDir = path.join(process.cwd(), 'public/music/songs')
  const fixtureFiles = readdirSync(fixtureDir).filter((file) => file.endsWith('.score-meta.json'))
  const assertDuration = (midiBytes: Uint8Array, expectedSeconds?: number) => {
    if (typeof expectedSeconds !== 'number') {
      return
    }
    // MuseScore duration is rounded and aligned to full measure boundaries.
    const toleranceSeconds = 0.5
    const scoreDuration = getScoreDuration(midiBytes)
    expect(Math.abs(scoreDuration - expectedSeconds)).toBeLessThanOrEqual(toleranceSeconds)
  }
  // MIDI files frequently set keysig=0 ("C") even when the true key is unknown,
  // so we only assert non-C key signatures here.
  const assertKeySignature = (song: ReturnType<typeof parseMidi>, fixtureKeysig?: number) => {
    if (typeof fixtureKeysig !== 'number') {
      return
    }
    const parsed = getKeySignatureFromMidi(fixtureKeysig, 0)
    if (parsed === 'C') {
      return
    }
    expect(song.keySignature).toBe(parsed)
  }

  for (const file of fixtureFiles) {
    const fixturePath = path.join(fixtureDir, file)
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
    const midiName = file.replace(/\.score-meta\.json$/i, '.mid')
    const midiPath = path.join(songDir, midiName)
    const midiBytes = new Uint8Array(readFileSync(midiPath))

    it.concurrent(`matches MuseScore score-meta basics: ${midiName}`, () => {
      const song = parseMidi(midiBytes)

      if (typeof fixture.measures === 'number') {
        expect(song.measures.length).toBe(fixture.measures)
      }
      if (typeof fixture.timesig === 'string') {
        const [numerator, denominator] = fixture.timesig.split('/').map(Number)
        expect(song.timeSignature).toEqual({ numerator, denominator })
      }
      assertDuration(midiBytes, fixture.duration)
      assertKeySignature(song, fixture.keysig)
    })

    it.concurrent(`roundtrips midi data: ${midiName}`, () => {
      const song = parseMidi(midiBytes)
      const roundtripped = parseMidi(serializeMidi(song))

      expect(roundtripped.notes.length).toBe(song.notes.length)
      expect(roundtripped.measures.length).toBe(song.measures.length)
      expect(roundtripped.timeSignature).toEqual(song.timeSignature)
      expect(roundtripped.keySignature).toBe(song.keySignature)
      expect(Math.abs(roundtripped.duration - song.duration)).toBeLessThan(0.02)

      const sampleCount = Math.min(50, song.notes.length)
      for (let i = 0; i < sampleCount; i++) {
        const original = song.notes[i]
        const reparse = roundtripped.notes[i]
        expect(reparse.midiNote).toBe(original.midiNote)
        expect(Math.abs(reparse.time - original.time)).toBeLessThan(0.02)
        expect(Math.abs(reparse.duration - original.duration)).toBeLessThan(0.02)
      }
    })

    it.concurrent(`roundtrips serialized midi data: ${midiName}`, () => {
      const song = parseMidi(midiBytes)
      const serializedOnce = serializeMidi(song)
      const parsedOnce = parseMidi(serializedOnce)
      const serializedTwice = serializeMidi(parsedOnce)
      const parsedTwice = parseMidi(serializedTwice)

      expect(parsedTwice.notes.length).toBe(parsedOnce.notes.length)
      expect(parsedTwice.measures.length).toBe(parsedOnce.measures.length)
      expect(parsedTwice.timeSignature).toEqual(parsedOnce.timeSignature)
      expect(parsedTwice.keySignature).toBe(parsedOnce.keySignature)
      expect(Math.abs(parsedTwice.duration - parsedOnce.duration)).toBeLessThan(0.02)
    })
  }
})
