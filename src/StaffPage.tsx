import React, { useEffect, useRef, useState } from 'react'
import { Song, parseMusicXML, parseMidi, getNoteValue, STAFF, SongNote } from './utils'
import { usePlayer, useWindowSize, useRAFLoop } from './hooks'

import FClefSVG from './FClef.svg'
import GClefSVG from './GClef.svg'

export function StaffPage() {
  const [song, setSong] = useState<Song | null>(null)
  const { player } = usePlayer()

  const songLocation = window.location.pathname.substring(6)
  useEffect(() => {
    getSong(`/${songLocation}`).then((song: Song) => {
      setSong(song)
      player.setSong(song)
    })

    return function cleanup() {}
  }, [songLocation, player])

  if (!song) {
    return <span> Loading...</span>
  }
  return (
    <div style={{ width: '100%', backgroundColor: 'white' }} className="staffPage">
      <WindowedStaffBoard song={song} />
    </div>
  )
}

const PIXELS_PER_SECOND = 300

export function WindowedStaffBoard({ song }: { song: Song }) {
  const windowSize = useWindowSize()
  const divRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<any>(null)
  const width = song.duration * PIXELS_PER_SECOND
  const { player } = usePlayer()
  // time + bpm is not normalized w.r.t to wall clock. should do this for a reasonable experience.
  const getXPos = (time: number) => time * PIXELS_PER_SECOND + 50

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
        position: 'fixed',
        overflow: 'hidden',
        height: windowSize.height,
        width: windowSize.width,
      }}
      ref={outerRef}
    >
      <div style={{ height: '100%', width }}>
        <div
          ref={divRef}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '100vw',
            backgroundColor: 'white',
          }}
        >
          <Stave width={'calc(100% - 100px)'} height={100} staff={STAFF.trebl} song={song} />
          <Sizer height={70} />
          <Stave width={'calc(100% - 100px)'} height={100} staff={STAFF.bass} song={song} />
          <div
            style={{
              position: 'absolute',
              top: -50,
              left: 200,
              width: 7,
              height: 375,
              backgroundColor: '#B91919',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -50,
              left: 188,
              width: 30,
              height: 375,
              backgroundColor: 'rgba(185,25,25,0.21)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

const noteSvg = (
  <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.4811 6.42107C24.4811 10.4211 21.0371 15.6763 15.4811 17.9211C9.48114 19.9211 5.48114 18.921 2.98114 15.421C1.48114 11.421 4.48114 6.92102 10.0411 3.9855C15.9811 2.42107 20.4811 2.42107 22.4811 6.42107Z"
      fill="black"
    />
  </svg>
)

// TODO:
// - notes
// - measures
// - scalability of Grand Staff.
const BASS_LINES = [
  { octave: 2, step: 'G' },
  { octave: 3, step: 'B' },
  { octave: 3, step: 'D' },
  { octave: 3, step: 'F' },
  { octave: 4, step: 'A' },
]

const STEP_NUM: any = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
}

const TREBL_LINES = [
  { octave: 4, step: 'E' },
  { octave: 4, step: 'G' },
  { octave: 5, step: 'B' },
  { octave: 5, step: 'D' },
  { octave: 5, step: 'F' },
]

// Make a staffz
function Stave({
  width,
  height,
  staff,
  song,
}: {
  width: number | string
  height: number
  staff: typeof STAFF.trebl | typeof STAFF.bass
  song: Song
}) {
  const notes = song.notes.filter((n) => n.staff === staff)
  const clefImgSrc = staff === STAFF.trebl ? GClefSVG : FClefSVG
  const clefStyle =
    staff === STAFF.trebl ? { height: 160, top: -20, left: -5 } : { height: 80, top: 2, left: 10 }

  function Line({ top }: any) {
    return (
      <div
        style={{
          position: 'absolute',
          top,
          width: '100%',
          height: 2.1,
          backgroundColor: 'black',
        }}
      />
    )
  }

  function getYPos(octave: number, step: string): number {
    return (octave * 7 + STEP_NUM[step]) * (height / 8)
  }
  function getRelYPos(octave: number, step: string) {
    const relTop = staff === STAFF.bass ? getYPos(4, 'A') : getYPos(5, 'F')
    return relTop - getYPos(octave, step)
  }

  function Note({ note }: { note: SongNote }) {
    const top = getRelYPos(note.pitch.octave, note.pitch.step)
    return (
      <>
        <div
          style={{
            position: 'absolute',
            left: note.time * 100 + 180,
            top: top + 2,
            transform: 'translateY(-50%)',
          }}
        >
          {noteSvg}
        </div>
        <div
          style={{
            position: 'absolute',
            left: note.time * 100 + 190,
            width: note.duration * 100,
            top: top + 1,
            height: 15,
            backgroundColor: 'rgba(0,0,0,0.51)',
            transform: 'translateY(-50%)',
          }}
        ></div>
      </>
    )
  }
  const lines = staff === STAFF.trebl ? TREBL_LINES : BASS_LINES
  return (
    <div style={{ position: 'relative', width, height, margin: '0 auto' }}>
      <div style={{ position: 'absolute' }}>
        {notes.map((n) => (
          <Note note={n} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, width: 2, height, backgroundColor: 'black' }} />
      <img style={{ position: 'absolute', ...clefStyle }} src={clefImgSrc} />
      {lines.map((l) => (
        <Line top={getRelYPos(l.octave, l.step)} />
      ))}
    </div>
  )
}

function Sizer({ height, width }: { height?: number; width?: number }) {
  return <div style={{ width, height }} />
}

async function getSong(url: string) {
  if (url.includes('.xml')) {
    const xml = await (await fetch(url)).text()
    return parseMusicXML(xml)
  }
  const buffer = await (await fetch(url)).arrayBuffer()
  return parseMidi(buffer)
}
