import React, { useRef, useEffect, useMemo } from 'react'
import Player from '../player'
import { CanvasRenderer, Config, CanvasItem } from './CanvasRenderer'
import { Hand, PlayableSong, SongMeasure, SongNote } from '../types'
import { getNoteLanes } from './utils'
import { useSize } from '../hooks/size'
import { isBlack } from '../utils'
import { getNote } from '../synth/utils'

type SongBoardProps = {
  id?: string
  song: PlayableSong | null
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

function getKeyColor(midiNote: number, isLeft: boolean): string {
  const keyType = isBlack(midiNote) ? 'black' : 'white'
  if (isLeft) {
    return palette.leftHand[keyType]
  }
  return palette.rightHand[keyType]
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

function CanvasSongBoard({ song, hand = 'both', direction = 'vertical' }: SongBoardProps) {
  const notesAndMeasures = useRef<NotesAndMeasures>(getSortedItems(song))
  const { width, height, measureRef } = useSize()
  const player = Player.player()
  const lanes = useMemo(() => getNoteLanes(width), [width])

  useEffect(() => {
    notesAndMeasures.current = getSortedItems(song)
  }, [song])

  // keeping within component scope since song and hand can change
  function isMatchingHand(item: SongMeasure | SongNote) {
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

  function getItemsInView(sortedItems: NotesAndMeasures): NotesAndMeasures {
    if (sortedItems.length === 0) {
      return sortedItems
    }

    const viewportStart = getCurrentOffset(player.getTime())
    const viewportEnd = viewportStart + (direction === 'vertical' ? height : width) * 1.5 // overscan a vp
    const firstIndex = sortedItems.findIndex((i) => getItemStartEnd(i).end >= viewportStart)
    // could maybe do a slice after getting the first index to iterate on a shorter arr
    const lastIndex = sortedItems.findIndex((i) => getItemStartEnd(i).start >= viewportEnd)
    // returns -1 if nothing satisfies condition
    if (lastIndex === -1) {
      return sortedItems.slice(firstIndex, sortedItems.length - 1)
    }
    return sortedItems.slice(firstIndex, lastIndex)
  }

  function getItems() {
    return getItemsInView(notesAndMeasures.current).filter(isMatchingHand)
  }

  // ¯\_(ツ)_/¯
  function canvasStartPosition(startTime: number) {
    return height - (startTime - player.getTime()) * PIXELS_PER_SECOND
  }

  function getItemSettings<T extends CanvasItem>(item: T): Config<T> {
    if (item.type === 'measure') {
      return {
        posY: canvasStartPosition(item.time),
      } as Config<T>
    }
    const note = item as SongNote
    const lane = lanes[note.midiNote - getNote('A0')]
    const length = PIXELS_PER_SECOND * note.duration
    return {
      width: lane.width - 2, // accounting for piano key with border 1px
      posX: lane.left + 1,
      color: getKeyColor(note.midiNote, note.track === song?.config.left),
      posY: canvasStartPosition(item.time) - length,
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
