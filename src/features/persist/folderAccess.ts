/**
 * Folder Access Module for Local Music File Management
 * 
 * This module handles the File System Access API integration for allowing users
 * to select folders containing their music files. Songs remain on the user's
 * computer and are loaded on-demand.
 * 
 * Key Features:
 * - Folder selection using showDirectoryPicker()
 * - Automatic scanning for MIDI (.mid) and MusicXML (.xml) files
 * - Filename-based song titles (no artist information)
 * - Session-based folder handle caching
 * 
 * Browser Support: Chrome, Edge, and other Chromium-based browsers
 * 
 * Limitations:
 * - Folder handles cannot be persisted across browser sessions
 * - Users may need to re-select folders after browser restart
 * - File System Access API is not available in all browsers
 */

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

// Active folder handles (in memory only)
const activeFolderHandles = new Map<string, FileSystemDirectoryHandle>()

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
    
    // Store in active handles for this session
    activeFolderHandles.set(dirHandle.name, dirHandle)
    
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
          
          // Try to get basic duration information
          let duration = 0
          try {
            if (isMidiFile(file)) {
              // For MIDI files, we could parse basic info here
              // For now, we'll leave it as 0 and calculate when loaded
              duration = 0
            }
          } catch {
            // If we can't get duration, just use 0
            duration = 0
          }
          
          const songMetadata: SongMetadata = {
            id: songId,
            title,
            artist: '', // Leave blank as specified
            file: `local/${dirHandle.name}/${name}`,
            localPath: name,
            source: 'local',
            difficulty: 0,
            duration,
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

function isMidiFile(file: File): boolean {
  return file.type === 'audio/midi' || 
         file.type === 'audio/mid' ||
         file.name.endsWith('.mid') ||
         file.name.endsWith('.midi')
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

/**
 * Get a File object for a local song. This may require re-requesting folder access
 * if the folder handle is not in the current session.
 */
export async function getLocalSongFile(songMetadata: SongMetadata): Promise<File | null> {
  if (songMetadata.source !== 'local' || !songMetadata.localPath) {
    return null
  }

  const folderName = extractFolderNameFromFile(songMetadata.file)
  if (!folderName) {
    console.error('Could not extract folder name from:', songMetadata.file)
    return null
  }

  try {
    // Check if we have the folder handle in memory
    let folderHandle = activeFolderHandles.get(folderName)
    
    if (!folderHandle) {
      // If not in memory, we need to request access again
      // This is a limitation of the File System Access API
      console.warn(`Folder handle for "${folderName}" not in memory. User may need to re-select the folder.`)
      return null
    }

    // Get the file handle
    const fileHandle = await folderHandle.getFileHandle(songMetadata.localPath)
    return await fileHandle.getFile()
    
  } catch (error) {
    console.error('Error loading local song file:', error)
    return null
  }
}

function extractFolderNameFromFile(filePath: string): string | null {
  // Expected format: "local/FolderName/filename.mid"
  const match = filePath.match(/^local\/([^\/]+)\//)
  return match ? match[1] : null
}