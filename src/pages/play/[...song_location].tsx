import '../../player'
import React, { useState, useEffect, useRef } from 'react'
import {
  useWindowSize,
  usePlayer,
  useRAFLoop,
  useSongPressedKeys,
  useUserPressedKeys,
  useQuery,
} from '../../hooks'
import { Song } from '../../parsers'
import { WebAudioFontSynth } from '../../synth'
import { WindowedSongBoard } from '../../WindowedSongboard'
import { WindowedStaffBoard } from '../../StaffPage'
import midiKeyboard from '../../midi'
import { useRouter } from 'next/router'
import { formatTime, getSong, inferHands, isBrowser } from '../../utils'

// const steps: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }
// const pathToSongs =
const synth = new WebAudioFontSynth()
type viz = 'falling-notes' | 'sheet'

export type Hand = 'both' | 'left' | 'right'
export type SongConfig = { config: { left?: number; right?: number } }
export type PlayableSong = Song & SongConfig

function App() {
  const { width, height } = useWindowSize()
  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [query, setQuery] = useQuery()
  const [rangeSelecting, setRangeSelecting] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const { player } = usePlayer()
  const [song, setSong] = useState<PlayableSong | null>(null)
  const [hand, setHand] = useState<Hand>('both')
  const router = useRouter()
  const viz: viz = query.viz ?? 'falling-notes'

  let songLocation = ''
  if (isBrowser()) {
    songLocation = window.location.pathname.substring(6)
  }

  const handleHand = (selected: Hand) => {
    if (hand === selected) {
      setHand('both')
      return
    }
    setHand(selected)
  }
  useEffect(() => {
    player.setHand(hand)
  }, [hand])

  // Register ummount fns
  useEffect(() => {
    return () => {
      player.stop()
    }
  }, [])

  useEffect(() => {
    getSong(songLocation)
      .then(inferHands)
      .then((song: PlayableSong) => {
        setSong(song)
        player.setSong(song)
      })
    midiKeyboard.virtualKeyboard = true

    return function cleanup() {
      midiKeyboard.virtualKeyboard = false
    }
  }, [songLocation, player])

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
          height: 55,
          width,
          zIndex: 2,
          backgroundColor: '#292929',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <i
          className="fas fa-arrow-left"
          style={{ fontSize: 30, position: 'relative', left: 15 }}
          onClick={() => {
            player.pause()
            router.push(`/`)
          }}
        />
        <div
          className="nav-buttons"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-around',
            width: 225,
          }}
        >
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <i
            className="fas fa-step-backward"
            style={{ fontSize: 24 }}
            onClick={() => {
              player.stop()
              setPlaying(false)
            }}
          />
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <i
            className={playing ? 'fas fa-pause' : 'fas fa-play'}
            style={{ fontSize: 24 }}
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
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <BpmDisplay />
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        </div>
        <div
          style={{
            display: 'flex',
            marginLeft: 'auto',
            alignItems: 'center',
            minWidth: 250,
            marginRight: 20,
          }}
        >
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <div className="super-hands" style={{ fontSize: 24 }}>
            <i
              style={{ transform: 'rotateY(180deg)', color: hand === 'left' ? 'red' : undefined }}
              className="fas fa-hand-paper"
              onClick={() => handleHand('left')}
            />
            <i
              style={{ color: hand === 'right' ? 'red' : undefined }}
              className="fas fa-hand-paper"
              onClick={() => handleHand('right')}
            />
          </div>
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <i
            className="fas fa-clock"
            style={{ fontSize: 24, color: waiting ? 'red' : undefined }}
            onClick={() => {
              setWaiting(!waiting)
              player.setWait(!waiting)
            }}
          />
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <i
            className="fas fa-history"
            style={{ fontSize: 24, color: rangeSelecting ? 'red' : undefined }}
            onClick={() => {
              setRangeSelecting(!rangeSelecting)
              setPlaying(false)
              player.pause()
            }}
          />
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <i
            className="fas fa-music"
            style={{ color: viz === 'sheet' ? 'red' : undefined, fontSize: 24 }}
            onClick={() => {
              if (viz === 'falling-notes' || !viz) {
                setQuery('viz', 'sheet')
              } else {
                setQuery('viz', 'falling-notes')
              }
            }}
          />
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <i
            className={soundOff ? 'fas fa-volume-off' : 'fas fa-volume-up'}
            style={{ fontSize: 24 }}
            onClick={() => {
              if (!soundOff) {
                player.setVolume(0)
                setSoundOff(true)
              } else {
                player.setVolume(1)
                setSoundOff(false)
              }
            }}
          />
        </div>
        {song && (
          <div style={{ position: 'absolute', top: 55 }}>
            <SongScrubBar
              song={song}
              width={width}
              rangeSelecting={rangeSelecting}
              setRangeSelecting={setRangeSelecting}
            />
          </div>
        )}
      </div>
      {viz === 'falling-notes' && song && (
        <div
          style={{
            backgroundColor: '#2e2e2e',
            display: 'fixed',
            width: '100vw',
            height: '100vh',
            contain: 'strict',
          }}
        >
          <RuleLines width={width} height={height} />
          <WindowedSongBoard
            song={song}
            hand={hand}
            width={width}
            height={height - getKeyboardHeight(width)}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              height: getKeyboardHeight(width),
            }}
          >
            <PianoRoll width={width} selectedHand={hand} song={song} />
          </div>
        </div>
      )}
      {viz === 'sheet' && song && (
        <>
          <WindowedStaffBoard song={song} selectedHand={hand} />
        </>
      )}
    </div>
  )
}

function BpmDisplay() {
  const { player } = usePlayer()
  const bpmRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)

  useRAFLoop(() => {
    if (!bpmRef.current || !percentRef.current) {
      return
    }

    bpmRef.current.textContent = Math.floor(player.getBpm()) + ' BPM'
    percentRef.current.textContent = Math.floor(player.getBpmModifier() * 100) + '%'
  })

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 110 }}
    >
      <i style={{ fontSize: 24 }} className="fas fa-minus" onClick={() => player.decreaseBpm()} />
      <div style={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
        <span style={{ fontSize: 24 }} ref={percentRef} />
        <span style={{ fontSize: 16 }} ref={bpmRef} />
      </div>
      <i style={{ fontSize: 24 }} className="fas fa-plus" onClick={() => player.increaseBpm()} />
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
              opacity: 0.15,
            } as any
          }
        ></div>
        <div
          style={
            {
              ...baseStyle,
              opacity: 0.3,
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
export function SongScrubBar({
  song,
  width,
  rangeSelecting = false,
  setRangeSelecting = () => {},
}: {
  song: Song
  width: number
  rangeSelecting?: boolean
  setRangeSelecting?: any
}) {
  const { player } = usePlayer()
  const [mousePressed, setMousePressed] = useState(false) // TODO: mouse state shouldn't need to be ui state.
  const [mouseOver, setMouseOver] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const timeSpanRef = useRef<HTMLSpanElement>(null)
  const measureSpanRef = useRef<HTMLSpanElement>(null)
  const toolTipRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)
  const rangeSelection = useRef<null | { start: number; end: number }>(null)
  const startX = useRef<number>(0)

  function getProgress(x: number) {
    return Math.min(Math.max((x - startX.current) / width, 0), 1)
  }

  useRAFLoop(() => {
    if (!divRef.current) {
      return
    }
    const progress = Math.min(player.getTime() / player.getDuration(), 1)
    divRef.current.style.transform = `translateX(${progress * width}px)`
    if (currentTimeRef.current) {
      const time = player.getRealTimeDuration(0, player.getTime())
      currentTimeRef.current.innerText = String(formatTime(time))
    }
    if (rangeRef.current && rangeSelection.current) {
      const start = Math.min(rangeSelection.current.start, rangeSelection.current.end)
      const end = Math.max(rangeSelection.current.start, rangeSelection.current.end)
      rangeRef.current.style.left = (start / player.getDuration()) * width + 'px'
      rangeRef.current.style.width = ((end - start) / player.getDuration()) * width + 'px'
    }
  })
  useEffect(() => {
    if (wrapperRef.current) {
      startX.current = wrapperRef.current.getBoundingClientRect().x
    }
  }, [wrapperRef.current])

  useEffect(() => {
    if (rangeSelecting) {
      rangeSelection.current = null
      player.setRange(null)
    }
  }, [rangeSelecting])

  function seekPlayer(e: { clientX: number }) {
    const progress = getProgress(e.clientX)
    const songTime = progress * player.getDuration()
    player.seek(songTime)
  }

  useEffect(() => {
    if (mousePressed) {
      const handleUp = () => {
        setMousePressed(false)
        if (rangeSelecting) {
          const { start, end } = rangeSelection.current!
          player.setRange({ start, end: end ?? 0 })
          setRangeSelecting(false)
        }
      }
      const handler = (e: MouseEvent) => {
        const progress = getProgress(e.clientX)
        const songTime = progress * player.getDuration()
        if (rangeSelecting) {
          rangeSelection.current = { start: rangeSelection.current?.start ?? 0, end: songTime }
        } else {
          player.seek(songTime)
        }
      }

      window.addEventListener('mousemove', handler)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handler)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [mousePressed, rangeSelecting])

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        width,
        height: 40,
        borderBottom: 'black solid 1px',
      }}
      onMouseDown={(e) => {
        setMousePressed(true)
        if (!rangeSelecting) {
          seekPlayer(e)
          return
        }

        const progress = getProgress(e.clientX)
        const songTime = progress * player.getDuration()
        rangeSelection.current = { start: songTime, end: songTime }
      }}
      onMouseOver={() => setMouseOver(true)}
      onMouseOut={() => setMouseOver(false)}
      onMouseMove={(e: React.MouseEvent) => {
        if (measureSpanRef.current && timeSpanRef.current && toolTipRef.current) {
          const progress = getProgress(e.clientX)
          const songTime = progress * player.getDuration()
          const measure = player.getMeasureForTime(songTime)
          toolTipRef.current.style.left = `${Math.min(
            width - 150,
            e.clientX - startX.current + 10,
          )}px`
          measureSpanRef.current.innerText = String(measure.number)
          timeSpanRef.current.innerText = formatTime(player.getRealTimeDuration(0, songTime))
        }
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width: width,
            backgroundColor: '#B0B0B0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: 'calc(100%)',
            width: width,
            pointerEvents: 'none',
            backgroundColor: 'white',
            left: -width,
          }}
          className="scrubBar"
          ref={divRef}
        />
      </div>
      <span
        ref={currentTimeRef}
        style={{ position: 'absolute', bottom: 1, left: 4, color: '#242632', fontSize: 20 }}
      ></span>
      <span style={{ position: 'absolute', bottom: 1, right: 4, color: '#242632', fontSize: 20 }}>
        {formatTime(player.getRealTimeDuration(0, song.duration))}
      </span>
      <div
        style={{
          display: mouseOver ? 'flex' : 'none',
          position: 'absolute',
          left: 100,
          top: -45,
          height: '42px',
          width: '150px',
          backgroundColor: 'black',
          zIndex: 6,
        }}
        ref={toolTipRef}
      >
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 7,
            color: 'white',
            verticalAlign: 'center',
            fontSize: 12,
          }}
        >
          Time: <span ref={timeSpanRef} style={{ color: 'green' }} />
        </span>
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 7,
            color: 'white',
            verticalAlign: 'center',
            fontSize: 12,
          }}
        >
          Measure: <span ref={measureSpanRef} style={{ color: 'green' }} />
        </span>
      </div>
      {rangeSelection.current && (
        <div
          ref={rangeRef}
          style={{
            position: 'absolute',
            border: '2px solid orange',
            top: '-2px',
            height: 30,
          }}
        ></div>
      )}
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

export function PianoRoll({
  width,
  selectedHand,
  song,
}: {
  width: number
  selectedHand: Hand
  song: PlayableSong
}) {
  const pressedKeys = useSongPressedKeys()

  const notes = getKeyPositions(width).map((note: any, i: any) => {
    let color = note.color
    const shouldShow =
      i in pressedKeys &&
      (selectedHand === 'both' ||
        (selectedHand === 'left' && pressedKeys[i].track === song.config.left) ||
        (selectedHand === 'right' && pressedKeys[i].track === song.config.right))
    if (shouldShow) {
      let { track, noteValue } = pressedKeys[i]

      const hand: 'left' | 'right' = track === song.config.left ? 'left' : 'right'
      if (hand === 'left') {
        if (isBlack(noteValue)) {
          color = '#D74000'
        } else {
          color = '#FF6825'
        }
      } else {
        if (isBlack(noteValue)) {
          color = '#4912D4'
        } else {
          color = '#7029FB'
        }
      }
    }
    return (
      <PianoNote
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
    <div
      style={{
        position: 'relative',
        width,
        height: getKeyboardHeight(width),
        boxSizing: 'border-box',
      }}
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

function PianoNote({ left, width, color, height, noteValue }: any) {
  const [userPressed, setUserPressed] = useState(false)
  const midiKeys: Map<number, number> = useUserPressedKeys()
  let pressed = userPressed || midiKeys.has(noteValue)
  return (
    <div
      style={{
        border: '1px solid #292e49',
        position: 'absolute',
        top: 0,
        left,
        width,
        height,
        backgroundColor: pressed ? 'grey' : color,
        zIndex: isBlack(noteValue) ? 1 : 0,
        userSelect: 'none',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        boxSizing: 'border-box',
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

export default App
