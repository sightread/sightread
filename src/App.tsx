import React, { useState, useEffect } from 'react'
import './App.css'
import { useWindowSize } from './hooks/utils'
import { parseMusicXML } from './utils'

// const steps: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }

const xml = parseMusicXML()

function App() {
  const { width, height } = useWindowSize()
  const [notes, setNotes]: any = useState({ duration: 0, staffs: {} })

  useEffect(() => {
    xml.then((d) => {
      setNotes(d)
    })
  }, [])

  return (
    <div className="App">
      <div>
        <SongBoard width={width} screenHeight={height} song={notes} />
      </div>
      <div style={{ position: 'fixed', bottom: 0 }}>
        <PianoRoll width={width} />
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

function SongBoard({ width, screenHeight, song }: any) {
  const notes = Object.values(song.staffs)
    .map((x: any) => x.notes)
    .flat(Infinity)
  const pianoKeysArray = getKeyPositions(width)
  const height = song.duration * 40 + screenHeight
  return (
    <div style={{ position: 'relative', width: width, height: height }}>
      {notes.map((note: any) => {
        const key = pianoKeysArray[note.noteValue]
        return (
          <SongNote
            noteLength={note.duration * 40}
            width={key.width}
            posX={key.left}
            posY={note.time * 40 + screenHeight}
            note={note}
          />
        )
      })}
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

function PianoRoll({ width }: any) {
  // const blackNotes = [1, 4, 6, 9, 11]
  const notes = getKeyPositions(width).map((noteConfig: any, i: any) => (
    <PianoNote
      left={noteConfig.left}
      width={noteConfig.width}
      height={noteConfig.height}
      color={noteConfig.color}
      key={i}
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

function PianoNote({ left, width, color, height }: any) {
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
      }}
    ></div>
  )
}

export default App
