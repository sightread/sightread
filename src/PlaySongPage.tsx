import './player'
import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { useWindowSize, usePlayer, useRAFLoop, usePressedKeys } from './hooks'
import { Song, parseMusicXML, parseMidi } from './utils'
import { WebAudioFontSynth } from './player'
import { WindowedSongBoard } from './WindowedSongboard'
import { useParams } from 'react-router'

// const steps: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }

const synth = new WebAudioFontSynth()

function App() {
  const { width, height } = useWindowSize()
  const [playing, setPlaying] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const { player } = usePlayer()
  const [song, setSong] = useState<Song | null>(null)

  const { song_location }: any = useParams()

  useEffect(() => {
    getSong(`/music/${song_location}`).then((song: Song) => {
      setSong(song)
      player.setSong(song)
    })
  }, [song_location, player])

  useEffect(() => {
    const keyboardHandler = (evt: KeyboardEvent) => {
      if (evt.code === 'Space') {
        if (playing) {
          player.pause()
          setPlaying(false)
        } else {
          player.play()
          setPlaying(true)
        }
      }
    }
    window.addEventListener('keydown', keyboardHandler, { passive: true })
    return () => window.removeEventListener('keydown', keyboardHandler)
  }, [playing, player])

  return (
    <div className="App">
      <div
        id="topbar"
        style={{
          position: 'fixed',
          height: 50,
          width,
          zIndex: 2,
          backgroundColor: 'rgb(50,50,50)',
          flexDirection: 'row',
          display: 'flex',
        }}
      >
        <div style={{ position: 'absolute', top: 10, left: 20 }}>
          <i
            className="fa fa-2x fa-arrow-left"
            style={{ color: 'white' }}
            onClick={() => {
              player.pause()
              window.history.back()
            }}
          />
        </div>
        <div
          className="nav-buttons"
          style={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'space-around',
            width: 160,
            height: 50,
            top: 10,
            left: width / 2 - 160 / 2,
          }}
        >
          <i
            className={playing ? 'fa fa-2x fa-pause' : 'fa fa-2x fa-play'}
            style={{ width: 30 }}
            onClick={() => {
              if (!playing) {
                player.play()
                setPlaying(true)
              } else {
                player.pause()
                setPlaying(false)
              }
            }}
          ></i>
          <i
            className="fa fa-2x fa-step-backward"
            style={{ width: 30 }}
            onClick={() => {
              player.stop()
              setPlaying(false)
            }}
          ></i>
          <i
            className={soundOff ? 'fa fa-2x fa-volume-off' : 'fa fa-2x fa-volume-up'}
            style={{ width: 30 }}
            onClick={() => {
              if (!soundOff) {
                player.setVolume(0)
                setSoundOff(true)
              } else {
                player.setVolume(1)
                setSoundOff(false)
              }
            }}
          ></i>
        </div>
        {song && <SongScrubBar song={song} />}
      </div>
      <RuleLines width={width} height={height} />
      {song && <WindowedSongBoard song={song} />}
      <div style={{ position: 'fixed', bottom: 0, height: getKeyboardHeight(width) }}>
        <PianoRoll width={width} />
      </div>
    </div>
  )
}

function RuleLines({ width, height }: any) {
  const widthOfWhiteKey = width / 52
  const getRuleLines = () => {
    const baseStyle = {
      position: 'fixed',
      height,
      width: 1,
      backgroundColor: '#fff',
    }
    return Array.from({ length: 12 }).map((_n, i) => (
      <div key={i}>
        <div
          style={
            {
              ...baseStyle,
              left: widthOfWhiteKey * i * 7 + 5 * widthOfWhiteKey,
              opacity: 0.3,
            } as any
          }
        ></div>
        <div
          style={
            {
              ...baseStyle,
              opacity: 0.4,
              left: widthOfWhiteKey * i * 7 + 2 * widthOfWhiteKey,
            } as any
          }
        ></div>
      </div>
    ))
  }
  return <div id="rule-lines">{getRuleLines()}</div>
}

// TODO: animate filling up the green of current measure
// TODO support seeking to start of current measure
function SongScrubBar({ song }: { song: Song }) {
  const { player } = usePlayer()
  const { width } = useWindowSize()
  const numMeasures = song?.measures?.length ?? 0
  const measureWidth = width / numMeasures
  const divRef = useRef<HTMLDivElement>(null)
  useRAFLoop(() => {
    if (!divRef.current) {
      return
    }
    const progress = Math.min(player.getTime() / song.duration, 1)
    divRef.current.style.transform = `translateX(${progress * width}px)`
  })

  return (
    <div>
      <div
        style={{ position: 'relative', display: 'flex', width, top: '50px' }}
        className="scrub-bar-container"
      >
        {Array.from({ length: numMeasures }).map((n, i) => {
          return (
            <div
              style={{
                height: '100%',
                width: measureWidth,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                border: 'solid #004d40 1px',
                zIndex: 2,
              }}
              key={i}
              onClick={() => player.seek(i)}
            />
          )
        })}
        <div
          style={{
            position: 'absolute',
            height: 'calc(100% )',
            width,
            pointerEvents: 'none',
            backgroundColor: '#009688',
            left: -width,
            zIndex: 1,
          }}
          className="scrubBar"
          ref={divRef}
        ></div>
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width,
            backgroundColor: '#b2dfdb',
            zIndex: 0,
          }}
        ></div>
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

function isBlack(noteValue: number) {
  return [1, 4, 6, 9, 11].some((x) => noteValue % 12 === x)
}

const MemoedPianoNote = React.memo(PianoNote)
function PianoRoll({ width }: any) {
  const pressedKeys = usePressedKeys()
  const notes = getKeyPositions(width).map((note: any, i: any) => {
    let color = note.color
    if (pressedKeys[i]) {
      let { staff, noteValue } = pressedKeys[i]
      const hand = staff === 1 ? 'left-hand' : 'right-hand'
      if (hand === 'left-hand') {
        if (isBlack(noteValue)) {
          color = '#2c6e78'
        } else {
          color = '#4dd0e1'
        }
      } else {
        if (isBlack(noteValue)) {
          color = '#c65a00'
        } else {
          color = '#ef6c00'
        }
      }
    }
    return (
      <MemoedPianoNote
        left={note.left}
        width={note.width}
        height={note.height}
        color={color}
        noteValue={i}
        key={i}
      />
    )
  })
  /**
   *   0  1   2  3  4   5  6   7  8  9   10 11
   *  {A, A#, B, C, C#, D, D#, E, F, F#, G, G#}
   */

  return (
    <div style={{ position: 'relative', width, height: getKeyboardHeight(width) }}>{notes}</div>
  )
}

let isMouseDown = false
window.addEventListener('mousedown', () => (isMouseDown = true), { passive: true })
window.addEventListener('mouseup', () => (isMouseDown = false), { passive: true })

function PianoNote({ left, width, color, height, noteValue }: any) {
  const [userPressed, setUserPressed] = useState(false)
  return (
    <div
      style={{
        border: '1px solid #292e49',
        position: 'absolute',
        top: 0,
        left,
        width,
        height,
        backgroundColor: userPressed ? 'grey' : color,
        zIndex: isBlack(noteValue) ? 1 : 0,
        userSelect: 'none',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
      }}
      onMouseDown={() => {
        setUserPressed(true)
        synth.playNoteValue(noteValue)
      }}
      onMouseUp={() => {
        setUserPressed(false)
        synth.stopNoteValue(noteValue)
      }}
      onMouseLeave={() => {
        setUserPressed(false)
        synth.stopNoteValue(noteValue)
      }}
      onMouseEnter={() => {
        if (isMouseDown) {
          setUserPressed(true)
          synth.playNoteValue(noteValue)
        }
      }}
    ></div>
  )
}

async function getSong(url: string) {
  if (url.includes('.xml')) {
    const xml = await (await fetch(url)).text()
    return parseMusicXML(xml)
  }
  const buffer = await (await fetch(url)).arrayBuffer()
  return parseMidi(buffer)
}

export default App
