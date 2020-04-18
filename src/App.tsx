import React from 'react'
import './App.css'
import { useWindowSize } from './hooks/utils'
import { parseMusicXML } from './utils'

function App() {
  const { width, height } = useWindowSize()
  const sheetMusic = {
    songLength: 10,
    notes: [
      { noteLength: 2, keyNumber: 10, posY: 300 },
      { noteLength: 2, keyNumber: 50, posY: 200 },
      { noteLength: 4, keyNumber: 25, posY: 500 },
      { noteLength: 4, keyNumber: 80, posY: 100 },
      { noteLength: 4, keyNumber: 5, posY: 150 },
      { noteLength: 4, keyNumber: 32, posY: 800 },
    ],
  }
  return (
    <div className="App">
      <SongBoard width={width} screenHeight={height} song={sheetMusic} />
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
  const heightPerSecond = 20
  const pianoKeysArray = getKeyPositions(width)
  const height = song.songLength * heightPerSecond + screenHeight
  return (
    <div style={{ position: 'relative', width: width, height: height }}>
      {song.notes.map((note: any) => {
        const key = pianoKeysArray[note.keyNumber]
        return (
          <SongNote
            noteLength={note.noteLength * heightPerSecond}
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
  const blackNotes = [1, 4, 6, 9, 11]
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

parseMusicXML().then((d) => {
  ;(window as any).parsed = d
})

export default App
