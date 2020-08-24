import './player'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { usePlayer, useRAFLoop, useWindowSize } from './hooks'
import { Song, SongMeasure, STAFF, SongNote } from './utils'

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

export function WindowedSongBoard({ song, hand }: { song: Song; hand: 'both' | 'left' | 'right' }) {
  const windowSize = useWindowSize()
  const { player } = usePlayer()
  const items: Array<SongMeasure | SongNote> = useMemo(() => {
    return [...song.measures, ...song.notes]
  }, [song, hand])
  const lanes = useMemo(() => getNoteLanes(windowSize.width), [windowSize])

  const renderItem = (item: SongMeasure | SongNote, i: number) => {
    if (item.type === 'measure') {
      return <Measure measure={item} width={windowSize.width} key={`measure-${item.number}`} />
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
      return { start, end: start + 10 }
    }
  }
  const getCurrentOffset = () => player.getTime() * PIXELS_PER_SECOND

  return (
    <div
      style={{ position: 'fixed', bottom: getKeyboardHeight(windowSize.width), height: '100vh' }}
    >
      <Virtualized
        items={items}
        renderItem={renderItem}
        getItemOffsets={getItemOffsets}
        getCurrentOffset={getCurrentOffset}
      />
    </div>
  )
}

function isBlack(noteValue: number) {
  return [1, 4, 6, 9, 11].some((x) => noteValue % 12 === x)
}

function FallingNote({ note, noteLength, width, posX }: any) {
  const keyType = isBlack(note.noteValue) ? 'black' : 'white'
  const className = keyType + ' ' + (note.staff === 1 ? 'left-hand' : 'right-hand')
  return (
    <div
      style={{
        position: 'relative',
        left: posX,
        height: noteLength,
        width,
        textAlign: 'center',
        borderRadius: '6px',
      }}
      className={className}
    >
      {/* {note.pitch.step} */}
    </div>
  )
}

function Measure({ width, measure }: { width: number; measure: SongMeasure }) {
  const height = 15
  return (
    <div id={`measure-${measure.number}`}>
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
          backgroundColor: '#C5C5C5',
          width,
        }}
        key={`measure-${measure.number}`}
      ></div>
    </div>
  )
}
