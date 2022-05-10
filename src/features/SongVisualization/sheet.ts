import { GivenState } from './canvasRenderer'
import { Viewport } from './utils'
import {
  drawCurlyBrace,
  drawFClef,
  drawGClef,
  drawKeySignature,
  drawPlayNotesLine,
  drawStaffConnectingLine,
  drawStaffLines,
  drawTimeSignature,
  STAFF_SPACE,
} from '@/features/drawing'

const STAFF_START_X = 100
const STAFF_FIVE_LINES_HEIGHT = 80
const PLAY_NOTES_LINE_OFFSET = STAFF_SPACE * 4 // offset above and below the staff lines

function getViewport(state: Readonly<GivenState>): Viewport {
  return {
    start: state.time * state.pps,
    end: state.time * state.pps + (state.width - STAFF_START_X),
  }
}

type State = GivenState & {
  viewport: Viewport
}

function deriveState(state: GivenState) {
  return { ...state, viewport: getViewport(state) }
}

// Optimization ideas:
// - can use offdom canvas (not OffscreenCanvas API) for background since its repainting over and over.
// - can also treat it all as one giant image that gets partially drawn each frame.
export function renderSheetVis(givenState: GivenState): void {
  const state = deriveState(givenState)
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

function drawStatics(state: State) {
  const { ctx, keySignature } = state
  ctx.fillStyle = 'black'
  ctx.strokeStyle = 'black'

  const curlyBraceSize = STAFF_FIVE_LINES_HEIGHT * 2 + 100
  const curlyBraceY = state.height / 2 + curlyBraceSize / 2
  drawCurlyBrace(state.ctx, STAFF_START_X - 25, curlyBraceY, curlyBraceSize)

  const staffHeight = STAFF_FIVE_LINES_HEIGHT * 8
  const trebleTopY = state.height / 2 - 50 - staffHeight
  const bassTopY = state.height / 2 + 50
  drawStaffLines(state.ctx, STAFF_START_X, trebleTopY, state.width)
  drawStaffLines(state.ctx, STAFF_START_X, bassTopY, state.width)
  drawStaffConnectingLine(state.ctx, STAFF_START_X, trebleTopY - 1, bassTopY + staffHeight + 1)

  const playLineTop = trebleTopY - PLAY_NOTES_LINE_OFFSET
  const playLineBottom = bassTopY + staffHeight + PLAY_NOTES_LINE_OFFSET
  drawPlayNotesLine(ctx, getPlayNotesLineX(state), playLineTop, playLineBottom)

  drawGClef(ctx, getClefX(), trebleTopY)
  drawFClef(ctx, getClefX(), bassTopY)
  drawKeySignature(ctx, getKeySignatureX(), trebleTopY, keySignature, 'treble')
  drawKeySignature(ctx, getKeySignatureX(), bassTopY, keySignature, 'bass')

  if (state.timeSignature) {
    const x = getTimeSignatureX(state)
    drawTimeSignature(ctx, x, trebleTopY, state.timeSignature)
    drawTimeSignature(ctx, x, bassTopY, state.timeSignature)
  }
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
