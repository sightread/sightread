import type { Song, SongConfig, SongMetadata } from '@/types'
import { fileToUint8 } from '@/utils'
import { parseMidi } from '../parsers'
import { LOCAL_STORAGE_SONG_LIST_KEY } from './constants'
import Storage from './storage'
import { getLocalSongs } from './folderAccess'

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

function setUploadedLibrary(library: SongMetadata[]): void {
  Storage.set<SongMetadata[]>(LOCAL_STORAGE_SONG_LIST_KEY, library)
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
  setUploadedLibrary(library.concat(uploadedSong))
  Storage.set(id, song)
  return uploadedSong
}

export function deleteSong(id: string) {
  const songLibrary = getUploadedLibrary()
  setUploadedLibrary(songLibrary.filter((s) => s.id !== id))
  Storage.delete(id)
}

async function sha1(msgUint8: Uint8Array) {
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8.buffer as ArrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function getPersistedSongSettings(file: string) {
  return Storage.get<SongConfig>(`${file}/settings`)
}

export function setPersistedSongSettings(file: string, config: SongConfig) {
  return Storage.set(`${file}/settings`, config)
}

/**
 * Get a local song by loading it from the file system using stored folder handles
 */
export async function getLocalSong(songMetadata: SongMetadata): Promise<Song | null> {
  if (songMetadata.source !== 'local' || !songMetadata.localPath) {
    return null
  }

  try {
    // For now, we'll return null and implement file loading when the folder picker is used
    // This will be enhanced when we have active folder handles
    console.warn('Local song loading not yet implemented for:', songMetadata.title)
    return null
  } catch (error) {
    console.error('Error loading local song:', error)
    return null
  }
}

/**
 * Get all songs including both uploaded and local songs
 */
export function getAllSongs(): SongMetadata[] {
  const uploadedSongs = getUploadedLibrary()
  const localSongs = getLocalSongs()
  return [...uploadedSongs, ...localSongs]
}
