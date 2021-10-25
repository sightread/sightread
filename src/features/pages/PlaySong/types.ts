import { VisualizationMode } from '@/types'

export type PlaySongProps = {
  type: 'lesson' | 'song'
  songLocation: string
  viz: VisualizationMode
}
