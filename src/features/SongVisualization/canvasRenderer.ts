import { SongMeasure, SongNote, Hand } from '@/types'
import { clamp, isBlack, isBrowser, pickHex } from '@/utils'
import { getNoteLanes } from './utils'
import { circle, line, roundRect } from '@/features/drawing'
import midiState from '@/features/midi'
import { getKey, getNote } from '@/features/synth'
import { getKeyAlterations, KEY_SIGNATURE, Note } from '../theory'
import { getOctave } from '../synth/utils'
import glyphs from '../theory/glyphs'

type CanvasItem = SongMeasure | SongNote
type HandSettings = {
  [trackId: string]: {
    hand: Hand | 'none'
  }
}

/* =================== START SHEET VIS HELPERS ======================== */
/* ==================================================================== */
const MUSIC_FONT = 'Leland'
const STAFF_FIVE_LINES_HEIGHT = 80
const STAFF_SPACE = STAFF_FIVE_LINES_HEIGHT / 4
const PIXELS_PER_STAFF_ROW = STAFF_SPACE
const STAFF_START_X = 150
const PLAY_NOTES_LINE_X = 400
const PLAY_NOTES_WIDTH = 20
const PLAY_NOTES_LINE_OFFSET = PIXELS_PER_STAFF_ROW * 4 // offset above and below the staff lines
const PLAY_NOTES_LINE_COLOR = 'rgba(110, 40, 251, 0.43)' // '#7029fb'
const NOTE_ALPHA = 'A2'
const STEP_NUM: any = {
  A: 5, // A and B start at 0, so C1 < A1
  B: 6,
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
}

const UNICODE_SYMBOLS = {
  NATURAL: '♮',
  FLAT: '♭',
  SHARP: '♯',
  TREBL_CLEF: '𝄞',
  BASS_CLEF: '𝄢',
  NOTEHEAD_UNICODE: '𝅘',
}

const CLEFS = {
  treble: {
    bottomRow: getRow(getNote('E4')),
    middleRow: getRow(getNote('B4')),
    topRow: getRow(getNote('F5')),
  },
  bass: {
    bottomRow: getRow(getNote('G2')),
    middleRow: getRow(getNote('D3')),
    topRow: getRow(getNote('A3')),
  },
}

// There are 52 white keys. 7 (sortof) notes per octave (technically octaves go from C-C...so its 8).
function getRow(midiNote: number, keySignature?: KEY_SIGNATURE): number {
  let key = getKey(midiNote, keySignature)
  let octave = getOctave(midiNote)
  let step = key[0]
  return octave * 7 + STEP_NUM[step]
}

/* ==================== SHEET BACKGROUND HELPERS ====================== */
function trebleBottomY(height: number): number {
  const center = Math.round(height / 2)
  return center - 50
}

function trebleTopY(height: number): number {
  const bottom = trebleBottomY(height)
  return bottom - STAFF_FIVE_LINES_HEIGHT
}

function bassTopY(height: number): number {
  const center = Math.round(height / 2)
  return center + 50
}

function bassBottomY(height: number): number {
  const top = bassTopY(height)
  return top + STAFF_FIVE_LINES_HEIGHT
}

function drawStaffConnectingLine(state: State): void {
  const { ctx } = state
  ctx.save()
  ctx.lineWidth = 3
  line(ctx, STAFF_START_X, trebleTopY(state.height), STAFF_START_X, bassBottomY(state.height))
  ctx.restore()
}

function drawStaffLines(state: State, clef: 'bass' | 'treble'): void {
  const { ctx, width } = state
  const { bottomRow, topRow } = CLEFS[clef]
  ctx.save()

  let lineWidth = 1.5
  ctx.lineWidth = lineWidth
  for (let row = bottomRow; row <= topRow; row += 2) {
    const y = getRowY(state, clef, row) - lineWidth / 2
    line(ctx, STAFF_START_X, y, width, y)
  }

  // Vertical line.
  ctx.lineWidth = 3
  line(
    ctx,
    STAFF_START_X,
    getRowY(state, clef, topRow) - 1.5,
    STAFF_START_X,
    getRowY(state, clef, bottomRow),
  )
  ctx.restore()
}

function drawPlayNotesLine(state: State): void {
  const { ctx, height } = state
  ctx.save()
  const top = trebleTopY(height) - 64 - PLAY_NOTES_LINE_OFFSET
  const bottom = bassTopY(height) + PLAY_NOTES_LINE_OFFSET
  ctx.lineWidth = PLAY_NOTES_WIDTH
  ctx.strokeStyle = PLAY_NOTES_LINE_COLOR
  line(ctx, PLAY_NOTES_LINE_X, top, PLAY_NOTES_LINE_X, bottom)

  // Vertical lil bar for center.
  ctx.strokeStyle = 'rgba(255,0,0,0.3)'
  ctx.lineWidth = 3
  line(ctx, PLAY_NOTES_LINE_X, top, PLAY_NOTES_LINE_X, bottom)
  ctx.restore()
}

/* ===================== END SHEET VIS HELPERS ======================== */
/* ==================================================================== */

const palette = {
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
    // Filter out the contiguous notes that may have already clipped off screen.
    // As well as non matching items
    return startPred(item) && isMatchingHand(item, state)
  })
}

/**
 * Get the contiguous range starting from the first element that returns true from the startPred
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
  return clamp(offset / noteLen, { min: 0, max: 1 })
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
  }
}

export type GivenState = {
  time: number
  drawNotes: boolean
  visualization: 'falling-notes' | 'sheet'
  width: number
  height: number
  pps: number // pixels per second
  hand: Hand
  hands: HandSettings
  ctx: CanvasRenderingContext2D
  showParticles: boolean
  items: CanvasItem[]
  constrictView?: boolean
  keySignature: KEY_SIGNATURE
  timeSignature?: { numerator: number; denominator: number }
}

type DerivedState = {
  lanes: { [midiNote: number]: { left: number; width: number } }
  viewport: { start: number; end: number }
  // active (currently being played).
  // Pulsing + Particles.
  // particles: any
}
type State = Readonly<GivenState & DerivedState>

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
    lanes: getNoteLanes(state.width, state.constrictView ? state.items : undefined),
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
  const lane = state.lanes[note.midiNote]
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

function drawStatics(state: State) {
  drawCurlyBrace(state)
  drawStaffLines(state, 'bass')
  drawStaffLines(state, 'treble')
  drawStaffConnectingLine(state)
  drawFClef(state)
  drawGClef(state)
  drawKeySignature(state, 'bass')
  drawKeySignature(state, 'treble')
  // drawRuler(state)
  drawPlayNotesLine(state)
}

// Optimization ideas:
// - can use offdom canvas (not OffscreenCanvas API) for background since its repainting over and over.
// - can also treat it all as one giant image that gets partially drawn each frame.
function renderSheetVis(state: State): void {
  drawStatics(state)
  for (const item of getItemsInView(state)) {
    if (item.type === 'measure') {
      continue
    }
    renderSheetNote(item, state)
  }
  renderMidiPressedKeys(state)
}

// TODO pick side based not just on side of C4 but also
// the current song, i.e. if there are notes that should be played by left or right hand
// then show it on that hand.
function renderMidiPressedKeys(state: State): void {
  const { ctx } = state
  const pressed = midiState.getPressedNotes()
  for (let note of pressed.keys()) {
    const staff = note < getNote('C4') ? 'bass' : 'treble'
    const canvasY = getNoteY(state, staff, note)
    let canvasX = PLAY_NOTES_LINE_X - 3
    drawMusicNote(state, canvasX, canvasY, 'red')
    // isFlat
    if (getKey(note).length === 2) {
      ctx.fillStyle = 'black'
      ctx.font = '12px bold Arial'
      ctx.fillText(UNICODE_SYMBOLS.SHARP, canvasX - 20, canvasY + 6)
    }
  }
}

function renderSheetNote(note: SongNote, state: State): void {
  const { ctx, pps } = state
  ctx.save()
  const length = Math.round(pps * note.duration)
  const posX = getItemStartEnd(note, state).start
  const color = sheetNoteColor(posX, length)
  const staff = state.hands?.[note.track].hand === 'right' ? 'treble' : 'bass'

  let canvasX = posX + PLAY_NOTES_LINE_X + PLAY_NOTES_WIDTH / 2
  let canvasY = getNoteY(state, staff, note.midiNote)

  ctx.fillStyle = color + NOTE_ALPHA
  const trailLength = length - 15 - (canvasX > PLAY_NOTES_LINE_X ? 0 : PLAY_NOTES_LINE_X - canvasX)
  const trailHeight = 10
  ctx.fillRect(
    Math.max(canvasX + 5, PLAY_NOTES_LINE_X + 5),
    canvasY - trailHeight / 2,
    trailLength,
    trailHeight,
  )

  // Return after drawing the tail for the notes that have already crossed.
  if (canvasX < PLAY_NOTES_LINE_X - 10) {
    return
  }

  // Draw extra lines. Must happen before the MusicNote.
  ctx.font = `80px ${MUSIC_FONT}`
  const noteRow = getRow(note.midiNote, state.keySignature)
  const { topRow, bottomRow } = CLEFS[staff]
  if (noteRow > topRow) {
    for (let row = topRow + 2; row <= noteRow; row += 2) {
      const y = getRowY(state, staff, row)
      line(ctx, canvasX - 13, y, canvasX + 20, y)
    }
  } else if (noteRow < bottomRow) {
    for (let row = bottomRow - 2; row >= noteRow; row -= 2) {
      const y = getRowY(state, staff, row)
      line(ctx, canvasX - 13, y, canvasX + 20, y)
    }
  }

  ctx.font = `${PIXELS_PER_STAFF_ROW * 5}px ${MUSIC_FONT}`
  ctx.fillStyle = color
  const key = getKey(note.midiNote, state.keySignature)
  const step = key[0]
  drawMusicNote(state, canvasX, canvasY, color)

  // const accidental = getAccidental(note.midiNote, state.keySignature)
  const accidental = key.length == 2 && key[1]
  if (accidental) {
    const text = accidental
    // const text = accidentalMap[accidental]
    ctx.font = 'bold 16px serif'
    ctx.fillStyle = 'black'
    ctx.fillText(text, canvasX - 20, canvasY + 3)
  }
  if (state.drawNotes) {
    ctx.font = '9px serif'
    ctx.fillStyle = 'white'
    ctx.fillText(step, canvasX, canvasY + 3)
  }
  ctx.restore()
}

function getNoteY(state: State, staff: 'bass' | 'treble', note: number) {
  return getRowY(state, staff, getRow(note, state.keySignature))
}

function getRowY(state: State, staff: 'bass' | 'treble', row: number) {
  let offsetFromBottom
  let bottom
  if (staff === 'treble') {
    offsetFromBottom = row - getRow(getNote('E4'))
    bottom = trebleBottomY(state.height)
  } else {
    offsetFromBottom = row - getRow(getNote('G2'))
    bottom = bassBottomY(state.height)
  }

  // TODO: relative to top instead of bottom for simpler maths.
  const pixelsPerRow = STAFF_FIVE_LINES_HEIGHT / 8
  return bottom - offsetFromBottom * pixelsPerRow
}

function sheetNoteColor(x: number, length: number): string {
  const black = '#000000'
  if (x + length < 0 || x >= 0) {
    return black
  }
  const ratio = Math.max((x + length) / length, 0.15) // idk why but lower causes orange
  return pickHex(palette.right.white, black, ratio)
}

type MusicPath = {
  height: number
  width: number
  path2D: Path2D
}
const MusicPaths = (() => {
  if (!isBrowser()) {
    return
  }

  return {
    GClef: {
      // Source: https://upload.wikimedia.org/wikipedia/commons/e/e8/G-clef.svg
      height: 75,
      width: 44,
      path2D: new Path2D(
        'M12 3.5c.4 3.2-2 5.7-4 7.7-1 1-.2.2-.7.6l-.3-2a13 13 0 0 1 4.3-8.1c.3.6.5.6.7 1.8zm.7 16.2a5.7 5.7 0 0 0-4.3-1L7.8 15c2.3-2.3 4.9-5 5-8.5 0-2.2-.2-4.7-1.6-6.5-1.7.1-3 2.2-3.8 3.4-1.5 2.7-1.2 6-.6 8.8-.8 1-2 1.8-2.7 2.7-2.4 2.4-4.5 5.5-4 9a8 8 0 0 0 9.6 7.3c.3 2.2 1 4.6.1 6.8-.7 1.6-2.7 3-4.3 2.2l-.5-.3c1.1-.3 2-1 2.3-1.6C8 37 6.9 34.7 5 35c-2 0-3 3-1.6 4.7 1.3 1.5 3.8 1.3 5.4.3 1.8-1.2 2-3.6 1.9-5.6l-.5-3.4 1.2-.4c2.7-1 4.4-4.3 3.6-7.1-.3-1.5-1-3-2.3-3.8zm.6 5.7c.2 2-1 4.3-3.1 5l-.3-1.5c-.5-2.4-.7-5-1.1-7.5 1.6-.1 3.5.6 4 2.2.3.6.4 1.2.5 1.8zM8 30.6c-2.5.2-5-1.6-5.6-4a7 7 0 0 1 .8-6.6c1.1-1.7 2.6-3 4-4.5l.6 3.4c-3 .8-5 4.7-3.2 7.4.5.8 2 2.3 2.7 1.7-1-.7-2-1.9-1.8-3.3 0-1.2 1.4-2.9 2.7-3.2.4 3 1 6.1 1.3 9a8 8 0 0 1-1.5.1z',
      ),
    },
    FClef: {
      // Source: https://upload.wikimedia.org/wikipedia/commons/c/c5/FClef.svg
      height: 20,
      width: 18,
      path2D: new Path2D(
        'M17.31 3.15c.01.36-.15.73-.43.98-.36.32-.9.4-1.36.22a1.27 1.27 0 0 1-.8-1.09 1.28 1.28 0 0 1 1.36-1.41 1.26 1.26 0 0 1 1.23 1.3zm0 5.84c.01.37-.15.74-.43.98-.36.33-.9.4-1.36.23a1.27 1.27 0 0 1-.8-1.1c-.03-.37.1-.75.36-1.02.25-.28.63-.4 1-.39.48.02.92.35 1.12.78.08.16.11.34.11.52zm-4.28-1.78a10.51 10.51 0 0 1-3.21 7.54c-2.5 2.49-5.75 4.07-9.07 5.13-.44.24-1.1-.08-.41-.4 1.34-.61 2.73-1.14 3.96-1.96 2.72-1.68 5.02-4.33 5.57-7.56.33-1.96.24-4-.25-5.94-.36-1.42-1.35-2.88-2.9-3.1a4.61 4.61 0 0 0-3.93 1.3 2.53 2.53 0 0 0-.7 1.87c.6-.47.57-.42 1.06-.64a2.2 2.2 0 0 1 2.93 1.47c.3 1.15.07 2.61-1.07 3.22-1.18.65-2.93.38-3.6-.89A4.81 4.81 0 0 1 2.7 1.27C4.5-.23 7.13-.3 9.25.48c2.19.81 3.49 3.08 3.7 5.32.06.47.08.94.08 1.41z',
      ),
    },
    CurlyBrace: {
      // Source: https://upload.wikimedia.org/wikipedia/commons/e/ec/Curly_bracket_left.svg
      width: 23,
      height: 232,
      path2D: new Path2D(
        'm18 5.5 2-3L21 1l-3 1-4.5 5-3 6-2 5-1 4-1 7-.5 7v12l2 15.5 1.5 8 1 10.5v12.5l-.5 4-.5 3-1 3L6 110l-2 3.5-2 2h2.5l.5-.5 6-10.5L14.5 94c.4-1.2 1.17-5.5 1.5-7.5l.5-8.5v-5l-.5-5.5-1-8.5-2-15.5-1-10c-.5-5 0-9 0-9.5s.5-4.5 1-6.5c.4-1.6 1.17-4 1.5-5l1-2.5 1-2L18 5.5Zm-13 115L2.5 117l-.5-.5h2.5l5 5.5 3 6 2 5 1 4 1 7 .5 7v12l-2 15.5-1.5 8-1 10.5v12.5l.5 4 .5 3 1 3L17 225l2 3.5 2 2-2-.5-1-1-6-9.5L8.5 209c-.4-1.2-1.17-5.5-1.5-7.5l-.5-8.5v-5l.5-5.5 1-8.5 2-15.5 1-10c.5-5 0-9 0-9.5s-.5-4.5-1-6.5c-.4-1.6-1.17-4-1.5-5l-1-2.5-1-2-1.5-2.5Z',
      ),
    },
    Note: {
      width: 42,
      height: 43,
      path2D: new Path2D(
        'M22.4811 6.42107C24.4811 10.4211 21.0371 15.6763 15.4811 17.9211C9.48114 19.9211 5.48114 18.921 2.98114 15.421C1.48114 11.421 4.48114 6.92102 10.0411 3.9855C15.9811 2.42107 20.4811 2.42107 22.4811 6.42107Z',
      ),
    },
    Sharp: {
      // Source: https://upload.wikimedia.org/wikipedia/commons/a/a6/Sharp.svg
      width: 6,
      height: 9,
      path2D: new Path2D(
        'M1.9 12.15v-4.7l2-.55v4.68l-2 .57zm3.94-1.13-1.37.39V6.73l1.37-.38V4.4l-1.37.39V0H3.9v4.93l-2 .58V.86h-.53v4.82L0 6.07v1.95l1.38-.39v4.67L0 12.7v1.94l1.38-.39V19h.53v-4.93l2-.55v4.63h.56v-4.8l1.37-.39v-1.94z',
      ),
    },
  }
})()!

function drawPaths(
  state: State,
  musicPath: typeof MusicPaths.FClef,
  x: number,
  y: number,
  opts?: { width?: number; height?: number; color?: string },
) {
  const { ctx } = state
  const { width, height, color } = opts ?? {}
  ctx.save()
  ctx.translate(x, y)
  if (color) {
    ctx.fillStyle = color
  }
  if (width || height) {
    let widthRatio = 1
    let heightRatio = 1
    if (width) {
      widthRatio = width / musicPath.width
      // Assume autoscale
      if (!height) {
        heightRatio = widthRatio
      }
    }
    if (height) {
      heightRatio = height / musicPath.height
      if (!width) {
        widthRatio = heightRatio
      }
    }
    ctx.scale(widthRatio, heightRatio)
  }
  ctx.fill(musicPath.path2D)
  ctx.restore()
}

function getTimeSignatureText(state: State) {
  const { timeSignature } = state
  if (!timeSignature) {
    return ''
  }
  const { numerator, denominator } = timeSignature
  const numeratorGlyph = (glyphs as any)['timeSig' + numerator]
  const denominatorGlyph = (glyphs as any)['timeSig' + denominator]

  return `${glyphs.timeSigCombNumerator}${numeratorGlyph}${glyphs.timeSigCombDenominator}${denominatorGlyph}`
}

function drawKeySignature(state: State, staff: 'treble' | 'bass') {
  const { ctx, keySignature } = state
  ctx.save()
  const type = getKeyAlterations(keySignature).type
  const symbol = type === 'flat' ? glyphs.accidentalFlat : glyphs.accidentalSharp

  const size = STAFF_FIVE_LINES_HEIGHT
  let x = STAFF_START_X + STAFF_SPACE * 4 // account for clef.
  for (let note of getKeySignatureNotes(state, staff)) {
    ctx.font = `${size}px ${MUSIC_FONT}`
    ctx.fillText(symbol, x, getNoteY({ ...state, keySignature: 'C' }, staff, getNote(note)))
    x += STAFF_SPACE
  }
  ctx.restore()
}

function getKeySignatureNotes(state: State, staff: 'treble' | 'bass') {
  const { keySignature } = state
  const alterations = getKeyAlterations(keySignature)
  let order: Note[] =
    alterations.type === 'sharp'
      ? ['F', 'C', 'G', 'D', 'A', 'E', 'B']
      : ['B', 'E', 'A', 'D', 'G', 'C', 'F']

  return order
    .filter((note) => alterations.notes.has(note))
    .map((note) => {
      let octave = staff === 'treble' ? 5 : 3
      if (note === 'A' || note === 'B') {
        octave--
      }

      return note + octave
    })
}

function drawMusicNote(state: State, x: number, y: number, color: string) {
  drawPaths(state, MusicPaths.Note, x - 10, y - 11, { color })
}

function drawSymbol(state: State, symbol: string, x: number, y: number, size: number) {
  const { ctx } = state
  ctx.save()
  ctx.font = `${size}px ${MUSIC_FONT}`
  ctx.fillText(symbol, x, y)
  ctx.restore()
}

function drawGClef(state: State) {
  const x = STAFF_START_X + 10
  const y = getNoteY(state, 'treble', getNote('G4'))
  drawSymbol(state, glyphs.gClef, x, y, STAFF_FIVE_LINES_HEIGHT)
}

function drawFClef(state: State) {
  const x = STAFF_START_X + 10
  const y = getNoteY({ ...state, keySignature: 'C' }, 'bass', getNote('F3'))
  drawSymbol(state, glyphs.fClef, x, y, STAFF_FIVE_LINES_HEIGHT)
}

function drawCurlyBrace(state: State) {
  const size = STAFF_FIVE_LINES_HEIGHT * 2 + 100
  const x = STAFF_START_X - 25
  const y = state.height / 2 + size / 2
  drawSymbol(state, glyphs.brace, x, y, size)
}

function drawRuler(state: State) {
  const { ctx } = state
  ctx.save()
  ctx.strokeStyle = 'rgb(0,0,0,0.1)'
  ctx.font = '12px Arial'
  for (let i = 0; i < state.height; i += 25) {
    ctx.fillText(`${i}`, 0, i)
    line(ctx, 0, i, state.width, i)
  }
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
      const lane = midiNote
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
