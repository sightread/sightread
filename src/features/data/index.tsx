import { parseMidi } from '@/features/parsers'
import { loadSongMetadata } from '@/features/metadata'
import { Song, SongSource } from '@/types'
import { base64ToBytes, peek } from '@/utils'
import type { SWRResponse } from 'swr'
import useSWRImmutable from 'swr/immutable'
import * as persistence from '../persist/persistence'

async function handleSong(response: Response, songId: string): Promise<Song> {
  const song = await response.arrayBuffer().then((buf) => parseMidi(new Uint8Array(buf)))

  // Try to load metadata file
  const metadata = await loadSongMetadata(songId)
  if (metadata) {
    song.handFingerMetadata = metadata
  }

  return song
}

function getBuiltinSongUrl(id: string) {
  return `/music/songs/${id}`
}

function getBase64Song(data: string): Song {
  const binaryMidi = base64ToBytes(data)
  return parseMidi(binaryMidi)
}

async function fetchSong(id: string, source: SongSource): Promise<Song> {
  if (source === 'builtin') {
    const url = getBuiltinSongUrl(id)
    return fetch(url).then((response) => handleSong(response, id))
  } else if (source === 'base64') {
    return getBase64Song(id)
  } else if (source === 'local') {
    await persistence.initialize()

    return persistence
      .getSongHandle(id)
      .then((handle) => {
        return handle?.getFile()
      })
      .then((file) => {
        if (!file) {
          throw new Error(`Could not get song for ${id}, ${source}`)
        }
        return file.arrayBuffer()
      })
      .then((buffer: ArrayBuffer) => parseMidi(new Uint8Array(buffer)))
  }

  return Promise.reject(new Error(`Could not get song for ${id}, ${source}`))
}

export function useSong(id: string, source: SongSource): SWRResponse<Song, any, any> {
  return useSWRImmutable([id, source], ([id, source]) => fetchSong(id, source))
}
