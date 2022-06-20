import { UploadedSong } from '@/features/persist'
import { DifficultyLabel } from '@/types'

export type LibrarySong = {
  file: string
  title: string
  artist: string
  difficulty: DifficultyLabel
  type: 'song'
  duration: number
}

export type SelectableSongs = (LibrarySong | UploadedSong)[]

export type Filters = {
  show: boolean
  duration?: [number, number] // duration filter in a range. have to find song with longest duration?
  difficulty?: DifficultyLabel
  type?: 'song' | 'upload'
}
