import React from 'react'
import './App.css'
import { useWindowSize } from './hooks/utils'

function App() {
  const { width } = useWindowSize()
  return (
    <div className="App">
      <div style={{ position: 'fixed', bottom: 0 }}>
        <PianoRoll width={width} />
      </div>
    </div>
  )
}

function PianoRoll({ width }: any) {
  const blackNotes = [1, 4, 6, 9, 11]
  const notes = []
  const whiteWidth = width / 52 // 52 white keys in a keyboard.
  const height = (220 / 30) * whiteWidth
  /**
   *   0  1   2  3  4   5  6   7  8  9   10 11
   *  {A, A#, B, C, C#, D, D#, E, F, F#, G, G#}
   */

  let totalNotes = 0
  for (var whiteNotes = 0; whiteNotes < 52; whiteNotes++, totalNotes++) {
    if (blackNotes.includes(totalNotes % 12)) {
      notes.push(
        <PianoNote
          left={whiteNotes * whiteWidth - whiteWidth / 4}
          width={whiteWidth / 2}
          color={'black'}
          height={height * (2 / 3)}
        />,
      )
      totalNotes++
    }
    notes.push(
      <PianoNote
        left={whiteNotes * whiteWidth}
        width={whiteWidth}
        height={height}
        color={'white'}
      />,
    )
  }

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
