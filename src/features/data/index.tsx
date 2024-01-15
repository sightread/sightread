import { parseMidi } from '@/features/parsers'
import { Song, SongMetadata, SongSource } from '@/types'
import { getUploadedSong } from '@/features/persist'
import * as library from './library'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useFetch } from '@/hooks'
import { FetchState, useRemoteResource } from '@/hooks/useFetch'
import { batchedFetch } from '@/utils'

function handleSong(response: Response): Promise<Song> {
  return response.arrayBuffer().then(parseMidi)
}

export function getKey(id: string, source: SongSource) {
  return `${source}/${id}`
}

function getSongUrl(id: string, source: SongSource) {
  return `/api/midi?id=${id}&source=${source}`
}

function getBase64Song(data: string): Song {
  const binaryMidi = Buffer.from(decodeURIComponent(data), 'base64')
  return parseMidi(binaryMidi.buffer)
}

function fetchSong(id: string, source: SongSource): Promise<Song> {
  if (source === 'midishare' || source === 'builtin') {
    const url = getSongUrl(id, source)
    return batchedFetch(url).then(handleSong)
  } else if (source === 'base64') {
    return Promise.resolve(getBase64Song(id))
  } else if (source === 'upload') {
    return Promise.resolve(getUploadedSong(id)).then((res) =>
      res === null ? Promise.reject(new Error('Could not find song')) : res,
    )
  }

  return Promise.reject(new Error(`Could not get song for ${id}, ${source}`))
}

export function useSong(id: string, source: SongSource): FetchState<Song> {
  const getResource = useCallback(() => fetchSong(id, source), [id, source])
  return useRemoteResource(getResource)
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
