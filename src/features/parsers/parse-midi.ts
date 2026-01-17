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
  const timeSigEvents =
    parsed.header.timeSignatures.length > 0
      ? [...parsed.header.timeSignatures].sort((a, b) => a.ticks - b.ticks)
      : [{ ticks: 0, timeSignature: [4, 4] as [number, number] }]
  const timeSignatures = timeSigEvents.map((event) => ({
    time: parsed.header.ticksToSeconds(event.ticks),
    numerator: event.timeSignature[0],
    denominator: event.timeSignature[1],
  }))

  let measureIndex = 1
  const measures: Array<SongMeasure> = []
  const measureStartTicks: number[] = []

  const trackEndTicks = parsed.tracks
    .map((track) => track.endOfTrackTicks)
    .filter((ticks): ticks is number => typeof ticks === 'number')
  const songDurationTicks = Math.max(parsed.durationTicks, ...trackEndTicks)
  const measureDurationTicks = parsed.durationTicks > 0 ? parsed.durationTicks : songDurationTicks

  for (let i = 0; i < timeSigEvents.length; i++) {
    const event = timeSigEvents[i]
    const nextEvent = timeSigEvents[i + 1]
    const startTick = event.ticks
    const endTick = nextEvent ? nextEvent.ticks : measureDurationTicks
    const [numerator, denominator] = event.timeSignature
    const ticksPerMeasure = (numerator / denominator) * (4 * parsed.header.ppq)
    const segmentTicks = Math.max(0, endTick - startTick)
    const measureCount = Math.ceil(segmentTicks / ticksPerMeasure)

    for (let j = 0; j < measureCount; j++) {
      const tick = startTick + j * ticksPerMeasure
      const time = parsed.header.ticksToSeconds(tick)
      const duration =
        parsed.header.ticksToSeconds(tick + ticksPerMeasure) - parsed.header.ticksToSeconds(tick)
      measures.push({ type: 'measure', number: measureIndex++, duration, time })
      measureStartTicks.push(tick)
    }
  }

  function getMeasureForTick(tick: number): number {
    if (measureStartTicks.length === 0) {
      return 0
    }
    let low = 0
    let high = measureStartTicks.length - 1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const start = measureStartTicks[mid]
      const nextStart = measureStartTicks[mid + 1]
      if (tick < start) {
        high = mid - 1
      } else if (nextStart !== undefined && tick >= nextStart) {
        low = mid + 1
      } else {
        return mid + 1
      }
    }
    return measureStartTicks.length
  }

  let notes: Array<SongNote> = parsed.tracks.flatMap((track, i) => {
    return track.notes.map((note) => ({
      type: 'note',
      midiNote: note.midi,
      track: i,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity * 127,
      measure: getMeasureForTick(note.ticks),
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
  const primaryTimeSigEvent =
    timeSigEvents.find((event) => event.timeSignature[0] > 1) ?? timeSigEvents[0]
  const timeSignature = primaryTimeSigEvent?.timeSignature ?? [4, 4]

  const keySignatureEvents = parsed.header.keySignatures ?? []
  let keySignature: KEY_SIGNATURE = 'C'
  if (keySignatureEvents.length > 0) {
    const minTick = Math.min(...keySignatureEvents.map((event) => event.ticks ?? 0))
    if (minTick === 0) {
      const lastAtMinTick = [...keySignatureEvents]
        .reverse()
        .find((event) => event.ticks === minTick)
      keySignature = (lastAtMinTick?.key as KEY_SIGNATURE) ?? 'C'
    }
  }

  const noteEndTimes = notes.map((note) => note.time + note.duration)
  const duration = noteEndTimes.length > 0 ? Math.max(...noteEndTimes) : 0

  return {
    // Use last note end time for musical duration; end-of-track padding is ignored.
    duration,
    measures: sort(measures),
    notes: sort(notes),
    tracks,
    bpms,
    timeSignature: { numerator: timeSignature[0], denominator: timeSignature[1] },
    timeSignatures,
    keySignature,
    items: sort([...measures, ...notes]),
    ppq: parsed.header.ppq,
    secondsToTicks: (n) => parsed.header.secondsToTicks(n),
    ticksToSeconds: (n) => parsed.header.ticksToSeconds(n),
  }
}
