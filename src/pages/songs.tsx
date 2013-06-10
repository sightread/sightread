import type { GetStaticProps } from 'next'
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

export const getStaticProps: GetStaticProps = async () => {
  // const midishareManifest: { [id: string]: MusicFile } = await getMidishareManifest()
  // for (const song of Object.values(midishareManifest)) {
  //   song.source = 'midishare'
  // }

  return {
    // props: { midishareManifest },
    props: {},
    revalidate: 60 * 60, // once an hour.
  }
}

// Page should operate even if/when midishare is down.
async function getMidishareManifest() {
  try {
    return (await fetch('https://midishare.dev/api/midis')).json()
  } catch (err: any) {
    console.error(`${new Date().toUTCString()}: Error reaching midishare.dev`)
    return {}
  }
}

export default SelectSong
