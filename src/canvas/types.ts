import { SongMeasure, SongNote } from 'src/types'

export type Canvas = CanvasRenderingContext2D
export type CanvasItem = SongMeasure | SongNote

export type Palette = {
  right: {
    black: string
    white: string
  }
  left: {
    black: string
    white: string
  }
  measure: string
}
export type visualizations = 'sheet' | 'falling-notes' | 'freeplay' | string
