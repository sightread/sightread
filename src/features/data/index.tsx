import { parseMidi } from '@/features/parsers'
import { Song, SongSource } from '@/types'
import useSWR, { type SWRResponse } from 'swr'
import { getSongHandle } from '../persist/persistence'

async function handleSong(response: Response): Promise<Song> {
  return response.arrayBuffer().then((buf) => parseMidi(buf, true))
}

function getBuiltinSongUrl(id: string) {
  return `/music/songs/${id}`
}

function getBase64Song(data: string): Song {
  const binaryMidi = Buffer.from(decodeURIComponent(data), 'base64')
  return parseMidi(binaryMidi.buffer)
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
      .then((file) => file?.arrayBuffer())
      .then((buffer) => parseMidi(buffer!))
  }

  return Promise.reject(new Error(`Could not get song for ${id}, ${source}`))
}

export function useSong(id: string, source: SongSource): SWRResponse<Song, any, any> {
  return useSWR([id, source], ([id, source]) => fetchSong(id, source))
}
