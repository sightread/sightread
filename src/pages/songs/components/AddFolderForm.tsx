import { Sizer } from '@/components'
import {
  addFolder,
  isFileSystemAccessSupported,
  isScanningAtom,
  localDirsAtom,
  localSongsAtom,
  removeFolder,
  requiresPermissionAtom,
  scanFolders,
} from '@/features/persist/persistence'
import { useAtomValue } from 'jotai'
import { AlertCircle, Folder, Music, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function ManageFoldersForm({ onClose }: { onClose: () => void }) {
  const isScanning = useAtomValue<boolean | Promise<void>>(isScanningAtom)
  const folders = useAtomValue(localDirsAtom)
  const localSongs = useAtomValue(localSongsAtom)
  const needsPermission = useAtomValue(requiresPermissionAtom)
  const isScanningActive = isScanning !== false
  const [showSpinner, setShowSpinner] = useState(false)
  const spinnerStartRef = useRef<number | null>(null)

  useEffect(() => {
    let isCancelled = false
    const syncSpinner = async () => {
      if (isScanningActive) {
        if (!showSpinner) {
          spinnerStartRef.current = performance.now()
          setShowSpinner(true)
        }
        return
      }
      if (showSpinner) {
        const start = spinnerStartRef.current ?? performance.now()
        const elapsed = performance.now() - start
        const remaining = Math.max(0, 1000 - elapsed)
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining))
        }
        if (!isCancelled) {
          setShowSpinner(false)
          spinnerStartRef.current = null
        }
      }
    }
    void syncSpinner()
    return () => {
      isCancelled = true
    }
  }, [isScanningActive, showSpinner])

  const handleScanFolders = async () => {
    if (isScanningActive) {
      return
    }
    spinnerStartRef.current = performance.now()
    setShowSpinner(true)
    await new Promise(requestAnimationFrame)
    await scanFolders()
  }

  if (!isFileSystemAccessSupported()) {
    return (
      <div className="relative flex flex-col gap-5 px-6 pt-6 pb-6 text-base">
        <h1 className="text-2xl font-semibold text-gray-900">Add Music Folder</h1>
        <Sizer height={0} />

        <div className="flex items-center gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Browser Not Supported</p>
            <p className="text-sm">
              Syncing folders is only supported in Chromium-based browsers like Chrome and Edge due
              to lack of support for the File System Access API. Please switch to a supported
              browser.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full cursor-pointer rounded-md bg-violet-600 py-2 text-white transition hover:bg-violet-700"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto bg-white px-6 pt-6 pb-6">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="mb-1 text-xl font-semibold text-gray-900">Folder Management</h2>
        <p className="text-sm text-gray-500">Organize your music collection</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
          Folders ({folders.length})
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleScanFolders}
            disabled={isScanningActive}
            className="flex items-center justify-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${showSpinner ? 'animate-spin' : ''}`} />
            Scan Folders
          </button>
          <button
            onClick={addFolder}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Add Folder
          </button>
        </div>
      </div>

      <Sizer height={24} />

      {/* Folders List */}
      <div className="space-y-2">
        {needsPermission && (
          <p className="text-xs text-red-800">
            Please rescan folders to grant access to your music files.
          </p>
        )}

        {folders.length === 0 ? (
          <div className="py-8 text-center">
            <Folder className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No folders added yet</p>
            <p className="mt-1 text-xs text-gray-400">Add a folder to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {folders.map((folder, i) => {
              const songCount = localSongs.get(folder.id)?.length || 0
              return (
                <div
                  key={i}
                  className="group flex items-center justify-between rounded-md border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Folder className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className={'truncate text-sm font-medium text-gray-900'}>
                        {folder.handle.name}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <Music className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {songCount} {songCount === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFolder(folder.id)
                    }}
                    className="rounded p-1.5 text-gray-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                    title="Remove folder"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {folders.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-center text-xs text-gray-500">
            Total:{' '}
            {folders.reduce((sum, folder) => sum + (localSongs.get(folder.id)?.length ?? 0), 0)}{' '}
            songs across {folders.length} folders
          </p>
        </div>
      )}
    </div>
  )
}
