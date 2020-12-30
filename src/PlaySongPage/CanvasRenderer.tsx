import { timingSafeEqual } from 'crypto'
import React, { useRef, useCallback } from 'react'
import { isReturnStatement, parseConfigFileTextToJson } from 'typescript'
import { useRAFLoop } from '../hooks'
import Player from '../player'
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
  getItems: (time: number) => CanvasItem[]
  width: number
  height: number
  itemSettings<T extends CanvasItem>(item: T, time: number): Config<T>
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

// Idea: could pre-render an array of particle generators to cycle through
// so dont need to re-create them

export function CanvasRenderer({ getItems, width, height, itemSettings }: CanvasRendererProps) {
  const ctxRef = useRef<Canvas>()
  // key -> generator (key is x position since this is unique for every unique note)
  const particleEffects = useRef<Map<number, ParticleGenerator>>(
    new Map<number, ParticleGenerator>(),
  )
  const tempParticles = useRef<Map<number, ParticleGenerator>>(new Map<number, ParticleGenerator>())

  const setContext = useCallback(
    (canvasEl: HTMLCanvasElement) => {
      if (!canvasEl) {
        return
      }

      // Canvas will look blurry on Hi-DPI displays since CSS Pixel < real pixel
      // Use devicePixelRatio to scale the size: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio.
      canvasEl.style.width = width + 'px'
      canvasEl.style.height = height + 'px'
      const scale = window.devicePixelRatio ?? 1
      canvasEl.width = Math.floor(width * scale)
      canvasEl.height = Math.floor(height * scale)

      ctxRef.current = canvasEl.getContext('2d')!
      // Normalize coordinate system to use css pixels.
      ctxRef.current!.scale(scale, scale)
    },
    [width, height],
  )

  useRAFLoop(() => {
    if (!ctxRef.current) {
      return
    }
    const ctx = ctxRef.current
    const time = Player.player().getTime()
    clearCanvas(ctx)
    for (const item of getItems(time)) {
      renderItem(ctx, item, time)
    }
    updateParticles(ctx)
  })

  function renderItem(ctx: Canvas, item: CanvasItem, time: number): void {
    if (item.type === 'measure') {
      return renderMeasure(ctx, item, time)
    }
    return renderNote(ctx, item, time)
  }

  function renderMeasure(ctx: Canvas, measure: SongMeasure, time: number): void {
    const { posY } = itemSettings(measure, time)
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

  function renderNote(ctx: Canvas, note: SongNote, time: number): void {
    const config = itemSettings(note, time)
    ctx.save()
    ctx.fillStyle = config.color
    ctx.strokeStyle = config.color
    roundRect(ctx, config.posX, config.posY, config.width, config.length)
    applyParticles(ctx, config)
    ctx.restore()
  }

  function updateParticles(ctx: Canvas): void {
    particleEffects.current = new Map(tempParticles.current)
    tempParticles.current.clear()
    for (const effect of particleEffects.current.values()) {
      effect.update(ctx)
    }
  }

  function applyParticles(ctx: Canvas, config: NoteConfig): void {
    const { posX } = config

    if (config.posY + config.length < height || config.posY > height) {
      return
    }

    const effect: ParticleGenerator =
      particleEffects.current.get(posX) ?? new ParticleGenerator(posX, height, config.width)
    tempParticles.current.set(posX, effect)
  }

  function clearCanvas(ctx: Canvas) {
    ctx.clearRect(0, 0, width, height)
  }

  return <canvas ref={setContext} width={width} height={height} />
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

function circle(ctx: Canvas, x: number, y: number, r: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.fillRect(x, y, r, r) // if the object is small use rect instead of circle
  ctx.restore()
}

const numParticles = 30
const particleRadius = 2
const velocity = {
  x: {
    min: 0.1,
    max: 0.3,
  },
  y: {
    min: 0.3,
    max: 2.4,
  },
  opacity: {
    min: 0.003,
    max: 0.015,
  },
  precision: 5, // num decimal places
}

class ParticleGenerator {
  // config: NoteConfig
  posX: number
  posY: number
  width: number
  particles: Particle[] = []

  constructor(posX: number, posY: number, width: number) {
    this.posX = posX
    this.posY = posY
    this.width = width
    for (let i = 0; i < numParticles; i++) {
      this.particles.push(new Particle())
    }
  }

  update(ctx: Canvas) {
    for (const particle of this.particles) {
      particle.update(ctx, this.posX, this.posY, this.width)
    }
  }
}

function randomNegative(): number {
  return Math.random() < 0.5 ? -1 : 1
}

function randDecimal(min: number, max: number, decimalPlaces: number): number {
  const rand =
    Math.random() < 0.5
      ? (1 - Math.random()) * (max - min) + min
      : Math.random() * (max - min) + min // could be min or max or anything in between
  const power = Math.pow(10, decimalPlaces)
  return Math.floor(rand * power) / power
}

function hexToRgb(hexValue: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue)
  if (!result) {
    throw new Error(`Invalid hex value ${hexValue}`)
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function rgbaString(color: RGB, opacity: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity.toString()})`
}

type RGB = {
  r: number
  g: number
  b: number
}

class Particle {
  __offsetPercent: number // used so particles are spawned at random x vals within the key width
  // __color: RGB
  __x: number = 0
  __y: number = 0
  __opacity = 1 // will fade out as moves away
  __dx: number
  __dy: number
  __dO: number
  shouldReset: boolean = false // signal when it should be killed
  constructor() {
    // this.__color = hexToRgb(color)
    this.__offsetPercent = Math.random()
    this.__dx = randDecimal(velocity.x.min, velocity.x.max, velocity.precision) * randomNegative() // x can go left or right
    this.__dy = randDecimal(velocity.y.min, velocity.y.max, velocity.precision)
    this.__dO = randDecimal(velocity.opacity.min, velocity.opacity.max, velocity.precision)
  }
  // passing x, w, and h as params makes sure that they are always up to date if the canvas
  // changes sizes
  update(ctx: Canvas, posX: number, posY: number, width: number) {
    const x = width * this.__offsetPercent + this.__x + posX
    const y = posY + this.__y
    // const color = rgbaString(this.__color, this.__opacity)
    const color = `rgba(255, 255, 255, ${this.__opacity.toString()})`
    circle(ctx, x, y, particleRadius, color)
    this.__x += this.__dx
    this.__y -= this.__dy
    this.__opacity -= this.__dO
    if (this.__opacity <= 0) {
      this.reset()
    }
  }

  reset(): void {
    this.__x = 0
    this.__y = 0
    this.__opacity = 1
  }
}
