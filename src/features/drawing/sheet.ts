import {
  getKey,
  getKeyDetails,
  getNote,
  getOctave,
  isBlack,
  KEY_SIGNATURE,
  glyphs,
} from '@/features/theory'
import { pickHex } from '@/utils'
import { line } from './index'

type Clef = 'bass' | 'treble'
const TEXT_FONT = 'Arial'
const MUSIC_FONT = 'Leland'
export const STAFF_FIVE_LINES_HEIGHT = 80
export const STAFF_SPACE = STAFF_FIVE_LINES_HEIGHT / 4
export const PIXELS_PER_ROW = STAFF_FIVE_LINES_HEIGHT / 8
const STAFF_LINE_WIDTH = 2
const PLAY_NOTES_WIDTH = 20
const PLAY_NOTES_LINE_COLOR = 'rgba(110, 40, 251, 0.43)' // '#7029fb'
const STEP_NUM: any = {
  A: 5, // A and B start at 0, so C1 < A1
  B: 6,
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
}
const NOTE_ALPHA = 'A2'

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

function getNoteY(state: State, staff: Clef, note: number) {
  return getRowY(state, staff, getRow(note, state.keySignature))
}

function getRowY(height: number, staff: Clef, row: number) {
  const top = staff === 'treble' ? trebleTopY(height) : bassTopY(height)
  const topNote = staff == 'treble' ? 'F5' : 'A3'
  const offsetFromTop = getRow(getNote(topNote)) - row

  return top + offsetFromTop * PIXELS_PER_ROW
}

function sheetNoteColor(x: number, length: number): string {
  const black = '#000000'
  if (x + length < 0 || x >= 0) {
    return black
  }
  const ratio = Math.max((x + length) / length, 0.15) // idk why but lower causes orange
  return pickHex(palette.right.white, black, ratio)
}

export function drawStaffConnectingLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  y2: number,
): void {
  ctx.save()
  ctx.lineWidth = 3
  line(ctx, x, y1, x, y2)
  ctx.restore()
}

export function drawStaffLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
): void {
  ctx.save()
  ctx.lineWidth = STAFF_LINE_WIDTH
  for (let i = 0; i < 5; i++, y += PIXELS_PER_ROW * 2) {
    line(ctx, x, y, width, y)
  }
  ctx.restore()
}

export function drawPlayNotesLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  y2: number,
): void {
  ctx.save()
  ctx.strokeStyle = PLAY_NOTES_LINE_COLOR
  ctx.lineWidth = PLAY_NOTES_WIDTH
  line(ctx, x, y1, x, y2)

  // Vertical lil bar for center.
  ctx.strokeStyle = 'rgba(255,0,0,0.3)'
  ctx.lineWidth = 3
  line(ctx, x, y1, x, y2)
  ctx.restore()
}

export function drawTimeSignature(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeSignature: { numerator: number; denominator: number },
) {
  ctx.save()
  const { numerator, denominator } = timeSignature
  const numeratorGlyph = (glyphs as any)['timeSig' + numerator]
  const denominatorGlyph = (glyphs as any)['timeSig' + denominator]
  ctx.font = `${STAFF_FIVE_LINES_HEIGHT}px ${MUSIC_FONT}`
  ctx.fillText(numeratorGlyph, x, y + STAFF_SPACE)
  ctx.fillText(denominatorGlyph, x, y + STAFF_SPACE * 3)
  ctx.restore()
}

export function drawKeySignature(
  ctx: CanvasRenderingContext2D,
  x: number,
  staffTopY: number,
  keySignature: KEY_SIGNATURE,
  staff: 'treble' | 'bass',
) {
  ctx.save()
  const type = getKeyDetails(keySignature).type
  const symbol = type === 'flat' ? glyphs.accidentalFlat : glyphs.accidentalSharp

  const size = STAFF_FIVE_LINES_HEIGHT
  ctx.font = `${size}px ${MUSIC_FONT}`
  for (let note of getKeySignatureNotes(keySignature, staff)) {
    const y = staffTopY + getOffset(note, staff)
    ctx.fillText(symbol, x, y)
    x += STAFF_SPACE
  }
  ctx.restore()
}

function getKeySignatureNotes(keySignature: KEY_SIGNATURE, staff: 'treble' | 'bass') {
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

function drawSymbol(
  ctx: CanvasRenderingContext2D,
  symbol: string,
  x: number,
  y: number,
  size?: number,
) {
  ctx.save()
  if (size) {
    ctx.font = `${size}px ${MUSIC_FONT}`
  } else {
    ctx.font = MUSIC_FONT
  }
  ctx.fillText(symbol, x, y)
  ctx.restore()
}

// TODO: create an interval
function getOffset(key: string, clef: Clef) {
  return getRowOffset(key, clef) * PIXELS_PER_ROW
}
function getRowOffset(key: string, clef: Clef) {
  return CLEFS[clef].topRow - getRow(getNote(key))
}

export function drawGClef(ctx: CanvasRenderingContext2D, x: number, trebleTopY: number) {
  const y = trebleTopY + getOffset('G4', 'treble')
  drawSymbol(ctx, glyphs.gClef, x, y, STAFF_FIVE_LINES_HEIGHT)
}

export function drawFClef(ctx: CanvasRenderingContext2D, x: number, bassTopY: number) {
  const y = bassTopY + getOffset('F3', 'bass')
  drawSymbol(ctx, glyphs.fClef, x, y, STAFF_FIVE_LINES_HEIGHT)
}

export function drawCurlyBrace(ctx: CanvasRenderingContext2D, x: number, y: number, size?: number) {
  drawSymbol(ctx, glyphs.brace, x, y, size)
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
    let canvasX = getPlayNotesLineX(state) - state.measurements.whiteNoteSeparation
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

function getItemStartEnd(item: CanvasItem, state: GivenState): { start: number; end: number } {
  const start = item.time * state.pps - state.viewport.start
  const duration = item.type === 'note' ? item.duration : 100
  const end = start + duration * state.pps
  return { start, end }
}
