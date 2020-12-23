import React, { useRef, useEffect } from 'react'
import { useRAFLoop } from '../hooks'
import { SongMeasure, SongNote } from '../types'

type CanvasContext = Canvas | null | undefined
type Canvas = CanvasRenderingContext2D

type MeasureConfig = {
  posY: number
}
type NoteConfig = {
  posY: number
  width: number
  length: number
  posX: number
  color: string
}
export type CanvasItem = SongMeasure | SongNote
export type Config<T> = T extends SongMeasure
  ? MeasureConfig
  : T extends SongNote
  ? NoteConfig
  : never

type CanvasRendererProps = {
  getItems: () => CanvasItem[]
  width: number
  height: number
  itemSettings<T extends CanvasItem>(item: T): Config<T>
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

export function CanvasRenderer({ getItems, width, height, itemSettings }: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctx = useRef<CanvasContext>(null)

  useEffect(() => {
    const canvas = canvasRef.current?.getContext('2d')
    ctx.current = canvas
  }, [canvasRef.current])

  function clearCanvas(ctx: Canvas) {
    ctx.clearRect(0, 0, width, height)
  }

  useRAFLoop(() => {
    if (!ctx.current) return
    clearCanvas(ctx.current)
    const itemsToShow = getItems()
    for (const item of itemsToShow) {
      renderItemOnCanvas(ctx.current, item)
    }
  })
  function renderMeasure(ctx: Canvas, measure: SongMeasure): void {
    const { posY } = itemSettings(measure)
    ctx.save()
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
    const config = itemSettings(note)
    ctx.save()
    ctx.fillStyle = config.color
    ctx.strokeStyle = config.color
    roundRect(ctx, config.posX, config.posY, config.width, config.length)
    ctx.restore()
  }

  function renderItemOnCanvas(ctx: Canvas, item: CanvasItem): void {
    if (item.type === 'measure') {
      return renderMeasure(ctx, item)
    }
    return renderNote(ctx, item)
  }
  return <canvas ref={canvasRef} width={width} height={height} />
}

const radius = 5
const noteCornerRadius = {
  tl: radius,
  tr: radius,
  bl: radius,
  br: radius,
}
function roundRect(ctx: Canvas, x: number, y: number, width: number, height: number): void {
  if (height < radius) {
    ctx.fillRect(x, y, width, height > 2 ? height : 2)
    return
  }
  const getCornerRadii = () => {
    if (width > radius) {
      return noteCornerRadius
    }
    const r = width - 1
    return { tl: r, tr: r, bl: r, br: r }
  }
  const { tl, tr, bl, br } = getCornerRadii()

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
