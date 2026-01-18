import { line, roundRect } from '@/features/drawing'
import {
  drawPianoRoll,
  getPianoRollMeasurements,
  handlePianoRollMousePress,
  PianoRollMeasurements,
} from '@/features/drawing/piano'
import { getFixedDoNoteFromKey, getKey, isBlack, transposeMidi } from '@/features/theory'
import type { SongMeasure, SongNote } from '@/types'
import { clamp } from '@/utils'
import midiState from '../midi'
import { getRelativePointerCoordinates } from '../pointer'
import { GivenState } from './canvas-renderer'
import { HAND_COLORS } from './handColors'
import {
  CanvasItem,
  getFontSize,
  getItemsInView,
  getOptimalFontSize,
  getSongRange,
  Viewport,
} from './utils'

const TEXT_FONT = 'monospace'
const colors = {
  measure: 'rgba(255,255,255,0.06)',
  octaveLine: 'rgba(255,255,255,0.035)',
  rangeSelectionFill: '#8b5cf6',
}

/**
 *
 */
function getActiveNotes(state: State, inViewNotes: SongNote[]): Map<number, string> {
  const activeNotes = new Map<number, string>()
  for (let midiNote of midiState.getPressedNotes().keys()) {
    activeNotes.set(midiNote, 'grey')
  }
  for (let note of inViewNotes) {
    if (isPlayingNote(state, note)) {
      const transposed = getTransposedMidi(state, note)
      activeNotes.set(transposed, getNoteColor(state, note))
    }
  }
  return activeNotes
}

function isPlayingNote(state: State, note: SongNote) {
  const itemPos = getItemStartEnd(note, state)
  const noteLen = note.duration * state.pps
  const offset = itemPos.start - state.height
  const clamped = clamp(offset / noteLen, { min: 0, max: 1 })
  return 0 < clamped && clamped < 1
}

function getViewport(state: Readonly<GivenState>): Viewport {
  return {
    start: state.time * state.pps + state.height,
    end: state.time * state.pps,
  }
}

type State = GivenState & {
  viewport: Viewport
  pianoMeasurements: PianoRollMeasurements
  pianoTopY: number
  pianoHeight: number
  noteHitY: number
  redFeltHeight: number
  greyBarHeight: number
}

function deriveState(state: GivenState): State {
  let items = state.constrictView ? state.items : undefined
  const notes: SongNote[] = items
    ? (items.filter((i) => i.type === 'note') as SongNote[])
    : ([{ midiNote: 21 }, { midiNote: 108 }] as SongNote[])

  let minNotes = 36
  if (state.windowWidth > state.height) {
    if (state.windowWidth > 800) {
      minNotes = 88
    } else if (state.windowWidth > 600) {
      minNotes = 72
    } else if (state.windowWidth > 500) {
      minNotes = 60
    } else if (state.windowWidth > 400) {
      minNotes = 40
    } else if (state.windowWidth > 300) {
      minNotes = 32
    }
  }

  const { startNote, endNote } = getSongRange({ notes }, minNotes, state.transpose)
  const pianoMeasurements = getPianoRollMeasurements(state.windowWidth, { startNote, endNote })
  const { whiteHeight } = pianoMeasurements
  const pianoTopY = state.height - whiteHeight - 5
  const pianoHeight = whiteHeight + 5
  const greyBarHeight = Math.max(Math.floor(whiteHeight / 30), 6)
  const redFeltHeight = greyBarHeight - 2

  lastState = {
    ...state,
    pianoMeasurements: getPianoRollMeasurements(state.windowWidth, { startNote, endNote }),
    viewport: getViewport(state),
    pianoTopY,
    greyBarHeight,
    redFeltHeight,
    noteHitY: pianoTopY - greyBarHeight - redFeltHeight,
    pianoHeight,
  }
  return lastState
}

function getFallingNoteItemsInView<T>(state: State): CanvasItem[] {
  let startPred = (item: CanvasItem) => getItemStartEnd(item, state).end <= state.height
  let endPred = (item: CanvasItem) => getItemStartEnd(item, state).start < 0
  return getItemsInView(state, startPred, endPred)
}

export function renderFallingVis(givenState: GivenState): void {
  const state: State = deriveState(givenState)
  state.ctx.fillStyle = '#0f1014' // background color
  state.ctx.fillRect(0, 0, state.windowWidth, state.height)

  const items = getFallingNoteItemsInView(state)

  renderOctaveRuler(state)

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

  if (state.selectedRange) {
    renderRange(state)
  }

  // Render piano pieces
  renderRedFelt(state)
  renderGreyBar(state)

  handlePianoRollMousePress(
    state.pianoMeasurements,
    state.pianoTopY,
    getRelativePointerCoordinates(state.canvasRect.left, state.canvasRect.top),
  )
  drawPianoRoll(
    state.ctx,
    state.pianoMeasurements,
    state.pianoTopY,
    getActiveNotes(state, items.filter((i) => i.type === 'note') as any),
  )
}

function getNoteColor(state: State, note: SongNote): string {
  const hand = state.hands[note.track]?.hand ?? 'both'
  const keyType = isBlack(getTransposedMidi(state, note)) ? 'black' : 'white'

  let color
  if (hand === 'both' || hand === 'right') {
    color = HAND_COLORS.right[keyType]
  } else {
    color = HAND_COLORS.left[keyType]
  }
  return color
}

function renderRedFelt(state: State) {
  const { ctx, windowWidth: width } = state
  const { pianoTopY, redFeltHeight } = state
  const redFeltY = pianoTopY - redFeltHeight

  ctx.save()
  const redFeltColor = '#7f1d2f'
  ctx.fillStyle = redFeltColor
  ctx.fillRect(0, redFeltY, width, redFeltHeight)
  ctx.restore()
}

function renderRange(state: State) {
  const { ctx, windowWidth, noteHitY, pps } = state
  if (!state.selectedRange) {
    return
  }

  // TODO: Skip rendering the range if not even in view.
  const { start, end } = state.selectedRange
  ctx.save()
  const duration = end - start
  const canvasX = 0
  const canvasY =
    getItemStartEnd({ type: 'note', time: start, duration } as CanvasItem, state).start -
    (state.height - noteHitY)
  const height = duration * pps
  ctx.fillStyle = colors.rangeSelectionFill
  ctx.globalAlpha = 0.5
  const lineWidth = Math.floor(windowWidth / 120)
  const lineHeight = Math.floor(lineWidth / 4)
  ctx.fillRect(0, canvasY, windowWidth, lineHeight)
  ctx.fillRect(canvasX, canvasY - height, lineWidth, height)
  ctx.fillRect(0, canvasY - height - lineHeight, windowWidth, lineHeight)
  ctx.restore()
}

function renderGreyBar(state: State) {
  const { pianoTopY, redFeltHeight, greyBarHeight, ctx } = state

  ctx.save()
  ctx.fillStyle = '#1b1d25'
  ctx.strokeStyle = '#0c0d12'
  const greyBarY = pianoTopY - redFeltHeight - greyBarHeight
  ctx.fillRect(0, greyBarY + 0.2, state.windowWidth, greyBarHeight)
  ctx.strokeRect(0, greyBarY, state.windowWidth, greyBarHeight)
  ctx.restore()
}

function renderOctaveRuler(state: State) {
  const { ctx } = state
  ctx.save()
  ctx.lineWidth = 2
  for (let [midiNote, { left }] of Object.entries(state.pianoMeasurements.lanes)) {
    const key = getKey(+midiNote)
    if (key === 'C') {
      ctx.strokeStyle = colors.octaveLine
      line(ctx, left - 2, 0, left, state.height)
    }
    if (key === 'F') {
      ctx.strokeStyle = colors.measure
      line(ctx, left - 2, 0, left, state.height)
    }
  }
  ctx.restore()
}

export function renderFallingNote(note: SongNote, state: State): void {
  const transposed = getTransposedMidi(state, note)
  if (!(transposed in state.pianoMeasurements.lanes)) {
    return
  }

  const { ctx, pps, noteLabels } = state
  const lane = state.pianoMeasurements.lanes[transposed]
  const posY = getItemStartEnd(note, state).end - (state.height - state.noteHitY)
  const posX = Math.floor(lane.left + 1)
  const width = lane.width - 2
  const color = getNoteColor(state, note)
  const actualLength = note.duration * pps
  // TODO: the renderingt height is wonky since it relies on browser canvas-only things.
  const minLengthToDisplayLetter = getFontSize(ctx, '', (width * 2) / 3).height + 15
  const length = Math.floor(Math.max(actualLength, minLengthToDisplayLetter))

  ctx.save()
  ctx.fillStyle = color
  ctx.strokeStyle = 'rgb(40,40,40)'
  roundRect(ctx, posX, posY, width, length)

  if (noteLabels !== 'none') {
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.textBaseline = 'bottom'
    const key = getKey(transposed, state.keySignature)
    const noteText = noteLabels === 'alphabetical' ? key : getFixedDoNoteFromKey(key)
    const padding = 1
    const maxWidth = width - padding * 2
    const { fontPx, measuredWidth: textWidth } = getOptimalFontSize(
      ctx,
      noteText,
      TEXT_FONT,
      maxWidth,
    )
    ctx.font = `${fontPx}px ${TEXT_FONT}`
    ctx.fillText(noteText, posX + width / 2 - textWidth / 2, posY + length - 4)
  }

  ctx.restore()
}

function getTransposedMidi(state: GivenState, note: SongNote) {
  return transposeMidi(note.midiNote, state.transpose)
}

function renderMeasure(measure: SongMeasure, state: State): void {
  const { ctx, windowWidth: width } = state
  ctx.save()
  const posY = getItemStartEnd(measure, state).start - (state.height - state.noteHitY)

  ctx.strokeStyle = ctx.fillStyle = colors.measure
  ctx.lineWidth = 2
  line(ctx, 0, posY, width, posY)
  ctx.strokeStyle = 'rgb(130,130,130)'
  ctx.fillStyle = 'rgb(130,130,130)'
  ctx.font = `16px ${TEXT_FONT}`
  ctx.fillText(measure.number.toString(), width / 100, Math.floor(posY - 5))
  ctx.restore()
}

function getItemStartEnd(item: CanvasItem, state: State): { start: number; end: number } {
  const start = state.viewport.start - item.time * state.pps
  const duration = item.type === 'note' ? item.duration : 100
  const end = start - duration * state.pps
  return { start, end }
}

// TODO figure out a less shit way of sharing measurements
// for hit detection. most of the state is irrelevant to the rest of the world.
let lastState: State | null = null
export function intersectsWithPiano(y: number): boolean {
  if (!lastState) return false
  return y >= lastState.pianoTopY
}
