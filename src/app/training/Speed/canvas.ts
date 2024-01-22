import {
  drawFClef,
  drawGClef,
  drawLedgerLines,
  drawMusicNote,
  drawPlayNotesLine,
  drawStaffConnectingLine,
  drawStaffLines,
  drawSymbol,
  getNoteY,
  PLAY_NOTES_WIDTH,
  STAFF_SPACE,
} from '@/features/drawing'
import midiState from '@/features/midi'
import { getKey, glyphs } from '@/features/theory'
import { Size } from '@/types'
import { SpeedState, SpeedTrainingConfig as SpeedConfig } from '.'

const TEXT_FONT = 'Arial'
const STAFF_START_X = 100
const STAFF_FIVE_LINES_HEIGHT = 80
const PLAY_NOTES_LINE_OFFSET = STAFF_SPACE * 2 // offset above and below the staff lines

type State = {
  ctx: CanvasRenderingContext2D
  canvasSize: Size
  speedState: SpeedState
  speedConfig: SpeedConfig
}

export function render(state: State) {
  const { ctx, canvasSize, speedState } = state
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
  drawStatics(state)
  const items = speedState.notes.slice(speedState.currentNoteIndex)
  for (const [idx, item] of items.entries()) {
    renderSheetNote(state, item, idx)
  }
  renderMidiPressedKeys(state)
}

function drawStatics(state: State) {
  const { ctx, canvasSize, speedConfig } = state
  ctx.fillStyle = 'black'
  ctx.strokeStyle = 'black'

  const staffHeight = STAFF_FIVE_LINES_HEIGHT
  const staffTopY = getStaffTopY(state)
  drawStaffLines(ctx, STAFF_START_X, staffTopY, canvasSize.width)
  drawStaffConnectingLine(ctx, STAFF_START_X, staffTopY - 1, staffTopY + staffHeight + 1)

  const playLineTop = staffTopY - PLAY_NOTES_LINE_OFFSET
  const playLineBottom = staffTopY + staffHeight + PLAY_NOTES_LINE_OFFSET
  drawPlayNotesLine(ctx, getPlayNotesLineX(), playLineTop, playLineBottom)

  const { clef } = speedConfig
  if (clef === 'treble') {
    drawGClef(ctx, getClefX(), staffTopY)
  } else if (clef === 'bass') {
    drawFClef(ctx, getClefX(), staffTopY)
  }
}

function getClefX() {
  return STAFF_START_X + STAFF_SPACE
}

function getPlayNotesLineX() {
  return getClefX() + STAFF_SPACE * 6
}

function getStaffTopY(state: State) {
  const staffHeight = STAFF_FIVE_LINES_HEIGHT
  return state.canvasSize.height / 2 - staffHeight / 2
}

function renderSheetNote(state: State, midiNote: number, idx: number): void {
  const { ctx, speedConfig, speedState } = state
  ctx.save()
  const posX = idx * 100
  const staff = speedConfig.clef
  const staffTopY = getStaffTopY(state)

  const playNotesLineX = getPlayNotesLineX()
  let canvasX = posX + playNotesLineX + PLAY_NOTES_WIDTH / 2
  let canvasY = getNoteY(midiNote, staff, staffTopY)

  // Return if already offscreen past playNotesLine.
  if (canvasX < playNotesLineX - 10) {
    ctx.restore()
    return
  }

  drawLedgerLines(ctx, canvasX - 13, 33, staffTopY, midiNote, staff)
  drawMusicNote(ctx, canvasX, canvasY, 'black')

  const key = getKey(midiNote)
  const accidental = key.length == 2 && key[1]
  if (accidental) {
    ctx.font = `bold 16px ${TEXT_FONT}`
    ctx.fillStyle = 'black'
    ctx.fillText(accidental, canvasX - 20, canvasY + 6)
  }
  if (state.speedConfig.displayLetter) {
    ctx.font = `9px ${TEXT_FONT}`
    ctx.fillStyle = 'white'
    const step = key[0]
    ctx.fillText(step, canvasX, canvasY + 3)
  }
  ctx.restore()
}

function renderMidiPressedKeys(state: State): void {
  const { ctx, speedConfig } = state
  const staff = speedConfig.clef
  const staffTopY = getStaffTopY(state)

  const pressed = midiState.getPressedNotes()
  for (let note of pressed.keys()) {
    const canvasY = getNoteY(note, staff, staffTopY)
    let canvasX = getPlayNotesLineX() - 2
    drawMusicNote(ctx, canvasX, canvasY, 'red')

    const key = getKey(note)
    // is sharp
    if (key.length === 2) {
      ctx.fillStyle = 'black'
      drawSymbol(ctx, glyphs.accidentalSharp, canvasX - 17, canvasY, STAFF_SPACE)
    }
    if (speedConfig.displayLetter) {
      ctx.font = `9px ${TEXT_FONT}`
      ctx.fillStyle = 'white'
      ctx.fillText(key[0], canvasX, canvasY + 3)
    }
  }
}
