import React from 'react'
import { Song, parseMusicXML, parseMidi, STAFF, SongNote } from './utils'
import { usePlayer, useWindowSize } from './hooks'

import FClefSVG from './FClef.svg'
import GClefSVG from './GClef.svg'
import { Virtualized } from './Virtualized'

const PIXELS_PER_SECOND = 300
function getXPos(time: number) {
  return time * PIXELS_PER_SECOND
}

export function WindowedStaffBoard({ song }: { song: Song }) {
  const windowSize = useWindowSize()
  const width = song.duration * PIXELS_PER_SECOND

  return (
    <div style={{}}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '100vw',
          backgroundColor: 'white',
        }}
      >
        <Stave width={windowSize.width - 100} height={100} staff={STAFF.trebl} song={song} />
        <Sizer height={70} />
        <Stave width={windowSize.width - 100} height={100} staff={STAFF.bass} song={song} />
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
  width: number
  height: number
  staff: typeof STAFF.trebl | typeof STAFF.bass
  song: Song
}) {
  const { player } = usePlayer()
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
          height: 2.5,
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
            top: top + 2,
            transform: 'translateY(-50%)',
          }}
        >
          {noteSvg}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 10,
            width: note.duration * PIXELS_PER_SECOND - 10,
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
      <div style={{ position: 'relative', left: 150, overflow: 'hidden' }}>
        <Virtualized
          items={notes}
          renderItem={(note: any) => <Note note={note} />}
          getCurrentOffset={() => getXPos(player.getTime())}
          getItemOffsets={(note: SongNote) => ({
            start: getXPos(note.time),
            end: getXPos(note.time + note.duration),
          })}
          direction="horizontal"
          width={width - 150}
          height={height}
        />
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
