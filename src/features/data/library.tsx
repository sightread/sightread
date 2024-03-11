import { SongMetadata, SongSource } from '@/types'
import { getKey } from '.'
import builtinSongManifest from '@/manifest.json'
import { PrimitiveAtom, atom, useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { getUploadedLibrary } from '../persist'

const builtinMetadata: Array<[string, SongMetadata]> = Object.values(builtinSongManifest).map(
  (metadata) => {
    const key = getKey(metadata.id, metadata.source as SongSource)
    return [key, metadata as SongMetadata]
  },
)
const storageMetadata: Array<[string, SongMetadata]> = Object.values(getUploadedLibrary()).map(
  (metadata) => {
    const key = getKey(metadata.id, metadata.source)
    return [key, metadata as SongMetadata]
  },
)

export const songManifestAtom: PrimitiveAtom<Map<string, SongMetadata>> = atom(
  new Map([...builtinMetadata, ...storageMetadata]),
)

const songManifestAsListAtom = atom<Array<SongMetadata>>((get) => {
  const songManifest = get(songManifestAtom)
  return Array.from(songManifest.values())
})

export function useSongManifest(): [Array<SongMetadata>, (list: Array<SongMetadata>) => void] {
  const [songManifest, setSongManifest] = useAtom(songManifestAtom)
  const songManifestAsList = useAtomValue(songManifestAsListAtom)
  const addSongs = useCallback(
    (metadataList: SongMetadata[]) => {
      const toAdd: Array<[string, SongMetadata]> = metadataList.map((metadata) => [
        getKey(metadata.id, metadata.source),
        metadata,
      ])
      const merged: Map<string, SongMetadata> = new Map([...Object.entries(songManifest), ...toAdd])
      setSongManifest(merged)
    },
    [songManifest, setSongManifest],
  )
  return [songManifestAsList, addSongs]
}

export function useSongMetadata(id: string, source: SongSource): SongMetadata | undefined {
  const key = getKey(id, source)
  const songManifest = useAtomValue(songManifestAtom)
  return songManifest.get(key)
}
