import type { SongMeasure, SongNote } from '@/types'
import { getKey, isBlack } from '@/features/theory'

import { line, roundRect } from '@/features/drawing'
import { GivenState } from './canvasRenderer'
import midiState from '../midi'
import {
  drawPianoRoll,
  getPianoRollMeasurements,
  handlePianoRollMousePress,
  PianoRollMeasurements,
} from '@/features/drawing/piano'
import { getRelativeMouseCoordinates } from '../mouse'
import { CanvasItem, getItemsInView, getSongRange, Viewport } from './utils'
import { clamp } from '@/utils'

const TEXT_FONT = 'Arial'
const palette = {
  right: {
    black: '#611AE5',
    white: '#8147EB',
  },
  left: {
    black: '#CF4E17',
    white: '#EB7847',
  },
  measure: 'rgb(60,60,60)',
  octaveLine: 'rgb(90,90,90)',
  rangeSelectionFill: '#44b22e',
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
      activeNotes.set(note.midiNote, getNoteColor(state, note))
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
  const { startNote, endNote } = getSongRange({ notes })

  const pianoMeasurements = getPianoRollMeasurements(state.windowWidth, { startNote, endNote })
  const { whiteHeight } = pianoMeasurements
  const pianoTopY = state.height - whiteHeight - 5
  const pianoHeight = whiteHeight + 5
  const greyBarHeight = Math.max(Math.floor(whiteHeight / 30), 6)
  const redFeltHeight = greyBarHeight - 2

  return {
    ...state,
    pianoMeasurements: getPianoRollMeasurements(state.windowWidth, { startNote, endNote }),
    viewport: getViewport(state),
    pianoTopY,
    greyBarHeight,
    redFeltHeight,
    noteHitY: pianoTopY - greyBarHeight - redFeltHeight,
    pianoHeight,
  }
}

function getFallingNoteItemsInView<T>(state: State): CanvasItem[] {
  let startPred = (item: CanvasItem) => getItemStartEnd(item, state).end <= state.height
  let endPred = (item: CanvasItem) => getItemStartEnd(item, state).start < 0
  return getItemsInView(state, startPred, endPred)
}

export function renderFallingVis(givenState: GivenState): void {
  const state: State = deriveState(givenState)
  state.ctx.fillStyle = '#2e2e2e' // background color
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
    getRelativeMouseCoordinates(state.canvasRect.left, state.canvasRect.top),
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
  const keyType = isBlack(note.midiNote) ? 'black' : 'white'

  let color
  if (hand === 'both' || hand === 'right') {
    color = palette.right[keyType]
  } else {
    color = palette.left[keyType]
  }
  return color
}

function renderRedFelt(state: State) {
  const { ctx, windowWidth: width } = state
  const { pianoTopY, redFeltHeight } = state
  const redFeltY = pianoTopY - redFeltHeight

  ctx.save()
  const redFeltColor = 'rgb(159,31,38)'
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
  ctx.fillStyle = palette.rangeSelectionFill
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
  ctx.fillStyle = 'rgb(74,74,74)'
  ctx.strokeStyle = 'rgb(40,40,40)'
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

export function renderFallingNote(note: SongNote, state: State): void {
  const { ctx, pps, drawNotes } = state
  const lane = state.pianoMeasurements.lanes[note.midiNote]
  const posY = getItemStartEnd(note, state).end - (state.height - state.noteHitY)
  const posX = Math.floor(lane.left + 1)
  const length = Math.floor(note.duration * pps)
  const width = lane.width - 2
  const color = getNoteColor(state, note)

  ctx.save()
  ctx.fillStyle = color
  ctx.strokeStyle = 'rgb(40,40,40)'
  roundRect(ctx, posX, posY, width, length)

  if (drawNotes) {
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.textBaseline = 'bottom'
    const noteText = getKey(note.midiNote, state.keySignature)
    ctx.font = `${(width * 2) / 3}px ${TEXT_FONT}`
    // TODO: only measure this once per render loop, instead of for each note.
    const { width: textWidth } = ctx.measureText(noteText)
    ctx.fillText(noteText, posX + width / 2 - textWidth / 2, posY + length - 2)
  }
  ctx.restore()
}

function renderMeasure(measure: SongMeasure, state: State): void {
  const { ctx, windowWidth: width, viewport } = state
  ctx.save()
  const posY = getItemStartEnd(measure, state).start - (state.height - state.noteHitY)

  ctx.strokeStyle = ctx.fillStyle = palette.measure
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
