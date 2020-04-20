import "./player"
import React, { useState, useEffect, useRef } from "react"
import "./App.css"
import { useWindowSize, usePlayer } from "./hooks"
import { parseMusicXML } from "./utils"
import { WebAudioFontSynth } from "./player"

// const steps: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }

const xml = parseMusicXML()
const synth = new WebAudioFontSynth()

function App() {
  const { width, height } = useWindowSize()
  const [notes, setNotes]: any = useState({ duration: 0, staffs: {} })
  const [playing, setPlaying] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const { player } = usePlayer()

  useEffect(() => {
    xml.then((d) => {
      player.setSong(d)
      setNotes(d)
    })
  }, [player])

  useEffect(() => {
    const keyboardHandler = (evt: KeyboardEvent) => {
      if (evt.code === "Space") {
        if (playing) {
          player.pause()
          setPlaying(false)
        } else {
          player.play()
          setPlaying(true)
        }
      }
    }
    window.addEventListener("keydown", keyboardHandler)
    return () => window.removeEventListener("keydown", keyboardHandler)
  }, [playing, player])

  return (
    <div className="App">
      <div
        id="topbar"
        style={{
          position: "fixed",
          height: 50,
          width,
          zIndex: 2,
          backgroundColor: "rgb(50,50,50)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: 160,
            height: 50,
            margin: "0 auto",
            position: "relative",
            top: 10,
          }}
        >
          <i
            className={playing ? "fa fa-2x fa-pause" : "fa fa-2x fa-play"}
            style={{ color: "white", width: 40 }}
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
            style={{ color: "white", width: 40 }}
            onClick={() => {
              player.stop()
              setPlaying(false)
            }}
          ></i>
          <i
            className={soundOff ? "fa fa-2x fa-volume-off" : "fa fa-2x fa-volume-up"}
            style={{ color: "white", width: 40 }}
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
        <SongScrubBar />
      </div>
      <RuleLines width={width} height={height} />
      <SongBoard width={width} screenHeight={height} song={notes} playing={playing} />
      <div style={{ position: "fixed", bottom: 0 }}>
        <PianoRoll width={width} />
      </div>
    </div>
  )
}

function RuleLines({ width, height }: any) {
  const widthOfWhiteKey = width / 52
  const getRuleLines = () => {
    const baseStyle = {
      position: "fixed",
      height: height - 30,
      width: 1,
      backgroundColor: "#fff",
    }
    return Array.from({ length: 12 }).map((_n, i) => (
      <div>
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
  return <>{getRuleLines()}</>
}

// TODO: animate filling up the green of current measure
// TODO support seeking to start of current measure
function SongScrubBar() {
  const { measure, song, seek } = usePlayer()
  const { width } = useWindowSize()
  const numMeasures = song?.measures?.length ?? 0
  const measureWidth = width / numMeasures

  return (
    <div style={{ display: "flex", width, height: 30 }}>
      {Array.from({ length: numMeasures }).map((n, i) => {
        return (
          <div
            style={{
              height: 30,
              width: measureWidth,
              backgroundColor: i <= measure ? "rgb(0,145,0)" : "grey",
              border: "solid #6b6b6b 1px",
            }}
            key={i}
            onClick={() => seek(i)}
          />
        )
      })}
    </div>
  )
}

function createNoteObject(whiteNotes: any, whiteWidth: any, height: any, type: any) {
  switch (type) {
    case "black":
      return {
        left: whiteNotes * whiteWidth - whiteWidth / 4,
        width: whiteWidth / 2,
        color: "black",
        height: height * (2 / 3),
      }
    case "white":
      return {
        left: whiteNotes * whiteWidth,
        height: height,
        width: whiteWidth,
        color: "white",
      }
    default:
      throw Error("Invalid note type")
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
      notes.push(createNoteObject(whiteNotes, whiteWidth, height, "black"))
      totalNotes++
    }
    notes.push(createNoteObject(whiteNotes, whiteWidth, height, "white"))
  }
  return notes
}

function SongBoard({ width, screenHeight, song, playing }: any) {
  const { player, manuallySeekedMeasure } = usePlayer()
  const height = song.duration * 40 + screenHeight
  const scrollRef = useRef(null)
  const animationRef: any = useRef(null)

  // TODO: fix bug for rewinding to start of current measure.
  useEffect(() => {
    if (scrollRef.current === null) {
      return
    }
    const node = scrollRef.current as any
    const bpm = 180
    const duration = ((song.duration - player.currentSongTime) / bpm) * 60 * 1000
    const end = -(height - screenHeight)
    const start = (player.currentSongTime / song.duration) * end
    if (playing) {
      node.style.bottom = "0px"
      animationRef.current?.cancel?.()
      animationRef.current = node.animate([{ bottom: `${start}px` }, { bottom: `${end}px` }], {
        duration,
      })
    } else {
      animationRef.current?.cancel?.()
      animationRef.current = null
      node.style.bottom = `${start}px`
    }
  }, [song, screenHeight, player, height, playing, manuallySeekedMeasure])

  const notes = Object.values(song.staffs).flatMap((x: any) => x.notes)
  const pianoKeysArray = getKeyPositions(width)
  const getMeasures = () => {
    if (song === undefined || song.measures === undefined) {
      return <div></div>
    }
    return song.measures.map((measure: any, i: number) => {
      const posY = measure.time * 40 + getKeyboardHeight(width)
      return (
        <div>
          <div
            style={{
              height: 15,
              left: 10,
              bottom: posY + 10,
              fontSize: 15,
              color: "white",
              position: "absolute",
            }}
          >
            {i}
          </div>
          <div
            style={{
              height: 1,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              width: width,
              left: 0,
              bottom: posY,
              position: "absolute",
            }}
            key={i}
          ></div>
        </div>
      )
    })
  }
  // const measures = song.measures.map((measure: any) => measure.time)
  return (
    <div style={{ position: "fixed", overflow: "hidden", height: screenHeight, width }}>
      <div
        ref={scrollRef}
        style={{
          position: "absolute",
          height,
          overflow: "hidden",
          width: "100%",
          bottom: 0,
        }}
      >
        {getMeasures()}
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
  const className = note.staff === 1 ? "left-hand" : "right-hand"
  return (
    <div
      style={{
        height: noteLength,
        width,
        position: "absolute",
        bottom: posY,
        left: posX,
        textAlign: "center",
        borderRadius: "15px",
      }}
      className={className}
    >
      {/* {note.pitch.step},{note.pitch.octave},{note.noteValue} */}
    </div>
  )
}

function PianoRoll({ width }: any) {
  const { pressedKeys }: any = usePlayer()

  const getPressedColor = (staff: number) => (staff === 1 ? "#4dd0e1" : "#ef6c00")
  const notes = getKeyPositions(width).map((note: any, i: any) => (
    <PianoNote
      left={note.left}
      width={note.width}
      height={note.height}
      color={!!pressedKeys[i] ? getPressedColor(pressedKeys[i].staff) : note.color}
      noteValue={i}
      key={i}
    />
  ))
  const whiteWidth = width / 52 // 52 white keys in a keyboard.
  const height = (220 / 30) * whiteWidth
  /**
   *   0  1   2  3  4   5  6   7  8  9   10 11
   *  {A, A#, B, C, C#, D, D#, E, F, F#, G, G#}
   */

  return <div style={{ position: "relative", width, height }}>{notes}</div>
}

let isMouseDown = false
window.addEventListener("mousedown", () => (isMouseDown = true))
window.addEventListener("mouseup", () => (isMouseDown = false))

function PianoNote({ left, width, color, height, noteValue }: any) {
  return (
    <div
      style={{
        border: "1px solid #292e49",
        position: "absolute",
        top: 0,
        left,
        width,
        height,
        backgroundColor: color,
        zIndex: color === "black" ? 1 : 0,
        userSelect: "none",
      }}
      onMouseDown={() => synth.playNoteValue(noteValue)}
      onMouseUp={() => synth.stopNoteValue(noteValue)}
      onMouseLeave={() => synth.stopNoteValue(noteValue)}
      onMouseEnter={() => isMouseDown && synth.playNoteValue(noteValue)}
    ></div>
  )
}

export default App
