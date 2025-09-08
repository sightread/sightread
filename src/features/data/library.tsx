import builtinSongManifest from '@/manifest.json'
import { SongMetadata, SongSource } from '@/types'
import { getKey } from '@/utils'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteSong, getUploadedLibrary } from '../persist'
import { getLocalSongs, removeLocalSong } from '../persist/folderAccess'

const builtinMetadata: Array<[string, SongMetadata]> = Object.values(builtinSongManifest).map(
  (metadata) => {
    const key = getKey(metadata.id, metadata.source as SongSource)
    return [key, metadata as SongMetadata]
  },
)

function getStorageMetadata(): Array<[string, SongMetadata]> {
  const uploadedSongs = getUploadedLibrary()
  const localSongs = getLocalSongs()
  const allSongs = [...uploadedSongs, ...localSongs]
  
  return allSongs.map((metadata) => {
    const key = getKey(metadata.id, metadata.source)
    return [key, metadata as SongMetadata]
  })
}

const builtinMetadataAtom = atom(builtinMetadata)
const storageMetadataAtom = atom(getStorageMetadata())

export function useRefreshStorageMetadata() {
  const set = useSetAtom(storageMetadataAtom)
  const refresh = useCallback(() => set(getStorageMetadata()), [set])
  return refresh
}

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
  const [isClient, setIsClient] = useState(false)
  const emptyList = useMemo(() => [], [])

  // On first render, we want to match what the server SSRed so we can't take advantage of local storage.
  // not sure what to actually do here besides show a loading spinner
  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? songManifestAsList : emptyList
}

export function useSongMetadata(id: string, source: SongSource): SongMetadata | undefined {
  const key = getKey(id, source)
  const songManifest = useAtomValue(songManifestAtom)
  return songManifest.get(key)
}

export function useDeleteSong() {
  const refresh = useRefreshStorageMetadata()
  return useCallback(
    (id: string) => {
      // First try to delete from uploaded songs
      try {
        deleteSong(id)
      } catch {
        // If not found in uploaded, try local songs
        removeLocalSong(id)
      }
      refresh()
    },
    [refresh],
  )
}
