import ClientPage from './index'

import { SongMetadata, SongSource } from '@/types'

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

// Page should operate even if/when midishare is down.
async function getMidishareManifest() {
  try {
    const revalidate = 60 * 60 // once an hour.
    return (await fetch('https://midishare.dev/api/midis', { next: { revalidate } })).json()
  } catch (err: any) {
    console.error(`${new Date().toUTCString()}: Error reaching midishare.dev`, err)
    return {}
  }
}

function getKey(id: string, source: SongSource) {
  return `${source}/${id}`
}

async function getStaticProps() {
  const midishareMetadata: SongMetadata[] = Object.values(await getMidishareManifest())
  for (const song of midishareMetadata) {
    song.source = 'midishare'
  }
  const metadataByKey = midishareMetadata.map((m) => [getKey(m.id, m.source), m])
  return metadataByKey
}

export default async function SelectSong() {
  const midishareMetadata = await getStaticProps()
  const props = { midishareMetadata }
  return <ClientPage {...props} />
}
