import { Hand, HandSettings } from '@/types'
import { KEY_SIGNATURE } from '@/features/theory'
import { CanvasItem } from './utils'
import { renderFallingVis } from './falling-notes'
import { renderSheetVis } from './sheet'

export type GivenState = {
  time: number
  drawNotes: boolean
  coloredNotes: boolean
  visualization: 'falling-notes' | 'sheet'
  windowWidth: number
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
  // TODO: snap to measures
  selectedRange?: { start: number; end: number }
  game: boolean
}

export function render(state: Readonly<GivenState>) {
  if (state.visualization === 'falling-notes') {
    renderFallingVis(state)
  } else {
    renderSheetVis(state)
  }
}
