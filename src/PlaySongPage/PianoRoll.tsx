import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSize } from '../hooks/size'
import midiState from '../midi'
import Player from '../player'
import { getNote } from '../synth/utils'
import { SongNote } from '../types'
import { isBlack, isBrowser } from '../utils'

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

type PianoRollProps = {
  getKeyColor: (pressedKeys: any, midiNote: number, type: 'black' | 'white') => string
  activeColor: string
  onNoteDown?: (midiNote: number) => void
  onNoteUp?: (midiNote: number) => void
}
export function PianoRoll({ getKeyColor, activeColor, onNoteUp, onNoteDown }: PianoRollProps) {
  const { width, measureRef } = useSize()
  const prevPressed = useRef({})
  const keyPositions = useMemo(() => getKeys(width), [width])

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
        onNoteDown={onNoteDown}
        onNoteUp={onNoteUp}
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
        display: 'flex',
        flexDirection: 'row',
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

type PianoNoteProps = {
  left: number
  width: number
  color: string
  height: number
  note: number
  activeColor: string
  onNoteDown?: (midiNote: number) => void
  onNoteUp?: (midiNote: number) => void
}
function PianoNote({
  left,
  width,
  color,
  height,
  note,
  activeColor,
  onNoteDown,
  onNoteUp,
}: PianoNoteProps) {
  const [userPressed, setUserPressed] = useState(false)
  const midiKeys = midiState.getPressedNotes()
  let pressed = userPressed || midiKeys.has(note)

  return (
    <div
      id={getNoteId(note)}
      style={{
        border: '1px solid #292e49',
        marginLeft: isBlack(note) ? -(width / 2) : 0,
        marginRight: isBlack(note) ? -(width / 2) : 0,
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
        onNoteDown?.(note)
      }}
      onMouseUp={() => {
        setUserPressed(false)
        onNoteUp?.(note)
      }}
      onMouseLeave={() => {
        if (!userPressed) {
          return
        }
        setUserPressed(false)
        onNoteUp?.(note)
      }}
      onMouseEnter={() => {
        if (isMouseDown) {
          setUserPressed(true)
          onNoteDown?.(note)
        }
      }}
    ></div>
  )
}

type PianoKey = {
  width: number
  height: number
  color: 'black' | 'white'
}

function getKeys(totalWidth: number): PianoKey[] {
  const whiteWidth = totalWidth / 52
  const whiteHeight = (7 + 1 / 3) * whiteWidth
  const blackWidth = whiteWidth / 2
  const blackHeight = whiteHeight * (2 / 3)
  const isBlack = (n: number) => [1, 4, 6, 9, 11].includes(n % 12)

  return Array.from({ length: 88 }).map((_, noteIndex) => {
    if (isBlack(noteIndex)) {
      return { width: blackWidth, height: blackHeight, color: 'black' }
    }
    return { width: whiteWidth, height: whiteHeight, color: 'white' }
  })
}
