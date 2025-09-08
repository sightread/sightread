import { parseMidi } from '@/features/parsers'
import { getUploadedSong, getLocalSong, getAllSongs } from '@/features/persist'
import { Song, SongSource, SongMetadata } from '@/types'
import useSWR, { type SWRResponse } from 'swr'

function handleSong(response: Response): Promise<Song> {
  return response.arrayBuffer().then(parseMidi)
}

function getBuiltinSongUrl(id: string) {
  return `/music/songs/${id}`
}

function getBase64Song(data: string): Song {
  const binaryMidi = Buffer.from(decodeURIComponent(data), 'base64')
  return parseMidi(binaryMidi.buffer)
}

function fetchSong(id: string, source: SongSource): Promise<Song> {
  if (source === 'builtin') {
    const url = getBuiltinSongUrl(id)
    return fetch(url).then(handleSong)
  } else if (source === 'base64') {
    return Promise.resolve(getBase64Song(id))
  } else if (source === 'upload') {
    return Promise.resolve(getUploadedSong(id)).then((res) =>
      res === null ? Promise.reject(new Error('Could not find song')) : res,
    )
  } else if (source === 'local') {
    // For local songs, we need to find the song metadata first, then load the file
    const allSongs = getAllSongs()
    const songMetadata = allSongs.find(s => s.id === id && s.source === 'local')
    
    if (!songMetadata) {
      return Promise.reject(new Error('Could not find local song metadata'))
    }
    
    return getLocalSong(songMetadata).then((res) =>
      res === null ? Promise.reject(new Error('Could not load local song file')) : res,
    )
  }

  return Promise.reject(new Error(`Could not get song for ${id}, ${source}`))
}

export function useSong(id: string, source: SongSource): SWRResponse<Song, any, any> {
  return useSWR([id, source], ([id, source]) => fetchSong(id, source))
}
