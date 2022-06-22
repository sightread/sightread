import { SelectSong } from '@/features/pages'

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
  const midishareManifest = await (await fetch('https://midishare.dev/api/midis')).json()

  return {
    props: { midishareManifest },
  }
}

export default SelectSong
