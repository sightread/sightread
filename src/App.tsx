import React, { useState, useEffect } from 'react'
import './App.css'
import { useWindowSize } from './hooks/utils'
import { parseMusicXML } from './utils'

const step: any = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6 }

function formatNote(note: any, height: number) {
  const noteLength = note.duration
  const posY = note.time * 100 + height
  const keyNumber = 12 * note.pitch.octave + step[note.pitch.step]
  return { noteLength, posY, keyNumber }
}
const xml = parseMusicXML()

function App() {
  const { width, height } = useWindowSize()
  const [notes, setNotes]: any = useState()

  useEffect(() => {
    xml.then((d) => {
      ;(window as any).parsed = d
      setNotes(d)
    })
  }, [])

  // const sheetMusic = {
  //   songLength: 10,
  //   notes: [
  //     { noteLength: 2, keyNumber: 10, posY: 300 },
  //     { noteLength: 2, keyNumber: 50, posY: 200 },
  //     { noteLength: 4, keyNumber: 25, posY: 500 },
  //     { noteLength: 4, keyNumber: 80, posY: 600 },
  //     { noteLength: 4, keyNumber: 5, posY: 150 },
  //     { noteLength: 4, keyNumber: 32, posY: 800 },
  //   ],
  // }
  const getSongConfig = () => {
    if (!notes) {
      return { songLength: 0, notes: [] }
    }
    const leftNotes = notes.staffs['1'].notes
    const rightNotes = notes.staffs['2'].notes
    let songLength = 0
    const parsedNotes = [...leftNotes, ...rightNotes].map((note) => {
      songLength += note.duration
      return formatNote(note, height)
    })
    return { songLength, notes: parsedNotes }
  }
  return (
    <div className="App">
      <SongBoard width={width} screenHeight={height} song={getSongConfig()} />
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
  // console.log('song config', song)
  const pianoKeysArray = getKeyPositions(width)
  const height = song.songLength * 40 + screenHeight
  return (
    <div style={{ position: 'relative', width: width, height: height }}>
      {song.notes.map((note: any) => {
        const key = pianoKeysArray[note.keyNumber]
        return (
          <SongNote
            noteLength={note.noteLength * 50}
            width={key.width}
            posX={key.left}
            posY={note.posY}
          />
        )
      })}
    </div>
  )
}

function SongNote({ noteLength, width, posX, posY }: any) {
  return (
    <div
      style={{
        backgroundColor: '#009688',
        height: noteLength,
        width,
        position: 'absolute',
        bottom: posY,
        left: posX,
      }}
    ></div>
  )
}

function PianoRoll({ width }: any) {
  // const blackNotes = [1, 4, 6, 9, 11]
  const notes = getKeyPositions(width).map((noteConfig: any) => (
    <PianoNote
      left={noteConfig.left}
      width={noteConfig.width}
      height={noteConfig.height}
      color={noteConfig.color}
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
