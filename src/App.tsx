import './player'
import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { useWindowSize } from './hooks/utils'
import { parseMusicXML } from './utils'
import Player, { WebAudioFontSynth } from './player'

// const steps: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }

const xml = parseMusicXML()
const synth = new WebAudioFontSynth()
let player: any

function App() {
  const { width, height } = useWindowSize()
  const [notes, setNotes]: any = useState({ duration: 0, staffs: {} })
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    xml.then((d) => {
      setNotes(d)
      player = new Player(d)
    })
  }, [])

  return (
    <div className="App">
      {notes && (
        <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 2 }}>
          <button
            onClick={() => {
              player.play()
              setPlaying(true)
            }}
          >
            Play
          </button>
          <button
            onClick={() => {
              player.pause()
              setPlaying(false)
            }}
          >
            Pause
          </button>
          <button
            onClick={() => {
              player.stop()
              setPlaying(false)
            }}
          >
            Stop
          </button>
          <input type="range" min="0" max={notes?.duration ?? 0} />
        </div>
      )}
      <SongBoard
        width={width}
        screenHeight={height}
        song={notes}
        playing={playing}
        player={player}
      />
      <div style={{ position: 'fixed', bottom: 0 }}>
        <PianoRoll
          width={width}
          onSelectNote={(noteValue: any) => {
            synth.playNoteValue(noteValue)
          }}
          onDeselectNote={(noteValue: any) => {
            synth.stopNoteValue(noteValue)
          }}
          player={player}
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

function getKeyboardHeight(width: number) {
  const whiteWidth = width / 52
  return (220 / 30) * whiteWidth
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

function SongBoard({ width, screenHeight, song, playing, player }: any) {
  const height = song.duration * 40 + screenHeight
  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current === null) {
      return
    }

    const node = scrollRef.current as any
    if (playing) {
      const bpm = 180
      const duration = ((song.duration - player.currentSongTime) / bpm) * 60 * 1000
      const end = -(height - screenHeight)
      const start = (player.currentSongTime / song.duration) * end
      let animation = node.animate([{ bottom: `${start}px` }, { bottom: `${end}px` }], {
        duration,
      })
      return () => animation.pause()
    } else {
      // node.scrollTop = (song.duration - 0) /* time*/ * 40 + getKeyboardHeight(width)
    }
  }, [song, playing, height, screenHeight, player])

  const notes = Object.values(song.staffs).flatMap((x: any) => x.notes)
  const pianoKeysArray = getKeyPositions(width)
  return (
    <div style={{ position: 'fixed', overflow: 'hidden', height: screenHeight, width }}>
      <div
        ref={scrollRef}
        style={{
          position: 'absolute',
          height,
          overflow: 'hidden',
          width: '100%',
          bottom: 0,
        }}
      >
        {notes.map((note: any, i) => {
          const key = pianoKeysArray[note.noteValue]
          return (
            <SongNote
              noteLength={note.duration * 40}
              width={key.width}
              posX={key.left}
              posY={note.time * 40 + getKeyboardHeight(width)}
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
  const className = note.staff === 1 ? 'left-hand' : 'right-hand'
  return (
    <div
      style={{
        height: noteLength,
        width,
        position: 'absolute',
        bottom: posY,
        left: posX,
        textAlign: 'center',
        borderRadius: '15px',
      }}
      className={className}
    >
      {/* {note.pitch.step},{note.pitch.octave},{note.noteValue} */}
    </div>
  )
}

function PianoRoll({ width, onSelectNote, onDeselectNote, player }: any) {
  // const blackNotes = [1, 4, 6, 9, 11]
  const [pressedKeys, setPressedKeys]: any = useState({})
  useEffect(() => {
    let handler = setInterval(() => {
      if (player) {
        setPressedKeys(player.getPressedKeys())
      }
    }, 25)
    return () => clearInterval(handler)
  }, [pressedKeys, setPressedKeys, player])

  const getPressedColor = (staff: number) => (staff === 1 ? '#4dd0e1' : '#ef6c00')
  const notes = getKeyPositions(width).map((note: any, i: any) => (
    <PianoNote
      left={note.left}
      width={note.width}
      height={note.height}
      color={!!pressedKeys[i] ? getPressedColor(pressedKeys[i].staff) : note.color}
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
