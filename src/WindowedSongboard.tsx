import Player from './player'
import React, { useMemo } from 'react'
import { Virtualized } from './Virtualized'
import { Hand, PlayableSong, SongMeasure, SongNote } from './types'
import { getNote } from './synth/utils'
import { isBlack } from './utils'
import { useSize } from './hooks/size'

const PIXELS_PER_SECOND = 150

function getNoteLanes(width: any) {
  const whiteWidth = width / 52
  const blackWidth = whiteWidth / 2
  const blackNotes = [1, 4, 6, 9, 11]
  const lanes: Array<{ left: number; width: number }> = []
  let totalNotes = 0

  for (var whiteNotes = 0; whiteNotes < 52; whiteNotes++, totalNotes++) {
    const lane = { width: whiteWidth, left: whiteWidth * whiteNotes }
    if (blackNotes.includes(totalNotes % 12)) {
      lanes.push({ width: blackWidth, left: lane.left - blackWidth / 2 })
      totalNotes++
    }
    lanes.push(lane)
  }
  return lanes
}

export function WindowedSongBoard({
  song,
  hand = 'both',
}: {
  song: PlayableSong | null
  hand: Hand
}) {
  const player = Player.player()

  const { width, measureRef } = useSize()
  const items: Array<SongMeasure | SongNote> = useMemo(() => {
    return (song && [...song.measures, ...song.notes]) ?? []
  }, [song, hand])
  const lanes = useMemo(() => getNoteLanes(width), [width])

  const renderItem = (item: SongMeasure | SongNote, i: number) => {
    if (item.type === 'measure') {
      return <Measure measure={item} width={width} key={`measure-${item.number}`} />
    } else {
      const note = item
      const lane = lanes[note.midiNote - getNote('A0')]
      return (
        <FallingNote
          noteLength={PIXELS_PER_SECOND * note.duration}
          width={lane.width}
          posX={lane.left}
          note={note}
          key={`songnote-${note.time}-${note.midiNote}-${i}`}
          song={song!}
        />
      )
    }
  }

  function getItemOffsets(item: SongNote | SongMeasure) {
    const start = item.time * PIXELS_PER_SECOND
    if (item.type === 'note') {
      return { start, end: start + item.duration * PIXELS_PER_SECOND }
    } else {
      return { start, end: start }
    }
  }
  const getCurrentOffset = () => player.getTime() * PIXELS_PER_SECOND

  function itemFilter(item: SongMeasure | SongNote) {
    if (item.type === 'measure') {
      return true
    }

    const isLeft = item.track === song?.config.left
    const isRight = item.track === song?.config.right
    return (
      (hand === 'both' && (isLeft || isRight)) ||
      (item.type === 'note' && hand === 'left' && isLeft) ||
      (item.type === 'note' && hand === 'right' && isRight)
    )
  }

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }} ref={measureRef}>
      <Virtualized
        items={items}
        renderItem={renderItem}
        getItemOffsets={getItemOffsets}
        getCurrentOffset={getCurrentOffset}
        itemFilter={itemFilter}
      />
    </div>
  )
}

type FallingNoteProps = {
  note: SongNote
  noteLength: number
  width: number
  posX: number
  song: PlayableSong
}
function FallingNote({ note, noteLength, width, posX, song }: FallingNoteProps) {
  const keyType = isBlack(note.midiNote) ? 'black' : 'white'
  const className = keyType + ' ' + (note.track === song.config.left ? 'left-hand' : 'right-hand')
  return (
    <div
      style={{
        position: 'relative',
        left: posX,
        height: noteLength,
        width,
        textAlign: 'center',
        borderRadius: '6px',
        boxSizing: 'border-box',
      }}
      className={className}
    >
      {/* {note.pitch.step} */}
    </div>
  )
}

function Measure({ width, measure }: { width: number; measure: SongMeasure }) {
  return (
    <div id={`measure-${measure.number}`}>
      <div
        style={{
          position: 'relative',
          left: 10,
          top: -7,
          fontSize: 15,
          color: 'white',
          userSelect: 'none',
        }}
      >
        {measure.number}
      </div>
      <div style={{ width, height: 1, backgroundColor: '#C5C5C5' }}></div>
    </div>
  )
}
