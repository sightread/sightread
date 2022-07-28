import type { Song, SongConfig } from '@/types'
import type { LibrarySong } from '../pages/SelectSong/types'
import { LOCAL_STORAGE_SONG_LIST_KEY, LOCAL_STORAGE_SONG_SUFFIX } from './constants'
import Storage from './storage'

function getStorageFilename(name: string, artist: string) {
  return `uploads/${name}/${artist}`
}
export function getSongStorageKey(title: string, artist: string): string {
  return getStorageFilename(title, artist) + '/' + LOCAL_STORAGE_SONG_SUFFIX
}
export function isKeyAlreadyUsed(title: string, artist: string): boolean {
  const songs = getUploadedLibrary()
  return !!songs.find((s) => s.title === title && s.artist === artist)
}

export function getUploadedSong(id: string): Song | null {
  return Storage.get<Song>(id)
}

export function getUploadedLibrary(): LibrarySong[] {
  if (!Storage.has(LOCAL_STORAGE_SONG_LIST_KEY)) {
    Storage.set<LibrarySong[]>(LOCAL_STORAGE_SONG_LIST_KEY, [])
  }
  return Storage.get<LibrarySong[]>(LOCAL_STORAGE_SONG_LIST_KEY) ?? []
}

/**
 * Need to update song index, as well as individual song data.
 */
export async function saveSong(song: Song, title: string, artist: string): Promise<LibrarySong> {
  const songKey = getSongStorageKey(title, artist)
  const id = await sha1(songKey)
  const uploadedSong: LibrarySong = {
    id,
    title,
    artist,
    duration: song.duration,
    file: getStorageFilename(title, artist),
    source: 'upload',
    difficulty: 0,
  }
  const songs = getUploadedLibrary().concat(uploadedSong)
  Storage.set(id, song)
  Storage.set(LOCAL_STORAGE_SONG_LIST_KEY, songs)

  return uploadedSong
}

async function sha1(message: string) {
  const msgUint8 = new TextEncoder().encode(message)
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
