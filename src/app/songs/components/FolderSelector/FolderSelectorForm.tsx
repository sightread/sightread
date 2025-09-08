import { Sizer } from '@/components'
import { useRefreshStorageMetadata } from '@/features/data/library'
import { 
  selectMusicFolder, 
  scanFolderForSongs, 
  addLocalSongs, 
  isFileSystemAccessSupported 
} from '@/features/persist/folderAccess'
import clsx from 'clsx'
import { useState } from 'react'
import { Folder, AlertCircle } from 'react-feather'

interface FolderSelectorState {
  isLoading: boolean
  error?: string
  success?: boolean
}

export default function FolderSelectorForm({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<FolderSelectorState>({ isLoading: false })
  const refreshStorage = useRefreshStorageMetadata()

  const handleSelectFolder = async () => {
    if (!isFileSystemAccessSupported()) {
      setState({ 
        isLoading: false, 
        error: 'File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.' 
      })
      return
    }

    setState({ isLoading: true, error: undefined })

    try {
      const folderHandle = await selectMusicFolder()
      
      if (!folderHandle) {
        // User cancelled
        setState({ isLoading: false })
        return
      }

      // Scan folder for music files
      const songs = await scanFolderForSongs(folderHandle)
      
      if (songs.length === 0) {
        setState({ 
          isLoading: false, 
          error: 'No MIDI (.mid) or MusicXML (.xml) files found in the selected folder.' 
        })
        return
      }

      // Add songs to local storage
      addLocalSongs(songs)
      refreshStorage()

      setState({ isLoading: false, success: true })
      
      // Close the modal after a brief success message
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error: any) {
      console.error('Error selecting folder:', error)
      setState({ 
        isLoading: false, 
        error: error.message || 'Failed to access the selected folder.' 
      })
    }
  }

  if (!isFileSystemAccessSupported()) {
    return (
      <div className="relative flex w-[min(100vw,500px)] flex-col gap-5 p-8 text-base">
        <h1 className="text-3xl font-bold">Add Music Folder</h1>
        <Sizer height={0} />
        
        <div className="flex items-center gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Browser Not Supported</p>
            <p className="text-sm">
              Your browser doesn't support the File System Access API. 
              Please use Chrome, Edge, or another Chromium-based browser.
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 w-full cursor-pointer rounded-md py-2 text-white transition"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex w-[min(100vw,500px)] flex-col gap-5 p-8 text-base">
      <h1 className="text-3xl font-bold">Add Music Folder</h1>
      <Sizer height={0} />
      
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-800">
        <p className="text-sm">
          Select a folder containing your MIDI (.mid) or MusicXML (.xml) files. 
          The app will scan the folder and add all music files to your library.
        </p>
        <p className="text-sm mt-2">
          <strong>Note:</strong> Song files will remain on your computer. 
          Filenames will be used as song titles with no artist information.
        </p>
      </div>

      <Sizer height={16} />

      <div
        className={clsx(
          'flex cursor-pointer items-center justify-center gap-4 rounded-md p-8 text-center transition',
          'border-2 border-dashed border-gray-400 bg-gray-50 hover:shadow-lg',
          state.isLoading && 'opacity-50 cursor-not-allowed'
        )}
        onClick={state.isLoading ? undefined : handleSelectFolder}
      >
        <Folder size={32} className="text-purple-primary" />
        <div>
          <div className="text-lg font-medium">
            {state.isLoading ? 'Scanning Folder...' : 'Select Music Folder'}
          </div>
          <div className="text-sm text-gray-600">
            {state.isLoading ? 'Please wait while we scan your folder' : 'Click to browse for a folder'}
          </div>
        </div>
      </div>

      {state.success && (
        <>
          <Sizer height={16} />
          <div className="rounded-md border border-green-300 bg-green-50 p-4 text-green-700">
            <p className="font-medium">Success!</p>
            <p className="text-sm">Music folder added successfully.</p>
          </div>
        </>
      )}

      {state.error && (
        <>
          <Sizer height={16} />
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm">{state.error}</p>
          </div>
        </>
      )}

      <Sizer height={16} />
      
      {!state.success && (
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 w-full cursor-pointer rounded-md py-2 text-white transition"
          disabled={state.isLoading}
        >
          Cancel
        </button>
      )}
    </div>
  )
}