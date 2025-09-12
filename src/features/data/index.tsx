import { parseMidi } from '@/features/parsers'
import { Song, SongSource } from '@/types'
import { base64ToBytes } from '@/utils'
import type { SWRResponse } from 'swr'
import useSWRImmutable from 'swr/immutable'
import { getSongHandle } from '../persist/persistence'

async function handleSong(response: Response): Promise<Song> {
  return response.arrayBuffer().then((buf) => parseMidi(new Uint8Array(buf)))
}

function getBuiltinSongUrl(id: string) {
  return `/music/songs/${id}`
}

function getBase64Song(data: string): Song {
  const binaryMidi = base64ToBytes(decodeURIComponent(data))
  return parseMidi(binaryMidi)
}

async function fetchSong(id: string, source: SongSource): Promise<Song> {
  if (source === 'builtin') {
    const url = getBuiltinSongUrl(id)
    return fetch(url).then(handleSong)
  } else if (source === 'base64') {
    return getBase64Song(id)
  } else if (source === 'local') {
    return getSongHandle(id)
      .then((handle) => handle?.getFile())
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
