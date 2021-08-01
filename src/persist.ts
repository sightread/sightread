import { Song } from './types'
import { isBrowser } from './utils'

const inMemorySongData: { [key: string]: Song } = {}

// need the suffix since the file key is already used for the trackSettings
// keys should not start with a "/" or else breaks url routing
const LOCAL_STORAGE_SONG_SUFFIX = 'SONG_DATA'
const LOCAL_STORAGE_SONG_LIST_KEY = 'UPLOADS/SONG_LIST'
const UPLOADS_PREFIX = 'UPLOADS'

function getSongKey(name: string, artist: string) {
  return `${UPLOADS_PREFIX}/${name}/${artist}`
}
export function getSongLocalStorageKey(name: string, artist: string): string {
  return getSongKey(name, artist) + LOCAL_STORAGE_SONG_SUFFIX
}
export function isKeyAlreadyUsed(name: string, artist: string): boolean {
  return localStorage.hasOwnProperty(getSongLocalStorageKey(name, artist))
}
/* *
 *  If key is for an upload songs, check in memory first
 *  this means that local storage failed when song was uploaded.
 *  Else check localStorage.
 *  Otherwise return null as it is not a valid uploaded song key.
 */
export function getUploadedSong(fileKey: string): Song | null {
  const keyIfUploaded = fileKey + LOCAL_STORAGE_SONG_SUFFIX
  if (keyIfUploaded in inMemorySongData) {
    return inMemorySongData[keyIfUploaded]
  }
  const local = localStorage.getItem(keyIfUploaded)
  if (local) {
    return JSON.parse(local) as Song
  }
  return null
}

export type UploadedSong = {
  name: string
  artist: string
  duration: number
  file: string
  type: 'upload'
  difficulty: 'N/A,'
}

let uploadedSongList: UploadedSong[]

export function getUploadedLibrary() {
  if (!isBrowser()) {
    return []
  }

  if (uploadedSongList) {
    return uploadedSongList
  }
  const storage = localStorage.getItem(LOCAL_STORAGE_SONG_LIST_KEY)
  if (storage) {
    uploadedSongList = JSON.parse(storage) as UploadedSong[]
  } else {
    uploadedSongList = []
  }
  return uploadedSongList
}

/** Save song should save information to local storage if possible,
 *  if not possible then everything should be done in memory.
 */
export function saveSong(song: Song, name: string, artist: string): UploadedSong {
  const file = getSongKey(name, artist)
  const songKey = getSongLocalStorageKey(name, artist)
  try {
    // try local storage first (persistent)
    localStorage.setItem(songKey, JSON.stringify(song))
  } catch (e) {
    console.error(e)
    localStorage.removeItem(songKey)
    // use in memory as backup
    inMemorySongData[songKey] = song
  }
  return saveSongToLibrary({ name, artist, duration: song.duration, file, type: 'upload', difficulty: 'N/A,' })
}

/** always pushes to in memory, then saves the list if possible */
function saveSongToLibrary(newSong: UploadedSong): UploadedSong {
  const songList = getUploadedLibrary()
  songList.push(newSong)
  try {
    localStorage.setItem(LOCAL_STORAGE_SONG_LIST_KEY, JSON.stringify(songList))
  } catch (err) {
    console.error(err)
  }
  return newSong
}

export function deleteSong(song: UploadedSong): boolean {
  const { file, artist, name } = song
  if (deleteFromSongList(file)) {
    localStorage.removeItem(getSongLocalStorageKey(name, artist))
    return true
  }
  return false
}

function deleteFromSongList(fileKey: string): boolean {
  const songList = getUploadedLibrary()
  const indexOfSong = songList.findIndex((song) => song.file == fileKey)
  if (indexOfSong === -1) {
    throw new Error('key given does not exist in uploaded song list.')
  }
  songList.splice(indexOfSong, 1)
  try {
    localStorage.setItem(LOCAL_STORAGE_SONG_LIST_KEY, JSON.stringify(songList))
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
