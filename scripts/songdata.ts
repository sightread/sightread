import { MusicFile } from '@/types'

const synthesiaManifest = require('./synthesia-manifest.json')

const songs: MusicFile[] = synthesiaManifest.map((s: any) => {
  return {
    file: `music/songs/${s.title}.${s.id}.mid`,
    title: s.title,
    artist: s.artist ?? s.arranger,
    difficulty: s.difficulty,
    source: 'builtin',
  }
})

const musicFiles: MusicFile[] = songs

export { musicFiles }
