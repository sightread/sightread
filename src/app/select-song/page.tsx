'use client'
import ClientPage from './index'

import type { GetStaticProps } from 'next'
import { SongMetadata } from '@/types'

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
    return (
      await fetch('https://midishare.dev/api/midis', {
        next: {
          revalidate: 60 * 60, // once an hour.
        },
      })
    ).json()
  } catch (err: any) {
    console.error(`${new Date().toUTCString()}: Error reaching midishare.dev`)
    return {}
  }
}
const getStaticProps: GetStaticProps = async () => {
  const midishareMetadata: SongMetadata[] = Object.values(await getMidishareManifest())
  for (const song of midishareMetadata) {
    song.source = 'midishare'
  }

  return {
    props: { songMetadata: midishareMetadata },
    revalidate: 60 * 60,
  }
}

//  TODO: finish migrating this.
//  invalidating at the
export default async function SelectSong() {
  const songMetadata = await getStaticProps()
  const props = { songMetadata }
  return <ClientPage {...props} />
}
