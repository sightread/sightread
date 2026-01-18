import * as tonejs from '@tonejs/midi'
import type { Bpm, Song, SongMeasure, SongNote, Tracks } from '../../../src/types'
import { isBlack, KEY_SIGNATURE } from '../theory'

type TimeSignatureEvent = { ticks: number; timeSignature: [number, number] }
const DEFAULT_TIME_SIGNATURE: TimeSignatureEvent = { ticks: 0, timeSignature: [4, 4] }

function sort<T extends { time: number }>(arr: T[]): T[] {
  return arr.sort((i1, i2) => i1.time - i2.time)
}

function normalizeTimeSignature(timeSignature: number[]): [number, number] {
  const [numerator = 4, denominator = 4] = timeSignature
  return [numerator, denominator]
}

function getTimeSignatureEvents(parsed: tonejs.Midi): TimeSignatureEvent[] {
  if (parsed.header.timeSignatures.length > 0) {
    return [...parsed.header.timeSignatures]
      .sort((a, b) => a.ticks - b.ticks)
      .map((event) => ({
        ticks: event.ticks,
        timeSignature: normalizeTimeSignature(event.timeSignature),
      }))
  }
  return [DEFAULT_TIME_SIGNATURE]
}

function getTrackEndTicks(parsed: tonejs.Midi): number[] {
  return parsed.tracks
    .map((track) => track.endOfTrackTicks)
    .filter((ticks): ticks is number => typeof ticks === 'number')
}

function getMeasureDurationTicks(parsed: tonejs.Midi, trackEndTicks: number[]): number {
  const songDurationTicks = Math.max(parsed.durationTicks, ...trackEndTicks)
  return parsed.durationTicks > 0 ? parsed.durationTicks : songDurationTicks
}

function getScoreEndTicks(
  timeSigEvents: TimeSignatureEvent[],
  measureDurationTicks: number,
  ppq: number,
): number {
  let scoreEndTicks = 0
  for (let i = 0; i < timeSigEvents.length; i++) {
    const event = timeSigEvents[i]
    const nextEvent = timeSigEvents[i + 1]
    const startTick = event.ticks
    const endTick = nextEvent ? nextEvent.ticks : measureDurationTicks
    const [numerator, denominator] = event.timeSignature
    const ticksPerMeasure = (numerator / denominator) * (4 * ppq)
    const segmentTicks = Math.max(0, endTick - startTick)
    const measureCount = Math.ceil(segmentTicks / ticksPerMeasure)
    scoreEndTicks = Math.max(scoreEndTicks, startTick + measureCount * ticksPerMeasure)
  }
  return scoreEndTicks
}

// Returns a sheet-music-aligned duration: end time rounded up to the last full measure.
// This differs from Song.duration, which is the last note end time (musical duration).
export function getScoreDuration(midiData: Uint8Array): number {
  const parsed = new tonejs.Midi(midiData)
  const timeSigEvents = getTimeSignatureEvents(parsed)
  const trackEndTicks = getTrackEndTicks(parsed)
  const measureDurationTicks = getMeasureDurationTicks(parsed, trackEndTicks)
  const scoreEndTicks = getScoreEndTicks(timeSigEvents, measureDurationTicks, parsed.header.ppq)
  return parsed.header.ticksToSeconds(scoreEndTicks)
}

export default function parseMidi(midiData: Uint8Array): Song {
  const parsed = new tonejs.Midi(midiData)
  const bpms: Array<Bpm> = parsed.header.tempos.map((tempo) => {
    return { time: parsed.header.ticksToSeconds(tempo.ticks), bpm: tempo.bpm }
  })
  const timeSigEvents = getTimeSignatureEvents(parsed)
  const timeSignatures = timeSigEvents.map((event) => ({
    time: parsed.header.ticksToSeconds(event.ticks),
    numerator: event.timeSignature[0],
    denominator: event.timeSignature[1],
  }))

  let measureIndex = 1
  const measures: Array<SongMeasure> = []
  const measureStartTicks: number[] = []

  const trackEndTicks = getTrackEndTicks(parsed)
  const measureDurationTicks = getMeasureDurationTicks(parsed, trackEndTicks)

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
  let keySignature: KEY_SIGNATURE | undefined
  if (keySignatureEvents.length > 0) {
    const minTick = Math.min(...keySignatureEvents.map((event) => event.ticks ?? 0))
    const lastAtMinTick = [...keySignatureEvents]
      .reverse()
      .find((event) => event.ticks === minTick)
    keySignature = lastAtMinTick?.key as KEY_SIGNATURE
  }
  // MIDI files often emit keysig=0 ("C") even when the score's key is unknown.
  // Treat C as unknown unless it passes the "all white keys" heuristic below.
  if (keySignature === 'C') {
    keySignature = undefined
  }
  if (!keySignature) {
    const hasBlackNotes = notes.some((note) => isBlack(note.midiNote))
    if (!hasBlackNotes) {
      keySignature = 'C'
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
