import { Home } from '@/features/pages'
import { FEATURED_SONGS } from '@/features/pages/Home'
import { MusicFile } from '@/types'
import { GetStaticProps } from 'next'
import fs from 'fs'

export const getStaticProps: GetStaticProps = async () => {
  const featuredSongIds = new Set(Object.values(FEATURED_SONGS).map((s) => s.id))
  const featuredSongBytes: ArrayBuffer[] = require('@/manifest.json')
    .filter((s: MusicFile) => featuredSongIds.has(s.id))
    .map((s: MusicFile) => {
      const path = `public/${s.file}`
      const buffer = new Uint8Array(fs.readFileSync(path)).buffer
      const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)))
      return base64String
    })

  return { props: { featuredSongBytes } }
}

export default Home
