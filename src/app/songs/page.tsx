import { SongMetadata } from '@/types'
import { getKey } from '@/utils'
import ClientPage from './index'

export type MidishareManifestSong = {
  title: string
  artist?: string
  uploader: string
  uploadedAt: Date // TODO: make a date type?
  youtubeId?: string
  originalSourceUrl?: string
  originalSourceType: 'musescore' | 'flat.io' | 'other'
  originalArranger: string
  duration: string
  midiUrl: string
}

export default async function SelectSong() { 
  return <ClientPage />
}
