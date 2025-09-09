import builtinSongManifest from '@/manifest.json'
import { SongMetadata, SongSource } from '@/types'
import { getKey } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { localSongsAtom } from '../persist'

const builtinMetadata: Array<[string, SongMetadata]> = Object.values(builtinSongManifest).map(
  (metadata) => {
    const key = getKey(metadata.id, metadata.source as SongSource)
    return [key, metadata as SongMetadata]
  },
)

const builtinMetadataAtom = atom(builtinMetadata)
const storageMetadataAtom = atom((get) => {
  const songs = Array.from(get(localSongsAtom).values()).flatMap((x) => x)
  return songs.map((x) => [x.id, x]) as [string, SongMetadata][]
})

export const songManifestAtom = atom<Map<string, SongMetadata>>((get) => {
  const builtinMetadata = get(builtinMetadataAtom)
  const storageMetadata = get(storageMetadataAtom)
  return new Map([...builtinMetadata, ...storageMetadata])
})

const songManifestAsListAtom = atom<Array<SongMetadata>>((get) => {
  const songManifest = get(songManifestAtom)
  return Array.from(songManifest.values())
})

export function useSongManifest(): SongMetadata[] {
  const songManifestAsList = useAtomValue(songManifestAsListAtom)
  return songManifestAsList
}

export function useSongMetadata(id: string, source: SongSource): SongMetadata | undefined {
  const key = getKey(id, source)
  const songManifest = useAtomValue(songManifestAtom)
  return songManifest.get(key)
}
