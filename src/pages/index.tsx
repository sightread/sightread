import { Home } from '@/features/pages'

// TODO: Remove waterfall by sending needed MIDI data for the page via initial server render.
//       Need to encode MIDI in a string. Base64 can help (1.37x space), unsure if there are more efficient ways.

// import { MusicFile } from '@/types'
// import { GetStaticProps } from 'next'
// import fs from 'fs'

// export const FEATURED_SONGS = {
//   fur_elise: { source: 'builtin', id: 'b3decef157a073fbef49430250bb7015' },
//   twinkle: { source: 'builtin', id: 'ec6acc14d631630c22ca796d0a5d5b0a' },
//   moonlight: { source: 'builtin', id: '33e41ebf6367374ce7a5f033a5baa796' },
// }

// export const getStaticProps: GetStaticProps = async () => {
//   const featuredSongIds = new Set(Object.values(FEATURED_SONGS).map((s) => s.id))
//   const featuredSongBytes: ArrayBuffer[] = require('@/manifest.json')
//     .filter((s: MusicFile) => featuredSongIds.has(s.id))
//     .map((s: MusicFile) => {
//       const path = `public/${s.file}`
//       const buffer = new Uint8Array(fs.readFileSync(path)).buffer
//       const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)))
//       return base64String
//     })

//   return { props: { featuredSongBytes } }
// }

export default Home
