import "./player"
import React, { useState, useEffect, useRef, useCallback } from "react"
import "./App.css"
import { useWindowSize, usePlayer, useRAFLoop, usePressedKeys } from "./hooks"
import { parseMusicXML, Song, SongMeasure } from "./utils"
import { WebAudioFontSynth } from "./player"
import { WindowedSongBoard } from "./WindowedSongboard"
import { useHistory } from "react-router-dom"

// const steps: any = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 }

const synth = new WebAudioFontSynth()

function App({ selectedSong }: any) {
  const { width, height } = useWindowSize()
  const [song, setSong]: [Song, Function] = useState({
    duration: 0,
    staffs: {},
    notes: [],
    divisions: 1,
    measures: [],
  })
  const [playing, setPlaying] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const { player } = usePlayer()

  useEffect(() => {
    // fetch(process.env.PUBLIC_URL + "/music/pirates-carribean-medley.xml")
    fetch(process.env.PUBLIC_URL + "/music/GoT.xml")
      // fetch(process.env.PUBLIC_URL + "/music/Canon_Rock.xml")
      .then((resp) => resp.text())
      .then((xml) => {
        const song = parseMusicXML(xml)
        player.setSong(song)
        setSong(song)
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
        <SongScrubBar song={song} />
      </div>
      <RuleLines width={width} height={height} />
      {song && <WindowedSongBoard song={song} />}
      {/* <SongBoard width={width} screenHeight={height} song={song} /> */}
      {/* <div style={{ position: "fixed", bottom: 0 }}>
        <PianoRoll width={width} />
      </div> */}
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
      <div style={{ position: "relative", display: "flex", width }} className="scrub-bar-container">
        {Array.from({ length: numMeasures }).map((n, i) => {
          return (
            <div
              style={{
                height: "100%",
                width: measureWidth,
                backgroundColor: "rgba(0, 0, 0, 0)",
                border: "solid #004d40 1px",
                zIndex: 2,
              }}
              key={i}
              onClick={() => player.seek(i)}
            />
          )
        })}
        <div
          style={{
            position: "absolute",
            height: "calc(100% )",
            width,
            pointerEvents: "none",
            backgroundColor: "#009688",
            left: -width,
            zIndex: 1,
          }}
          className="scrubBar"
          ref={divRef}
        ></div>
        <div
          style={{
            position: "absolute",
            height: "100%",
            width,
            backgroundColor: "#b2dfdb",
            zIndex: 0,
          }}
        ></div>
      </div>
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

function pixelsPerDuration(song: Song) {
  return 100 * (1 / song.divisions)
}

function Measure({ width, measure, song }: { width: number; measure: SongMeasure; song: Song }) {
  const posY = measure.time * pixelsPerDuration(song) + getKeyboardHeight(width)
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
        {measure.number}
      </div>
      <div
        style={{
          height: 1,
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          width,
          left: 0,
          bottom: posY,
          position: "absolute",
        }}
        key={`measure-${posY}`}
      ></div>
    </div>
  )
}

const sum = (list: Array<number>) => list.reduce((a, b) => a + b, 0)
const avg = (list: Array<number>) => sum(list) / list.length

function SongBoard({ width, song }: { width: number; screenHeight: number; song: Song }) {
  const { player } = usePlayer()
  const height = song.duration * pixelsPerDuration(song)
  const scrollRef = useRef<HTMLDivElement>(null)

  // TODO: fix bug for rewinding to start of current measure.
  useRAFLoop(() => {
    if (scrollRef.current === null) {
      return
    }
    const node = scrollRef.current
    if (node) {
      const offset = (player.getTime() / song?.duration) * height
      node.style.transform = `translateY(${offset}px)`
    }
  })

  const { measures, notes } = song
  const pianoKeysArray = getKeyPositions(width)

  return (
    <div
      style={{
        position: "fixed",
        overflow: "hidden",
        height,
        width,
        bottom: 0,
      }}
      ref={scrollRef}
    >
      {measures.map((measure) => (
        <Measure measure={measure} width={width} key={measure.number} song={song} />
      ))}
      {notes.map((note: any, i) => {
        const key = pianoKeysArray[note.noteValue]
        console.assert(key, "key could not be found " + JSON.stringify(note))
        if (i > 40) {
          return <> </>
        }
        return (
          <SongNote
            noteLength={note.duration * pixelsPerDuration(song)}
            width={key.width}
            posX={key.left}
            posY={note.time * pixelsPerDuration(song) + getKeyboardHeight(width)}
            note={note}
            key={i}
          />
        )
      })}
    </div>
  )
}

function SongNote({ note, noteLength, width, posX, posY }: any) {
  const keyType = isBlack(note.noteValue) ? "black" : "white"
  const className = keyType + " " + (note.staff === 1 ? "left-hand" : "right-hand")
  return (
    <div
      style={{
        height: noteLength,
        width,
        position: "absolute",
        bottom: posY,
        left: posX,
        textAlign: "center",
        borderRadius: "6px",
      }}
      className={className}
    >
      {/* {note.pitch.step},{note.pitch.octave},{note.noteValue} */}
    </div>
  )
}

function isBlack(noteValue: number) {
  return [1, 4, 6, 9, 11].some((x) => noteValue % 12 === x)
}

function PianoRoll({ width }: any) {
  const pressedKeys = usePressedKeys()
  const getPressedColor = (staff: number) => (staff === 1 ? "#4dd0e1" : "#ef6c00")
  const notes = getKeyPositions(width).map((note: any, i: any) => {
    let color = note.color
    if (pressedKeys[i]) {
      let { staff, noteValue } = pressedKeys[i]
      const hand = staff === 1 ? "left-hand" : "right-hand"
      if (hand === "left-hand") {
        if (isBlack(noteValue)) {
          color = "#2c6e78"
        } else {
          color = "#4dd0e1"
        }
      } else {
        if (isBlack(noteValue)) {
          color = "#c65a00"
        } else {
          color = "#ef6c00"
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
        zIndex: isBlack(noteValue) ? 1 : 0,
        userSelect: "none",
        borderBottomLeftRadius: "8px",
        borderBottomRightRadius: "8px",
      }}
      onMouseDown={() => synth.playNoteValue(noteValue)}
      onMouseUp={() => synth.stopNoteValue(noteValue)}
      onMouseLeave={() => synth.stopNoteValue(noteValue)}
      onMouseEnter={() => isMouseDown && synth.playNoteValue(noteValue)}
    ></div>
  )
}

export default App
