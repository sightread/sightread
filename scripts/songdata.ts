import { MusicFile } from '@/types'

const builtinManifest = require('./builtin-manifest.json')

const songs: MusicFile[] = builtinManifest.map((s: any) => {
  return {
    file: `music/songs/${s.title}.mid`,
    title: s.title,
    artist: s.artist ?? s.arranger,
    difficulty: s.difficulty,
    source: 'builtin',
  }
})

const musicFiles: MusicFile[] = songs

export { musicFiles }
