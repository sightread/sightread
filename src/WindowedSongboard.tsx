import './player'
import React, { useMemo } from 'react'
import { usePlayer } from './hooks'
import { Song, SongMeasure, SongNote, STAFF } from './parsers'
import { Virtualized } from './Virtualized'

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
  width,
  height,
}: {
  song: Song
  hand: 'both' | 'left' | 'right'
  width: any
  height: any
}) {
  const { player } = usePlayer()
  const items: Array<SongMeasure | SongNote> = useMemo(() => {
    return [...song.measures, ...song.notes]
  }, [song, hand])
  const lanes = useMemo(() => getNoteLanes(width), [width])

  const renderItem = (item: SongMeasure | SongNote, i: number) => {
    if (item.type === 'measure') {
      return <Measure measure={item} width={width} key={`measure-${item.number}`} />
    } else {
      const note = item
      const lane = lanes[note.noteValue]
      return (
        <FallingNote
          noteLength={PIXELS_PER_SECOND * note.duration}
          width={lane.width}
          posX={lane.left}
          note={note}
          key={`songnote-${note.time}-${note.noteValue}-${i}`}
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
    return (
      hand === 'both' ||
      item.type === 'measure' ||
      (item.type === 'note' && item.staff === STAFF.bass && hand === 'left') ||
      (item.type === 'note' && item.staff === STAFF.trebl && hand === 'right')
    )
  }

  return (
    <div style={{ width, height }}>
      <Virtualized
        items={items}
        renderItem={renderItem}
        getItemOffsets={getItemOffsets}
        getCurrentOffset={getCurrentOffset}
        itemFilter={itemFilter}
        width={width}
        height={height}
      />
    </div>
  )
}

function isBlack(noteValue: number) {
  return [1, 4, 6, 9, 11].some((x) => noteValue % 12 === x)
}

function FallingNote({ note, noteLength, width, posX }: any) {
  const keyType = isBlack(note.noteValue) ? 'black' : 'white'
  const className = keyType + ' ' + (note.staff === STAFF.bass ? 'left-hand' : 'right-hand')
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
      <div style={{ position: 'relative', left: 10, top: -7, fontSize: 15, color: 'white' }}>
        {measure.number}
      </div>
      <div style={{ width, height: 1, backgroundColor: '#C5C5C5' }}></div>
    </div>
  )
}
