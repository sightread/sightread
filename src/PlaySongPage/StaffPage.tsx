import * as React from 'react'
import { FClefIcon, GClefIcon } from '../icons'
import { Virtualized } from './Virtualized'
import { Sizer } from '../utils'
import { PlayableSong, SongNote } from '../types'
import Player from '../player'

const PIXELS_PER_SECOND = 300
function getXPos(time: number) {
  return time * PIXELS_PER_SECOND
}

export function WindowedStaffBoard({
  song,
  selectedHand,
}: {
  song: PlayableSong | null
  selectedHand: 'left' | 'right' | 'both'
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '100vw',
        backgroundColor: 'white',
      }}
    >
      <div style={{ position: 'relative', marginLeft: 150 }}>
        <Stave height={80} hand={'right'} song={song} disabled={selectedHand === 'left'} />
        <Sizer height={100} />
        <Stave height={80} hand={'left'} song={song} disabled={selectedHand === 'right'} />
        <VerticalRedBar />
      </div>
    </div>
  )
}

function VerticalRedBar() {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: -50,
          left: 86,
          width: 7,
          height: 375,
          backgroundColor: '#B91919',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -50,
          left: 75,
          width: 30,
          height: 375,
          backgroundColor: 'rgba(185,25,25,0.21)',
        }}
      />
    </>
  )
}

const NoteHeadSvg = (
  <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.4811 6.42107C24.4811 10.4211 21.0371 15.6763 15.4811 17.9211C9.48114 19.9211 5.48114 18.921 2.98114 15.421C1.48114 11.421 4.48114 6.92102 10.0411 3.9855C15.9811 2.42107 20.4811 2.42107 22.4811 6.42107Z"
      fill="black"
    />
  </svg>
)

const STEP_NUM: any = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
}

function ClefSvg(props: any) {
  if (props.hand === 'right') {
    return <GClefIcon {...props} />
  }
  return <FClefIcon {...props} />
}

// Make a staffz
function Stave({
  height,
  hand,
  song,
  disabled,
}: {
  height: number
  hand: 'left' | 'right'
  song: PlayableSong | null
  disabled: boolean
}) {
  const notes = song?.notes.filter((n) => n.track === song.config[hand]) ?? []

  const player = Player.player()

  const clefStyle =
    hand === 'right'
      ? { position: 'absolute', height: 150, top: -28, left: -5 }
      : { position: 'absolute', height: 67, top: 2, left: 10 }

  function Line({ top, width }: any) {
    return (
      <div
        style={{
          position: 'absolute',
          top,
          width: width ?? '100%',
          height: 2.5,
          backgroundColor: 'black',
        }}
      />
    )
  }

  // There are 52 white keys. 8 notes per octave.
  function getRow(octave: number, step: string): number {
    return octave * 8 + STEP_NUM[step]
  }
  const staveTopRow = hand === 'left' ? getRow(4, 'A') : getRow(5, 'F')
  const heightPerRow = height / 8
  function getYForRow(row: number) {
    const relDiff = staveTopRow - row
    return relDiff * heightPerRow
  }

  function Note({ note }: { note: SongNote }) {
    const row = getRow(note.pitch.octave, note.pitch.step)
    const top = getYForRow(row)
    const extraLines: any = []
    if (row > staveTopRow) {
      for (let i = staveTopRow + 2; i <= row; i++) {
        if (i % 2 === 0) {
          extraLines.push(
            <Line
              top={getYForRow(i)}
              width={note.duration * PIXELS_PER_SECOND}
              key={`line-${i}-${note.time}`}
            />,
          )
        }
      }
    }
    if (row < staveTopRow - 8) {
      for (let i = row; i <= staveTopRow - 8; i++) {
        if (i % 2 === 0) {
          extraLines.push(
            <Line
              top={getYForRow(i)}
              width={note.duration * PIXELS_PER_SECOND}
              key={`line-${i}-${note.time}`}
            />,
          )
        }
      }
    }

    const accidentalMap: any = {
      '-2': '♭♭',
      '-1': '♭',
      1: '#',
      2: '##',
    }
    return (
      <div>
        {note.pitch.alter !== 0 && (
          <span
            style={{ position: 'absolute', top: top - 8, left: -12, fontSize: 20, fontWeight: 600 }}
          >
            {accidentalMap[note.pitch.alter]}
          </span>
        )}
        <div
          style={{
            position: 'absolute',
            top: top + 2,
            transform: 'translateY(-50%)',
          }}
        >
          {NoteHeadSvg}
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
        />
        {extraLines}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        height,
        margin: '0 auto',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          position: 'relative',
          marginLeft: 90,
          flex: 1,
        }}
      >
        {/* This div is just to enable overflow hiding in X direction and allowing all Y overflow. */}
        <div
          style={{
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            marginTop: '-50vh',
            paddingTop: '50vh',
            position: 'relative',
          }}
        >
          <Virtualized
            items={notes}
            renderItem={(note: any) => <Note note={note} />}
            getCurrentOffset={() => getXPos(player.getTime())}
            getItemOffsets={(note: SongNote) => ({
              start: getXPos(note.time),
              end: getXPos(note.time + note.duration),
            })}
            direction="horizontal"
          />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 2, height, backgroundColor: 'black' }} />
      <ClefSvg hand={hand} style={clefStyle} />
      {[0, 2, 4, 6, 8].map((i) => {
        return <Line top={getYForRow(staveTopRow - i)} key={`line-${i}`} />
      })}
    </div>
  )
}
