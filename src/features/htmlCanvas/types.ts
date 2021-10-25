import { SongMeasure, SongNote } from '@/types'

export type Canvas = CanvasRenderingContext2D
export type CanvasItem = SongMeasure | SongNote
export type visualizations = 'sheet' | 'falling-notes' | 'freeplay' | string
