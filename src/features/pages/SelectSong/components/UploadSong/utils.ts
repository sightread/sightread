import { isBrowser, isLocalStorageAvailable } from '@/utils'
import { saveSong } from '@/features/persist'
import { UploadFormState } from './types'
import { LibrarySong } from '../../types'

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
