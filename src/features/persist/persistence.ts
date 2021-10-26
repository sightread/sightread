import type { Song, SongConfig } from '@/types'
import { LOCAL_STORAGE_SONG_LIST_KEY, LOCAL_STORAGE_SONG_SUFFIX } from './constants'
import Storage from './storage'
import { UploadedSong } from './types'

function getStorageFilename(name: string, artist: string) {
  return `uploads/${name}/${artist}`
}
export function getSongStorageKey(name: string, artist: string): string {
  return getStorageFilename(name, artist) + '/' + LOCAL_STORAGE_SONG_SUFFIX
}
export function isKeyAlreadyUsed(name: string, artist: string): boolean {
  const songs = getUploadedLibrary()
  return !!songs.find((s) => s.name === name && s.artist === artist)
}

export function getUploadedSong(file: string): Song | null {
  const storageKey = file + '/' + LOCAL_STORAGE_SONG_SUFFIX
  return Storage.get<Song>(storageKey)
}

export function getUploadedLibrary(): UploadedSong[] {
  if (!Storage.has(LOCAL_STORAGE_SONG_LIST_KEY)) {
    Storage.set<UploadedSong[]>(LOCAL_STORAGE_SONG_LIST_KEY, [])
  }
  return Storage.get<UploadedSong[]>(LOCAL_STORAGE_SONG_LIST_KEY) ?? []
}

/**
 * Need to update song index, as well as individual song data.
 */
export function saveSong(song: Song, name: string, artist: string): UploadedSong {
  const songKey = getSongStorageKey(name, artist)
  const uploadedSong: UploadedSong = {
    name,
    artist,
    duration: song.duration,
    file: getStorageFilename(name, artist),
    type: 'upload',
    difficulty: 'N/A,',
  }
  const songs = getUploadedLibrary().concat(uploadedSong)
  Storage.set(songKey, JSON.stringify(song))
  Storage.set(LOCAL_STORAGE_SONG_LIST_KEY, JSON.stringify(songs))

  return uploadedSong
}

export function getPersistedSongSettings(file: string) {
  return Storage.get<SongConfig>(`${file}/settings`)
}

export function setPersistedSongSettings(file: string, config: SongConfig) {
  return Storage.set(`${file}/settings`, config)
}
