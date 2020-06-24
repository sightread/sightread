import React, { useEffect, useRef, useState } from "react"
// import ReactDOM from "react-dom"
import Vex from "vexflow"
import { Song, parseMusicXML, parseMidi, getNoteValue } from "./utils"
import { usePlayer, useWindowSize } from "./hooks"

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
      <SongStaff song={song} />
    </div>
  )
}

function SongStaff({ song }: { song: Song }) {
  const { width } = useWindowSize()
  const divRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!divRef) {
      return
    }

    // Create an SVG renderer and attach it to the DIV element named "vf".
    const div = document.getElementById("vf")
    const renderer = new VF.Renderer(divRef.current as any, VF.Renderer.Backends.SVG)

    // Configure the rendering context.
    renderer.resize(40000, 300)
    const context = renderer.getContext()
    context.setFont("Arial", 10).setBackgroundFillStyle("#eed")

    // Create a stave of width 400 at position 10, 40 on the canvas.
    const staveRight = new VF.Stave(10, 40, 40000)
    const staveLeft = new VF.Stave(10, 130, 40000)

    // Add a clef and time signature.
    staveRight.addClef("treble").addTimeSignature("4/4")
    staveLeft.addClef("bass").addTimeSignature("4/4")

    // Connect it to the rendering context and draw!
    staveRight.setContext(context).draw()
    staveLeft.setContext(context).draw()

    let firstNote = song.notes[0]
    let vexNotes = song.notes.map((note) => {
      var tickContext = new VF.TickContext()
      tickContext.preFormat().setX((note.time - firstNote.time) * 30)
      let vexNote
      let keys = [`${note.pitch.step.toLowerCase()}/${note.pitch.octave}`]
      if (note.staff == 2) {
        vexNote = new VF.StaveNote({ clef: "treble", keys, duration: "4" })
        vexNote.setStave(staveRight)
      } else {
        vexNote = new VF.StaveNote({ clef: "bass", keys, duration: "4" })
        vexNote.setStave(staveLeft)
      }
      vexNote.setContext(context)
      tickContext.addTickable(vexNote)
      vexNote.draw()
      return vexNote
    })
    vexNotes.forEach((vexNote) => {})
  }, [divRef])
  return <div ref={divRef}> </div>
}

async function getSong(url: string) {
  if (url.includes(".xml")) {
    const xml = await (await fetch(url)).text()
    return parseMusicXML(xml)
  }
  const buffer = await (await fetch(url)).arrayBuffer()
  return parseMidi(buffer)
}
