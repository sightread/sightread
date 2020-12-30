import React, { useMemo } from 'react'
import { CanvasRenderer, Config, CanvasItem } from './CanvasRenderer'
import { Hand, PlayableSong, SongMeasure, SongNote } from '../types'
import { getNoteLanes, whiteNoteHeight } from './utils'
import { useSize } from '../hooks/size'
import { isBlack, pickHex } from '../utils'
import { getNote } from '../synth/utils'

type HandSettings = {
  [trackId: string]: {
    hand: Hand | 'none'
  }
}

type SongBoardProps = {
  id?: string
  song: PlayableSong | null
  handSettings: HandSettings // alt names? trackHandMapping, not sure if sound will be included here yet
  hand: Hand
  direction?: 'vertical' | 'horizontal'
}

type NotesAndMeasures = CanvasItem[]

const palette = {
  rightHand: {
    black: '#4912d4',
    white: '#7029fb',
  },
  leftHand: {
    black: '#d74000',
    white: '#ff6825',
  },
  measure: '#C5C5C5', //'#C5C5C5',
}

const PIXELS_PER_SECOND = 150

function getKeyColor(midiNote: number, hand: Hand | 'none'): string {
  const keyType = isBlack(midiNote) ? 'black' : 'white'
  if (hand === 'both' || hand === 'right') {
    return palette.rightHand[keyType]
  } else if (hand === 'left') {
    return palette.leftHand[keyType]
  }
  // hands are set to none for this track
  return 'transparent'
}

function getItemStartEnd(item: SongNote | SongMeasure) {
  const start = item.time * PIXELS_PER_SECOND
  if (item.type === 'note') {
    return { start, end: start + item.duration * PIXELS_PER_SECOND }
  } else {
    return { start, end: start }
  }
}

function getCurrentOffset(time: number) {
  return time * PIXELS_PER_SECOND
}

function getSortedItems(song: PlayableSong | null): NotesAndMeasures {
  if (!song) return []
  return [...song.notes, ...song.measures].sort((i1, i2) => i1.time - i2.time)
}

function CanvasSongBoard({ song, handSettings, direction = 'vertical', hand }: SongBoardProps) {
  const { width, height, measureRef } = useSize()
  const lanes = useMemo(() => getNoteLanes(width), [width])
  const pianoRollStart = useMemo(() => height - whiteNoteHeight(width), [width])
  const notesAndMeasures = useMemo(() => getSortedItems(song).filter(isMatchingHand), [
    song,
    handSettings,
  ])

  // keeping within component scope since song and hand can change
  function isMatchingHand(item: SongMeasure | SongNote) {
    if (item.type === 'measure') {
      return true
    }
    const showLeft = hand === 'both' || hand === 'left'
    if (handSettings[item.track]?.hand === 'left' && showLeft) {
      return true
    }
    const showRight = hand === 'both' || hand === 'right'
    if (handSettings[item.track]?.hand === 'right' && showRight) {
      return true
    }
    return false
  }

  function getItemsInView(sortedItems: NotesAndMeasures, time: number): NotesAndMeasures {
    if (sortedItems.length === 0) {
      return sortedItems
    }

    const viewportStart = getCurrentOffset(time)
    const viewportEnd = viewportStart + (direction === 'vertical' ? height : width) * 1.5 // overscan a vp
    const firstIndex = sortedItems.findIndex((i) => getItemStartEnd(i).end >= viewportStart)
    // could maybe do a slice after getting the first index to iterate on a shorter arr
    const lastIndex = sortedItems.findIndex((i) => getItemStartEnd(i).start >= viewportEnd)
    // returns -1 if nothing satisfies condition
    if (lastIndex === -1) {
      return sortedItems.slice(firstIndex)
    }
    return sortedItems.slice(firstIndex, lastIndex)
  }

  function getItems(time: number) {
    return getItemsInView(notesAndMeasures, time)
  }

  // ¯\_(ツ)_/¯
  function canvasStartPosition(startTime: number, time: number) {
    return height - (startTime - time) * PIXELS_PER_SECOND
  }

  /**
    if the note is currently being played 
    (calculated by if the piano roll is between the note start and end)
    gets the gradient between white (start) to the not color (end)
    as a ratio of the fraction of the note that has been played vs still will be played  
  */
  function playingNoteColor(color: string, y: number, length: number): string {
    if (y + length < height || y > height) {
      return color
    }
    const ratio = Math.max((y + length - height) / length, 0.3) // so color is never fully white
    const grad = pickHex(color, '#ffffff', ratio)
    return grad
  }

  function getItemSettings<T extends CanvasItem>(item: T, time: number): Config<T> {
    if (item.type === 'measure') {
      return {
        posY: Math.floor(canvasStartPosition(item.time, time)),
      } as Config<T>
    }
    const note: SongNote = item as SongNote
    const lane = lanes[note.midiNote - getNote('A0')]
    const length = PIXELS_PER_SECOND * note.duration
    const posY = Math.floor(canvasStartPosition(item.time, time) - length)
    const color = playingNoteColor(
      getKeyColor(note.midiNote, handSettings[note.track].hand),
      posY,
      length,
    )

    return {
      width: lane.width - 2, // accounting for piano key with border 1px
      posX: Math.floor(lane.left + 1),
      posY,
      color,
      length,
    } as Config<T>
  }
  // specify the width and height so the canvas resolution matches the appearance
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }} ref={measureRef}>
      <CanvasRenderer
        getItems={getItems}
        itemSettings={getItemSettings}
        width={width}
        height={height}
      />
    </div>
  )
}

export default CanvasSongBoard
