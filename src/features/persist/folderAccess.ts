import type { SongMetadata } from '@/types'
import { LOCAL_STORAGE_FOLDER_HANDLES_KEY, LOCAL_STORAGE_LOCAL_SONGS_KEY } from './constants'
import Storage from './storage'

// Extend the built-in types with missing methods
declare global {
  interface FileSystemDirectoryHandle {
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>
    keys(): AsyncIterableIterator<string>
    values(): AsyncIterableIterator<FileSystemHandle>
  }

  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite'
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'
    }): Promise<FileSystemDirectoryHandle>
  }
}

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window
}

// Store folder handle (can't be directly serialized, so we store metadata)
interface FolderInfo {
  name: string
  addedAt: number
}

export async function selectMusicFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser')
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'read',
      startIn: 'music'
    })
    
    // Store folder info
    const folderInfoList = getFolderInfoList()
    const folderInfo: FolderInfo = {
      name: dirHandle.name,
      addedAt: Date.now()
    }
    
    // Check if folder is already added
    if (!folderInfoList.find(f => f.name === dirHandle.name)) {
      folderInfoList.push(folderInfo)
      setFolderInfoList(folderInfoList)
    }
    
    return dirHandle
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return null // User cancelled
    }
    throw error
  }
}

export function getFolderInfoList(): FolderInfo[] {
  return Storage.get<FolderInfo[]>(LOCAL_STORAGE_FOLDER_HANDLES_KEY) ?? []
}

function setFolderInfoList(folders: FolderInfo[]): void {
  Storage.set<FolderInfo[]>(LOCAL_STORAGE_FOLDER_HANDLES_KEY, folders)
}

export async function scanFolderForSongs(dirHandle: FileSystemDirectoryHandle): Promise<SongMetadata[]> {
  const songs: SongMetadata[] = []
  
  try {
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file') {
        const fileHandle = handle as FileSystemFileHandle
        const file = await fileHandle.getFile()
        
        // Check if it's a MIDI or XML file
        if (isMusicFile(file)) {
          const songId = await generateSongId(name, dirHandle.name)
          const title = getFileNameWithoutExtension(name)
          
          const songMetadata: SongMetadata = {
            id: songId,
            title,
            artist: '', // Leave blank as specified
            file: `local/${dirHandle.name}/${name}`,
            localPath: name,
            source: 'local',
            difficulty: 0,
            duration: 0, // Will be calculated when song is loaded
          }
          
          songs.push(songMetadata)
        }
      }
    }
  } catch (error) {
    console.error('Error scanning folder:', error)
    throw new Error(`Failed to scan folder: ${(error as Error).message}`)
  }
  
  return songs
}

function isMusicFile(file: File): boolean {
  return file.type === 'audio/midi' || 
         file.type === 'audio/mid' ||
         file.name.endsWith('.mid') ||
         file.name.endsWith('.midi') ||
         file.name.endsWith('.xml')
}

function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}

async function generateSongId(fileName: string, folderName: string): Promise<string> {
  const text = `${folderName}/${fileName}`
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function getLocalSongs(): SongMetadata[] {
  return Storage.get<SongMetadata[]>(LOCAL_STORAGE_LOCAL_SONGS_KEY) ?? []
}

export function setLocalSongs(songs: SongMetadata[]): void {
  Storage.set<SongMetadata[]>(LOCAL_STORAGE_LOCAL_SONGS_KEY, songs)
}

export function addLocalSongs(newSongs: SongMetadata[]): void {
  const existingSongs = getLocalSongs()
  const combinedSongs = [...existingSongs]
  
  // Add only new songs (not already in the list)
  for (const newSong of newSongs) {
    if (!existingSongs.find(song => song.id === newSong.id)) {
      combinedSongs.push(newSong)
    }
  }
  
  setLocalSongs(combinedSongs)
}

export function removeLocalSong(songId: string): void {
  const songs = getLocalSongs()
  setLocalSongs(songs.filter(s => s.id !== songId))
}