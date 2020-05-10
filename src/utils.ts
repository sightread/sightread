import { parseMidiFile, MidiEvent } from "jasmid.ts"

export type SongNote = {
  noteValue: number
  staff: number
  duration: number
  time: number
  pitch: {
    step: string
    octave: number
  }
  accidental: number // 1 | -1 | 0
  velocity?: number
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

export type Song = {
  staffs: Staffs
  duration: number
  divisions: number
  measures: Array<SongMeasure>
  notes: Array<SongNote>
  bpms: Array<{ time: number; bpm: number }>
}

export function parseMusicXML(txt: string): Song {
  /*
   * TODO:
   * - Handle alternative time signatures
   * - Handle non Trebl/Bass clefs
   */

  const xml = new DOMParser().parseFromString(txt, "application/xml")
  const walker = xml.createTreeWalker(xml, NodeFilter.SHOW_ALL, nodeFilter)

  let bpm = 120
  let currTime = 0
  let totalDuration = 0
  let openTies = new Map() // A tie in music is when a note should be held down for multiple notes.
  let curr = walker.currentNode as HTMLElement
  let currKey = { fifth: 0, mode: "major" }
  let staffs: Staffs = {}
  let notes: Array<SongNote> = []
  let measures: Array<SongMeasure> = []
  const bpms = []
  const divisions = Number(xml.querySelector("divisions")?.textContent)
  let part = 0
  while (curr) {
    if (curr.tagName === "clef") {
      let number = Number(curr.getAttribute("number"))
      staffs[number] = staffs[number] || {}
      staffs[number].clef = { sign: curr.querySelector("sign")?.textContent ?? "" }
    } else if (curr.tagName === "note" && curr.querySelector("rest")) {
      const duration = Number(curr.querySelector("duration")?.textContent?.trim())
      currTime += duration
    } else if (curr.tagName === "note") {
      let tie = curr.querySelector("tie")
      const step = curr.querySelector("step")?.textContent?.trim() ?? ""
      const octave = Number(curr.querySelector("octave")?.textContent?.trim())
      let duration = Number(curr.querySelector("duration")?.textContent?.trim())
      if (isNaN(duration)) {
        // TODO: check for note size and convert to duration.
        console.error("Error: found a note with no duration.")
        duration = 0
      }
      const staff = Number(curr.querySelector("staff")?.textContent?.trim()) || part
      let accidental: any = curr.querySelector("accidental")?.textContent?.trim()
      if (!accidental || accidental === "natural") {
        accidental = 0
      } else if (accidental === "sharp") {
        accidental = 1
      } else if (accidental === "flat") {
        accidental = -1
      } else {
        accidental = Number(curr.querySelector("accidental")?.textContent?.trim() ?? 0)
        console.error("JAKE THIS HAPPENED, THERES AN ACCIDENTAL NUMBER IN THE XML", curr.innerHTML)
      }
      if (curr.querySelector("alter")) {
        accidental = Number(curr.querySelector("alter")?.textContent?.trim()) ?? 0
      }
      const isChord = !!curr.querySelector("chord")
      const lastNoteTime = notes.length > 0 ? notes[notes.length - 1].time : 0
      let time = isChord ? lastNoteTime : currTime

      const noteValue = getNoteValue(step, octave, currKey.fifth, accidental)
      let note: SongNote = {
        pitch: { step, octave },
        duration,
        time,
        noteValue,
        staff,
        accidental,
      }
      if (tie) {
        let type = tie.getAttribute("type")
        if (type === "stop") {
          if (openTies.has(noteValue)) {
            openTies.get(noteValue).duration += duration
            openTies.delete(noteValue)
          } else {
            console.warn("could not close tie", curr)
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
        currTime += duration
      }
    } else if (curr.tagName === "backup") {
      let duration = Number(curr.querySelector("duration")?.textContent?.trim())
      console.assert(duration)
      currTime -= duration
    } else if (curr.tagName === "forward") {
      let duration = Number(curr.querySelector("duration")?.textContent?.trim())
      if (isNaN(duration)) {
        console.error(`note duration!!`, curr.querySelector("duration"))
        duration = 0
      }
      currTime += duration
    } else if (curr.tagName === "measure") {
      const number = Number(curr.getAttribute("number"))
      // Don't add the same measure multiple times for multi-part xml files.
      if (!measures.find((m) => m.number === number)) {
        measures.push({ time: currTime, number })
      }
    } else if (curr.tagName === "key") {
      const fifth = Number(curr.querySelector("fifths")?.textContent?.trim())
      const mode = curr.querySelector("mode")?.textContent?.trim() ?? ""
      currKey = { fifth, mode }
    } else if (curr.tagName === "sound") {
      if (curr.hasAttribute("tempo")) {
        bpm = Number(curr.getAttribute("tempo"))
        bpms.push({ time: currTime, bpm })
      }
    } else if (curr.tagName === "part") {
      currTime = 0
      part = Number(curr.getAttribute("id")?.slice(1))
    }
    totalDuration = Math.max(totalDuration, currTime)
    curr = walker.nextNode() as HTMLElement
  }

  return { staffs, duration: totalDuration, measures, divisions, notes, bpms }
}

const nodeFilter = {
  acceptNode(node: HTMLElement) {
    const acceptable = [
      "note",
      "clef",
      "measure",
      "key",
      "time",
      "backup",
      "forward",
      "meter",
      "sound",
      "part",
    ]
    return acceptable.some((name) => name === node.tagName)
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_SKIP
  },
}

function getNoteValue(
  step: string,
  octave: number,
  fifth: number,
  accidental: number = 0,
  alter: number = 0,
) {
  // const stepValues: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }
  const stepValues: any = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  // let offset = getSharps(fifth)[step] ?? 0
  let offset = 0

  if (octave === 0) {
    if (step === "A") {
      return 0
    }
    return 1 // 'B';
  }

  return (octave - 1) * 12 + stepValues[step] + offset + 3 + accidental
}

;(window as any).getSharps = getSharps
function getSharps(fifth: number) {
  const cScale = [0, 2, 3, 5, 7, 8, 10]
  const thisScale = cScale.map((n) => (((n + fifth * 7 + 12) % 12) + 12) % 12)
  thisScale.sort((a, b) => a - b)

  const revIndex = ["A", "B", "C", "D", "E", "F", "G"]
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
  console.error("midi", { parsed })

  const bpms: Array<{ time: number; bpm: number }> = []
  var ticksPerBeat = parsed.header.ticksPerBeat

  let currTime = 0
  let openNotes = new Map<number, SongNote>() // notes still "on"
  let notes: SongNote[] = []
  let timeSignature = { numerator: 4, denominator: 4 }
  // let keySignature = {}

  const orderedEvents = getOrderedMidiEvents(parsed)
  for (let orderedEvent of orderedEvents) {
    let midiEvent: MidiEvent = orderedEvent.event
    currTime += orderedEvent.ticksToEvent

    if (midiEvent.subType === "noteOn") {
      const noteValue = midiEvent.note - 21 // convert to noteValue
      if (openNotes.has(noteValue)) {
        const note = openNotes.get(noteValue)!
        note.duration = currTime - note.time
        openNotes.delete(noteValue)
      }
      const note: SongNote = {
        time: currTime,
        duration: 0,
        noteValue,
        staff: 0,
        pitch: {} as any,
        accidental: 0,
        velocity: midiEvent.velocity,
      }
      openNotes.set(noteValue, note)
      notes.push(note)
    } else if (midiEvent.subType === "noteOff") {
      const noteValue = midiEvent.note - 21
      if (openNotes.has(noteValue)) {
        const note = openNotes.get(noteValue)!
        note.duration = currTime - note.time
        openNotes.delete(noteValue)
      }
    } else if (midiEvent.subType === "setTempo") {
      const bpm = 60000000 / midiEvent.microsecondsPerBeat
      bpms.push({ time: (currTime / ticksPerBeat) * 4, bpm })
    } else if (midiEvent.subType === "timeSignature") {
      timeSignature = midiEvent
    }
  }

  notes.forEach((n) => {
    n.time = (n.time / ticksPerBeat) * 4
    n.duration = (n.duration / ticksPerBeat) * 4
  })

  let measures = []
  const ticksPerMeasure = ticksPerBeat * (timeSignature.numerator / timeSignature.denominator) * 4
  for (let i = 0; i < currTime / ticksPerMeasure; i++) {
    measures.push({ number: i, time: ((i * ticksPerMeasure) / ticksPerBeat) * 4 })
  }

  return {
    duration: (currTime / ticksPerBeat) * 4,
    divisions: 4,
    measures: measures,
    notes: notes,
    staffs: {},
    bpms,
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
