import { SelectSong } from '@/features/pages'
import { MusicFile } from '@/types'

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

export async function getServerSideProps() {
  const midishareManifest: any = await (await fetch('https://midishare.dev/api/midis')).json()
  for (let song of Object.values(midishareManifest)) {
    ;(song as MusicFile).source = 'midishare'
  }

  return {
    props: { midishareManifest },
  }
}

export default SelectSong
