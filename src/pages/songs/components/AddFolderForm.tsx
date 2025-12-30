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

export default function ManageFoldersForm({ onClose }: { onClose: () => void }) {
  const isScanning = useAtomValue<boolean | Promise<void>>(isScanningAtom)
  const folders = useAtomValue(localDirsAtom)
  const localSongs = useAtomValue(localSongsAtom)
  const needsPermission = useAtomValue(requiresPermissionAtom)

  if (!isFileSystemAccessSupported()) {
    return (
      <div className="relative flex flex-col gap-5 p-8 text-base">
        <h1 className="text-3xl font-bold">Add Music Folder</h1>
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
          className="w-full cursor-pointer rounded-md bg-gray-500 py-2 text-white transition hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto bg-white p-4">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="mb-1 text-lg font-medium text-gray-900">Folder Management</h2>
        <p className="text-sm text-gray-500">Organize your music collection</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={scanFolders}
          disabled={isScanning !== false}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          Scan Folders
        </button>
        <button
          onClick={addFolder}
          className="flex flex-4 cursor-pointer items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Folder
        </button>
      </div>

      <Sizer height={24} />

      {/* Folders List */}
      <div className="space-y-2">
        <div className="mb-3 flex flex-col justify-between gap-1">
          <h3 className="text-sm font-medium text-gray-700">Folders ({folders.length})</h3>
          {needsPermission && (
            <p className="text-xs text-red-800">
              Please rescan folders to grant access to your music files.
            </p>
          )}
        </div>

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
