import * as React from 'react'
import { useState, useEffect } from 'react'
import { formatTime } from '@/utils'
import { SongPreviewModal } from '@/features/SongPreview'
import songManifest from '@/manifest.json'
import { getUploadedLibrary } from '@/features/persist'
import { AppBar, Modal, Table, Sizer, Container } from '@/components'
import { LibrarySong, Filters } from './types'
import { FilterPane, FilterTypeValue, TypeFilter, UploadForm } from './components'
import { DifficultyLabel } from '@/types'

const builtin = songManifest as unknown as LibrarySong[]

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

type SelectSongPageProps = {
  midishareManifest: LibrarySong[]
}
export default function SelectSongPage(props: SelectSongPageProps) {
  const [songs, setSongs] = useState<LibrarySong[]>(
    builtin.concat(Object.values(props.midishareManifest)),
  )
  const [addNew, setAddNew] = useState<boolean>(false)
  const [selectedSongId, setSelectedSongId] = useState<any>('')
  const selectedSongMeta = songs.find((s) => s.id === selectedSongId)
  const [filters, setFilters] = useState<Filters>({ show: false })

  useEffect(() => {
    function closeModal(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAddNew(false)
      }
    }
    window.addEventListener('keydown', closeModal)
    return () => {
      window.removeEventListener('keydown', closeModal)
    }
  }, [])

  // TODO: this is a bug if the uploaded library changes, and s will only expand.
  const uploadedLibrary = getUploadedLibrary()
  useEffect(() => {
    setSongs(builtin.concat(Object.values(props.midishareManifest)).concat(uploadedLibrary))
  }, [uploadedLibrary])

  const handleUpload = () => setAddNew(false)

  const handleAddNew = (e: any) => {
    setAddNew(true)
    e.stopPropagation()
  }

  const handleCloseAdd = () => {
    setAddNew(false)
  }

  const handleToggleOpenFilter = () => {
    setFilters({ ...filters, show: !filters.show })
  }

  const handleFilterType = (type: FilterTypeValue): void => {
    return setFilters({ ...filters, type })
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
      <Modal show={addNew} onClose={handleCloseAdd} style={{ minWidth: '375px' }}>
        <UploadForm onSuccess={handleUpload} />
      </Modal>
      <AppBar style={{ backgroundColor: '#292929', display: 'flex' }} />
      <Container style={{ backgroundColor: '#F2F2F2', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
          <Sizer height={24} />
          <h2 style={{ fontSize: 36, fontWeight: 200 }}>Songs</h2>
          <FilterPane show={filters.show}>
            <div style={{ display: 'flex' }}>
              <TypeFilter onSelect={handleFilterType} value={filters.type} />
            </div>
          </FilterPane>
          <Sizer height={24} />
          <Table
            columns={[
              { label: 'Title', id: 'title', keep: true },
              { label: 'Artist', id: 'artist', keep: true },
              { label: 'Difficulty', id: 'difficulty', format: getDifficultyLabel as any },
              {
                label: 'Length',
                id: 'duration',
                format: (n) => formatTime(n),
              },
              { label: 'Source', id: 'source' },
            ]}
            searchBoxPlaceholder="Search Songs by Title or Artist"
            getId={(s: LibrarySong) => s.id}
            rows={songs}
            filter={['title', 'artist']}
            onSelectRow={setSelectedSongId}
            onCreate={handleAddNew}
            onFilter={handleToggleOpenFilter}
          />
          <Sizer height={60} />
        </div>
      </Container>
    </>
  )
}
