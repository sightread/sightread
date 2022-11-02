import { Song, SongMetadata, SongSource } from '@/types'
import { getKey } from '.'
import songManifest from '@/manifest.json'

const songs: Map<string, Song> = new Map()
const songsMetadata: Map<string, SongMetadata> = new Map()

export function addSong(id: string, source: SongSource, song: Song) {
  const key = getKey(id, source)
  songs.set(key, song)
}

export function hasSong(id: string, source: SongSource) {
  return songs.has(getKey(id, source))
}

export function getSong(id: string, source: SongSource) {
  return songs.get(getKey(id, source))
}

const seen = new WeakSet()
export function addMetadata(metadataList: SongMetadata[]) {
  if (seen.has(metadataList)) {
    return
  }
  seen.add(metadataList)

  for (const metadata of metadataList) {
    const key = getKey(metadata.id, metadata.source)
    songsMetadata.set(key, metadata)
  }
}

export function getSongsMetadata() {
  return Array.from(songsMetadata.values())
}

export function getSongMetadata(id: string, source: SongSource) {
  const key = getKey(id, source)
  return songsMetadata.get(key)
}

addMetadata(Object.values(songManifest) as any)
