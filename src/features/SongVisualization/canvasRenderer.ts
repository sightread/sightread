import { SongMeasure, SongNote, Hand } from '@/types'
import { clamp, range } from '@/utils'
import { KEY_SIGNATURE } from '@/features/theory'
import { getSongRange } from './utils'
import { getPianoRollMeasurements, PianoRollMeasurements } from '../drawing/piano'
import midiState from '../midi'
import Player from '../player'
import { renderFallingVis } from './falling-notes'

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
  items: CanvasItem[]
  constrictView?: boolean
  keySignature: KEY_SIGNATURE
  timeSignature?: { numerator: number; denominator: number }
  canvasRect: DOMRect
}

export function render(state: Readonly<GivenState>) {
  if (state.visualization === 'falling-notes') {
    renderFallingVis(state)
  } else {
    renderSheetVis(state)
  }
}
