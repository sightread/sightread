import { Midi } from '@tonejs/midi'
import { parseMidi as parseMidiFile, writeMidi } from 'midi-file'
import type { MidiData, MidiEvent, MidiKeySignatureEvent } from 'midi-file'
import type { Song } from '../../../src/types'

function defaultSecondsToTicks(seconds: number, ppq: number, bpm = 120): number {
  const beats = seconds / (60 / bpm)
  return Math.round(beats * ppq)
}

export default function serializeMidi(song: Song): Uint8Array {
  const midi = new Midi()
  const ppq = song.ppq ?? 480
  const secondsToTicks =
    typeof song.secondsToTicks === 'function'
      ? song.secondsToTicks
      : (seconds: number) => defaultSecondsToTicks(seconds, ppq)

  const tempoEvents =
    song.bpms.length > 0
      ? song.bpms
          .slice()
          .sort((a, b) => a.time - b.time)
          .map((bpm) => ({
            ticks: secondsToTicks(bpm.time),
            bpm: bpm.bpm,
          }))
      : [{ ticks: 0, bpm: 120 }]

  const timeSignatureEvents =
    song.timeSignatures && song.timeSignatures.length > 0
      ? song.timeSignatures
          .slice()
          .sort((a, b) => a.time - b.time)
          .map((sig) => ({
            ticks: secondsToTicks(sig.time),
            timeSignature: [sig.numerator, sig.denominator],
          }))
      : song.timeSignature
        ? [
            {
              ticks: 0,
              timeSignature: [song.timeSignature.numerator, song.timeSignature.denominator],
            },
          ]
        : []

  midi.header.fromJSON({
    name: '',
    ppq,
    tempos: tempoEvents,
    timeSignatures: timeSignatureEvents,
    keySignatures: song.keySignature
      ? [
          {
            ticks: 0,
            key: song.keySignature,
            scale: 'major',
          },
        ]
      : [],
    meta: [],
  })

  const trackIds = Object.keys(song.tracks)
    .map((id) => Number(id))
    .sort((a, b) => a - b)
  const tracks = new Map<number, ReturnType<Midi['addTrack']>>()

  for (const id of trackIds) {
    const track = midi.addTrack()
    const trackMeta = song.tracks[id]
    if (trackMeta?.name) {
      track.name = trackMeta.name
    }
    if (trackMeta?.instrument === 'percussion') {
      track.channel = 9
    }
    if (typeof trackMeta?.program === 'number') {
      track.instrument.number = trackMeta.program
    }
    tracks.set(id, track)
  }

  for (const note of song.notes) {
    let track = tracks.get(note.track)
    if (!track) {
      track = midi.addTrack()
      tracks.set(note.track, track)
    }
    const startTicks = secondsToTicks(note.time)
    const endTicks = secondsToTicks(note.time + note.duration)
    const durationTicks = Math.max(1, endTicks - startTicks)
    const velocity =
      typeof note.velocity === 'number' ? Math.min(1, Math.max(0, note.velocity / 127)) : 1
    track.addNote({
      midi: note.midiNote,
      ticks: startTicks,
      durationTicks,
      velocity,
    })
  }

  let output = midi.toArray()

  if (song.keySignature) {
    const keyToFifths: Record<string, number> = {
      Cb: -7,
      Gb: -6,
      Db: -5,
      Ab: -4,
      Eb: -3,
      Bb: -2,
      F: -1,
      C: 0,
      G: 1,
      D: 2,
      A: 3,
      E: 4,
      B: 5,
      'F#': 6,
      'C#': 7,
    }
    const fifths = keyToFifths[song.keySignature] ?? 0
    const midiData = parseMidiFile(output) as MidiData
    const track0 = midiData.tracks[0]
    if (track0) {
      const filtered = track0.filter((event): event is MidiEvent => event.type !== 'keySignature')
      const keySignatureEvent: MidiKeySignatureEvent = {
        deltaTime: 0,
        meta: true,
        type: 'keySignature',
        key: fifths,
        scale: 0,
      }
      filtered.unshift(keySignatureEvent)
      midiData.tracks[0] = filtered
      output = new Uint8Array(writeMidi(midiData))
    }
  }

  return output
}
