import { Song } from '@/types'
import {
  isFileMidi,
  isFileXML,
  fileToUint8,
  fileToString,
  isBrowser,
  isLocalStorageAvailable,
} from '@/utils'
import { isKeyAlreadyUsed, saveSong } from '@/features/persist'
import { parseMidi, parseMusicXml } from '@/features/parsers'
import { UploadSong, UploadFormState } from './types'
import { LibrarySong } from '../../types'

export async function convertFileToSong(file: File): Promise<Song> {
  if (isFileMidi(file)) {
    const buffer = await fileToUint8(file)
    return parseMidi(buffer.buffer)
  } else if (isFileXML(file)) {
    const rawString = await fileToString(file)
    if (!rawString) {
      throw new Error('failed to convert file to string')
    }
    return parseMusicXml(rawString)
  }
  throw new Error('Unkown file type, valid types are audio/mid or .xml files.')
}

export async function uploadSong(
  file: File,
  title: string,
  artist: string,
): Promise<LibrarySong | null> {
  if (isKeyAlreadyUsed(title, artist)) {
    throw new Error('Name and arist already used. Please choose another')
  }
  const parsedSong = await convertFileToSong(file)
  return saveSong(parsedSong, title, artist)
}

export function prevent(e: React.MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
}

/** Warn the user if local storage is not availabe */
export function defaultUploadState(): UploadFormState {
  if (!isBrowser()) {
    return { source: 'upload' }
  }
  if (!isLocalStorageAvailable()) {
    return {
      source: 'upload',
      error:
        'Warning: Due to your current browser, uploaded songs will be lost after leaving the site.',
    }
  }
  return { source: 'upload' }
}
