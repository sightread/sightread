// Since this is called from Deno as well, we need to use relative paths.
import type { Song, SongMeasure, SongNote, Tracks, Bpm } from '../../../src/types'
import { KEY_SIGNATURE } from '../theory'
import * as tonejs from '@tonejs/midi'

function sort<T extends { time: number }>(arr: T[]): T[] {
  return arr.sort((i1, i2) => i1.time - i2.time)
}

export default function parseMidi(midiData: ArrayBufferLike): Song {
  const parsed = new tonejs.Midi(midiData as ArrayBuffer)
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
          instrument: track.instrument.name,
          program: track.instrument.number,
        },
      ]
    }),
  )
  const timeSignature = parsed.header.timeSignatures[0]?.timeSignature ?? [4, 4]
  const keySignature = parsed.header.keySignatures[0]?.key as KEY_SIGNATURE

  let measureIndex = 1
  const measures: Array<SongMeasure> = parsed.header.timeSignatures.flatMap((ts, i, arr) => {
    let startOfTempoTicks = parsed.header.ticksToSeconds(ts.ticks)
    // Either end of song, or start of next timeSignature.
    let endOfTempoTicks = arr[i + 1] !== undefined ? arr[i + 1].ticks : parsed.durationTicks
    let startMeasure = parsed.header.ticksToMeasures(startOfTempoTicks)
    let endMeasure = parsed.header.ticksToMeasures(endOfTempoTicks)
    let measureCount = endMeasure - startMeasure
    let secondsPerMeasure =
      (parsed.header.ticksToSeconds(endOfTempoTicks) -
        parsed.header.ticksToSeconds(startOfTempoTicks)) /
      measureCount

    const type = 'measure'
    const duration = secondsPerMeasure
    return Array.from({ length: measureCount }).map((_, i) => {
      let number = measureIndex++
      const time = startOfTempoTicks + duration * i
      return { type, number, duration, time }
    })
  })

  return {
    duration: parsed.duration,
    measures: sort(measures),
    notes: sort(notes),
    tracks,
    bpms,
    timeSignature: { numerator: timeSignature[0], denominator: timeSignature[1] },
    keySignature,
    items: sort([...measures, ...notes]),
  }
}
