import { SongMeasure, SongNote, Hand } from '@/types'
import { clamp, getNoteSizes, isBrowser, isNumber, pickHex, range } from '@/utils'
import { circle, line, roundRect } from '@/features/drawing'
import midiState from '@/features/midi'
import { getKey, getKeyDetails, getNote, getOctave, isBlack, KEY_SIGNATURE } from '../theory'
import glyphs from '../theory/glyphs'
import { getSongRange } from './utils'
import { getMouseCoordinates, isMouseDown } from '../mouse'
import { roundCorner } from '../drawing/utils'

type CanvasItem = SongMeasure | SongNote
type HandSettings = {
  [trackId: string]: {
    hand: Hand | 'none'
  }
}

/* =================== START SHEET VIS HELPERS ======================== */
/* ==================================================================== */
const TEXT_FONT = 'Arial'
const MUSIC_FONT = 'Leland'
const STAFF_FIVE_LINES_HEIGHT = 80
const STAFF_SPACE = STAFF_FIVE_LINES_HEIGHT / 4
const STAFF_LINE_WIDTH = 2
const STAFF_START_X = 100
const PLAY_NOTES_WIDTH = 20
const PLAY_NOTES_LINE_OFFSET = STAFF_SPACE * 4 // offset above and below the staff lines
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

const CLEFS = {
  treble: {
    bottomRow: getRow(getNote('E4')),
    topRow: getRow(getNote('F5')),
  },
  bass: {
    bottomRow: getRow(getNote('G2')),
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
  line(
    ctx,
    STAFF_START_X,
    trebleTopY(state.height) - STAFF_LINE_WIDTH / 2,
    STAFF_START_X,
    bassBottomY(state.height) + STAFF_LINE_WIDTH / 2,
  )
  ctx.restore()
}

function drawStaffLines(state: State, clef: 'bass' | 'treble'): void {
  const { ctx, width } = state
  const { bottomRow, topRow } = CLEFS[clef]
  ctx.save()

  let lineWidth = STAFF_LINE_WIDTH
  ctx.lineWidth = lineWidth
  for (let row = bottomRow; row <= topRow; row += 2) {
    const y = getRowY(state, clef, row)
    line(ctx, STAFF_START_X, y, width, y)
  }
  ctx.restore()
}

function drawPlayNotesLine(state: State): void {
  const { ctx, height } = state
  ctx.save()
  const top = trebleTopY(height) - STAFF_FIVE_LINES_HEIGHT - PLAY_NOTES_LINE_OFFSET
  const bottom = bassBottomY(height) + PLAY_NOTES_LINE_OFFSET
  const x = getPlayNotesLineX(state)
  ctx.strokeStyle = PLAY_NOTES_LINE_COLOR
  ctx.lineWidth = PLAY_NOTES_WIDTH
  line(ctx, x, top, x, bottom)

  // Vertical lil bar for center.
  ctx.strokeStyle = 'rgba(255,0,0,0.3)'
  ctx.lineWidth = 3
  line(ctx, x, top, x, bottom)
  ctx.restore()
}

/* ===================== END SHEET VIS HELPERS ======================== */
/* ==================================================================== */

const palette = {
  right: {
    // black: '#4912d4',
    // white: '#7029fb',
    black: 'hsl(258deg 80% 50%)',
    white: 'hsl(261deg 80% 60%)',
  },
  left: {
    // black: '#d74000',
    // white: '#ff6825',
    // black: 'hsl(18deg 100% 42%)',
    // white: 'hsl(18deg 100% 57%)',
    black: 'hsl(18deg 80% 45%)',
    white: 'hsl(22deg 80% 60%)',
  },
  measure: 'rgb(60,60,60)',
  octaveLine: 'rgb(90,90,90)',
  whiteKeyBackground: 'rgb(255,253,240)',
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
  return color
}

function getFallingNoteColor(note: SongNote, state: State): string {
  const color = getNoteColor(note, state)
  return color
  // const playedRatio = getNotePlayedRatio(note, state)
  // return pickHex(color, '#ffffff', playedRatio === 0 ? 1 : playedRatio)
}

function getItemStartEnd(item: CanvasItem, state: State): { start: number; end: number } {
  if (state.visualization == 'falling-notes') {
    const start = state.viewport.start - item.time * state.pps
    const duration = item.type === 'note' ? item.duration : 100
    const end = start - duration * state.pps
    return { start, end }
  }

  const start = item.time * state.pps - state.viewport.start
  const duration = item.type === 'note' ? item.duration : 100
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
  canvasRect: DOMRect
  images: {
    blackKeyRaised: HTMLImageElement
    blackKeyPressed: HTMLImageElement
  }
}

type DerivedState = {
  lanes: Lanes
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
    lanes: getNoteLanes(state),
    viewport: getViewport(state),
  }
  return { ...state, ...derived }
}

export function render(givenState: Readonly<GivenState>) {
  const state = deriveState(givenState)

  if (state.visualization === 'falling-notes') {
    state.ctx.fillStyle = '#2e2e2e' // background color
    state.ctx.fillRect(0, 0, state.width, state.height)
    renderFallingVis(state)
  } else {
    state.ctx.clearRect(0, 0, state.width, state.height)
    renderSheetVis(state)
  }

  // Disable before comitting
  // if (isBrowser() && window.location.origin.includes('localhost')) {
  //   renderDebugInfo(state)
  // }
}

let blackRoundingsPath: any = { width: 5, height: 6, path2d: null }
if (isBrowser()) {
  blackRoundingsPath.path2d = new Path2D('M2 3.5C2 2 2 1 0 1V0H5V1C3 1 3 2 3 3.5V6H2V3.5Z')
}

function renderPianoRoll(state: State, inViewNotes: SongNote[]) {
  const { ctx, lanes } = state
  const {
    whiteHeight,
    blackHeight,
    midiNotes,
    pianoTopY: top,
    greyBarHeight,
    redFeltHeight,
  } = lanes

  // Render all the white, then render all the black.
  ctx.fillStyle = 'black'
  ctx.fillRect(0, state.height - 10, state.width, 10)
  const activeNotes = new Map(
    inViewNotes
      .filter((note) => {
        const ratio = getNotePlayedRatio(note, state)
        return 0 < ratio && ratio < 1
      })
      .map((note) => {
        return [note.midiNote, getNoteColor(note, state)]
      }),
  )
  const pressedNotes = new Map(
    Array.from(midiState.getPressedNotes().keys()).map((midiNote) => [midiNote, 'grey']),
  )

  const redFeltColor = 'rgb(159,31,38)' // Color
  const redFeltY = state.lanes.pianoTopY - redFeltHeight
  ctx.fillStyle = redFeltColor
  ctx.fillRect(0, redFeltY, state.width, redFeltHeight)

  ctx.fillStyle = 'rgb(74,74,74)'
  ctx.strokeStyle = 'rgb(40,40,40)'
  const greyBarY = redFeltY - greyBarHeight
  ctx.shadowColor = 'rgb(40,40,40)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetY = -2
  ctx.fillRect(0, greyBarY + 0.2, state.width, greyBarHeight)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  // ctx.strokeRect(0, greyBarY, state.width, greyBarHeight)

  const whiteNotes = Object.entries(midiNotes).filter(([midiNote]) => !isBlack(+midiNote))
  const blackNotes = Object.entries(midiNotes).filter(([midiNote]) => isBlack(+midiNote))

  ctx.strokeStyle = 'transparent'
  ctx.fillStyle = 'black'
  ctx.fillRect(0, top, state.width, whiteHeight)
  // TODO: redo logic around how to spread out the roundRects s.t. there isn't this dumb width-3 breaking everything.
  for (let [midiNote, lane] of whiteNotes) {
    const { left, width } = lane
    ctx.fillStyle =
      activeNotes.get(+midiNote) ?? pressedNotes.get(+midiNote) ?? palette.whiteKeyBackground
    const height = whiteHeight + (activeNotes.has(+midiNote) || pressedNotes.has(+midiNote) ? 2 : 0)
    roundRect(state.ctx, left, top, width - 3, height, { topRadius: 0, bottomRadius: 8 })
    const isC = getKey(+midiNote) == 'C'
    if (isC) {
      const octave = getOctave(+midiNote)

      ctx.fillStyle = octave === 4 ? 'rgb(120,120,120)' : 'rgb(190,190,190)'
      ctx.font = `20px ${TEXT_FONT}`
      const txt = `C${octave}`
      const textWidth = ctx.measureText(txt).width
      ctx.fillText(txt, left + width / 2 - textWidth / 2, state.height - 20)
    }
  }

  for (let [midiNote, lane] of blackNotes) {
    let { left, width, whiteMiddle } = lane
    const cornerWidth = 3
    ctx.fillStyle = 'black'
    ctx.fillRect(left - 2, top, width + 3, blackHeight + 2)
    roundCorner(
      ctx,
      whiteMiddle! - cornerWidth - 2,
      top + blackHeight,
      cornerWidth,
      cornerWidth,
      width / 3,
    )
    roundCorner(
      ctx,
      whiteMiddle! + cornerWidth - 1,
      top + blackHeight,
      -cornerWidth,
      cornerWidth,
      width / 3,
    )

    const isPressed = activeNotes.has(+midiNote) || pressedNotes.has(+midiNote)
    ctx.fillStyle = activeNotes.get(+midiNote) ?? pressedNotes.get(+midiNote) ?? 'black'
    let img = isPressed ? state.images.blackKeyPressed : state.images.blackKeyRaised
    let posY = isPressed ? top : top - 2
    ctx.drawImage(img, left, posY, width, blackHeight)
    if (activeNotes.has(+midiNote)) {
      ctx.globalAlpha = 0.7
      ctx.fillRect(left, posY, width, blackHeight)
      ctx.globalAlpha = 1
    }
  }
}

let lastPressedNote: null | number = null
function handlePianoRollMousePresses(state: State) {
  if (!isMouseDown()) {
    if (isNumber(lastPressedNote)) {
      midiState.release(lastPressedNote)
      lastPressedNote = null
    }
    return
  }

  // Can easily optimize this later.
  const { x, y } = getMouseCoordinates()
  const adjustedY = y - state.canvasRect.top
  const { blackHeight, whiteHeight, pianoTopY } = state.lanes
  let newPressedNote: null | number = null
  for (let [midiNote, lane] of Object.entries(state.lanes.midiNotes)) {
    const { left, width } = lane
    const height = isBlack(+midiNote) ? blackHeight : whiteHeight
    const doesXIntersect = left <= x && x <= left + width
    const doesYIntersect = pianoTopY <= adjustedY && adjustedY <= pianoTopY + height
    if (doesXIntersect && doesYIntersect) {
      newPressedNote = +midiNote
      break
    }
  }
  if (newPressedNote && !isBlack(newPressedNote) && isBlack(newPressedNote + 1)) {
    const { left, width } = state.lanes.midiNotes[newPressedNote + 1]
    const doesXIntersect = left <= x && x <= left + width
    const doesYIntersect = pianoTopY <= adjustedY && adjustedY <= pianoTopY + blackHeight
    if (doesXIntersect && doesYIntersect) {
      newPressedNote = newPressedNote + 1
    }
  }

  if (newPressedNote == lastPressedNote) {
    return
  }

  if (isNumber(lastPressedNote)) {
    midiState.release(lastPressedNote)
    lastPressedNote = null
  }
  if (isNumber(newPressedNote)) {
    midiState.press(newPressedNote, 127 / 2)
    lastPressedNote = newPressedNote
  }
}

function getBlackKeyXOffset(midiNote: number) {
  const offset = 2 / 3 - 0.5
  const blackOffsets: { [note: number]: number } = {
    1: -offset,
    3: +offset,
    6: -offset,
    8: 0, // center of a 3 grouping is still in middle
    10: +offset,
  }
  return blackOffsets[midiNote % 12]
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

  // 1. Render the ruler lines
  renderOctaveRuler(state)

  // 2. Render all the notes + measures
  for (let i of items) {
    if (i.type === 'measure') {
      renderMeasure(i, state)
    }
  }
  for (let i of items) {
    if (i.type === 'note') {
      renderFallingNote(i, state)
    }
  }

  handlePianoRollMousePresses(state)
  renderPianoRoll(state, items.filter((i) => i.type === 'note') as SongNote[])

  // 3. Render particles effects
  if (state.showParticles) {
    const effect = getParticleGenerator()
    effect.update(state)
    effect.render(state)
  }
}
function renderOctaveRuler(state: State) {
  const { ctx } = state
  ctx.save()
  ctx.lineWidth = 2
  for (let [midiNote, { left }] of Object.entries(state.lanes.midiNotes)) {
    const key = getKey(+midiNote)
    if (key === 'C') {
      ctx.strokeStyle = palette.octaveLine
      line(ctx, left - 2, 0, left, state.height)
    }
    if (key === 'F') {
      ctx.strokeStyle = palette.measure
      line(ctx, left - 2, 0, left, state.height)
    }
  }
  ctx.restore()
}

function renderFallingNote(note: SongNote, state: State): void {
  const { ctx, pps } = state
  const lane = state.lanes.midiNotes[note.midiNote]
  const posY = getItemStartEnd(note, state).end - (state.height - state.lanes.noteHitY)
  const posX = Math.floor(lane.left + 1)
  const length = Math.floor(note.duration * pps)
  const width = lane.width - 2
  const color = getFallingNoteColor(note, state)

  ctx.fillStyle = color
  ctx.strokeStyle = 'rgb(40,40,40)'
  roundRect(ctx, Math.floor(posX), posY, width, length)
}

function renderDebugInfo(state: State) {
  const { ctx, viewport, width, height } = state
  ctx.fillStyle = state.visualization === 'falling-notes' ? 'white' : 'black'
  ctx.font = `9px ${TEXT_FONT}`

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
  ctx.save()
  const color = palette.measure
  const posY = getItemStartEnd(measure, state).start - (state.height - state.lanes.noteHitY)

  ctx.font = `14px ${TEXT_FONT}`
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.globalAlpha = 0.9
  line(ctx, 0, posY, state.width, posY)
  ctx.strokeStyle = 'rgb(130,130,130)'
  ctx.fillStyle = 'rgb(130,130,130)'
  ctx.fillText(measure.number.toString(), 10, Math.floor(posY - 5))
  ctx.restore()
}

function drawStatics(state: State) {
  state.ctx.font = `${STAFF_FIVE_LINES_HEIGHT}px ${MUSIC_FONT}`
  state.ctx.fillStyle = 'black'
  state.ctx.strokeStyle = 'black'

  drawCurlyBrace(state)
  drawStaffLines(state, 'bass')
  drawStaffLines(state, 'treble')
  drawStaffConnectingLine(state)
  drawPlayNotesLine(state)
  drawFClef(state)
  drawGClef(state)
  drawKeySignature(state, 'bass')
  drawKeySignature(state, 'treble')
  drawTimeSignature(state, 'treble')
  drawTimeSignature(state, 'bass')
  // drawRuler(state)
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
    let canvasX = getPlayNotesLineX(state) - 3
    drawMusicNote(state, canvasX, canvasY, 'red')

    const key = getKey(note)
    // is sharp
    if (key.length === 2) {
      ctx.fillStyle = 'black'
      ctx.font = `${STAFF_SPACE}px ${MUSIC_FONT}`
      ctx.fillText(glyphs.accidentalSharp, canvasX - 17, canvasY)
    }
    if (state.drawNotes) {
      ctx.font = `9px ${TEXT_FONT}`
      ctx.fillStyle = 'white'
      ctx.fillText(key[0], canvasX, canvasY + 3)
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
  const playNotesLineX = getPlayNotesLineX(state)
  let canvasX = posX + playNotesLineX + PLAY_NOTES_WIDTH / 2
  let canvasY = getNoteY(state, staff, note.midiNote)
  ctx.fillStyle = color + NOTE_ALPHA
  const trailLength = length - 15 - (canvasX > playNotesLineX ? 0 : playNotesLineX - canvasX)
  const trailHeight = 10
  ctx.fillRect(
    Math.max(canvasX, playNotesLineX + 1.5),
    canvasY - trailHeight / 2,
    trailLength,
    trailHeight,
  )
  // Return after drawing the tail for the notes that have already crossed.
  if (canvasX < playNotesLineX - 10) {
    ctx.restore()
    return
  }
  // Draw extra lines. Must happen before the MusicNote.
  ctx.font = `${STAFF_FIVE_LINES_HEIGHT}px ${MUSIC_FONT}`
  const noteRow = getRow(note.midiNote, state.keySignature)
  const { topRow, bottomRow } = CLEFS[staff]
  ctx.lineWidth = STAFF_LINE_WIDTH
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
  ctx.font = `${STAFF_FIVE_LINES_HEIGHT}px ${MUSIC_FONT}`
  ctx.fillStyle = color
  const key = getKey(note.midiNote, state.keySignature)
  const step = key[0]
  drawMusicNote(state, canvasX, canvasY, color)
  const accidental = key.length == 2 && key[1]
  if (accidental) {
    ctx.font = `bold 16px ${TEXT_FONT}`
    ctx.fillStyle = 'black'
    ctx.fillText(accidental, canvasX - 20, canvasY + 6)
  }
  if (state.drawNotes) {
    ctx.font = `9px ${TEXT_FONT}`
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

function drawTimeSignature(state: State, staff: 'treble' | 'bass') {
  if (!state.timeSignature) {
    return
  }
  const { ctx } = state
  ctx.save()

  const { numerator, denominator } = state.timeSignature

  let x = getTimeSignatureX(state)
  const y = staff == 'treble' ? trebleTopY(state.height) : bassTopY(state.height)
  const numeratorGlyph = (glyphs as any)['timeSig' + numerator]
  const denominatorGlyph = (glyphs as any)['timeSig' + denominator]
  ctx.font = `${STAFF_FIVE_LINES_HEIGHT}px ${MUSIC_FONT}`
  ctx.fillText(numeratorGlyph, x, y + STAFF_SPACE)
  ctx.fillText(denominatorGlyph, x, y + STAFF_SPACE * 3)

  ctx.restore()
}

function getClefX() {
  return STAFF_START_X + STAFF_SPACE
}

function getKeySignatureX() {
  return getClefX() + 3 * STAFF_SPACE
}

function getTimeSignatureX(state: State) {
  const fifths = getKeyDetails(state.keySignature).notes.length
  return getKeySignatureX() + fifths * STAFF_SPACE + STAFF_SPACE
}

function getPlayNotesLineX(state: State) {
  return getTimeSignatureX(state) + STAFF_SPACE * 4
}

function drawKeySignature(state: State, staff: 'treble' | 'bass') {
  const { ctx, keySignature } = state
  ctx.save()
  const type = getKeyDetails(keySignature).type
  const symbol = type === 'flat' ? glyphs.accidentalFlat : glyphs.accidentalSharp

  const size = STAFF_FIVE_LINES_HEIGHT
  let x = getKeySignatureX()
  for (let note of getKeySignatureNotes(state, staff)) {
    ctx.font = `${size}px ${MUSIC_FONT}`
    ctx.fillText(symbol, x, getNoteY({ ...state, keySignature: 'C' }, staff, getNote(note)))
    x += STAFF_SPACE
  }
  ctx.restore()
}

function getKeySignatureNotes(state: State, staff: 'treble' | 'bass') {
  const { keySignature } = state
  const keyDetails = getKeyDetails(keySignature)

  return getKeyDetails(keySignature).notes.map((note) => {
    let octave = staff === 'treble' ? 5 : 3
    if (note === 'A' || note === 'B') {
      octave--
    }

    return note + octave
  })
}

function drawMusicNote(state: State, x: number, y: number, color: string) {
  state.ctx.save()
  state.ctx.fillStyle = color
  drawSymbol(state, glyphs.noteheadBlack, x - STAFF_SPACE / 2, y, STAFF_FIVE_LINES_HEIGHT)
  state.ctx.restore()
}

function drawSymbol(state: State, symbol: string, x: number, y: number, size: number) {
  const { ctx } = state
  ctx.save()
  ctx.font = `${size}px ${MUSIC_FONT}`
  ctx.fillText(symbol, x, y)
  ctx.restore()
}

function drawGClef(state: State) {
  const x = getClefX()
  const y = getNoteY(state, 'treble', getNote('G4'))
  drawSymbol(state, glyphs.gClef, x, y, STAFF_FIVE_LINES_HEIGHT)
}

function drawFClef(state: State) {
  const x = getClefX()
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
  ctx.font = `12px ${TEXT_FONT}`
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
        const lanes = state.lanes.midiNotes
        const x = lanes[p.lane].left + p.x + lanes[p.lane].width * p.offsetPercent
        const y = state.height - p.y
        const color = `rgba(255, 255, 255, ${p.opacity})`
        circle(state.ctx, x, y, particleRadius, color)
      }
    }
  }
}

interface Lanes {
  midiNotes: {
    [midiNote: number]: { left: number; width: number; whiteMiddle?: number }
  }
  whiteHeight: number
  blackHeight: number
  pianoTopY: number
  greyBarHeight: number
  redFeltHeight: number
  noteHitY: number
}

function getNoteLanes(state: Readonly<GivenState>): Lanes {
  const { width, height } = state
  const items = state.constrictView ? state.items : undefined
  const notes: SongNote[] = items
    ? (items.filter((i) => i.type === 'note') as SongNote[])
    : ([{ midiNote: 21 }, { midiNote: 108 }] as SongNote[])
  const { startNote, endNote } = getSongRange({ notes })
  const whiteKeysCount = range(startNote, endNote)
    .map((n) => !isBlack(n))
    .filter(Boolean).length

  const { whiteWidth, blackWidth, whiteHeight, blackHeight } = getNoteSizes(width, whiteKeysCount)
  const pianoTopY = height - whiteHeight - 5
  const greyBarHeight = Math.max(Math.floor(whiteHeight / 30), 6)
  const redFeltHeight = greyBarHeight - 2
  const noteHitY = pianoTopY - greyBarHeight - redFeltHeight
  const lanes: Lanes = {
    whiteHeight,
    blackHeight,
    pianoTopY,
    greyBarHeight,
    redFeltHeight,
    noteHitY,
    midiNotes: {},
  }
  let whiteNotes = 0
  for (let note = startNote; note <= endNote; note++) {
    if (isBlack(note)) {
      const whiteMiddle = whiteWidth * whiteNotes
      const left = whiteMiddle - blackWidth / 2 - 2 + getBlackKeyXOffset(note) * blackWidth
      lanes.midiNotes[note] = { width: blackWidth, left, whiteMiddle }
    } else {
      lanes.midiNotes[note] = { width: whiteWidth, left: whiteWidth * whiteNotes }
      whiteNotes++
    }
  }

  return lanes
}
