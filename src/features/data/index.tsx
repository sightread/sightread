'use client'

import { parseMidi } from '@/features/parsers'
import { getUploadedSong } from '@/features/persist'
import { Song, SongSource } from '@/types'
import useSWR, { type SWRResponse } from 'swr'

function handleSong(response: Response): Promise<Song> {
  return response.arrayBuffer().then(parseMidi)
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
    return fetch(url).then(handleSong)
  } else if (source === 'base64') {
    return Promise.resolve(getBase64Song(id))
  } else if (source === 'upload') {
    return Promise.resolve(getUploadedSong(id)).then((res) =>
      res === null ? Promise.reject(new Error('Could not find song')) : res,
    )
  }

  return Promise.reject(new Error(`Could not get song for ${id}, ${source}`))
}

export function useSong(id: string, source: SongSource): SWRResponse<Song, any, any> {
  return useSWR([id, source], ([id, source]) => fetchSong(id, source))
}
