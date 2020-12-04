import { parseMidiFile, MidiEvent } from 'jasmid.ts'

export type SongNote = {
  type: 'note'
  noteValue: number
  track: number
  time: number
  duration: number
  pitch: {
    step: string
    octave: number
  }
  accidental: number // 1 | -1 | 0
  velocity?: number
}

export type Tracks = {
  [id: number]: {
    instrument: string
    name?: string
    program?: number
  }
}

export type SongMeasure = {
  type: 'measure'
  time: number
  number: number
}

type Bpm = { time: number; bpm: number }

export type Song = {
  tracks: Tracks
  duration: number
  measures: Array<SongMeasure>
  notes: Array<SongNote>
  bpms: Array<Bpm>
  timeSignature: { numerator: number; denominator: number }
}

export function parseMusicXML(txt: string): Song {
  /*
   * TODO:
   * - Handle alternative time signatures
   * - Handle non Trebl/Bass clefs
   */

  const xml = new DOMParser().parseFromString(txt, 'application/xml')
  const walker = xml.createTreeWalker(xml, NodeFilter.SHOW_ALL)

  let currTime = 0
  let currMeasure = 1
  let totalDuration = 0
  let openTies = new Map() // A tie in music is when a note should be held down even after crossing a measure.
  let repeatStart: number = 1
  let curr = walker.currentNode as HTMLElement
  let tracks: Tracks = { 1: { instrument: 'piano' }, 2: { instrument: 'piano' } }
  let notes: Array<SongNote> = []
  let measures: Array<SongMeasure> = []
  const bpms: Array<Bpm> = []
  const divisions = Number(xml.querySelector('divisions')?.textContent)
  let part = 0
  const timeSignature = { numerator: 4, denominator: 4 }
  let currTrack = 1

  function stepTime(duration: number): void {
    currTime = +(currTime + calcWallDuration(duration)).toFixed(2)
  }
  function calcWallDuration(duration: number, time: number = currTime): number {
    // Must calculate the current bpm based on currTime, because various things may change
    // currTime backwards or forwards (part changes, or repeats etc.)

    // CALC LOGIC thx zohdi
    // divisions  , bpm, duration ;
    // | beats  |                      =  | beats |   *  |    1   | =     1
    // | minute | * (60)ms/minute         |  s    |      |  beats |       s
    // bpm / (60)===quarter beats per second
    // (duration/divisions) =  number of quarter beats
    // (1 / (bpm/60)) * duration/divisions = seconds
    const bpmIndex = bpms.findIndex((bpm) => bpm.time > time) - 1
    const bpm = (bpmIndex < 0 ? bpms[bpms.length - 1] : bpms[bpmIndex])?.bpm ?? 120
    const val = (1 / (bpm / 60)) * (duration / divisions)
    return +val.toFixed(2)
  }

  while (curr) {
    if (curr.tagName === 'clef') {
      const sign = curr.querySelector('sign')?.textContent ?? 'F'
      if (sign === 'G') {
        currTrack = 1
      } else if (sign === 'F') {
        currTrack = 2
      }
    } else if (curr.tagName === 'note' && curr.querySelector('rest')) {
      const duration: number = Number(curr.querySelector('duration')?.textContent?.trim())
      stepTime(duration)
    } else if (curr.tagName === 'note') {
      let tie = curr.querySelector('tie')
      const step = curr.querySelector('step')?.textContent?.trim() ?? ''
      const octave = Number(curr.querySelector('octave')?.textContent?.trim())
      let duration = Number(curr.querySelector('duration')?.textContent?.trim())
      if (isNaN(duration)) {
        // TODO: check for note size and convert to duration.
        // console.error('Error: found a note with no duration.')
        duration = 0
      }
      let noteTrack = Number(curr.querySelector('staff')?.textContent?.trim())
      let track = currTrack ? noteTrack : currTrack
      let accidental: any = curr.querySelector('accidental')?.textContent?.trim()
      if (!accidental || accidental === 'natural') {
        accidental = 0
      } else if (accidental === 'sharp') {
        accidental = 1
      } else if (accidental === 'flat') {
        accidental = -1
      } else {
        // TODO handle double-sharp and double-flat etc.
        accidental = Number(curr.querySelector('accidental')?.textContent?.trim() ?? 0)
      }
      if (curr.querySelector('alter')) {
        accidental = Number(curr.querySelector('alter')?.textContent?.trim()) ?? 0
      }
      const isChord = !!curr.querySelector('chord')
      let lastNoteTime = notes[notes.length - 1]?.time ?? 0

      let time = isChord ? lastNoteTime : currTime
      const noteValue = getNoteValue(step, octave, accidental)
      let note: SongNote = {
        type: 'note',
        pitch: { step, octave },
        duration: calcWallDuration(duration, time),
        time,
        noteValue,
        track,
        accidental,
      }
      if (tie) {
        let type = tie.getAttribute('type')
        const hasTwoTies = curr.querySelectorAll('tie').length > 1
        if (type === 'stop') {
          if (openTies.has(noteValue)) {
            openTies.get(noteValue).duration += note.duration
            // Only end it if the tie doesnt' have a next part as well.
            const i = notes.findIndex((n) => n === openTies.get(noteValue))
            notes.splice(i, 1)
            notes.push(openTies.get(noteValue))
            if (!hasTwoTies) {
              openTies.delete(noteValue)
            }
          } else {
            console.warn('could not close tie', curr)
          }
        } else {
          openTies.set(noteValue, note)
          notes.push(note)
        }
      } else {
        notes.push(note)
      }

      // TODO: - is there proper handling of `<chord/>`s ?
      if (!isChord) {
        stepTime(duration)
      }
    } else if (curr.tagName === 'backup') {
      let duration = Number(curr.querySelector('duration')?.textContent?.trim())
      currTime -= calcWallDuration(duration)
    } else if (curr.tagName === 'forward') {
      let duration = Number(curr.querySelector('duration')?.textContent?.trim())
      if (isNaN(duration)) {
        console.error(`note duration!!`, curr.querySelector('duration'))
        duration = 0
      }
      stepTime(duration)
    } else if (curr.tagName === 'measure') {
      const number = Number(curr.getAttribute('number'))
      // Don't add the same measure multiple times for multi-part xml files.
      if (!measures.find((m) => m.number === number)) {
        measures.push({ time: currTime, number, type: 'measure' })
      } else {
        const m = measures.find((m) => m.number === number)
        // TODO: wtffff why are the left and right hand times off.
        currTime = m?.time as any
      }
      currMeasure = number
    } else if (curr.tagName === 'key') {
      const fifth = Number(curr.querySelector('fifths')?.textContent?.trim())
      const mode = curr.querySelector('mode')?.textContent?.trim() ?? ''
    } else if (curr.tagName === 'sound') {
      if (curr.hasAttribute('tempo')) {
        const bpm = Number(curr.getAttribute('tempo'))
        bpms.push({ time: currTime, bpm })
      }
    } else if (curr.tagName === 'part') {
      currTime = 0
      part = Number(curr.getAttribute('id')?.slice(1))
    } else if (curr.tagName === 'time') {
      timeSignature.numerator = Number(curr.querySelector('beats')?.textContent) ?? 4
      timeSignature.denominator = Number(curr.querySelector('beat-type')?.textContent) ?? 4
    } else if (curr.tagName === 'repeat') {
      // TODO: will repeat multiple part's notes. should only be one part.
      if (curr.getAttribute('direction') === 'backward') {
        const startMeasure: SongMeasure = measures.find((m) => m.number === repeatStart)!
        const repeatNotes = notes.slice(notes.findIndex((note) => note.time >= startMeasure.time))
        const dt = currTime - startMeasure.time
        for (let note of repeatNotes) {
          const newNote = { ...note, time: note.time + dt }
          notes.push(newNote)
        }
        currTime = +(currTime + dt).toFixed(2)
      } else if (curr.getAttribute('direction') === 'forward') {
        repeatStart = currMeasure
      } else {
        // noop if type is unrecognized. Intentionally not using NodeFilter,
        // which would improve performance since we only serve preparsed version for prod.
      }
    }
    totalDuration = Math.max(totalDuration, currTime)
    curr = walker.nextNode() as HTMLElement
  }

  return {
    tracks,
    duration: totalDuration,
    measures,
    notes,
    bpms,
    timeSignature,
  }
}

export function getNoteValue(step: string, octave: number, accidental: number = 0) {
  const stepValues: any = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  let offset = 0

  if (octave === 0) {
    if (step === 'A') {
      return 0
    }
    return 1 // 'B';
  }

  return (octave - 1) * 12 + stepValues[step] + offset + 3 + accidental
}

export function getPitch(noteValue: number): { octave: number; step: string; alter: number } {
  const map: any = {
    0: { step: 'C', alter: 0 },
    1: { step: 'C', alter: 1 },
    2: { step: 'D', alter: 0 },
    3: { step: 'D', alter: 1 },
    4: { step: 'E', alter: 0 },
    5: { step: 'F', alter: 0 },
    6: { step: 'F', alter: 1 },
    7: { step: 'G', alter: 0 },
    8: { step: 'G', alter: 1 },
    9: { step: 'A', alter: 0 },
    10: { step: 'A', alter: 1 },
    11: { step: 'B', alter: 0 },
  }
  //noteValue = noteValue + 1 // TODO: figure out why this is here
  const { step, alter } = map[(noteValue - 3) % 12]

  return { octave: Math.floor(noteValue / 12) + 1, step, alter }
}

// TODO in the faroff future: replace jasmid.ts with own parser.

export interface NoteKey extends String {
  notReal: string
}

export function parseMidi(midiData: ArrayBufferLike): Song {
  const parsed = parseMidiFile(midiData)

  const bpms: Array<Bpm> = []
  var ticksPerBeat = parsed.header.ticksPerBeat

  let currTime = 0
  let currTick = 0
  let tracks: Tracks = {}
  let openNotes: Map<NoteKey, SongNote> = new Map() // notes still "on"
  let notes: SongNote[] = []
  let measures: SongMeasure[] = []
  let lastMeasureTickedAt = -Infinity
  let timeSignature = { numerator: 4, denominator: 4 }
  const ticksPerMeasure = () =>
    ticksPerBeat * (timeSignature.numerator / timeSignature.denominator) * 4

  function calcWallDuration(ticks: number): number {
    const bpm = bpms[bpms.length - 1]?.bpm ?? 120
    return (ticks * 60) / (ticksPerBeat * bpm)
  }

  let orderedEvents = getOrderedMidiEvents(parsed)
  for (let orderedEvent of orderedEvents) {
    const midiEvent: MidiEvent = orderedEvent.event
    const track: number = orderedEvent.track
    const noteKey = (num: number): NoteKey => (`${track}-${num}` as unknown) as NoteKey

    currTick += orderedEvent.ticksToEvent
    currTime += calcWallDuration(orderedEvent.ticksToEvent)
    if (currTick - lastMeasureTickedAt >= ticksPerMeasure()) {
      lastMeasureTickedAt = currTick
      measures.push({ type: 'measure', time: currTime, number: measures.length + 1 })
    }

    if (!tracks[track]) {
      tracks[track] = { instrument: 'piano' }
    }

    if (midiEvent.subType === 'instrumentName') {
      tracks[track].instrument = midiEvent.text
    } else if (midiEvent.subType === 'trackName') {
      tracks[track].name = midiEvent.text
    } else if (midiEvent.subType === 'programChange') {
      tracks[track].program = midiEvent.program
    } else if (midiEvent.subType === 'noteOn') {
      const noteValue = midiEvent.note - 21 // convert to noteValue
      if (openNotes.has(noteKey(noteValue))) {
        const note = openNotes.get(noteKey(noteValue))!
        note.duration = calcWallDuration(note.duration)
        openNotes.delete(noteKey(noteValue))
      }

      const note: SongNote = {
        type: 'note',
        time: currTime,
        duration: 0,
        noteValue,
        track,
        pitch: getPitch(noteValue),
        accidental: getPitch(noteValue).alter,
        velocity: midiEvent.velocity,
      }
      openNotes.set(noteKey(noteValue), note)
      notes.push(note)
    } else if (midiEvent.subType === 'noteOff') {
      const noteValue = midiEvent.note - 21
      if (openNotes.has(noteKey(noteValue))) {
        const note = openNotes.get(noteKey(noteValue))!
        note.duration = currTime - note.time
        openNotes.delete(noteKey(noteValue))
      }
    } else if (midiEvent.subType === 'setTempo') {
      const bpm = 60000000 / midiEvent.microsecondsPerBeat
      bpms.push({ time: currTime, bpm })
    } else if (midiEvent.subType === 'timeSignature') {
      timeSignature = midiEvent
    }
  }

  // Calc duration
  let duration = 0
  for (let n of notes) {
    duration = Math.max(duration, n.time + n.duration)
  }

  // TODO: evaluate if this is necessary.
  // Removing empty tracks.
  for (let t of Object.keys(tracks).map(Number)) {
    let note = notes.find((n) => n.track === t)
    if (!note) {
      delete tracks[t]
    }
  }

  return {
    duration: currTime,
    measures: measures,
    notes: notes,
    tracks,
    bpms,
    timeSignature,
  }
}

function getOrderedMidiEvents(parsed: any) {
  var trackStates: any = []
  for (var i = 0; i < parsed.tracks.length; i++) {
    trackStates[i] = {
      nextEventIndex: 0,
      ticksToNextEvent: parsed.tracks[i].length ? parsed.tracks[i][0].deltaTime : null,
    }
  }

  function getNextEvent() {
    var ticksToNextEvent: any = null
    var nextEventTrack: any = null
    var nextEventIndex: any = null
    let nextEventInfo: any

    for (let i = 0; i < trackStates.length; i++) {
      if (
        trackStates[i].ticksToNextEvent != null &&
        (ticksToNextEvent === null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
      ) {
        ticksToNextEvent = trackStates[i].ticksToNextEvent
        nextEventTrack = i
        nextEventIndex = trackStates[i].nextEventIndex
      }
    }
    if (nextEventTrack != null) {
      /* consume event from that track */
      var nextEvent = parsed.tracks[nextEventTrack][nextEventIndex]
      if (parsed.tracks[nextEventTrack][nextEventIndex + 1]) {
        trackStates[nextEventTrack].ticksToNextEvent +=
          parsed.tracks[nextEventTrack][nextEventIndex + 1].deltaTime
      } else {
        trackStates[nextEventTrack].ticksToNextEvent = null
      }
      trackStates[nextEventTrack].nextEventIndex += 1
      /* advance timings on all tracks by ticksToNextEvent */
      for (let i = 0; i < trackStates.length; i++) {
        if (trackStates[i].ticksToNextEvent != null) {
          trackStates[i].ticksToNextEvent -= ticksToNextEvent
        }
      }
      nextEventInfo = {
        ticksToEvent: ticksToNextEvent,
        event: nextEvent,
        track: nextEventTrack,
      }
    } else {
      nextEventInfo = null
    }
    return nextEventInfo
  }

  let orderedEvents = []
  let nextEvent = getNextEvent()
  while (nextEvent) {
    orderedEvents.push(nextEvent)
    nextEvent = getNextEvent()
  }
  return orderedEvents
}

// Unused.
function getSharps(fifth: number) {
  const cScale = [0, 2, 3, 5, 7, 8, 10]
  const thisScale = cScale.map((n) => (((n + fifth * 7 + 12) % 12) + 12) % 12)
  thisScale.sort((a, b) => a - b)

  const revIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  let sharps: any = {}
  let accidentalOffset = fifth > 0 ? 1 : -1
  cScale.forEach((val, i) => {
    if (!thisScale.includes(val)) {
      sharps[revIndex[i]] = accidentalOffset
    }
  })
  return sharps
}

export function getHandIndexesForTeachMid(song: Song): { left?: number; right?: number } {
  // const onlyStudentTrack = Object.keys(song.tracks)
  //   .map(Number)
  //   .filter((trackNum) => song.tracks[trackNum].name === 'Student')
  // if (onlyStudentTrack) {
  //   return { right: onlyStudentTrack }
  // }
  console.error(song)

  const lhStudentTrack = Object.keys(song.tracks)
    .map(Number)
    .find((trackNum) => song.tracks[trackNum].name?.includes('L.H.'))
  const rhStudentTrack = Object.keys(song.tracks)
    .map(Number)
    .find((trackNum) => song.tracks[trackNum].name?.includes('R.H.'))
  return { left: lhStudentTrack, right: rhStudentTrack }
}

export function parserInferHands(song: Song): { left: any; right: any } {
  const pianoTracks = Object.values(song.tracks).filter((track) =>
    track.instrument.toLowerCase().includes('piano'),
  )
  // TODO: force users to choose tracks in this case.
  if (pianoTracks.length !== 2) {
    console.error(
      `Choosing the first two Piano tracks, even though there are ${pianoTracks.length}`,
      song,
    )
  }
  const [t1, t2] = Object.keys(song.tracks)
    .filter((trackNum: any) => song.tracks[trackNum].instrument.toLowerCase().includes('piano'))
    .map(Number)
  // Dumb way to determine r/l hand, calc which has the higher avg score, and flip if guessed wrong.
  const sum = (arr: Array<number>) => arr.reduce((a: number, b: number) => a + b, 0)
  const avg = (arr: Array<number>) => sum(arr) / arr.length
  let t1Avg = avg(song.notes.filter((n) => n.track === t1).map((n) => n.noteValue))
  let t2Avg = avg(song.notes.filter((n) => n.track === t2).map((n) => n.noteValue))
  if (t1Avg < t2Avg) {
    return { left: t1, right: t2 }
  }
  return { left: t2, right: t1 }
}
