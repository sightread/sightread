import React, { useRef, useEffect, useMemo } from 'react'
import Player from '../player'
import { Hand, PlayableSong, SongMeasure, SongNote, Track } from '../types'
import { useSize } from '../hooks/size'
import { useRAFLoop } from '../hooks'
import { isBlack } from '../utils'
import { getNote } from '../synth/utils'

type SongBoardProps = {
  id?: string
  song: PlayableSong | null
  hand: Hand
  direction?: 'vertical' | 'horizontal'
}

type Canvas = CanvasRenderingContext2D
type CanvasItem = SongMeasure | SongNote
type NotesAndMeasures = CanvasItem[]
type CanvasContext = Canvas | null | undefined
type Radius = {
  tl?: number
  tr?: number
  bl?: number
  br?: number
}

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

const noteCornerRadius: Radius = {
  tl: 5,
  tr: 5,
  bl: 5,
  br: 5,
}

const PIXELS_PER_SECOND = 150

function getKeyColor(midiNote: number, isLeft: boolean): string {
  const keyType = isBlack(midiNote) ? 'black' : 'white'
  if (isLeft) {
    return palette.leftHand[keyType]
  }
  return palette.rightHand[keyType]
}

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

const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 }
// https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
function roundRect(
  ctx: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: Radius = defaultRadius,
) {
  const getCorner = (corner: keyof Radius): number => {
    return radius[corner] || defaultRadius[corner]
  }
  const tl = getCorner('tl')
  const tr = getCorner('tr')
  const bl = getCorner('bl')
  const br = getCorner('br')
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + width - tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr)
  ctx.lineTo(x + width, y + height - br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height)
  ctx.lineTo(x + bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl)
  ctx.lineTo(x, y + tl)
  ctx.quadraticCurveTo(x, y, x + tl, y)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

function CanvasSongBoard({ song, hand = 'both', direction = 'vertical' }: SongBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctx = useRef<CanvasContext>(null)
  const notesAndMeasures = useRef<NotesAndMeasures>(getSortedItems(song))
  const { width, height, measureRef } = useSize()
  const player = Player.player()
  const lanes = useMemo(() => getNoteLanes(width), [width])

  useEffect(() => {
    const canvas = canvasRef.current?.getContext('2d')
    ctx.current = canvas
  }, [canvasRef.current])

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
    const viewPortStart = getCurrentOffset(player.getTime())
    const viewPortEnd = viewPortStart + (direction === 'vertical' ? height : width) * 1.5 // overscan a vp
    const firstIndex = sortedItems.findIndex((i) => getItemStartEnd(i).end >= viewPortStart)
    // could maybe do a slice after getting the first index to iterate on a shorter arr
    const lastIndex = sortedItems.findIndex((i) => getItemStartEnd(i).start >= viewPortEnd)
    // returns -1 if nothing satisfies condition
    if (lastIndex === -1) {
      return sortedItems.slice(firstIndex, sortedItems.length - 1)
    }
    return sortedItems.slice(firstIndex, lastIndex)
  }

  /* =========== START CANVAS FUNCTIONS ===================== */
  /* ======================================================== */
  useRAFLoop(() => {
    if (!ctx.current) return
    clearCanvas(ctx.current)

    const itemsToShow = getItemsInView(notesAndMeasures.current).filter(isMatchingHand)
    for (const item of itemsToShow) {
      renderItemOnCanvas(ctx.current, item)
    }
  })

  function canvasStartPosition(startTime: number) {
    return height - (startTime - player.getTime()) * PIXELS_PER_SECOND
  }
  function clearCanvas(ctx: Canvas) {
    ctx.clearRect(0, 0, width, height)
  }

  function renderItemOnCanvas(ctx: Canvas, item: CanvasItem): void {
    if (item.type === 'measure') {
      return renderMeasure(ctx, item)
    }
    return renderNote(ctx, item)
  }

  function renderMeasure(ctx: Canvas, measure: SongMeasure): void {
    ctx.save()
    const posY = canvasStartPosition(measure.time) // ¯\_(ツ)_/¯
    ctx.font = '20px Roboto'
    // line
    ctx.beginPath()
    ctx.moveTo(0, posY)
    ctx.lineTo(width, posY)
    ctx.strokeStyle = palette.measure
    ctx.stroke()
    // measure number
    ctx.fillStyle = palette.measure
    ctx.fillText(measure.number.toString(), 10, posY - 10)
    ctx.restore()
  }

  function renderNote(ctx: Canvas, note: SongNote): void {
    const lane = lanes[note.midiNote - getNote('A0')]
    const noteLength = PIXELS_PER_SECOND * note.duration
    const width = lane.width
    const posY = canvasStartPosition(note.time) - noteLength
    const posX = lane.left
    const color = getKeyColor(note.midiNote, note.track === song?.config.left)
    ctx.save()
    ctx.fillStyle = color
    ctx.strokeStyle = color
    roundRect(ctx, posX, posY, width, noteLength, noteCornerRadius)
    ctx.restore()
  }

  // specify the width and height so the canvas resolution matches the appearance
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }} ref={measureRef}>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </div>
  )
}

export default CanvasSongBoard
