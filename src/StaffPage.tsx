import React, { useEffect, useRef, useState } from "react"
// import ReactDOM from "react-dom"
import Vex from "vexflow"
import { Song, parseMusicXML, parseMidi, getNoteValue, STAFF } from "./utils"
import { usePlayer, useWindowSize, useRAFLoop } from "./hooks"

const VF = Vex.Flow

export function StaffPage() {
  const [song, setSong] = useState<Song | null>(null)
  const { player } = usePlayer()

  useEffect(() => {
    getSong(`/music/Piano%20Hero%20015%20-%20Fort%20Minor%20-%20Remember%20The%20Name.mid`).then(
      (song: Song) => {
        setSong(song)
        player.setSong(song)
      },
    )
  }, [player])

  if (!song) {
    return <span> Loading...</span>
  }
  return (
    <div style={{ width: "40000px", backgroundColor: "white" }} className="staffPage">
      <WindowedStaffBoard song={song} />
    </div>
  )
}

export function WindowedStaffBoard({ song }: { song: Song }) {
  const windowSize = useWindowSize()
  const divRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<any>(null)
  const width = song.duration * 30
  const { player } = usePlayer()

  useEffect(() => {
    if (!divRef) {
      return
    }

    // Create an SVG renderer and attach it to the DIV element named "vf".
    const renderer = new VF.Renderer(divRef.current as any, VF.Renderer.Backends.SVG)

    // Configure the rendering context.
    renderer.resize(width, 250)
    const context = renderer.getContext()
    context.setFont("Arial", 10).setBackgroundFillStyle("#eed")

    // Create a stave of width 400 at position 10, 40 on the canvas.
    const staveRight = new VF.Stave(10, 20, width)
    const staveLeft = new VF.Stave(10, 110, width)

    // Add a clef and time signature.
    const timeSignature = `${song.timeSignature.numerator}/${song.timeSignature.denominator}`
    staveRight.addClef("treble").addTimeSignature(timeSignature)
    staveLeft.addClef("bass").addTimeSignature(timeSignature)

    // Connect it to the rendering context and draw!
    staveRight.setContext(context).draw()
    staveLeft.setContext(context).draw()

    const notesGroup = context.openGroup()
    let vexNotes = song.notes.map((note) => {
      let accidental = ""
      if (note.accidental === 1) {
        accidental = "#"
      } else if (note.accidental === -1) {
        accidental = "b"
      }

      var tickContext = new VF.TickContext()
      let vexNote
      let keys = [`${note.pitch.step.toLowerCase()}${accidental}/${note.pitch.octave}`]
      if (note.staff === STAFF.trebl) {
        vexNote = new VF.StaveNote({ clef: "treble", keys, duration: "4" })
        vexNote.setStave(staveRight)
      } else {
        vexNote = new VF.StaveNote({ clef: "bass", keys, duration: "4" })
        vexNote.setStave(staveLeft)
      }
      vexNote.setContext(context)
      if (accidental) {
        vexNote.addAccidental(0, new VF.Accidental(accidental))
      }
      tickContext.addTickable(vexNote)
      tickContext.preFormat().setX(50 + note.time * 30)
      vexNote.draw()
      return vexNote
    })
    context.closeGroup()
    ;(notesGroup as any).style.overflow = "hidden"
    innerRef.current = notesGroup as HTMLDivElement
  }, [divRef])

  useRAFLoop((dt: number) => {
    if (!outerRef.current || !innerRef.current) {
      return
    }
    const now = player.getTime()
    let offset = now * 30
    innerRef.current.style.transform = `translateX(${-offset}px)`
  })

  return (
    <div
      style={{
        position: "fixed",
        overflow: "hidden",
        height: windowSize.height,
        width: windowSize.width,
      }}
      ref={outerRef}
    >
      <div
        style={{
          height: "100%",
          width: song.duration * 30,
        }}
        // ref={innerRef}
      >
        <div
          ref={divRef}
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "white",
          }}
        ></div>
      </div>
    </div>
  )
}

async function getSong(url: string) {
  if (url.includes(".xml")) {
    const xml = await (await fetch(url)).text()
    return parseMusicXML(xml)
  }
  const buffer = await (await fetch(url)).arrayBuffer()
  return parseMidi(buffer)
}
