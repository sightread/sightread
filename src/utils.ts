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
}

export type Staffs = {
  [staff: number]: {
    notes: Array<SongNote>
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
}

export function parseMusicXML(txt: string): Song {
  /*
   * TODO:
   * - Handle alternative time signatures
   * - Handle non Trebl/Bass clefs
   */

  const xml = new DOMParser().parseFromString(txt, "application/xml")
  const walker = xml.createTreeWalker(xml, NodeFilter.SHOW_ALL, nodeFilter)

  let currTime = 0
  let totalDuration = 0
  let curr = walker.currentNode as HTMLElement
  let currKey = { fifth: 0, mode: "major" }
  let staffs: Staffs = {}
  let measures: Array<SongMeasure> = []
  const divisions = Number(xml.querySelector("divisions")?.textContent)
  while (curr) {
    if (curr.tagName === "clef") {
      let number = Number(curr.getAttribute("number"))
      staffs[number] = staffs[number] || {}
      staffs[number].clef = { sign: curr.querySelector("sign")?.textContent ?? "" }
    } else if (curr.tagName === "note" && curr.querySelector("rest")) {
      const duration = Number(curr.querySelector("duration")?.textContent?.trim())
      currTime += duration
    } else if (curr.tagName === "note") {
      const step = curr.querySelector("step")?.textContent?.trim() ?? ""
      const octave = Number(curr.querySelector("octave")?.textContent?.trim())
      let duration = Number(curr.querySelector("duration")?.textContent?.trim())
      if (isNaN(duration)) {
        // TODO: check for note size and convert to duration.
        console.error("Error: found a note with no duration.")
        duration = 0
      }
      const staff = Number(curr.querySelector("staff")?.textContent?.trim())
      const accidental = Number(curr.querySelector("accidental")?.textContent?.trim() ?? 0)
      const isChord = !!curr.querySelector("chord")
      let time = isChord ? staffs[staff].notes[staffs[staff].notes.length - 1].time : currTime

      let note: SongNote = {
        pitch: { step, octave },
        duration,
        time,
        noteValue: getNoteValue(step, octave, currKey.fifth),
        staff,
        accidental,
      }

      staffs[staff].notes = staffs[staff].notes ?? []
      ;(staffs[staff].notes as any).push(note)
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
      measures.push({ time: currTime, number: Number(curr.getAttribute("number")) })
    } else if (curr.tagName === "key") {
      const fifth = Number(curr.querySelector("fifths")?.textContent?.trim())
      const mode = curr.querySelector("mode")?.textContent?.trim() ?? ""
      currKey = { fifth, mode }
    }
    totalDuration = Math.max(totalDuration, currTime)
    curr = walker.nextNode() as HTMLElement
  }

  return { staffs, duration: totalDuration, measures, divisions }
}

const nodeFilter = {
  acceptNode(node: HTMLElement) {
    const acceptable = ["note", "clef", "measure", "key", "time", "backup", "forward", "meter"]
    return acceptable.some((name) => name === node.tagName)
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_SKIP
  },
}

function getNoteValue(step: string, octave: number, fifth: number) {
  // const stepValues: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }
  const stepValues: any = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const offset = getSharps(fifth)[step] ?? 0

  if (octave === 0) {
    if (step === "A") {
      return 0
    }
    return 1 // 'B';
  }

  return (octave - 1) * 12 + stepValues[step] + offset + 3
}

function getSharps(fifth: number) {
  const cScale = [0, 2, 3, 5, 7, 8, 10]
  const thisScale = cScale.map((n) => (n + fifth * 7 + 12) % 12)
  thisScale.sort((a, b) => a - b)

  const revIndex = ["A", "B", "C", "D", "E", "F", "G"]
  let sharps: any = {}
  let accidentalOffset = fifth > 0 ? 1 : -1
  cScale.forEach((val, i) => {
    if (val !== thisScale[i]) {
      sharps[revIndex[i]] = accidentalOffset
    }
  })
  return sharps
}

;(window as any).getSharps = getSharps
;(window as any).getNoteValue = getNoteValue
