import './player'
import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { usePlayer, useRAFLoop, useWindowSize } from './hooks'
import { Song, SongMeasure } from './utils'

/**
 * Only display items in the viewport.
 *
 * How the fuck shoudl this work?
 * 1. Determine for each component, what its absolute height offset should be. Cache it forever.
 * 2. Based on that, figure out which should be displayed on screen
 */

const PIXELS_PER_SECOND = 150

function getKeyboardHeight(width: number) {
  const whiteWidth = width / 52
  return (220 / 30) * whiteWidth
}

function createNoteObject(whiteNotes: any, whiteWidth: any, height: any, type: any) {
  switch (type) {
    case 'black':
      return {
        left: whiteNotes * whiteWidth - whiteWidth / 4,
        width: whiteWidth / 2,
        color: 'black',
        height: height * (2 / 3),
      }
    case 'white':
      return {
        left: whiteNotes * whiteWidth,
        height: height,
        width: whiteWidth,
        color: 'white',
      }
    default:
      throw Error('Invalid note type')
  }
}

function getNoteLanes(width: any) {
  const whiteWidth = width / 52
  const height = (220 / 30) * whiteWidth

  const blackNotes = [1, 4, 6, 9, 11]
  const notes: any = []
  let totalNotes = 0

  for (var whiteNotes = 0; whiteNotes < 52; whiteNotes++, totalNotes++) {
    if (blackNotes.includes(totalNotes % 12)) {
      notes.push(createNoteObject(whiteNotes, whiteWidth, height, 'black'))
      totalNotes++
    }
    notes.push(createNoteObject(whiteNotes, whiteWidth, height, 'white'))
  }
  return notes
}

export function WindowedSongBoard({ song, hand }: { song: Song; hand: string }) {
  const windowSize = useWindowSize()
  const { player } = usePlayer()
  const outerRef: any = useRef(null)
  const innerRef: any = useRef(null)
  const [itemsCache, setItemsCache]: any = useState(null)
  const [startAndStopIndex, setIndexes] = useState([0, 0])

  useEffect(() => {
    setItemsCache(calculateCache(song, windowSize))
  }, [song, windowSize])

  useRAFLoop((dt: number) => {
    if (!outerRef.current || !innerRef.current) {
      return
    }
    const now = player.getTime()
    let offset = getTimeOffset(song, now) - windowSize.height + getKeyboardHeight(windowSize.width)
    offset *= -1
    innerRef.current.style.transform = `translateY(${offset}px)`

    //  can heavily optimize this part. only do calculations once ever Npx difference.
    const newIndexes = itemsCache.getRenderRange(player.getTime(), hand)
    if (startAndStopIndex[0] !== newIndexes[0] || startAndStopIndex[1] !== newIndexes[1]) {
      setIndexes(newIndexes)
    }
  })

  if (!itemsCache) {
    return <> </>
  }

  const [startIndex, stopIndex] = itemsCache.getRenderRange(player.getTime(), hand)
  const getHandItems = () => {
    switch (hand) {
      case 'both':
        return itemsCache.hands.items
      case 'left':
        return itemsCache.hands.leftItems
      case 'right':
        return itemsCache.hands.rightItems
      default:
        console.error('should not get here in getHandItems()')
        return []
    }
  }
  // console.count('WindowedSongBoardRenders')
  return (
    <div
      style={{
        position: 'fixed',
        overflow: 'hidden',
        height: windowSize.height, // TODO(rendering extra keyboardHeight vp above.). Make less stupid.
        width: windowSize.width,
      }}
      ref={outerRef}
    >
      <div
        style={{
          height: song.duration * PIXELS_PER_SECOND,
          width: '100%',
          willChange: 'transform',
        }}
        ref={innerRef}
      >
        {getHandItems().slice(startIndex, stopIndex)}
      </div>
    </div>
  )
}
function getTimeOffset(song: Song, time: number) {
  const totalHeight = song.duration * PIXELS_PER_SECOND
  return totalHeight - time * PIXELS_PER_SECOND
}

function calculateCache(song: Song, windowSize: any): any {
  const { width: windowWidth, height: windowHeight } = windowSize

  const positions = new Map()
  const items: JSX.Element[] = []
  const leftItems: JSX.Element[] = []
  const rightItems: JSX.Element[] = []

  song.measures.forEach((m) => {
    const offset = getTimeOffset(song, m.time)
    const item = (
      <Measure measure={m} width={windowWidth} key={`measure-${m.number}`} offset={offset} />
    )
    positions.set(item, { start: offset, end: offset - 15 })
    items.push(item)
    leftItems.push(item)
    rightItems.push(item)
  })

  const lanes = getNoteLanes(windowWidth)

  song.notes.forEach((note, i) => {
    const lane = lanes[note.noteValue]
    const offset = getTimeOffset(song, note.time)
    const item: JSX.Element = (
      <SongNote
        // noteLength={note.duration * pixelsPerDuration(song)}
        noteLength={PIXELS_PER_SECOND * note.duration}
        width={lane.width}
        posX={lane.left}
        offset={offset}
        note={note}
        key={`songnote-${note.time}-${note.noteValue}-${i}`}
      />
    )
    positions.set(item, {
      start: offset,
      end: getTimeOffset(song, note.time + note.duration),
    })
    items.push(item)
    if (note.staff === 1) {
      leftItems.push(item)
    } else {
      rightItems.push(item)
    }
  })

  items.sort((item1: any, item2: any) => -(positions.get(item1).start - positions.get(item2).start))
  leftItems.sort(
    (item1: any, item2: any) => -(positions.get(item1).start - positions.get(item2).start),
  )
  rightItems.sort(
    (item1: any, item2: any) => -(positions.get(item1).start - positions.get(item2).start),
  )

  function getRenderRange(time: number, hand: string) {
    const viewportBottom = getTimeOffset(song, time)
    // always have an extra half viewport overscanned in the scan direction
    const viewportTop = viewportBottom - windowHeight * 1.5

    function getRangeForHand(handArray: JSX.Element[]) {
      let firstIndex = 0
      for (let i = 1; i < handArray.length; i++) {
        const position = positions.get(handArray[i])
        if (position.end <= viewportBottom) {
          firstIndex = i
          break
        }
      }

      let lastIndex = handArray.length - 1
      for (let i = lastIndex - 1; i > 0; i--) {
        const position = positions.get(handArray[i])
        if (position.start >= viewportTop) {
          lastIndex = i
          break
        }
      }

      return [firstIndex, lastIndex]
    }
    switch (hand) {
      case 'both':
        return getRangeForHand(items)
      case 'left':
        return getRangeForHand(leftItems)
      case 'right':
        return getRangeForHand(rightItems)
      default:
        console.error('should not get here in get render range')
    }
  }
  const hands = { items, leftItems, rightItems }
  return { hands, positions, getRenderRange }
}

function isBlack(noteValue: number) {
  return [1, 4, 6, 9, 11].some((x) => noteValue % 12 === x)
}

function SongNote({ note, noteLength, width, posX, offset }: any) {
  const keyType = isBlack(note.noteValue) ? 'black' : 'white'
  const className = keyType + ' ' + (note.staff === 1 ? 'left-hand' : 'right-hand')
  return (
    <div
      style={{
        top: offset - noteLength,
        position: 'absolute',
        left: posX,
        height: noteLength,
        width,
        textAlign: 'center',
        borderRadius: '6px',
      }}
      className={className}
    >
      {note.pitch.step}
    </div>
  )
}

function Measure({
  width,
  measure,
  offset,
}: {
  width: number
  measure: SongMeasure
  offset: number
}) {
  const height = 15
  return (
    <div
      id={`measure-${measure.number}`}
      style={{
        position: 'absolute',
        top: offset - height,
      }}
    >
      <div
        style={{
          position: 'relative',
          height,
          left: 10,
          top: -7,
          fontSize: 15,
          color: 'white',
        }}
      >
        {measure.number}
      </div>
      <div
        style={{
          height: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          width,
        }}
        key={`measure-${measure.number}`}
      ></div>
    </div>
  )
}
