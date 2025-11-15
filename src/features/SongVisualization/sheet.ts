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
import { findNoteMetadata } from '@/features/metadata'
import { Clef, SongMeasure, SongNote } from '@/types'
import { pickHex } from '@/utils'
import {
  drawLedgerLines,
  drawMusicNote,
  drawSymbol,
  getNoteY,
  PLAY_NOTES_WIDTH,
} from '../drawing/sheet'
import midiState from '../midi'
import { isHitNote, isMissedNote } from '../player'
import { getFixedDoNoteFromKey, getKey, getKeyDetails, getNote, glyphs } from '../theory'
import { GivenState } from './canvas-renderer'
import { CanvasItem, getItemsInView, Viewport } from './utils'

const TEXT_FONT = 'Arial'
const STAFF_START_X = 100
const STAFF_FIVE_LINES_HEIGHT = 80
const PLAY_NOTES_LINE_OFFSET = STAFF_SPACE // offset above and below the staff lines

function getViewport(state: Readonly<GivenState>): Viewport {
  return {
    start: state.time * state.pps,
    end: state.time * state.pps + (state.windowWidth - STAFF_START_X),
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
  state.ctx.clearRect(0, 0, state.windowWidth, state.height)
  drawStaticsUnderlay(state)
  const items = getSheetItemsInView(state)
  for (const item of items) {
    if (item.type === 'measure') {
      continue
    }
    renderLedgerLines(state, item)
  }
  for (const item of items) {
    if (item.type === 'measure') {
      continue
    }
    renderSheetNote(state, item)
  }
  drawStaticsOverlay(state)
  renderMidiPressedKeys(state, items)
}

function getSheetItemsInView(state: State): CanvasItem[] {
  const startPred = (item: CanvasItem) => getItemStartEnd(state, item).end >= 0
  const endPred = (item: CanvasItem) => getItemStartEnd(state, item).start > state.windowWidth
  return getItemsInView(state, startPred, endPred)
}

function drawStaticsOverlay(state: State) {
  const { ctx, keySignature } = state
  const overlayEnd = getPlayNotesLineX(state) - STAFF_SPACE * 2
  ctx.clearRect(0, 0, overlayEnd, state.height)
  ctx.fillStyle = 'black'
  ctx.strokeStyle = 'black'

  const curlyBraceSize = STAFF_FIVE_LINES_HEIGHT * 2 + 100
  const curlyBraceY = state.height / 2 + curlyBraceSize / 2
  drawCurlyBrace(state.ctx, STAFF_START_X - 25, curlyBraceY, curlyBraceSize)

  const staffHeight = STAFF_FIVE_LINES_HEIGHT
  const trebleTopY = getTrebleStaffTopY(state)
  const bassTopY = getBassStaffTopY(state)
  drawStaffLines(state.ctx, STAFF_START_X, trebleTopY, overlayEnd)
  drawStaffLines(state.ctx, STAFF_START_X, bassTopY, overlayEnd)
  drawStaffConnectingLine(state.ctx, STAFF_START_X, trebleTopY - 1, bassTopY + staffHeight + 1)

  const playLineTop = trebleTopY - PLAY_NOTES_LINE_OFFSET
  const playLineBottom = bassTopY + staffHeight + PLAY_NOTES_LINE_OFFSET
  drawPlayNotesLine(ctx, getPlayNotesLineX(state) - 2, playLineTop, playLineBottom)

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

function drawStaticsUnderlay(state: State) {
  const { ctx } = state
  ctx.fillStyle = 'black'
  ctx.strokeStyle = 'black'

  const trebleTopY = getTrebleStaffTopY(state)
  const bassTopY = getBassStaffTopY(state)
  drawStaffLines(state.ctx, STAFF_START_X, trebleTopY, state.windowWidth)
  drawStaffLines(state.ctx, STAFF_START_X, bassTopY, state.windowWidth)
}

function getTrebleStaffTopY(state: State) {
  const staffHeight = STAFF_FIVE_LINES_HEIGHT
  return state.height / 2 - 50 - staffHeight
}

function getBassStaffTopY(state: State) {
  return state.height / 2 + 50
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

const colorMap = {
  primary: '121,74,227',
  hover: '185,154,244',
  disabled: '100,100,100',
  black: '0,0,0',
}

const coloredNotesMap: { [step: string]: string } = {
  C: '240,32,80',
  D: '252,137,63',
  E: '218,205,70',
  F: '126,222,80',
  G: '3,226,254',
  A: '0,0,255',
  B: '120,1,234',
}

function getGameColorPrefix(state: State, note: SongNote, canvasX: number) {
  const playNotesLineX = getPlayNotesLineX(state)
  const isPlayingNote = canvasX <= playNotesLineX

  if (isHitNote(state.player, note) && midiState.getPressedNotes().has(note.midiNote)) {
    return colorMap.hover
  } else if (isMissedNote(state.player, note)) {
    return colorMap.disabled
  } else if (isPlayingNote) {
    return colorMap.primary
  }
  return colorMap.black
}

function getLearnSongColorPrefix(
  state: State,
  note: SongNote,
  canvasX: number,
  coloredNotes: boolean,
  step: string,
) {
  const playNotesLineX = getPlayNotesLineX(state)
  const isPlayingNote = canvasX <= playNotesLineX

  if (isPlayingNote) {
    return colorMap.primary
  }

  return getNoteColor(coloredNotes, step)
}

function renderLedgerLines(state: State, note: SongNote): void {
  const { ctx, pps, keySignature } = state
  const posX = getItemStartEnd(state, note).start
  const staff = state.hands?.[note.track].hand === 'right' ? 'treble' : 'bass'
  const staffTopY = staff === 'treble' ? getTrebleStaffTopY(state) : getBassStaffTopY(state)
  const playNotesLineX = getPlayNotesLineX(state)
  let canvasX = posX + playNotesLineX + PLAY_NOTES_WIDTH / 2

  const ledgerGradient = ctx.createLinearGradient(
    playNotesLineX - STAFF_SPACE * 2,
    0,
    playNotesLineX,
    0,
  )
  fadeColorToWhite('0,0,0', ledgerGradient)

  ctx.fillStyle = ledgerGradient
  ctx.strokeStyle = ledgerGradient

  drawLedgerLines(
    ctx,
    canvasX - STAFF_SPACE,
    STAFF_SPACE * 2,
    staffTopY,
    note.midiNote,
    staff,
    state.keySignature,
  )
}

function renderSheetNote(state: State, note: SongNote): void {
  const { ctx, pps, keySignature } = state

  // Determine if this is a single-track MIDI (only one track) or multi-track
  const numTracks = state.hands ? Object.keys(state.hands).length : 0
  const isSingleTrack = numTracks === 1

  // For single-track MIDI with metadata: filter by metadata hand assignments
  // For multi-track MIDI: filter by track-based hand assignments
  if (isSingleTrack && state.handFingerMetadata) {
    // Single-track MIDI: use metadata.json hand assignments
    const noteMetadata = findNoteMetadata(state.handFingerMetadata, note.time, note.midiNote)

    if (noteMetadata && noteMetadata.hand !== ' ') {
      const metadataHand = noteMetadata.hand.toUpperCase()

      if (state.hand === 'left' && metadataHand !== 'L') {
        return
      }
      if (state.hand === 'right' && metadataHand !== 'R') {
        return
      }
    }
  } else if (!isSingleTrack && state.hands) {
    // Multi-track MIDI: use track-based hand assignments
    const trackHand = state.hands[note.track]?.hand
    if (trackHand) {
      if (state.hand === 'left' && trackHand !== 'left') {
        return
      }
      if (state.hand === 'right' && trackHand !== 'right') {
        return
      }
    }
  }

  ctx.save()
  const length = Math.round(pps * note.duration)
  const posX = getItemStartEnd(state, note).start
  const color = sheetNoteColor(posX, length)
  const staff = state.hands?.[note.track].hand === 'right' ? 'treble' : 'bass'
  const staffTopY = staff === 'treble' ? getTrebleStaffTopY(state) : getBassStaffTopY(state)
  const playNotesLineX = getPlayNotesLineX(state)
  let canvasX = posX + playNotesLineX + PLAY_NOTES_WIDTH / 2
  let canvasY = getNoteY(note.midiNote, staff, staffTopY, keySignature)

  const key = getKey(note.midiNote, state.keySignature)
  const prefix = state.game
    ? getGameColorPrefix(state, note, canvasX)
    : getLearnSongColorPrefix(state, note, canvasX, state.coloredNotes, key[0])

  const trailLength = length - STAFF_SPACE
  const trailHeight = 10
  const noteGradient = ctx.createLinearGradient(
    playNotesLineX - STAFF_SPACE * 2,
    0,
    playNotesLineX,
    0,
  )
  fadeColorToWhite(prefix, noteGradient)

  ctx.fillStyle = noteGradient
  ctx.strokeStyle = noteGradient
  ctx.fillRect(canvasX + STAFF_SPACE / 2, canvasY - trailHeight / 2, trailLength, trailHeight)
  ctx.globalCompositeOperation = 'source-over'

  // Return after drawing the tail for the notes that have already crossed.
  if (canvasX < playNotesLineX - STAFF_SPACE * 2) {
    ctx.restore()
    return
  }

  drawMusicNote(ctx, canvasX, canvasY, noteGradient)
  const accidental = key.length == 2 && key[1]
  if (accidental) {
    const symbol = accidental === '#' ? glyphs.accidentalSharp : glyphs.accidentalFlat
    const symbolX = canvasX - (STAFF_SPACE + 8)
    drawSymbol(ctx, symbol, symbolX, canvasY, STAFF_FIVE_LINES_HEIGHT * 0.8, noteGradient)
  }
  if (state.noteLabels !== 'none') {
    ctx.font = `9px ${TEXT_FONT}`
    ctx.fillStyle = 'white'
    const step = key[0]
    const noteText = state.noteLabels === 'alphabetical' ? step : getFixedDoNoteFromKey(step)
    const xOffset = state.noteLabels === 'alphabetical' ? 0 : 3
    ctx.fillText(noteText, canvasX - xOffset, canvasY + 3)
  }
  ctx.restore()
}

function getItemStartEnd(state: State, item: CanvasItem): { start: number; end: number } {
  const start = item.time * state.pps - state.viewport.start
  const duration = item.type === 'note' ? item.duration : 100
  const end = start + duration * state.pps
  return { start, end }
}

function sheetNoteColor(x: number, length: number): string {
  const black = '#000000'
  if (x + length < 0 || x >= 0) {
    return black
  }
  const ratio = Math.max((x + length) / length, 0.15) // idk why but lower causes orange
  return pickHex('#8147EB', black, ratio)
}

function renderMidiPressedKeys(state: State, inRange: (SongNote | SongMeasure)[]): void {
  const { ctx } = state
  const pressed = midiState.getPressedNotes()
  for (let note of pressed.keys()) {
    let staff: Clef = note < getNote('C4') ? 'bass' : 'treble'
    const inRangeNote = inRange.find((n) => n.type === 'note' && n.midiNote === +note) as
      | SongNote
      | undefined
    if (inRangeNote) {
      staff = state.hands?.[inRangeNote.track].hand === 'right' ? 'treble' : 'bass'
    }

    const staffTopY = staff === 'bass' ? getBassStaffTopY(state) : getTrebleStaffTopY(state)
    const canvasY = getNoteY(note, staff, staffTopY, state.keySignature)
    let canvasX = getPlayNotesLineX(state) - 2
    const key = getKey(note, state.keySignature)
    drawMusicNote(
      ctx,
      canvasX,
      canvasY,
      state.coloredNotes ? `rgba(${getNoteColor(true, key[0])},1)` : 'red',
    )

    // Draw accidental (sharp or flat)
    if (key.length === 2) {
      const symbolColor = state.coloredNotes ? `rgba(${getNoteColor(true, key[0])},1)` : 'black'
      const accidental = key[1] === '#' ? glyphs.accidentalSharp : glyphs.accidentalFlat
      drawSymbol(
        ctx,
        accidental,
        canvasX - 24,
        canvasY,
        STAFF_FIVE_LINES_HEIGHT * 0.6,
        symbolColor,
      )
    }
    if (state.noteLabels !== 'none') {
      ctx.font = `9px ${TEXT_FONT}`
      ctx.fillStyle = 'white'
      const step = key[0]
      const noteText = state.noteLabels === 'alphabetical' ? step : getFixedDoNoteFromKey(step)
      ctx.fillText(noteText, canvasX, canvasY + 3)
    }
  }
}

function fadeColorToWhite(color: string, gradient: any) {
  gradient.addColorStop(0, `rgba(${color},0)`)
  gradient.addColorStop(0.5, `rgba(${color},0.1)`)
  gradient.addColorStop(0.8, `rgba(${color},0.3`)
  gradient.addColorStop(1, `rgba(${color},1)`)
}

function getNoteColor(coloredNotes: boolean, step: string): string {
  return coloredNotes ? coloredNotesMap[step] : colorMap.black
}
