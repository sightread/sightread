import React, { useEffect, useRef, useState } from 'react'
import { useSize } from '@/hooks'
import { getNoteSizes, range } from '@/utils'
import { diffKeys, isBlack, isBrowser } from '@/utils'
import { getKey } from '@/features/synth'
import { getOctave } from '@/features/synth/utils'

const getNoteId = (n: number | string) => `PIANO_NOTE_${n}`

export type SubscriptionCallback =
  | null
  | ((pressedKeys: { [note: number]: { color?: string | void } }) => void)

export type PianoRollProps = {
  activeColor: string
  onNoteDown?: (midiNote: number) => void
  onNoteUp?: (midiNote: number) => void
  startNote?: number
  endNote?: number
  setKeyColorUpdater?: (cb: SubscriptionCallback | null) => void
}

export default function PianoRoll({
  activeColor,
  onNoteUp,
  onNoteDown,
  startNote,
  endNote,
  setKeyColorUpdater,
}: PianoRollProps) {
  const { width, measureRef } = useSize()
  const prevPressed = useRef({})
  startNote = startNote ?? 21
  endNote = endNote ?? 108

  useEffect(() => {
    setKeyColorUpdater?.(setNoteColors)
    return function cleanup() {
      setKeyColorUpdater?.(null)
    }
  }, [setKeyColorUpdater])

  function setNoteColors(currPressed: { [note: number]: { color?: string | void } }) {
    let diff = diffKeys(prevPressed.current, currPressed)
    for (let midiNote of diff) {
      const noteEl = document.getElementById(getNoteId(midiNote))
      if (!noteEl) {
        continue
      }

      const defaultColor = isBlack(midiNote) ? 'black' : 'white'
      const isActive = midiNote in currPressed
      const color = isActive ? currPressed[midiNote].color ?? activeColor : defaultColor

      noteEl.style.backgroundColor = color
    }
    prevPressed.current = currPressed
  }

  const whiteKeysCount = range(startNote, endNote)
    .map((n) => !isBlack(n))
    .filter(Boolean).length
  const sizes = getNoteSizes(width, whiteKeysCount)
  const notes = range(startNote, endNote).map((midiNote) => {
    return (
      <PianoNote
        width={isBlack(midiNote) ? sizes.blackWidth : sizes.whiteWidth}
        height={isBlack(midiNote) ? sizes.blackHeight : sizes.whiteHeight}
        note={midiNote}
        activeColor={activeColor}
        key={midiNote}
        onNoteDown={onNoteDown}
        onNoteUp={onNoteUp}
      />
    )
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
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
  height: number
  note: number
  activeColor: string
  onNoteDown?: (midiNote: number) => void
  onNoteUp?: (midiNote: number) => void
}
function PianoNote({ width, height, note, activeColor, onNoteDown, onNoteUp }: PianoNoteProps) {
  const [userPressed, setUserPressed] = useState(false)
  const color = isBlack(note) ? 'black' : 'white'
  const isC = getKey(note) == 'C'

  return (
    <div
      id={getNoteId(note)}
      style={{
        border: '1px solid #292e49',
        margin: isBlack(note) ? `0 -${width / 2}px` : 0,
        width,
        height,
        backgroundColor: userPressed ? activeColor : color,
        zIndex: isBlack(note) ? 1 : 0,
        userSelect: 'none',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
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
    >
      {isC && (
        <div
          style={{
            bottom: 0,
            opacity: 0.7,
            paddingBottom: 10,
          }}
        >
          {getKey(note) + getOctave(note)}
        </div>
      )}
    </div>
  )
}
