// Since this is called from Deno as well, we need to use relative paths.
import { getNote } from '../theory'
import { Song, SongMeasure, SongNote, Tracks, Bpm } from '../../types'

export default function parseMusicXml(txt: string): Song {
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
      let track = currTrack
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
      const midiNote = getNote(step + octave) + accidental
      let note: SongNote = {
        type: 'note',
        pitch: { step, octave, alter: accidental },
        duration: calcWallDuration(duration, time),
        time,
        midiNote,
        track,
      }
      if (tie) {
        let type = tie.getAttribute('type')
        const hasTwoTies = curr.querySelectorAll('tie').length > 1
        if (type === 'stop') {
          if (openTies.has(midiNote)) {
            openTies.get(midiNote).duration += note.duration
            // Only end it if the tie doesnt' have a next part as well.
            const i = notes.findIndex((n) => n === openTies.get(midiNote))
            notes.splice(i, 1)
            notes.push(openTies.get(midiNote))
            if (!hasTwoTies) {
              openTies.delete(midiNote)
            }
          } else {
            console.warn('could not close tie', curr)
          }
        } else {
          openTies.set(midiNote, note)
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
      // TODO properly parse this..
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
    // TODO: remove notes/measures separately
    items: [...notes, ...measures].sort((i1, i2) => i1.time - i2.time),
    timeSignature,
    keySignature: 'C',
  }
}
