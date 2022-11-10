import * as React from 'react'
import { useState, useEffect } from 'react'
import { formatTime } from '@/utils'
import { SongPreviewModal } from '@/features/SongPreview'
import { AppBar, Modal, Sizer } from '@/components'
import { DifficultyLabel, SongMetadata } from '@/types'
import { useEventListener } from '@/hooks'
import { Plus } from '@/icons'
import { SearchBox } from './components/Table/SearchBox'
import clsx from 'clsx'
import { UploadForm, Table } from './components'
import Head from 'next/head'
import { useSongManifest } from '@/features/data'
import { getUploadedLibrary } from '@/features/persist'

function getDifficultyLabel(s: number): DifficultyLabel {
  if (!s) {
    return '-'
  }

  const difficultyMap: { [d: number]: DifficultyLabel } = {
    0: '-',
    10: 'Easiest',
    20: 'Easier',
    30: 'Easy',
    40: 'Medium',
    50: 'Hard',
    60: 'Hardest',
    65: 'Hardest',
  }
  return difficultyMap[s]
}

// TODO: after an upload, scroll to the newly uploaded song / make it focused.
export default function SelectSongPage() {
  const [songs, addSongs] = useSongManifest()
  const [isUploadFormOpen, setUploadForm] = useState<boolean>(false)
  const [selectedSongId, setSelectedSongId] = useState<any>('')
  const selectedSongMeta = songs.find((s) => s.id === selectedSongId)
  const [search, setSearch] = useState('')

  const uploadedLibrary = getUploadedLibrary()
  useEffect(() => {
    addSongs(uploadedLibrary)
  }, [uploadedLibrary, addSongs])

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
      <Head>
        <title>Sightread: Select a song</title>
      </Head>
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
      <div className="bg-purple-lightest w-full h-screen flex flex-col">
        <AppBar />
        <div className="p-6 mx-auto max-w-screen-lg flex flex-col flex-grow w-full">
          <h2 className="text-3xl">Learn a song</h2>
          <Sizer height={8} />
          <h3 className="text-base"> Select a song, choose your settings, and begin learning</h3>
          <Sizer height={24} />
          <div className="flex gap-4">
            <SearchBox placeholder={'Search Songs by Title or Artist'} onSearch={setSearch} />
            <button
              className={clsx(
                'hidden sm:flex whitespace-nowrap flex-nowrap',
                'py-2 px-4 items-center rounded-md gap-1',
                'bg-purple-dark transition hover:bg-purple-hover text-white',
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
              // { label: 'Difficulty', id: 'difficulty', format: getDifficultyLabel as any },
              {
                label: 'Length',
                id: 'duration',
                format: (n) => formatTime(n),
              },
              { label: 'Source', id: 'source' },
            ]}
            getId={(s: SongMetadata) => s.id}
            rows={songs}
            filter={['title', 'artist']}
            onSelectRow={setSelectedSongId}
            search={search}
          />
        </div>
      </div>
    </>
  )
}
