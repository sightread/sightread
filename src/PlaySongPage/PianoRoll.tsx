import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUserPressedKeys } from '../hooks'
import { useSize } from '../hooks/size'
import Player from '../player'
import { getNote } from '../synth/utils'
import { SongNote } from '../types'
import { isBlack, isBrowser } from '../utils'
import { useSynth } from './utils'

/**
 * XORs the keys. Find all the keys that are in one object but not the other.
 */
function diffKeys<T>(o1: T, o2: T): Array<keyof T> {
  let diff = []
  for (let k in o1) {
    !(k in o2) && diff.push(k)
  }
  for (let k in o2) {
    !(k in o1) && diff.push(k)
  }
  return diff
}

const getNoteId = (n: number | string) => `PIANO_NOTE_${n}`

export default function PianoRoll({
  getKeyColor,
  activeColor,
}: {
  getKeyColor: (pressedKeys: any, midiNote: number, type: 'black' | 'white') => string
  activeColor: string
}) {
  const { width, measureRef } = useSize()
  const prevPressed = useRef({})
  const keyPositions = useMemo(() => getKeyPositions(width), [width])

  useEffect(() => {
    Player.player().subscribe(setNoteColors)
    return () => {
      Player.player().unsubscribe(setNoteColors)
    }
  }, [getKeyColor])

  function setNoteColors(currPressed: { [note: number]: SongNote }) {
    let diff = diffKeys(prevPressed.current, currPressed)
    for (let midiNote of diff) {
      const defaultColor = keyPositions[+midiNote - getNote('A0')].color
      const color = getKeyColor(currPressed, +midiNote, defaultColor)
      const noteEl = document.getElementById(getNoteId(midiNote))
      if (noteEl) {
        noteEl.style.backgroundColor = color
      }
    }
    prevPressed.current = currPressed
  }

  const notes = keyPositions.map((note: any, i: number) => {
    const midiNote = i + getNote('A0')
    const color = getKeyColor({}, midiNote, note.color)
    return (
      <PianoNote
        left={note.left}
        width={note.width}
        height={note.height}
        color={color}
        note={midiNote}
        activeColor={activeColor}
        key={i}
      />
    )
  })

  /**
   *   0  1   2  3  4   5  6   7  8  9   10 11
   *  {A, A#, B, C, C#, D, D#, E, F, F#, G, G#}
   */

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '3.5%', // hack to make it 7% as tall as the width
        paddingBottom: '3.5%',
        boxSizing: 'border-box',
      }}
      ref={measureRef}
    >
      {notes}
    </div>
  )
}

let isMouseDown = false
;(function () {
  const setMouseDown = () => (isMouseDown = true)
  const setMouseUp = () => (isMouseDown = false)
  if (isBrowser()) {
    window.addEventListener('mousedown', setMouseDown, { passive: true })
    window.addEventListener('mouseup', setMouseUp, { passive: true })
  }
})()

type PianoNote = {
  left: number
  width: number
  color: string
  height: number
  note: number
  activeColor: string
}
function PianoNote({ left, width, color, height, note, activeColor }: PianoNote) {
  const [userPressed, setUserPressed] = useState(false)
  const midiKeys: Map<number, number> = useUserPressedKeys()
  const synth = useSynth()

  let pressed = userPressed || midiKeys.has(note)

  return (
    <div
      id={getNoteId(note)}
      style={{
        border: '1px solid #292e49',
        position: 'absolute',
        top: 0,
        left,
        width,
        height,
        backgroundColor: pressed ? activeColor : color,
        zIndex: isBlack(note) ? 1 : 0,
        userSelect: 'none',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        boxSizing: 'border-box',
      }}
      onMouseDown={() => {
        setUserPressed(true)
        synth.playNote(note)
      }}
      onMouseUp={() => {
        setUserPressed(false)
        synth.stopNote(note)
      }}
      onMouseLeave={() => {
        setUserPressed(false)
        synth.stopNote(note)
      }}
      onMouseEnter={() => {
        if (isMouseDown) {
          setUserPressed(true)
          synth.playNote(note)
        }
      }}
    ></div>
  )
}

type PianoKey = {
  left: number
  width: number
  color: 'black' | 'white'
  height: number
}

export function createNoteObject(
  whiteNotes: number,
  whiteWidth: number,
  height: number,
  type: 'black' | 'white',
): PianoKey {
  switch (type) {
    case 'black':
      return {
        left: whiteNotes * whiteWidth - whiteWidth / 4,
        width: whiteWidth / 2,
        color: 'black',
        height: height * (2 / 3),
      }
    case 'white':
      return {
        left: whiteNotes * whiteWidth,
        height: height,
        width: whiteWidth,
        color: 'white',
      }
    default:
      throw new Error('Invalid note type')
  }
}
// 7% as tall as the total width!
// function getKeyboardHeight(width: number) {
//   const whiteWidth = width / 52
//   return (220 / 30) * whiteWidth
// }

export function getKeyPositions(width: number) {
  const whiteWidth = width / 52
  const height = (7 + 1 / 3) * whiteWidth

  const blackNotes = [1, 4, 6, 9, 11]
  const notes: PianoKey[] = []
  let totalNotes = 0

  for (var whiteNotes = 0; whiteNotes < 52; whiteNotes++, totalNotes++) {
    if (blackNotes.includes(totalNotes % 12)) {
      notes.push(createNoteObject(whiteNotes, whiteWidth, height, 'black'))
      totalNotes++
    }
    notes.push(createNoteObject(whiteNotes, whiteWidth, height, 'white'))
  }
  return notes
}
