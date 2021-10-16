import { useCallback, useEffect, useState } from 'react'
import type { Song, SongConfig } from './types'
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

export function getPersistedSongSettings(file: string) {
  return Storage.get<SongConfig>(`${file}/settings`)
}

export function setPersistedSongSettings(file: string, config: SongConfig) {
  return Storage.set(`${file}/settings`, config)
}

export function usePersistedState<T>(key: string, init: T): [T, (state: T) => void] {
  const [state, setState] = useState<T>(init)
  const setPersistedState = useCallback(
    (s: T) => {
      setState(s)
      Storage.set(key, s)
    },
    [key],
  )

  // Since the initial HTML will be set from an SSR and React will only attempt to Hydrate,
  // we need to ensure any state dependent on storage renders once loaded.
  // If UX poorly implemented, this can cause a flicker.
  useEffect(() => setState(Storage.get(key) ?? init), [])

  if (!isBrowser()) {
    return [init, () => {}]
  }

  return [state, setPersistedState]
}

/**
 * Wraps `LocalStorage` with a few builtin features:
 * - in-mem lookup for faster successive reads and semi-functional behaviore in no-storage scenarios.
 * - JSON parse/stringify for reduced boilerplate
 * - Error swallowing to not crash app
 */
class Storage {
  static cache = new Map()

  static set<T>(key: string, value: T) {
    if (!isBrowser()) {
      return
    }
    // Important that we set the in-mem cache first, so even if persistent storage fails
    // it is still usable within the same session.
    this.cache.set(key, value)

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(e)
    }
  }

  static has(key: string) {
    Storage.get(key)
    return this.cache.get(key) != null
  }

  static get<T>(key: string | null): T | null {
    if (!isBrowser() || key === null) {
      return null
    }

    if (this.cache.has(key)) {
      return this.cache.get(key) as T
    }

    let val = null
    try {
      val = JSON.parse(localStorage.getItem(key) ?? 'null') as T | null
    } catch {}
    this.cache.set(key, val)
    return val
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
