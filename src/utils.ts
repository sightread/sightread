import { parseMidiFile, MidiEvent } from 'jasmid.ts'

export const STAFF = {
  trebl: 1,
  bass: 2,
}

type Seconds = number
export type SongNote = {
  noteValue: number
  staff: number
  time: number
  duration: number
  pitch: {
    step: string
    octave: number
  }
  accidental: number // 1 | -1 | 0
  velocity?: number
  noteType: string // 4 = quarter, 1 = whole, etc.
}

export type Staffs = {
  [staff: number]: {
    clef: { sign: string }
  }
}

export type SongMeasure = {
  time: number
  number: number
}

type Bpm = { time: number; bpm: number }

export type Song = {
  staffs: Staffs
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
  const walker = xml.createTreeWalker(xml, NodeFilter.SHOW_ALL, nodeFilter)

  let currTime = 0
  let currMeasure = 1
  let totalDuration = 0
  let openTies = new Map() // A tie in music is when a note should be held down for multiple notes.
  let repeatStart: number = 1
  let curr = walker.currentNode as HTMLElement
  let staffs: Staffs = {}
  let notes: Array<SongNote> = []
  let measures: Array<SongMeasure> = []
  const bpms: Array<Bpm> = []
  const divisions = Number(xml.querySelector('divisions')?.textContent)
  let part = 0
  const timeSignature = { numerator: 4, denominator: 4 }

  function calcWallDuration(duration: number): number {
    // Must calculate the current bpm based on currTime, because various things may change
    // currTime backwards or forwards (part changes, or repeats etc.)
    const bpmIndex = bpms.findIndex((bpm) => bpm.time > currTime) - 1
    const bpm = (bpmIndex < 0 ? bpms[bpms.length - 1] : bpms[bpmIndex])?.bpm ?? 120
    return (1 / (bpm / 60)) * (duration / divisions)
  }

  while (curr) {
    if (curr.tagName === 'clef') {
      let number = Number(curr.getAttribute('number'))
      staffs[number] = staffs[number] || {}
      staffs[number].clef = { sign: curr.querySelector('sign')?.textContent ?? '' }
    } else if (curr.tagName === 'note' && curr.querySelector('rest')) {
      const duration: number = Number(curr.querySelector('duration')?.textContent?.trim())
      currTime += calcWallDuration(duration)
    } else if (curr.tagName === 'note') {
      let tie = curr.querySelector('tie')
      const step = curr.querySelector('step')?.textContent?.trim() ?? ''
      const octave = Number(curr.querySelector('octave')?.textContent?.trim())
      let duration = Number(curr.querySelector('duration')?.textContent?.trim())
      if (isNaN(duration)) {
        // TODO: check for note size and convert to duration.
        console.error('Error: found a note with no duration.')
        duration = 0
      }
      let staff = Number(curr.querySelector('staff')?.textContent?.trim()) ?? part
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
      const lastNoteTime = notes.length > 0 ? notes[notes.length - 1].time : 0
      let time = isChord ? lastNoteTime : currTime
      const noteConversionMap: any = {
        '16th': '16',
        eighth: '8',
        quarter: '4',
        third: '3',
        half: '2',
        whole: '1',
      }
      // divisions  , bpm, duration ;
      // | beats  |                      =  | beats |   *  |    1   | =     1
      // | minute | * (60)ms/minute         |  s    |      |  beats |       s
      // bpm / (60) == quarter beats per second
      // (duration/divisions) =  number of quarter beats
      // (1 / (bpm/60)) * duration/divisions = seconds
      const noteValue = getNoteValue(step, octave, accidental)
      let note: SongNote = {
        pitch: { step, octave },
        duration: calcWallDuration(duration),
        time,
        noteValue,
        staff,
        accidental,
        noteType: noteConversionMap[curr.querySelector('type')?.textContent ?? ''] ?? '4',
      }
      if (tie) {
        let type = tie.getAttribute('type')
        if (type === 'stop') {
          if (openTies.has(noteValue)) {
            openTies.get(noteValue).duration += note.duration
            openTies.delete(noteValue)
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
        currTime += calcWallDuration(duration)
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
      currTime += calcWallDuration(duration)
    } else if (curr.tagName === 'measure') {
      const number = Number(curr.getAttribute('number'))
      // Don't add the same measure multiple times for multi-part xml files.
      if (!measures.find((m) => m.number === number)) {
        measures.push({ time: currTime, number })
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
        currTime += dt
      } else if (curr.getAttribute('direction') === 'forward') {
        repeatStart = currMeasure
      }
    }
    totalDuration = Math.max(totalDuration, currTime)
    curr = walker.nextNode() as HTMLElement
  }

  if (bpms.length === 0) {
    bpms.push({ time: 0, bpm: 120 })
  }

  return {
    staffs,
    duration: totalDuration,
    measures,
    notes,
    bpms,
    timeSignature,
  }
}

const nodeFilter = {
  acceptNode(node: HTMLElement) {
    const acceptable = [
      'note',
      'clef',
      'measure',
      'key',
      'time',
      'backup',
      'forward',
      'meter',
      'sound',
      'part',
      'repeat',
    ]
    return acceptable.some((name) => name === node.tagName)
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_SKIP
  },
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

;(window as any).getSharps = getSharps
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

;(window as any).getSharps = getSharps
;(window as any).getNoteValue = getNoteValue

// TODO: write own parser
export function parseMidi(midiData: ArrayBufferLike): Song {
  const parsed = parseMidiFile(midiData)
  console.error('midi', { parsed })

  const bpms: Array<Bpm> = []
  var ticksPerBeat = parsed.header.ticksPerBeat

  let currTime = 0
  let currTick = 0
  let openNotes = new Map<number, SongNote>() // notes still "on"
  let notes: SongNote[] = []
  let measures: SongMeasure[] = []
  let lastMeasureTickedAt = -Infinity
  let timeSignature = { numerator: 4, denominator: 4 }
  const ticksPerMeasure = () =>
    ticksPerBeat * (timeSignature.numerator / timeSignature.denominator) * 4

  function calcWallDuration(ticks: number): number {
    // (tick / tpb) --> n beats  * bpm / 60 -->  (ticks *60 ) / (tpb * bpm)
    // beats per minute, ticks per beat, ticks  --> seconds
    // 1/b/m = m/b     min    * 60s  = s/b / t/b* t = s              ===>  tpb * tics = beats /bpm = minutes * 60     ticks  * 60 * (   beats   | minutes )
    //                beats     min                                 ===> (tpb / tics) * 60)/bpm = seconds                              (  ticks | beats)

    const bpm = bpms[bpms.length - 1]?.bpm || 120
    return (ticks * 60) / (ticksPerBeat * bpm)
  }

  const orderedEvents = getOrderedMidiEvents(parsed)
  for (let orderedEvent of orderedEvents) {
    let midiEvent: MidiEvent = orderedEvent.event
    currTick += orderedEvent.ticksToEvent
    currTime += calcWallDuration(orderedEvent.ticksToEvent)
    if (currTick - lastMeasureTickedAt >= ticksPerMeasure()) {
      lastMeasureTickedAt = currTick
      measures.push({ time: currTime, number: measures.length + 1 })
    }

    if (midiEvent.subType === 'noteOn') {
      const noteValue = midiEvent.note - 21 // convert to noteValue
      if (openNotes.has(noteValue)) {
        const note = openNotes.get(noteValue)!
        note.duration = calcWallDuration(note.duration)
        openNotes.delete(noteValue)
      }
      let staff = parsed.header.formatType === 0 ? 2 : orderedEvent.track
      if (parsed.tracks.length === 3) {
        if (staff === 1) {
          staff = STAFF.bass
        } else if (staff === 2) {
          staff = STAFF.trebl
        }
      } else if (parsed.tracks.length === 2) {
        if (staff === 0) {
          staff = STAFF.trebl
        } else {
          staff = STAFF.bass
        }
      }

      const note: SongNote = {
        time: currTime,
        duration: 0,
        noteValue,
        staff,
        pitch: getPitch(noteValue),
        accidental: 0,
        velocity: midiEvent.velocity,
        noteType: '4',
      }
      openNotes.set(noteValue, note)
      notes.push(note)
    } else if (midiEvent.subType === 'noteOff') {
      const noteValue = midiEvent.note - 21
      if (openNotes.has(noteValue)) {
        const note = openNotes.get(noteValue)!
        note.duration = currTime - note.time
        openNotes.delete(noteValue)
      }
    } else if (midiEvent.subType === 'setTempo') {
      const bpm = 60000000 / midiEvent.microsecondsPerBeat
      bpms.push({ time: currTime, bpm })
    } else if (midiEvent.subType === 'timeSignature') {
      timeSignature = midiEvent
    }
  }
  let duration = 0
  for (let n of notes) {
    duration = Math.max(duration, n.time + n.duration)
  }

  return {
    duration: currTime,
    measures: measures,
    notes: notes,
    staffs: {},
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
        (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
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
