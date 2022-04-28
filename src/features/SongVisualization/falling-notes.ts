import type { SongMeasure, SongNote } from '@/types'
import { getKey, isBlack } from '@/features/theory'

import { line, roundRect, roundCorner } from '@/features/drawing'
import { GivenState } from './canvasRenderer'
import Player from '../player'
import midiState from '../midi'
import {
  drawPianoRoll,
  getPianoRollMeasurements,
  handlePianoRollMousePresses,
  PianoRollMeasurements,
} from '@/features/drawing/piano'
import { getRelativeMouseCoordinates } from '../mouse'
import { getSongRange, Viewport } from './utils'

const TEXT_FONT = 'Arial'
const MUSIC_FONT = 'Leland'
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
}

/**
 *
 */
function getActiveNotes(state: State): Map<number, string> {
  const activeNotes = new Map()
  for (let midiNote of midiState.getPressedNotes().entries()) {
    activeNotes.set(midiNote, 'grey')
  }
  for (let songNote of Object.values(Player.player().getPressedKeys())) {
    activeNotes.set(songNote.midiNote, getNoteColor(songNote, state))
  }
}

function getViewport(state: Readonly<GivenState>): Viewport {
  return {
    start: state.time * state.pps + state.height,
    end: state.time * state.pps,
  }
}

type State = GivenState & {
  viewport: Viewport
  measurements: PianoRollMeasurements
  pianoTopY: number
  noteHitY: number
}
function deriveState(state: GivenState) {
  let items = state.constrictView ? state.items : undefined
  const notes: SongNote[] = items
    ? (items.filter((i) => i.type === 'note') as SongNote[])
    : ([{ midiNote: 21 }, { midiNote: 108 }] as SongNote[])
  const { startNote, endNote } = getSongRange({ notes })

  const pianoMeasurements = getPianoRollMeasurements(state.width, { startNote, endNote })
  const { whiteHeight } = pianoMeasurements
  const pianoTopY = state.height - whiteHeight - 5
  const greyBarHeight = Math.max(Math.floor(whiteHeight / 30), 6)
  const redFeltHeight = greyBarHeight - 2

  return {
    ...state,
    pianoMeasurements: getPianoRollMeasurements(state.width, { startNote, endNote }),
    viewport: getViewport(state),
    pianoTopY,
    greyBarHeight,
    redFeltHeight,
  }
}

export function renderFallingVis(givenState: GivenState): void {
  const state = deriveState(givenState)
  state.ctx.fillStyle = '#2e2e2e' // background color
  state.ctx.fillRect(0, 0, state.width, state.height)

  const { width, height } = state

  items = getItemsInView(state)

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

  renderRedFelt(state)
  renderGreyBar(state)

  handlePianoRollMousePresses(
    state.measurements,
    getRelativeMouseCoordinates(0, state.canvasRect.top),
  )
  drawPianoRoll(state.ctx, state.measurements, 0, pianoTopY, getActiveNotes(state))
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

function renderRedFelt(state: State) {
  const { ctx } = state
  const { pianoTopY, redFeltHeight } = state.measurements

  const redFeltY = pianoTopY - redFeltHeight

  ctx.save()
  const redFeltColor = 'rgb(159,31,38)'
  ctx.fillStyle = redFeltColor
  ctx.fillRect(x, y, width, height)
  ctx.restore()
}
function renderGreyBar(state: State) {
  const { ctx } = state
  const { pianoTopY, redFeltHeight, greyBarHeight } = state.measurements

  ctx.save()
  ctx.fillStyle = 'rgb(74,74,74)'
  ctx.strokeStyle = 'rgb(40,40,40)'
  const greyBarY = pianoTopY - redFeltHeight - greyBarHeight
  ctx.fillRect(0, greyBarY + 0.2, state.width, greyBarHeight)
  ctx.strokeRect(0, greyBarY, state.width, greyBarHeight)
  ctx.restore()
}

function renderOctaveRuler(state: State) {
  const { ctx } = state
  ctx.save()
  ctx.lineWidth = 2
  for (let [midiNote, { left }] of Object.entries(state.measurements.lanes)) {
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
  const { ctx, pps } = state
  const lane = state.measurements.lanes[note.midiNote]
  const posY = getItemStartEnd(note, state).end - (state.height - state.measurements.noteHitY)
  const posX = Math.floor(lane.left + 1)
  const length = Math.floor(note.duration * pps)
  const width = lane.width - 2
  const color = getNoteColor(note, state)

  ctx.fillStyle = color
  ctx.strokeStyle = 'rgb(40,40,40)'
  roundRect(ctx, posX, posY, width, length)
}

function renderMeasure(measure: SongMeasure, state: GivenState, viewport: Viewport): void {
  const { ctx, width } = state
  ctx.save()
  const posY =
    getItemStartEnd(measure, state, viewport).start - (state.height - state.measurements.noteHitY)

  ctx.font = `16px ${TEXT_FONT}`
  ctx.strokeStyle = ctx.fillStyle = palette.measure
  line(ctx, 0, posY, width, posY)
  ctx.strokeStyle = 'rgb(130,130,130)'
  ctx.fillStyle = 'rgb(130,130,130)'
  ctx.fillText(measure.number.toString(), width / 100, Math.floor(posY - 5))
  ctx.restore()
}

function getItemStartEnd(
  item: CanvasItem,
  state: GivenState,
  viewport: Viewport,
): { start: number; end: number } {
  const start = viewport.start - item.time * state.pps
  const duration = item.type === 'note' ? item.duration : 100
  const end = start - duration * state.pps
  return { start, end }
}
