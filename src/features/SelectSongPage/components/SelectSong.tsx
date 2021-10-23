import * as React from 'react'
import { useState, useEffect } from 'react'
import { formatTime, Sizer, Container } from '@/utils'
import { SongPreviewModal } from '@/features/SongPreviewModal'
import songManifest from '@/manifest.json'
import { getUploadedLibrary } from '@/persist'
import { AppBar, Modal, Table } from '@/components'
import { LibrarySong, Filters, SelectableSongs } from '../types'
import FilterPane from './Filter/FilterPane'
import TypeFilter from './Filter/TypeFilter'
import { FilterTypeValue } from './Filter/types'
import UploadForm from './UploadSong/UploadSongForm'

const library = songManifest.filter((s) => s.type === 'song') as LibrarySong[]

export default function SelectSongPage() {
  const [songs, setSongs] = useState<SelectableSongs>(library)
  const [addNew, setAddNew] = useState<boolean>(false)
  const [selectedSong, setSelectedSong] = useState<any>('')
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
  useEffect(() => setSongs((s) => s.concat(uploadedLibrary)), [uploadedLibrary])

  const handleUpload = () => {
    setSongs(songs.concat(getUploadedLibrary()))
    setAddNew(false)
  }

  const handleAddNew = () => {
    setAddNew(true)
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

  const filteredSongs = songs.filter((s) => {
    return filters.type === undefined || s.type === filters.type
  })

  return (
    <>
      <SongPreviewModal
        show={!!selectedSong}
        songMeta={selectedSong}
        onClose={() => {
          setSelectedSong(null)
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
              { label: 'Title', id: 'name', keep: true },
              { label: 'Artist', id: 'artist', keep: true },
              { label: 'Difficult', id: 'difficulty', format: () => 'Easy' },
              { label: 'Length', id: 'duration', format: formatTime },
            ]}
            searchBoxPlaceholder="Search Songs by Title or Artist"
            rows={filteredSongs}
            filter={['name', 'artist']}
            onSelectRow={setSelectedSong}
            onCreate={handleAddNew}
            onFilter={handleToggleOpenFilter}
          />
          <Sizer height={60} />
        </div>
      </Container>
    </>
  )
}
