import { AppBar, MarketingFooter, Modal, Sizer } from '@/components'
import { useSongManifest } from '@/features/data/library'
import { initialize } from '@/features/persist/persistence'
import { SongPreviewModal } from '@/features/SongPreview'
import { useEventListener } from '@/hooks'
import { Plus } from '@/icons'
import { SongMetadata } from '@/types'
import { formatTime } from '@/utils'
import clsx from 'clsx'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Table } from './components'
import ManageFoldersForm from './components/AddFolderForm'
import { SearchBox } from './components/Table/SearchBox'

// TODO: after an upload, scroll to the newly uploaded song / make it focused.
export default function SelectSongPage() {
  let songs: SongMetadata[] = useSongManifest()
  const [isUploadFormOpen, setUploadForm] = useState<boolean>(false)
  const [selectedSongId, setSelectedSongId] = useState<any>('')
  const selectedSongMeta = songs.find((s) => s.id === selectedSongId)
  const [search, setSearch] = useState('')

  useEffect(() => {
    initialize()
  }, [])

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
      <Modal show={isUploadFormOpen} onClose={handleCloseAddNew}>
        <ManageFoldersForm onClose={handleCloseAddNew} />
      </Modal>
      <div className="bg-purple-lightest flex min-h-screen w-full flex-col">
        <AppBar />
        <div className="mx-auto flex w-full max-w-(--breakpoint-lg) grow flex-col p-6">
          <h2 className="text-3xl">Learn a song</h2>
          <Sizer height={8} />
          <h3 className="text-base"> Select a song, choose your settings, and begin learning</h3>
          <Sizer height={24} />
          <div className="flex gap-4">
            <SearchBox placeholder={'Search Songs by Title or Artist'} onSearch={setSearch} />
            <button
              className={clsx(
                'hidden flex-nowrap whitespace-nowrap sm:flex',
                'items-center gap-1 rounded-md px-4 py-2',
                'bg-purple-dark hover:bg-purple-hover text-white transition',
              )}
              onClick={handleAddNew}
            >
              <Plus width={20} height={20} />
              <span>Manage Folders</span>
            </button>
          </div>
          <Sizer height={32} />
          <Table
            columns={[
              { label: 'Name', id: 'title', keep: true },
              {
                label: 'Length',
                id: 'duration',
                format: (n) => formatTime(Number(n)),
              },
            ]}
            getId={(s: SongMetadata) => s.id}
            rows={songs}
            filter={['title']}
            onSelectRow={setSelectedSongId}
            search={search}
          />
        </div>
        <Sizer height={32} />
      </div>
      <MarketingFooter />
    </>
  )
}
