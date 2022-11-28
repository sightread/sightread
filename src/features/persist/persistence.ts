import type { Song, SongConfig, SongMetadata } from '@/types'
import { fileToUint8 } from '@/utils'
import { parseMidi } from '../parsers'
import { LOCAL_STORAGE_SONG_LIST_KEY } from './constants'
import Storage from './storage'

export function hasUploadedSong(id: string): Song | null {
  return Storage.get<Song>(id)
}

export function getUploadedSong(id: string): Song | null {
  return Storage.get<Song>(id)
}

export function getUploadedLibrary(): SongMetadata[] {
  if (!Storage.has(LOCAL_STORAGE_SONG_LIST_KEY)) {
    Storage.set<SongMetadata[]>(LOCAL_STORAGE_SONG_LIST_KEY, [])
  }
  return Storage.get<SongMetadata[]>(LOCAL_STORAGE_SONG_LIST_KEY) ?? []
}

/**
 * Song data is stored in localStorage in two places:
 * - Song Library: list of songs and their metadata
 * - Song Data: data keyed by id of the song's notes.
 *
 * This function creates entries in both.
 */
export async function saveSong(file: File, title: string, artist: string): Promise<SongMetadata> {
  const buffer = await fileToUint8(file)
  const song = parseMidi(buffer.buffer)
  const id = await sha1(buffer)
  const uploadedSong: SongMetadata = {
    id,
    title,
    artist,
    duration: song.duration,
    file: `uploads/${title}/${artist}`,
    source: 'upload',
    difficulty: 0,
  }
  const library = getUploadedLibrary()
  if (library.find((s) => s.id === id)) {
    throw new Error('Cannot upload the same song twice')
  }
  Storage.set(LOCAL_STORAGE_SONG_LIST_KEY, library.concat(uploadedSong))
  Storage.set(id, song)
  return uploadedSong
}

async function sha1(msgUint8: Uint8Array) {
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function getPersistedSongSettings(file: string) {
  return Storage.get<SongConfig>(`${file}/settings`)
}

export function setPersistedSongSettings(file: string, config: SongConfig) {
  return Storage.set(`${file}/settings`, config)
}
