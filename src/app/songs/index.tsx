'use client'

import { AppBar, Dropdown, MarketingFooter, Modal, Sizer } from '@/components'
import { useDeleteSong, useSongManifest } from '@/features/data/library'
import { SongPreviewModal } from '@/features/SongPreview'
import { useEventListener } from '@/hooks'
import { MoreVertical, Plus } from '@/icons'
import * as icons from '@/icons'
import { SongMetadata } from '@/types'
import { formatTime } from '@/utils'
import clsx from 'clsx'
import * as React from 'react'
import { useState } from 'react'
import { Table, UploadForm } from './components'
import { SearchBox } from './components/Table/SearchBox'

type SongMetadataWithActions = SongMetadata & { actions?: React.ReactNode }

// TODO: after an upload, scroll to the newly uploaded song / make it focused.
export default function SelectSongPage() {
  let songs: SongMetadataWithActions[] = useSongManifest()
  const [isUploadFormOpen, setUploadForm] = useState<boolean>(false)
  const [selectedSongId, setSelectedSongId] = useState<any>('')
  const selectedSongMeta = songs.find((s) => s.id === selectedSongId)
  const [search, setSearch] = useState('')
  const deleteSong = useDeleteSong()

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

  // Create the actions column and cell values
  songs = songs.map((s) => {
    let actions = <></>
    if (s.source === 'upload') {
      actions = (
        <Dropdown
          target={
            <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
              <MoreVertical size={20} />
            </button>
          }
        >
          <div className="ring-border z-20 w-40 space-y-1 rounded-md bg-white p-2 shadow-md ring-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteSong(s.id)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <icons.Trash size={16} />
              Delete
            </button>
          </div>
        </Dropdown>
      )
    }

    return { ...s, actions }
  })

  return (
    <>
      <title>Sightread: Select a song</title>
      <SongPreviewModal
        show={!!selectedSongId}
        songMeta={selectedSongMeta}
        onClose={() => {
          setSelectedSongId(null)
        }}
      />
      <Modal show={isUploadFormOpen} onClose={handleCloseAddNew}>
        <UploadForm onClose={handleCloseAddNew} />
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
              <span>Add New</span>
            </button>
          </div>
          <Sizer height={32} />
          <Table
            columns={[
              { label: 'Title', id: 'title', keep: true },
              { label: 'Artist', id: 'artist', keep: true },
              {
                label: 'Length',
                id: 'duration',
                format: (n) => formatTime(Number(n)),
              },
              { label: 'Actions', id: 'actions' },
            ]}
            getId={(s: SongMetadataWithActions) => s.id}
            rows={songs}
            filter={['title', 'artist']}
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
