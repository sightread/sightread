import React, { useEffect, useRef, useState } from "react"
// import ReactDOM from "react-dom"
import Vex from "vexflow"
import { Song, parseMusicXML, parseMidi, getNoteValue, STAFF } from "./utils"
import { usePlayer, useWindowSize, useRAFLoop } from "./hooks"
import { ReactComponent } from "*.svg"

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
    <div style={{ width: "100%", backgroundColor: "white" }} className="staffPage">
      <WindowedStaffBoard song={song} />
    </div>
  )
}

export function WindowedStaffBoard({ song }: { song: Song }) {
  const windowSize = useWindowSize()
  const divRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<any>(null)
  const width = song.duration * 40
  const { player } = usePlayer()
  // time + bpm is not normalized w.r.t to wall clock. should do this for a reasonable experience.
  const getXPos = (time: number) => time * 40 + 50

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

    staveRight.setContext(context).draw()
    staveLeft.setContext(context).draw()
    // TODO: figure out how to draw connector
    // new VF.StaveConnector(staveLeft, staveRight)
    //   .setType(VF.StaveConnector.type.BOLD_DOUBLE_LEFT)
    //   .setContext(context)
    //   .draw()

    const hider = context.openGroup()
    context.closeGroup()
    console.log(hider)

    const notesGroup = context.openGroup()
    song.measures.forEach((measure) => {
      staveRight.drawVerticalBar(getXPos(measure.time) + 65)
      staveLeft.drawVerticalBar(getXPos(measure.time) + 65)
    })
    song.notes.forEach((note) => {
      const accidental: string =
        ({ "-2": "bb", "-1": "b", "1": "#", "2": "##" } as any)[note.accidental] ?? ""

      var tickContext = new VF.TickContext()
      let vexNote
      let keys = [`${note.pitch.step.toLowerCase()}${accidental}/${note.pitch.octave}`]
      // estimate duration!  how? tbd.
      if (note.staff === STAFF.trebl) {
        vexNote = new VF.StaveNote({
          clef: "treble",
          keys,
          duration: note.noteType,
        })
        vexNote.setStave(staveRight)
      } else {
        vexNote = new VF.StaveNote({ clef: "bass", keys, duration: note.noteType })
        vexNote.setStave(staveLeft)
      }
      vexNote.setContext(context)
      if (accidental) {
        vexNote.addAccidental(0, new VF.Accidental(accidental))
      }
      tickContext.addTickable(vexNote)
      tickContext.preFormat().setX(getXPos(note.time))
      vexNote.draw()
    })
    context.closeGroup()
    innerRef.current = notesGroup as HTMLDivElement
  }, [divRef])

  useRAFLoop((dt: number) => {
    if (!outerRef.current || !innerRef.current) {
      return
    }
    const now = player.getTime()
    let offset = getXPos(now) - 50
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
          width,
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
        >
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 124,
              width: 5,
              height: 150,
              backgroundColor: "red",
            }}
          ></div>
        </div>
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
