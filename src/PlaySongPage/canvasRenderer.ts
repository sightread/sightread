import { SongMeasure, SongNote, Hand, PlayableSong } from '../types'
import { isBlack, isBrowser, pickHex, shallowEquals } from '../utils'
import { getNoteLanes } from './utils'
import { getNote } from '../synth/utils'
import { circle, drawMusicNote, line, roundRect } from '../canvas/utils'

type Canvas = CanvasRenderingContext2D
type CanvasItem = SongMeasure | SongNote
type HandSettings = {
  [trackId: string]: {
    hand: Hand | 'none'
  }
}

type Palette = {
  right: {
    black: string
    white: string
  }
  left: {
    black: string
    white: string
  }
  measure: string
}
type FallinNoteLane = {
  width: number
  left: number
}

type SheetIconProps = {
  width: number
  height: number
  style: {
    left: number
    position: 'absolute'
    top: number
  }
}

/* =================== START SHEET VIS HELPERS ======================== */
/* ==================================================================== */
const PIXELS_PER_STAFF_ROW = 16
const STAFF_START_X = 150
const PLAY_NOTES_LINE_X = 250
const PLAY_NOTES_WIDTH = 20
const PLAY_NOTES_LINE_OFFSET = PIXELS_PER_STAFF_ROW * 4 // offset above and below the staff lines
const PLAY_NOTES_LINE_COLOR = 'rgba(110, 40, 251, 0.43)' // '#7029fb'
const NOTE_ALPHA = 'A2'
const STEP_NUM: any = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
}

// There are 52 white keys. 8 notes per octave.
function getRow(octave: number, step: string): number {
  return octave * 8 + STEP_NUM[step]
}

/* ==================== SHEET BACKGROUND HELPERS ====================== */
function trebleBottomY(height: number): number {
  const center = Math.round(height / 2)
  return center - 50 // 50px above the center
}

function trebleTopY(height: number): number {
  const bottom = trebleBottomY(height)
  return bottom - PIXELS_PER_STAFF_ROW * 5
}

function bassTopY(height: number): number {
  const center = Math.round(height / 2)
  return center + 50
}

function bassBottomY(height: number): number {
  const top = bassTopY(height)
  return top + PIXELS_PER_STAFF_ROW * 5
}

function drawTrebleStaffLines(ctx: Canvas, width: number, height: number): void {
  const trebleBotttom = trebleBottomY(height)
  for (let i = 0; i <= 5; i++) {
    const y = trebleBotttom - i * PIXELS_PER_STAFF_ROW
    line(ctx, STAFF_START_X, y, width, y)
  }
  line(ctx, STAFF_START_X, trebleBotttom, STAFF_START_X, trebleBotttom - 5 * PIXELS_PER_STAFF_ROW)
}

function drawBassStaffLines(ctx: Canvas, width: number, height: number): void {
  const bassTop = bassTopY(height)
  for (let i = 0; i <= 5; i++) {
    const y = bassTop + i * PIXELS_PER_STAFF_ROW
    line(ctx, STAFF_START_X, y, width, y)
  }
  line(ctx, STAFF_START_X, bassTop, STAFF_START_X, bassTop + 5 * PIXELS_PER_STAFF_ROW)
}

function drawPlayNotesLine(ctx: Canvas, width: number, height: number): void {
  ctx.save()
  const top = trebleTopY(height) - PLAY_NOTES_LINE_OFFSET
  const bottom = bassBottomY(height) + PLAY_NOTES_LINE_OFFSET
  ctx.lineWidth = PLAY_NOTES_WIDTH
  ctx.strokeStyle = PLAY_NOTES_LINE_COLOR
  line(ctx, PLAY_NOTES_LINE_X, top, PLAY_NOTES_LINE_X, bottom)
  ctx.restore()
}

function renderBackgroundLines(state: State): void {
  const { ctx, width, height } = state
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, PLAY_NOTES_LINE_X + 10, height)
  ctx.fillStyle = 'black'
  drawTrebleStaffLines(ctx, width, height)
  drawBassStaffLines(ctx, width, height)
  drawPlayNotesLine(ctx, width, height)
}

/* ===================== END SHEET VIS HELPERS ======================== */
/* ==================================================================== */

const palette: Palette = {
  right: {
    black: '#4912d4',
    white: '#7029fb',
  },
  left: {
    black: '#d74000',
    white: '#ff6825',
  },
  measure: '#C5C5C5',
}

function getItemsInView(state: State): CanvasItem[] {
  let startPred = (item: CanvasItem) => getItemStartEnd(item, state).end <= state.height
  let endPred = (item: CanvasItem) => getItemStartEnd(item, state).start < 0

  if (state.visualization === 'sheet') {
    startPred = (item: CanvasItem) => getItemStartEnd(item, state).end >= 0
    endPred = (item: CanvasItem) => getItemStartEnd(item, state).start > state.width
  }

  // First get the whole slice of notes in view.
  return getRange(state.items, startPred, endPred).filter((item) => {
    // Filter out the contiguous notes that may have already clipped below screen.
    // As well as non matching items
    return startPred(item) && isMatchingHand(item, state)
  })
}

/**
 * Get the contigious range starting from the first element that returns true from the startPred
 * until the first element that fails the endPred.
 */
function getRange<T>(
  array: T[],
  startPred: (elem: T) => boolean,
  endPred: (elem: T) => boolean,
): T[] {
  let start = array.findIndex(startPred)
  if (start === -1) {
    return []
  }

  let end = start + 1
  for (; end < array.length && !endPred(array[end]); end++) {}

  return array.slice(start, end)
}

/*
 * Derives what percent of the note has already been played.
 * For example, a note with duration 1s that has been played for 0.3s
 * should return 0.7.
 * Fully played or not played at all --> 1
 */
function getNotePlayedRatio(note: SongNote, state: State): number {
  const itemPos = getItemStartEnd(note, state)
  const noteLen = note.duration * state.pps
  const offset = itemPos.start - state.height
  return Math.min(Math.max(offset / noteLen, 0), 1)
}

function getNoteColor(note: SongNote, state: State): string {
  const hand = state.hands[note.track]?.hand ?? 'both'
  const keyType = isBlack(note.midiNote) ? 'black' : 'white'

  let color
  if (hand === 'both' || hand === 'right') {
    color = palette.right[keyType]
  } else {
    color = palette.left[keyType]
  }
  const playedRatio = getNotePlayedRatio(note, state)
  return pickHex(color, '#ffffff', playedRatio === 0 ? 1 : playedRatio)
}

function getItemStartEnd(item: CanvasItem, state: State): { start: number; end: number } {
  if (state.visualization == 'falling-notes') {
    const start = state.viewport.start - item.time * state.pps
    const duration = item.type === 'note' ? item.duration : 0
    const end = start - duration * state.pps
    return { start, end }
  }

  const start = item.time * state.pps - state.viewport.start
  const duration = item.type === 'note' ? item.duration : 0
  const end = start + duration * state.pps
  return { start, end }
}

function isMatchingHand(item: CanvasItem, state: State) {
  const { hand, hands } = state
  switch (item.type) {
    case 'measure':
      return state.visualization === 'falling-notes'
    case 'note':
      const showLeft = hand === 'both' || hand === 'left'
      if (showLeft && hands[item.track]?.hand === 'left') {
        return true
      }
      const showRight = hand === 'both' || hand === 'right'
      if (showRight && hands[item.track]?.hand === 'right') {
        return true
      }
      return false
    default:
      throw new Error('isMatching hand received unkown type.')
  }
}

export type GivenState = {
  time: number
  visualization: 'falling-notes' | 'sheet'
  width: number
  height: number
  pps: number // pixels per second
  hand: Hand
  hands: HandSettings
  ctx: CanvasRenderingContext2D
  showParticles: boolean
  items: CanvasItem[]
}

type DerivedState = {
  lanes: { left: number; width: number }[]
  viewport: { start: number; end: number }
  // active (currently being played).
  // Pulsing + Particles.
  // particles: any
}
type State = Readonly<GivenState & DerivedState>

function memo(
  fn: Function,
  getDeps: (...args: any[]) => any[] = (...args) => [args[0]],
): typeof fn {
  let lastDeps: any[]
  let cached: any
  return (...args: any[]) => {
    const deps = getDeps(...args)
    if (!lastDeps || !shallowEquals(deps, lastDeps)) {
      lastDeps = deps
      cached = fn(...args)
    }
    return cached
  }
}

const memoedDerivers = {
  lanes: memo(
    (s: GivenState) => getNoteLanes(s.width),
    (s: GivenState) => [s.width],
  ),
}

function getViewport(state: Readonly<GivenState>) {
  if (state.visualization === 'falling-notes') {
    return {
      start: state.time * state.pps + state.height,
      end: state.time * state.pps,
    }
  }

  return {
    start: state.time * state.pps,
    end: state.time * state.pps + (state.width - STAFF_START_X),
  }
}

function deriveState(state: Readonly<GivenState>): State {
  const derived: DerivedState = {
    lanes: memoedDerivers.lanes(state),
    viewport: getViewport(state),
  }
  return { ...state, ...derived }
}

export function render(givenState: Readonly<GivenState>) {
  const state = deriveState(givenState)
  state.ctx.clearRect(0, 0, state.width, state.height)
  if (state.visualization === 'falling-notes') {
    renderFallingVis(state)
  } else {
    renderSheetVis(state)
  }

  // Disable before comitting
  if (isBrowser() && window.location.origin.includes('localhost')) {
    renderDebugInfo(state)
  }
}

function renderItem(item: CanvasItem, state: State) {
  if (item.type === 'note') {
    renderFallingNote(item, state)
  } else if (item.type === 'measure') {
    renderMeasure(item, state)
  }
}

let pgen: ParticleGenerator
function getParticleGenerator() {
  if (!pgen) {
    pgen = new ParticleGenerator()
  }
  return pgen
}

function renderFallingVis(state: State): void {
  const items = getItemsInView(state)

  // 1. Render all the notes + measures
  for (let i of items) {
    renderItem(i, state)
  }

  // 2. Render particles effects
  if (state.showParticles) {
    const effect = getParticleGenerator()
    effect.update(state)
    effect.render(state)
  }
}

function renderFallingNote(note: SongNote, state: State): void {
  const { ctx, pps } = state
  const lane = state.lanes[note.midiNote - getNote('A0')]
  const posY = Math.round(getItemStartEnd(note, state).end)
  const posX = Math.round(lane.left + 1)
  const length = Math.round(note.duration * pps)
  const width = lane.width - 2
  const color = getNoteColor(note, state)

  ctx.fillStyle = color
  ctx.strokeStyle = color
  roundRect(ctx, posX, posY, width, length)
}

function renderDebugInfo(state: State) {
  const { ctx, viewport, width, height } = state
  ctx.fillStyle = state.visualization === 'falling-notes' ? 'white' : 'black'
  ctx.font = '9px Arial'

  ctx.fillText(
    `size: ${[Math.floor(width), Math.floor(height)]} viewport: ${[
      Math.floor(viewport.start),
      Math.floor(viewport.end),
    ]}`,
    50,
    50,
  )

  const inView = getItemsInView(state)
  if (inView[0]) {
    const firstItem = getItemStartEnd(inView[0], state)
    ctx.fillText(
      `inView: ${inView.length}, firstItem: ${[
        Math.floor(firstItem.start),
        Math.floor(firstItem.end),
      ]}`,
      50,
      65,
    )
  }
}

function renderMeasure(measure: SongMeasure, state: State): void {
  const { ctx } = state
  const color = palette.measure
  const posY = Math.round(getItemStartEnd(measure, state).start)

  ctx.font = '20px Roboto'
  ctx.strokeStyle = color
  ctx.fillStyle = color
  line(ctx, 0, posY, state.width, posY)
  ctx.fillText(measure.number.toString(), 10, posY - 10)
}

// TODO: reincorporate offdom canvas for background
function renderSheetVis(state: State): void {
  for (const item of getItemsInView(state)) {
    if (item.type === 'measure') {
      continue
    }
    renderSheetNote(item, state)
  }
  renderBackgroundLines(state)
}

function renderSheetNote(note: SongNote, state: State): void {
  const { ctx, pps } = state
  const length = Math.round(pps * note.duration)
  const posX = getItemStartEnd(note, state).start
  const color = sheetNoteColor(posX, length)
  const staff = state.hands?.[note.track].hand === 'right' ? 'treble' : 'bass'
  const pitch = note.pitch
  const noteRow = getRow(pitch.octave, pitch.step)

  if (staff === 'treble') {
    const offsetFromBottom = noteRow - getRow(4, 'E')
    const canvasY = trebleBottomY(state.height) - (offsetFromBottom / 2) * PIXELS_PER_STAFF_ROW
    const canvasX = posX + PLAY_NOTES_LINE_X + PLAY_NOTES_WIDTH
    ctx.fillStyle = color + NOTE_ALPHA
    ctx.fillRect(canvasX, canvasY + 3, length, 10)
    drawMusicNote(ctx, canvasX, canvasY, color)
  } else {
    const topRow = getRow(4, 'A')
    const offsetFromTop = topRow - noteRow
    const canvasY = bassTopY(state.height) + (offsetFromTop / 2) * PIXELS_PER_STAFF_ROW
    const canvasX = posX + PLAY_NOTES_LINE_X + PLAY_NOTES_WIDTH
    ctx.fillStyle = color + NOTE_ALPHA
    ctx.fillRect(canvasX, canvasY + 3, length, 10)
    drawMusicNote(ctx, canvasX, canvasY, color)
  }
}
function sheetNoteColor(x: number, length: number): string {
  const black = '#000000'
  if (x + length < 0 || x >= 0) {
    return black
  }
  const ratio = Math.max((x + length) / length, 0.15) // idk why but lower causes orange
  return pickHex(palette.right.white, black, ratio)
}
export function sheetIconProps(icon: 'treble' | 'bass' | 'brace', height: number): SheetIconProps {
  switch (icon) {
    case 'treble':
      return {
        height: PIXELS_PER_STAFF_ROW * 9.5,
        width: PIXELS_PER_STAFF_ROW * 6.5,
        style: {
          position: 'absolute',
          top: trebleTopY(height) - PIXELS_PER_STAFF_ROW * 2,
          left: STAFF_START_X - PIXELS_PER_STAFF_ROW,
        },
      }
    case 'bass':
      return {
        height: PIXELS_PER_STAFF_ROW * 4.5,
        width: PIXELS_PER_STAFF_ROW * 4,
        style: {
          position: 'absolute',
          top: bassTopY(height),
          left: STAFF_START_X + PIXELS_PER_STAFF_ROW - 5,
        },
      }
    case 'brace': {
      return {
        width: 50,
        height: 100 + 10 * PIXELS_PER_STAFF_ROW,
        style: {
          position: 'absolute',
          top: trebleTopY(height),
          left: STAFF_START_X - 50,
        },
      }
    }
    default:
      throw new Error('sheetIconProps got an unkown icon')
  }
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

type ParticleT = {
  offsetPercent: number
  lane: number
  x: number
  y: number
  opacity: number
  dx: number
  dy: number
  d0: number
}

// TODO: refactor PGenereator + move to its own file.
class ParticleGenerator {
  unused: ParticleT[] = []
  active: Map<number, ParticleT[]> = new Map()

  createParticle_(): ParticleT {
    return {
      offsetPercent: Math.random(),
      x: 0,
      y: 0,
      dx: randDecimal(velocity.x.min, velocity.x.max, velocity.precision) * randomNegative(), // x can go left or right
      dy: randDecimal(velocity.y.min, velocity.y.max, velocity.precision),
      d0: randDecimal(velocity.opacity.min, velocity.opacity.max, velocity.precision),
      lane: 0,
      opacity: 1,
    }
  }
  getParticles_(lane: number) {
    const particles: ParticleT[] = []
    for (let i = 0; i < numParticles; i++) {
      let particle = this.unused.pop() ?? this.createParticle_()
      particle.lane = lane
      particles.push(particle)
    }
    return particles
  }

  update(state: State) {
    const activeNotes: SongNote[] = getItemsInView(state).filter(
      (item) => item.type === 'note' && getNotePlayedRatio(item, state) > 0,
    ) as SongNote[]

    for (let { midiNote } of activeNotes) {
      const lane = midiNote - getNote('A0')
      if (!this.active.has(midiNote)) {
        this.active.set(midiNote, this.getParticles_(lane))
      }
      // update each particle position
      for (let particle of this.active.get(midiNote)!) {
        particle.x += particle.dx
        particle.y += particle.dy
        particle.opacity -= particle.dx

        // reset
        if (particle.y > 44 || particle.opacity <= 0) {
          particle.x = 0
          particle.y = 0
          particle.opacity = 1
        }
      }
    }
    // cleanup
    for (let midiNote of this.active.keys()) {
      if (!activeNotes.find((n) => n.midiNote === midiNote)) {
        const particles = this.active.get(midiNote)!
        for (let p of particles) {
          this.unused.push(p)
        }
        this.active.delete(midiNote)
      }
    }
  }

  render(state: State) {
    for (let particles of this.active.values()) {
      for (let p of particles) {
        const x = state.lanes[p.lane].left + p.x + state.lanes[p.lane].width * p.offsetPercent
        const y = state.height - p.y
        const color = `rgba(255, 255, 255, ${p.opacity})`
        circle(state.ctx, x, y, particleRadius, color)
      }
    }
  }
}
