import type { Song, SongConfig, SongMetadata, Playlist } from '@/types'
import { fileToUint8, fileToString } from '@/utils'
import { parseMidi } from '../parsers'
import { LOCAL_STORAGE_SONG_LIST_KEY, LOCAL_STORAGE_PLAYLIST_LIST_KEY } from './constants'
import Storage from './storage'
import { Parser } from 'm3u8-parser/dist/m3u8-parser.es.js'

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
  const songs = Storage.get<SongMetadata[]>(LOCAL_STORAGE_SONG_LIST_KEY) ?? []
  const playlists = getPlaylistLibrary()
  playlists.forEach(playlist => songs.push(...playlist.songs));
  return songs
}

export function getPlaylistLibrary(): Playlist[] {
  if (!Storage.has(LOCAL_STORAGE_PLAYLIST_LIST_KEY)) {
    Storage.set<Playlist[]>(LOCAL_STORAGE_PLAYLIST_LIST_KEY, [])
  }
  return Storage.get<Playlist[]>(LOCAL_STORAGE_PLAYLIST_LIST_KEY) ?? []
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

export async function savePlaylist(file:File) {
  const data = await fileToString(file)
  let playlist = [];
  if (data) {
    playlist = parsePlaylist(data)
  }
  const buffer = await fileToUint8(file)
  const id = await sha1(buffer)
  const uploadedPlaylist: Playlist = {
    id: id,
    name: file.name,
    songs: playlist.map((song:{uri:string, title:string, duration:number})=>({
      id: song.uri,
      title: song.title,
      artist: '',
      duration: song.duration,
      file: '',
      source: 'url',
      difficulty: 0,
    }))
  };
  const library = getPlaylistLibrary()
  if (library.find((s) => s.id === id)) {
    throw new Error('Cannot upload the same playlist twice')
  }
  Storage.set(LOCAL_STORAGE_PLAYLIST_LIST_KEY, library.concat(uploadedPlaylist))
  return uploadedPlaylist;
}

export async function deletePlaylist(id: string) {
  const library = getPlaylistLibrary();
  Storage.set(LOCAL_STORAGE_PLAYLIST_LIST_KEY, library.filter(p => p.id !== id))
}

function parsePlaylist(playlist:string){
  const parser = new Parser();
  parser.push(playlist);
  parser.end();
  return parser.manifest.segments
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
