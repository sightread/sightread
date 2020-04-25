import "./player"
import React, { useState, useEffect, useRef, useCallback } from "react"
import "./App.css"
import { usePlayer, useRAFLoop, usePressedKeys, useWindowSize } from "./hooks"
import { parseMusicXML, Song, SongMeasure } from "./utils"
import { WebAudioFontSynth } from "./player"

/**
 * Only display items in the viewport.
 *
 * How the fuck shoudl this work?
 * 1. Determine for each component, what its absolute height offset should be. Cache it forever.
 * 2. Based on that, figure out which should be displayed on screen
 */

function pixelsPerDuration(song: Song) {
  return 100 * (1 / song.divisions)
}

function getKeyboardHeight(width: number) {
  const whiteWidth = width / 52
  return (220 / 30) * whiteWidth
}

function getKeyPositions(width: any) {
  const whiteWidth = width / 52
  const height = (220 / 30) * whiteWidth

  const blackNotes = [1, 4, 6, 9, 11]
  const notes: any = []
  let totalNotes = 0

  // for (var whiteNotes = 0; whiteNotes < 52; whiteNotes++, totalNotes++) {
  //   if (blackNotes.includes(totalNotes % 12)) {
  //     notes.push(createNoteObject(whiteNotes, whiteWidth, height, "black"))
  //     totalNotes++
  //   }
  //   notes.push(createNoteObject(whiteNotes, whiteWidth, height, "white"))
  // }
  return notes
}

export function WindowedSongBoard({ song }: { song: Song }) {
  const windowSize = useWindowSize()
  const { player } = usePlayer()
  const { measures, notes, duration, divisions } = song
  const indexes: any = useRef(null)
  const outerRef: any = useRef(null)
  const innerRef: any = useRef(null)
  const [positionCache, setPositionCache]: any = useState(null)

  useEffect(() => {
    if (song.duration > 0) {
      setPositionCache(calculateCache(song, measures))
    }
  }, [song])

  useRAFLoop(() => {
    if (!outerRef.current || !innerRef.current) {
      return
    }
    const totalHeight = duration * pixelsPerDuration(song)
    const offset = player.getTime() * pixelsPerDuration(song)
    outerRef.current.scrollTop = totalHeight - offset - windowSize.height
    // outerRef.current.scrollTo(0, totalHeight - offset - windowSize.height)
    // innerRef.current.style.transform = `translateY(-${totalHeight - offset - windowSize.height}px)`
  })

  // const [startIndex, stopIndex] = getRenderRange(song)
  const [startIndex, stopIndex] = [0, 7]
  // const pianoKeysArray = getKeyPositions(windowSize.width)
  const items = []
  if (positionCache) {
    for (let i = startIndex; i < stopIndex; i++) {
      items.push(
        <Measure
          measure={measures[i]}
          width={windowSize.width}
          key={`measure-${i}`}
          offset={positionCache.get(measures[i]) - getKeyboardHeight(windowSize.width)}
        />,
      )
    }
  }
  console.count("WindowedSongBoardRenders")
  return (
    <div
      style={{
        position: "relative",
        overflow: "auto",
        height: windowSize.height - getKeyboardHeight(windowSize.height), // TODO(rendering extra keyboardHeight vp above.). Make less stupid.
        width: windowSize.width,
      }}
      ref={outerRef}
    >
      <div
        style={{
          height: duration * pixelsPerDuration(song),
          width: "100%",
          touchAction: "none",
        }}
        ref={innerRef}
      >
        {items}
      </div>
    </div>
  )
}

function calculateCache(song: Song, measures: SongMeasure[]): Map<any, number> {
  const getMeasureOffset = (measure: SongMeasure) => {
    const totalHeight = song.duration * pixelsPerDuration(song)
    return totalHeight - measure.time * pixelsPerDuration(song)
  }

  const positionCache = new Map()
  positionCache.clear()
  measures.forEach((m) => {
    positionCache.set(m, getMeasureOffset(m))
  })
  return positionCache
}

// function getRenderRange(offset, measures) {
// const viewportBottom = Math.min(height, (100 * time) / (divisions ?? 1))
// const viewportTop = viewportBottom + windowSize.height
// const [firstIndex, lastIndex] = indexes.current ?? [0, 0]
// if (
//   (cacheRef.current.song && Object.keys(cacheRef.current).length > 1 && !indexes.current) ||
//   (cacheRef.current.song &&
//     (cache[firstIndex] < viewportBottom ||
//       cache[firstIndex] > viewportTop ||
//       cache[lastIndex] < viewportBottom ||
//       cache[lastIndex] > viewportTop))
// ) {
//   let firstMeasure = measures.findIndex((m, i) => cache[i] > viewportBottom)
//   if (firstMeasure === -1) {
//     firstMeasure = 0
//   }
//   let lastMeasure = measures.findIndex((m, i) => cache[i + 1] > viewportTop)
//   if (lastMeasure === -1) {
//     lastMeasure = Math.max(0, measures.length - 1)
//   }
//   indexes.current = [firstMeasure, lastMeasure]
// }
// }

function isBlack(noteValue: number) {
  return [1, 4, 6, 9, 11].some((x) => noteValue % 12 === x)
}

function SongNote({ note, noteLength, width, posX, posY }: any) {
  const keyType = isBlack(note.noteValue) ? "black" : "white"
  const className = keyType + " " + (note.staff === 1 ? "left-hand" : "right-hand")
  return (
    <div
      style={{
        height: noteLength,
        width,
        position: "absolute",
        bottom: posY,
        left: posX,
        textAlign: "center",
        borderRadius: "6px",
        touchAction: "none",
      }}
      className={className}
    >
      {/* {note.pitch.step},{note.pitch.octave},{note.noteValue} */}
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
  return (
    <div
      id={`measure-${measure.number}`}
      style={{
        position: "absolute",
        top: offset,
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 15,
          left: 10,
          top: -7,
          fontSize: 15,
          color: "white",
          touchAction: "none",
        }}
      >
        {measure.number}
      </div>
      <div
        style={{
          height: 1,
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          width,
          touchAction: "none",
        }}
        key={`measure-${measure.number}`}
      ></div>
    </div>
  )
}
