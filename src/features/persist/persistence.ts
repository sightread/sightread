import type { Song, SongConfig, SongMetadata } from '@/types'
import * as idb from 'idb-keyval'
import * as jotai from 'jotai'
import { parseMidi } from '../parsers'
import * as storageKeys from './constants'
import Storage from './storage'

interface LocalDir {
  id: string
  addedAt: number
  handle: FileSystemDirectoryHandle
}

export const localDirsAtom = jotai.atom<LocalDir[]>([])
export const requiresPermissionAtom = jotai.atom<boolean>(false)
export const localSongsAtom = jotai.atom<Map<FileSystemDirectoryHandle, SongMetadata[]>>(new Map())

const store = jotai.getDefaultStore()
let initialized = false
async function initializeFromIdb() {
  if (initialized) {
    return Promise.resolve()
  }
  try {
    const dirs: LocalDir[] = (await idb.get(storageKeys.OBSERVED_DIRECTORIES)) ?? []
    store.set(localDirsAtom, dirs)
    const hasPermission = await Promise.all(dirs.map((dir) => checkPermission(dir.handle)))
    if (!hasPermission.every((p) => p)) {
      store.set(requiresPermissionAtom, true)
      return
    }
    scanFolders()
  } catch (e) {
    console.error('persistence init failed', e)
  } finally {
    initialized = true
  }
}

async function checkPermission(handle: FileSystemDirectoryHandle) {
  const permission = await handle.queryPermission({ mode: 'read' })
  return permission === 'granted'
}

initializeFromIdb()

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window
}

export async function addFolder(): Promise<void> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser')
  }
  await initializeFromIdb()

  try {
    const newHandle = await window.showDirectoryPicker({
      mode: 'read',
      startIn: 'music',
    })

    // Add directory if it isn't already in the set
    const dirs = store.get(localDirsAtom)
    const alreadyExists = (
      await Promise.all(dirs.map((d) => d.handle.isSameEntry(newHandle)))
    ).find((d) => d)
    if (!alreadyExists) {
      dirs.push({ id: crypto.randomUUID(), handle: newHandle, addedAt: Date.now() })
      store.set(localDirsAtom, dirs)
      await idb.set(storageKeys.OBSERVED_DIRECTORIES, dirs)
      await scanFolders()
    }

    return
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return
    }
    throw error
  }
}

export const isScanningAtom = jotai.atom(false)

export async function scanFolders() {
  if (store.get(isScanningAtom)) {
    return
  }
  store.set(isScanningAtom, true)
  try {
    let songs = new Map()
    const dirs = store.get(localDirsAtom)
    if (store.get(requiresPermissionAtom)) {
      for (const dir of dirs) {
        console.log('Requesting permission for', dir.handle.name)
        const didGrant = (await dir.handle.requestPermission({ mode: 'read' })) === 'granted'
        if (!didGrant) {
          console.warn('Permission not granted for', dir.handle.name)
          return
        }
      }
      store.set(requiresPermissionAtom, false)
    }
    for (const dir of dirs) {
      const dirSongs = await scanFolder(dir)
      songs.set(dir.handle, dirSongs)
    }
    store.set(localSongsAtom, songs)
  } catch (error) {
    console.error('Error scanning folders:', error)
  } finally {
    store.set(isScanningAtom, false)
  }
}

function isMidiFile(file: File): boolean {
  return (
    file.type === 'audio/midi' ||
    file.type === 'audio/mid' ||
    file.name.endsWith('.mid') ||
    file.name.endsWith('.midi')
  )
}

export async function getSongHandle(id: string): Promise<FileSystemFileHandle | undefined> {
  const [dirId, basename] = id.split('/')

  const dir = store.get(localDirsAtom).find((d) => d.id === dirId)
  const localSongs = store.get(localSongsAtom).get(dir?.handle!)
  return localSongs?.find((s) => s.handle?.name === basename)?.handle
}

async function scanFolder(dir: LocalDir): Promise<SongMetadata[]> {
  const songs: SongMetadata[] = []

  try {
    for await (const [name, handle] of dir.handle.entries()) {
      if (handle.kind === 'file') {
        const fileHandle = handle as FileSystemFileHandle
        const file = await fileHandle.getFile()

        try {
          if (isMidiFile(file)) {
            const title = name
            const id = title // for now

            let bytes = await file.arrayBuffer()
            let duration = parseMidi(bytes).duration
            const songMetadata: SongMetadata = {
              id: dir.id + '/' + name,
              title,
              file: id,
              artist: '', // Leave blank as specified
              source: 'local',
              difficulty: 0,
              duration,
              handle: fileHandle,
            }

            songs.push(songMetadata)
          }
        } catch (error) {
          console.error(`Error parsing MIDI file ${name}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Error scanning folder:', error)
    throw new Error(`Failed to scan folder: ${(error as Error).message}`)
  }

  return songs
}

export function removeFolder(id: string) {
  const dirs = store.get(localDirsAtom).filter((d) => d.id !== id)
  store.set(localDirsAtom, dirs)
  idb.set(storageKeys.OBSERVED_DIRECTORIES, dirs)
  scanFolders()
}

export function hasUploadedSong(id: string): Song | null {
  return Storage.get<Song>(id)
}

export function getPersistedSongSettings(file: string) {
  return Storage.get<SongConfig>(`${file}/settings`)
}

export function setPersistedSongSettings(file: string, config: SongConfig) {
  return Storage.set(`${file}/settings`, config)
}
