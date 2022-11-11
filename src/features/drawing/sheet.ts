import { getKey, getKeyDetails, getNote, getOctave, KEY_SIGNATURE, glyphs } from '@/features/theory'
import { Clef } from '@/types'
import { line } from './index'

const MUSIC_FONT = 'Leland'
export const STAFF_FIVE_LINES_HEIGHT = 80
export const STAFF_SPACE = STAFF_FIVE_LINES_HEIGHT / 4
export const PIXELS_PER_ROW = STAFF_FIVE_LINES_HEIGHT / 8
const STAFF_LINE_WIDTH = 2
export const PLAY_NOTES_WIDTH = 20
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

export function drawLedgerLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  staffTopY: number,
  midiNote: number,
  clef: Clef,
  keySignature?: KEY_SIGNATURE,
) {
  let rowOffset = getRowOffset(midiNote, clef, keySignature)
  const direction = rowOffset < 0 ? -1 : 1
  // If note is odd, push it to even since only even rows have lines.
  if (Math.abs(rowOffset % 2) == 1) {
    rowOffset -= direction
  }
  // If the note is within the staff, return.
  if (0 <= rowOffset && rowOffset < 10) {
    return
  }

  let start = Math.min(0, rowOffset)
  const end = Math.max(0, rowOffset)
  // If at the bottom of a staff, may as well skip ahead since those lines are already drawn.
  if (end >= 10) {
    start = 10
  }

  ctx.save()
  ctx.font = `${STAFF_FIVE_LINES_HEIGHT}px ${MUSIC_FONT}`
  ctx.lineWidth = STAFF_LINE_WIDTH

  for (; start <= end; start += 2) {
    const y = PIXELS_PER_ROW * start + staffTopY
    line(ctx, x, y, x + width, y)
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
  staff: Clef,
) {
  ctx.save()
  const type = getKeyDetails(keySignature).type
  const symbol = type === 'flat' ? glyphs.accidentalFlat : glyphs.accidentalSharp

  const size = STAFF_FIVE_LINES_HEIGHT
  ctx.font = `${size}px ${MUSIC_FONT}`
  for (let note of getKeySignatureNotes(keySignature, staff)) {
    const y = staffTopY + getOffset(getNote(note), staff)
    ctx.fillText(symbol, x, y)
    x += STAFF_SPACE
  }
  ctx.restore()
}

function getKeySignatureNotes(keySignature: KEY_SIGNATURE, staff: Clef) {
  return getKeyDetails(keySignature).notes.map((note) => {
    let octave = staff === 'treble' ? 5 : 3
    if (note === 'A' || note === 'B') {
      octave--
    }

    return note + octave
  })
}

export function drawMusicNote(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save()
  ctx.font = `${STAFF_FIVE_LINES_HEIGHT}px ${MUSIC_FONT}`
  ctx.fillStyle = color
  drawSymbol(ctx, glyphs.noteheadBlack, x - STAFF_SPACE / 2, y, STAFF_FIVE_LINES_HEIGHT)
  ctx.restore()
}

export function drawSymbol(
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
export function getNoteY(
  midiNote: number,
  clef: Clef,
  staffTopY: number,
  keySignature?: KEY_SIGNATURE,
) {
  return staffTopY + getOffset(midiNote, clef, keySignature)
}

function getOffset(midiNote: number, clef: Clef, keySignature?: KEY_SIGNATURE) {
  return getRowOffset(midiNote, clef, keySignature) * PIXELS_PER_ROW
}
function getRowOffset(midiNote: number, clef: Clef, keySignature?: KEY_SIGNATURE) {
  return CLEFS[clef].topRow - getRow(midiNote, keySignature)
}

// There are 52 white keys. 7 (sortof) notes per octave (technically octaves go from C-C...so its 8).
function getRow(midiNote: number, keySignature?: KEY_SIGNATURE): number {
  let key = getKey(midiNote, keySignature)
  let octave = getOctave(midiNote)
  let step = key[0]
  return octave * 7 + STEP_NUM[step]
}

export function drawGClef(ctx: CanvasRenderingContext2D, x: number, staffTopY: number) {
  const y = staffTopY + getOffset(getNote('G4'), 'treble')
  drawSymbol(ctx, glyphs.gClef, x, y, STAFF_FIVE_LINES_HEIGHT)
}

export function drawFClef(ctx: CanvasRenderingContext2D, x: number, staffTopY: number) {
  const y = staffTopY + getOffset(getNote('F3'), 'bass')
  drawSymbol(ctx, glyphs.fClef, x, y, STAFF_FIVE_LINES_HEIGHT)
}

export function drawCurlyBrace(ctx: CanvasRenderingContext2D, x: number, y: number, size?: number) {
  drawSymbol(ctx, glyphs.brace, x, y, size)
}
