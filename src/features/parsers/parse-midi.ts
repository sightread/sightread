// Since this is called from Deno as well, we need to use relative paths.
import * as tonejs from '@tonejs/midi'
import type { Bpm, Song, SongMeasure, SongNote, Tracks } from '../../../src/types'
import { KEY_SIGNATURE } from '../theory'

function sort<T extends { time: number }>(arr: T[]): T[] {
  return arr.sort((i1, i2) => i1.time - i2.time)
}

export default function parseMidi(midiData: Uint8Array): Song {
  const parsed = new tonejs.Midi(midiData)
  const bpms: Array<Bpm> = parsed.header.tempos.map((tempo) => {
    return { time: parsed.header.ticksToSeconds(tempo.ticks), bpm: tempo.bpm }
  })
  let notes: Array<SongNote> = parsed.tracks.flatMap((track, i) => {
    return track.notes.map((note) => ({
      type: 'note',
      midiNote: note.midi,
      track: i,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity * 127,
      measure: Math.floor(parsed.header.ticksToMeasures(note.ticks)),
    }))
  })
  const tracks: Tracks = Object.fromEntries(
    parsed.tracks.map((track, i) => {
      return [
        i,
        {
          name: track.name,
          // infer percussion soundfont for drums (channel 9)
          instrument: track.channel === 9 ? 'percussion' : track.instrument.name,
          program: track.instrument.number,
        },
      ]
    }),
  )
  const timeSignature = parsed.header.timeSignatures[0]?.timeSignature ?? [4, 4]
  const keySignature = parsed.header.keySignatures[0]?.key as KEY_SIGNATURE

  let measureIndex = 1
  const measures: Array<SongMeasure> = parsed.header.timeSignatures.flatMap(
    (timeSignatureEvent, i, arr) => {
      let startOfTempoTicks = timeSignatureEvent.ticks
      // Either end of song, or start of next timeSignature.
      let endOfTempoTicks = !!arr[i + 1] ? arr[i + 1].ticks : parsed.durationTicks
      let ticksPerMeasure =
        (timeSignatureEvent.timeSignature[0] / timeSignatureEvent.timeSignature[1]) *
        (4 * parsed.header.ppq)
      let startMeasure = parsed.header.ticksToMeasures(startOfTempoTicks)
      let endMeasure = parsed.header.ticksToMeasures(endOfTempoTicks)
      let measureCount = Math.ceil(endMeasure - startMeasure) // If the time signature lasts until the end of the song, it'll be fractional.
      let secondsPerMeasure =
        parsed.header.ticksToSeconds(startOfTempoTicks + ticksPerMeasure) -
        parsed.header.ticksToSeconds(startOfTempoTicks)

      const type = 'measure'
      const duration = secondsPerMeasure
      return Array.from({ length: measureCount }).map((_, i) => {
        let number = measureIndex++
        const tick = startOfTempoTicks + i * ticksPerMeasure
        const time = parsed.header.ticksToSeconds(tick)
        return { type, number, duration, time }
      })
    },
  )

  return {
    duration: parsed.duration,
    measures: sort(measures),
    notes: sort(notes),
    tracks,
    bpms,
    timeSignature: { numerator: timeSignature[0], denominator: timeSignature[1] },
    keySignature,
    items: sort([...measures, ...notes]),
    ppq: parsed.header.ppq,
    secondsToTicks: (n) => parsed.header.secondsToTicks(n),
    ticksToSeconds: (n) => parsed.header.ticksToSeconds(n),
  }
}
