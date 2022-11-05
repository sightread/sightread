import { parseMidi } from '@/features/parsers'
import { Song, SongMetadata, SongSource } from '@/types'
import { getUploadedSong } from '@/features/persist'
import * as library from './library'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getGeneratedSong } from '../theory/procedural'

const inflight: Map<string, Promise<Song>> = new Map()

function fetchSong(id: string, source: SongSource): Promise<Song> {
  return fetch(`/api/midi?id=${id}&source=${source}`)
    .then((response) => response.arrayBuffer())
    .then(parseMidi)
}

export function getKey(id: string, source: SongSource) {
  return `${source}/${id}`
}

export function useSong(id: string, source: SongSource) {
  const [song, setSong] = useState<Song | undefined>(library.getSong(id, source))
  const [error, setError] = useState<Error | undefined>()

  useEffect(() => {
    if (!id || !source) return

    const key = getKey(id, source)
    if (source === 'generated') {
      const promise = getGeneratedSong(id as any)
      inflight.set(key, promise)
      promise
        .then((song) => {
          library.addSong(id, source, song)
          setSong(song)
        })
        .catch(setError)
        .finally(() => inflight.delete(key))
    } else if (source === 'upload') {
      const uploadedSong = getUploadedSong(id)
      if (!uploadedSong) {
        setError(new Error(`Uploaded song could not be found: ${id}`))
      } else {
        setSong(uploadedSong)
      }
    } else if (library.hasSong(id, source)) {
      setSong(library.getSong(id, source))
    } else if (inflight.has(key)) {
      inflight.get(key)?.then(setSong).catch(setError)
    } else {
      const promise = fetchSong(id, source)
      inflight.set(key, promise)
      promise
        .then((song) => {
          library.addSong(id, source, song)
          setSong(song)
        })
        .catch(setError)
        .finally(() => inflight.delete(key))
    }
  }, [id, source])

  return { error, song, isLoading: error === null && song === null }
}

// TODO: replace with a signals-like library, so that setting from one component is reflected elsewhere.
type SongManifestHookReturn = [SongMetadata[], (metadata: SongMetadata[]) => void]
export function useSongManifest(): SongManifestHookReturn {
  const [songs, setSongs] = useState<SongMetadata[]>(library.getSongsMetadata())

  const add = useCallback((metadataList: SongMetadata[]): void => {
    library.addMetadata(metadataList)
    setSongs(library.getSongsMetadata())
  }, [])

  return useMemo(() => [songs, add], [songs, add])
}

export function useSongMetadata(id: string, source: SongSource) {
  return useMemo(() => library.getSongMetadata(id, source), [id, source])
}
