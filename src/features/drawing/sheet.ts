import {
  getKey,
  getKeyDetails,
  getNote,
  getOctave,
  isBlack,
  KEY_SIGNATURE,
  glyphs,
} from '@/features/theory'
import { line } from './index'

const TEXT_FONT = 'Arial'
const MUSIC_FONT = 'Leland'
const STAFF_FIVE_LINES_HEIGHT = 80
const STAFF_SPACE = STAFF_FIVE_LINES_HEIGHT / 4
const STAFF_LINE_WIDTH = 2
const STAFF_START_X = 100
const PLAY_NOTES_WIDTH = 20
const PLAY_NOTES_LINE_OFFSET = STAFF_SPACE * 4 // offset above and below the staff lines
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

function getNoteY(state: State, staff: 'bass' | 'treble', note: number) {
  return getRowY(state, staff, getRow(note, state.keySignature))
}

function getRowY(state: State, staff: 'bass' | 'treble', row: number) {
  const top = staff === 'treble' ? trebleTopY(state.height) : bassTopY(state.height)
  const topNote = staff == 'treble' ? 'F5' : 'A3'
  const offsetFromTop = getRow(getNote(topNote)) - row

  const pixelsPerRow = STAFF_FIVE_LINES_HEIGHT / 8
  return top + offsetFromTop * pixelsPerRow
}

function sheetNoteColor(x: number, length: number): string {
  const black = '#000000'
  if (x + length < 0 || x >= 0) {
    return black
  }
  const ratio = Math.max((x + length) / length, 0.15) // idk why but lower causes orange
  return pickHex(palette.right.white, black, ratio)
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
}

function getViewport(state: Readonly<GivenState>) {
  return {
    start: state.time * state.pps,
    end: state.time * state.pps + (state.width - STAFF_START_X),
  }
}

// Optimization ideas:
// - can use offdom canvas (not OffscreenCanvas API) for background since its repainting over and over.
// - can also treat it all as one giant image that gets partially drawn each frame.
export function renderSheetVis(state: State): void {
  state.ctx.clearRect(0, 0, state.width, state.height)
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
