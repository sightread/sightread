import './player'
import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import { useWindowSize } from './hooks/utils'
import { parseMusicXML } from './utils'
import Player, { Synth } from './player'

// const steps: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }

const xml = parseMusicXML()
const synth = new Synth()
let player: any

function App() {
  const { width, height } = useWindowSize()
  const [notes, setNotes]: any = useState({ duration: 0, staffs: {} })

  useEffect(() => {
    xml.then((d) => {
      setNotes(d)
      player = new Player(d)
    })
  }, [])

  return (
    <div className="App">
      {/* <SongBoard width={width} screenHeight={height} song={notes} time={-1} /> */}
      {notes && <button onClick={() => player.play()}>Play</button>}
      <div style={{ position: 'fixed', bottom: 0 }}>
        <PianoRoll
          width={width}
          onSelectNote={(noteValue: any) => {
            synth.playNoteValue(noteValue)
          }}
          onDeselectNote={(noteValue: any) => {
            synth.stopNoteValue(noteValue)
          }}
        />
      </div>
    </div>
  )
}
function createNoteObject(whiteNotes: any, whiteWidth: any, height: any, type: any) {
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
      throw Error('Invalid note type')
  }
}

function getKeyPositions(width: any) {
  const whiteWidth = width / 52
  const height = (220 / 30) * whiteWidth

  const blackNotes = [1, 4, 6, 9, 11]
  const notes: any = []
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

function SongBoard({ width, screenHeight, song, time }: any) {
  const scrollRef = useCallback(
    (node) => {
      if (node !== null) {
        node.scrollTop = (song.duration - time) * 40
      }
    },
    [song, time],
  )

  const notes = Object.values(song.staffs)
    .map((x: any) => x.notes)
    .flat(Infinity)
  const pianoKeysArray = getKeyPositions(width)
  const height = song.duration * 40 + screenHeight
  return (
    <div
      ref={scrollRef}
      style={{ position: 'absolute', height: screenHeight, overflow: 'hidden', width: '100%' }}
    >
      <div style={{ position: 'absolute', height }}>
        {notes.map((note: any, i) => {
          const key = pianoKeysArray[note.noteValue]
          return (
            <SongNote
              noteLength={note.duration * 40}
              width={key.width}
              posX={key.left}
              posY={note.time * 40}
              note={note}
              key={i}
            />
          )
        })}
      </div>
    </div>
  )
}

function SongNote({ note, noteLength, width, posX, posY }: any) {
  return (
    <div
      style={{
        backgroundColor: '#009688',
        height: noteLength,
        width,
        position: 'absolute',
        bottom: posY,
        left: posX,
        textAlign: 'center',
        borderRadius: '15px',
      }}
    >
      {note.pitch.step},{note.pitch.octave},{note.noteValue}
    </div>
  )
}

function PianoRoll({ width, onSelectNote, onDeselectNote }: any) {
  // const blackNotes = [1, 4, 6, 9, 11]
  const notes = getKeyPositions(width).map((note: any, i: any) => (
    <PianoNote
      left={note.left}
      width={note.width}
      height={note.height}
      color={note.color}
      key={i}
      onSelect={() => onSelectNote(i)}
      onDeselect={() => onDeselectNote(i)}
    />
  ))
  const whiteWidth = width / 52 // 52 white keys in a keyboard.
  const height = (220 / 30) * whiteWidth
  /**
   *   0  1   2  3  4   5  6   7  8  9   10 11
   *  {A, A#, B, C, C#, D, D#, E, F, F#, G, G#}
   */

  return <div style={{ position: 'relative', width, height }}>{notes}</div>
}

let isMouseDown = false
window.addEventListener('mousedown', () => (isMouseDown = true))
window.addEventListener('mouseup', () => (isMouseDown = false))

function PianoNote({ left, width, color, height, onSelect, onDeselect }: any) {
  return (
    <div
      style={{
        border: '1px solid #292e49',
        position: 'absolute',
        top: 0,
        left,
        width,
        height,
        backgroundColor: color,
        zIndex: color === 'white' ? 0 : 1,
        userSelect: 'none',
      }}
      onMouseDown={onSelect}
      onMouseUp={onDeselect}
      onMouseLeave={onDeselect}
      onMouseEnter={() => isMouseDown && onSelect()}
    ></div>
  )
}

export default App
