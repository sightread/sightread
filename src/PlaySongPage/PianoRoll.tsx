import React, { useEffect, useRef, useState } from 'react'
import { useSize } from '../hooks/size'
import midiState from '../midi'
import Player from '../player'
import { getKey, getNote } from '../synth/utils'
import { SongNote } from '../types'
import { diffKeys, isBlack, isBrowser } from '../utils'


const getNoteId = (n: number | string) => `PIANO_NOTE_${n}`

type PianoRollProps = {
  getKeyColor: (pressedKeys: any, midiNote: number) => string
  activeColor: string
  onNoteDown?: (midiNote: number) => void
  onNoteUp?: (midiNote: number) => void
}
export function PianoRoll({ getKeyColor, activeColor, onNoteUp, onNoteDown }: PianoRollProps) {
  const { width, measureRef } = useSize()
  const prevPressed = useRef({})
  if (!getKeyColor) {
    getKeyColor = (_, midiNote) => (isBlack(midiNote) ? 'black' : 'white')
  }

  useEffect(() => {
    Player.player().subscribe(setNoteColors)
    return () => {
      Player.player().unsubscribe(setNoteColors)
    }
  }, [getKeyColor])

  function setNoteColors(currPressed: { [note: number]: SongNote }) {
    let diff = diffKeys(prevPressed.current, currPressed)
    for (let midiNote of diff) {
      const noteEl = document.getElementById(getNoteId(midiNote))
      if (noteEl) {
        const color = getKeyColor(currPressed, +midiNote)
        noteEl.style.backgroundColor = color
      }
    }
    prevPressed.current = currPressed
  }

  const sizes = getNoteSizes(width)
  const notes = Array.from({ length: 88 }).map((_, i: number) => {
    const midiNote = i + getNote('A0')
    const color = getKeyColor({}, midiNote)
    return (
      <PianoNote
        width={isBlack(midiNote) ? sizes.blackWidth : sizes.whiteWidth}
        height={isBlack(midiNote) ? sizes.blackHeight : sizes.whiteHeight}
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
  width: number
  color: string
  height: number
  note: number
  activeColor: string
  onNoteDown?: (midiNote: number) => void
  onNoteUp?: (midiNote: number) => void
}
function PianoNote({
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
        margin: isBlack(note) ? `0 -${width / 2}px` : 0,
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

function getNoteSizes(width: number) {
  const whiteWidth = width / 52
  const whiteHeight = (7 + 1 / 3) * whiteWidth
  const blackWidth = whiteWidth / 2
  const blackHeight = whiteHeight * (2 / 3)

  return { whiteWidth, whiteHeight, blackWidth, blackHeight }
}
