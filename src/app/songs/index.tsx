'use client'

import { AppBar, MarketingFooter, Modal, Sizer } from '@/components'
import { midishareMetadataAtom, useSongManifest } from '@/features/data/library'
import { SongPreviewModal } from '@/features/SongPreview'
import { useEventListener } from '@/hooks'
import { Plus, Archive } from '@/icons'
import { DifficultyLabel, SongMetadata } from '@/types'
import { formatTime } from '@/utils'
import clsx from 'clsx'
import { useHydrateAtoms } from 'jotai/utils'
import { Metadata } from 'next'
import * as React from 'react'
import { useState } from 'react'
import { Table, UploadForm } from './components'
import { SearchBox } from './components/Table/SearchBox'
import PlayListView from './components/Playlists/PlaylistsView'

export const metadata: Metadata = {
  title: 'Sightread: Select a song',
}

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
export default function SelectSongPage({ midishareMetadata }: any) {
  const songs = useSongManifest()
  const [isUploadFormOpen, setUploadForm] = useState<boolean>(false)
  const [isPlaylistFormOpen, setPlaylistFormOpen] = useState<boolean>(false)
  const [selectedSongId, setSelectedSongId] = useState<any>('')
  const selectedSongMeta = songs.find((s) => s.id === selectedSongId)
  const [search, setSearch] = useState('')
  useHydrateAtoms([[midishareMetadataAtom, midishareMetadata]])

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

  const handlePlaylists = (e: any) => {
    setPlaylistFormOpen(true)
    e.stopPropagation();
  }

  const handleClosePlaylists = () => {
    setPlaylistFormOpen(false)
  }

  return (
    <>
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
      <Modal show={isPlaylistFormOpen} onClose={handleClosePlaylists}>
        <PlayListView onClose={handleCloseAddNew} />
      </Modal>
      <div className="flex h-screen w-full flex-col bg-purple-lightest">
        <AppBar />
        <div className="mx-auto flex w-full max-w-screen-lg flex-grow flex-col p-6">
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
                'bg-purple-dark text-white transition hover:bg-purple-hover',
              )}
              onClick={handleAddNew}
            >
              <Plus width={20} height={20} />
              <span>Add New</span>
            </button>
            <button
              className={clsx(
                'hidden flex-nowrap whitespace-nowrap sm:flex',
                'items-center gap-1 rounded-md px-4 py-2',
                'bg-purple-dark text-white transition hover:bg-purple-hover',
              )}
              onClick={handlePlaylists}
            >
              <Archive width={20} height={20} />
              <span>Manage playlists</span>
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
                format: (n) => formatTime(Number(n)),
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
        <Sizer height={32} />
      </div>
      <MarketingFooter />
    </>
  )
}
