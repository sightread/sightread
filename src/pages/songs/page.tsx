import { AppBar, MarketingFooter, Modal, Sizer } from '@/components'
import { useSongManifest } from '@/features/data/library'
import { isInitializedAtom } from '@/features/persist/persistence'
import { SongPreviewModal } from '@/features/SongPreview'
import { useEventListener } from '@/hooks'
import { ChevronDown, FolderOpen } from '@/icons'
import { SongMetadata } from '@/types'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Table } from './components'
import ManageFoldersForm from './components/AddFolderForm'
import { SearchBox } from './components/Table/SearchBox'
import { TableSkeleton } from './components/Table/Table'

// TODO: after an upload, scroll to the newly uploaded song / make it focused.
export default function SelectSongPage() {
  let songs: SongMetadata[] = useSongManifest()
  const isInitialized = useAtomValue(isInitializedAtom)
  const [isUploadFormOpen, setUploadForm] = useState<boolean>(false)
  const [selectedSongId, setSelectedSongId] = useState<any>('')
  const selectedSongMeta = songs.find((s) => s.id === selectedSongId)
  const [search, setSearch] = useState('')

  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (event.key === 'Escape') {
      setUploadForm(false)
    }
  })

  const handleAddNew = (e: any) => {
    setUploadForm(true)
    e.stopPropagation()
  }

  const handleCloseAddNew = () => {
    setUploadForm(false)
  }

  return (
    <>
      <title>Select a song</title>
      <SongPreviewModal
        show={!!selectedSongId}
        songMeta={selectedSongMeta}
        onClose={() => {
          setSelectedSongId(null)
        }}
      />
      <Modal show={isUploadFormOpen} onClose={handleCloseAddNew} className="w-[min(100vw,500px)]">
        <ManageFoldersForm onClose={handleCloseAddNew} />
      </Modal>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50">
        <div className="shrink-0">
          <AppBar />
        </div>
        <div className="mx-auto flex min-h-0 w-full max-w-(--breakpoint-lg) flex-1 flex-col p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Learn a song</h2>
          <Sizer height={4} />
          <h3 className="text-sm text-gray-600">
            Select a song, choose your settings, and begin learning
          </h3>
          <Sizer height={16} />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBox placeholder={'Search Titles'} onSearch={setSearch} autoFocus={true} />
            </div>
            <button
              className={clsx(
                'cursor-pointer flex-nowrap whitespace-nowrap',
                'inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm',
                'transition-colors hover:bg-gray-50',
              )}
              onClick={handleAddNew}
            >
              <FolderOpen width={16} height={16} />
              Folders
              <ChevronDown width={16} height={16} />
            </button>
          </div>
          <Sizer height={20} />
          {isInitialized ? (
            <Table rows={songs} search={search} onSelectRow={setSelectedSongId} />
          ) : (
            <TableSkeleton />
          )}
        </div>
        <div className="shrink-0">
          <MarketingFooter />
        </div>
      </div>
    </>
  )
}
