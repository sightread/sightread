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

// Clean up deprecated localStorage keys
if (globalThis.localStorage?.length > 0) {
  for (const key of storageKeys.DEPRECATED_LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}

type LocalDirKey = string

export const localDirsAtom = jotai.atom<LocalDir[]>([])
export const requiresPermissionAtom = jotai.atom<boolean>(false)
export const localSongsAtom = jotai.atom<Map<string, SongMetadata[]>>(new Map())
export const isInitializedAtom = jotai.atom<boolean>(false)

const store = jotai.getDefaultStore()

// Native File System Access (Chrome / Edge)
function hasNativeFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

// Fallback via <input type="file" webkitdirectory>
function hasDirectoryInputSupport(): boolean {
  if (typeof document === 'undefined') return false
  const input = document.createElement('input')
  input.type = 'file'
  return 'webkitdirectory' in (input as any)
}

// Either native FSA or a directory input fallback
export function isFileSystemAccessSupported(): boolean {
  if (typeof window === 'undefined') return false
  if (hasNativeFileSystemAccess()) return true
  return hasDirectoryInputSupport()
}

// Use native picker when available; otherwise ponyfill (lazy-loaded)
async function pickMusicDirectory(): Promise<FileSystemDirectoryHandle> {
  if (hasNativeFileSystemAccess()) {
    return window.showDirectoryPicker({
      mode: 'read',
      startIn: 'music' as any,
    })
  }

  const mod = await import('native-file-system-adapter')
  const handle = (await mod.showDirectoryPicker({
    _preferPolyfill: true,
  })) as unknown as FileSystemDirectoryHandle

  return handle
}

export async function initialize() {
  if (store.get(isInitializedAtom)) {
    return Promise.resolve()
  }
  try {
    let dirs: LocalDir[] = []

    // Only restore persisted handles when native FSA is available.
    if (hasNativeFileSystemAccess()) {
      dirs = (await idb.get(storageKeys.OBSERVED_DIRECTORIES)) ?? []
    }

    store.set(localDirsAtom, dirs)
    const hasPermission = await Promise.all(dirs.map((dir) => checkPermission(dir.handle)))
    if (!hasPermission.every((p) => p)) {
      store.set(requiresPermissionAtom, true)
      return
    }
    await scanFolders()
  } catch (e) {
    console.error('persistence init failed', e)
  } finally {
    store.set(isInitializedAtom, true)
  }
}

async function checkPermission(handle: FileSystemDirectoryHandle) {
  const permission = await handle.queryPermission({ mode: 'read' })
  return permission === 'granted'
}

export async function addFolder(): Promise<void> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser')
  }
  await initialize()

  try {
    const newHandle = await pickMusicDirectory()

    // Add directory if it isn't already in the set
    const dirs = store.get(localDirsAtom)
    const alreadyExists = (
      await Promise.all(dirs.map((d) => d.handle.isSameEntry(newHandle)))
    ).find((d) => d)
    if (!alreadyExists) {
      dirs.push({ id: crypto.randomUUID(), handle: newHandle, addedAt: Date.now() })
      store.set(localDirsAtom, dirs)

      // Only persist handles when native FSA is available.
      if (hasNativeFileSystemAccess()) {
        await idb.set(storageKeys.OBSERVED_DIRECTORIES, dirs)
      }

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

export const isScanningAtom = jotai.atom<false | Promise<void>>(false)

export async function scanFolders() {
  const inProgressScan = store.get(isScanningAtom)
  if (inProgressScan !== false) {
    await inProgressScan
    return
  }
  const { resolve, reject, promise } = Promise.withResolvers<void>()
  store.set(isScanningAtom, promise as Promise<void>)
  try {
    let songs = new Map<LocalDirKey, SongMetadata[]>()
    const dirs = store.get(localDirsAtom)
    if (store.get(requiresPermissionAtom)) {
      for (const dir of dirs) {
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
      songs.set(dir.id, dirSongs)
    }
    store.set(localSongsAtom, songs)
    resolve(undefined)
  } catch (error) {
    reject(new Error('Error scanning folders:', { cause: error as Error }))
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
  await initialize()
  const [dirId, basename] = id.split('/')

  const dir = store.get(localDirsAtom).find((d) => d.id === dirId)
  if (!dir) {
    console.error('Missing expected directory handle')
    return
  }

  const localSongs = store.get(localSongsAtom)
  const dirSongs = localSongs.get(dir?.id)
  return dirSongs?.find((s) => s.handle?.name === basename)?.handle
}
initialize()

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

            const buffer = await file.arrayBuffer()
            const bytes = new Uint8Array(buffer)
            const duration = parseMidi(bytes).duration
            const songMetadata: SongMetadata = {
              id: dir.id + '/' + name,
              title,
              file: id,
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
    if ((error as any).name === 'NotFoundError') {
      console.warn(
        'Directory handle is no longer valid, skipping folder:',
        (dir.handle as any)?.name,
      )
      return songs
    }
    throw new Error(`Failed to scan folder: ${(error as Error).message}`)
  }

  return songs
}

export function removeFolder(id: string) {
  const dirs = store.get(localDirsAtom).filter((d) => d.id !== id)
  store.set(localDirsAtom, dirs)

  // Same rule as addFolder: only persist when using native handles.
  if (hasNativeFileSystemAccess()) {
    idb.set(storageKeys.OBSERVED_DIRECTORIES, dirs)
  }

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
