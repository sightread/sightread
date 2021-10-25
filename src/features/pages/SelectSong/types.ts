import { UploadedSong } from '@/features/persist'

export type LibrarySong = {
  file: string
  name: string
  artist: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  type: 'song'
  duration: number
}

export type SelectableSongs = (LibrarySong | UploadedSong)[]

export type Filters = {
  show: boolean
  duration?: [number, number] // duration filter in a range. have to find song with longest duration?
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  type?: 'song' | 'upload'
}
