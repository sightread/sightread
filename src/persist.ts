import type { Song, TrackSettings } from './types'
import { isBrowser } from './utils'

// need the suffix since the file key is already used for the trackSettings
// keys should not start with a "/" or else breaks url routing
const LOCAL_STORAGE_SONG_SUFFIX = 'SONG_DATA'
const LOCAL_STORAGE_SONG_LIST_KEY = 'UPLOADS/SONG_LIST'

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

export type UploadedSong = {
  name: string
  artist: string
  duration: number
  file: string
  type: 'upload'
  difficulty: 'N/A,'
}

export function getUploadedLibrary() {
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

export function deleteSong(song: UploadedSong) {
  const { file, artist, name } = song
  Storage.delete(getSongStorageKey(name, artist))

  const songs = getUploadedLibrary()
  const indexOfSong = songs.findIndex((song) => song.file == file)
  if (indexOfSong === -1) {
    throw new Error(`Key: "${file}" does not exist in uploaded song list.`)
  }
  songs.splice(indexOfSong, 1)
  Storage.set(LOCAL_STORAGE_SONG_LIST_KEY, songs)
}

export function getSongSettings(key: string | null): TrackSettings | null {
  return Storage.get<TrackSettings>(key)
}

/**
 * Wraps `LocalStorage` with a few builtin features:
 * - in-mem lookup for faster successive reads and semi-functional behaviore in no-storage scenarios.
 * - JSON parse/stringify for reduced boilerplate
 * - Error swallowing to not crash app
 */
class Storage {
  static cache = new Map()

  static set(key: string, value: any) {
    // Important that we set the in-mem cache first, so even if persistent storage fails
    // it is still usable within the same session.
    this.cache.set(key, value)

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(e)
    }
  }

  static get<T>(key: string | null): T | null {
    if (!isBrowser() || key === null) {
      return null
    }

    const cached = this.cache.get(key)
    if (cached) {
      return cached as T
    }

    try {
      return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null
    } catch {
      return null
    }
  }

  static delete(key: string) {
    this.cache.delete(key)
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(e)
    }
  }
}
