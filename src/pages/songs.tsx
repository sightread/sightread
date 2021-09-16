import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import {
  formatTime,
  isFileMidi,
  isFileXML,
  Sizer,
  fileToString,
  fileToUint8,
  isBrowser,
  isLocalStorageAvailable,
  Container,
} from '../utils'
import { SelectSongModal, SelectSongTable } from '../SelectSongPage'
import songManifest from 'src/manifest.json'
import Modal from 'src/components/Modal'
import { Song } from 'src/types'
import { palette } from 'src/styles/common'
import { parseMidi, parseMusicXML } from '../parsers'
import { css } from '@sightread/flake'
import clsx from 'clsx'
import { getUploadedLibrary, UploadedSong, isKeyAlreadyUsed, saveSong } from '../persist'
import AppBar from 'src/components/AppBar'

type LibrarySong = {
  file: string
  name: string
  artist: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  type: 'song'
  duration: number
}
const library = songManifest.filter((s) => s.type === 'song') as LibrarySong[]

type SelectableSongs = (LibrarySong | UploadedSong)[]

type Filters = {
  show: boolean
  duration?: [number, number] // duration filter in a range. have to find song with longest duration?
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  type?: 'song' | 'upload'
}

const classes = css({
  submitButton: {
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    padding: '8px 24px',
    cursor: 'pointer',
    outline: 'none',
    fontSize: '18px',
    backgroundColor: palette.purple.primary,
    transition: '300ms',
    '&:hover': {
      backgroundColor: palette.purple.dark,
    },
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '18px',
    padding: '5px',
    borderRadius: '3px',
    '&:focus': {
      borderColor: '#80bdff',
      outline: '0',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
  fileUpload: {
    borderRadius: '5px',
    padding: '20px',
    border: '2px dashed grey',
    cursor: 'pointer',
    transition: '300ms',
    textAlign: 'center',
    '&:hover': {
      boxShadow: '0px 0px 15px 0px #a2a2a2 !important',
    },
  },
  filterButton: {
    backgroundColor: 'white',
    border: '1px solid black',
    padding: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  filterButtonActive: {
    color: 'white',
    backgroundColor: palette.purple.dark,
  },
})

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
  useEffect(() => {
    setSongs((s) => s.concat(getUploadedLibrary()))
  }, [getUploadedLibrary()])

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
      <SelectSongModal
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
          <SelectSongTable
            columns={[
              { label: 'Title', id: 'name', keep: true },
              { label: 'Artist', id: 'artist', keep: true },
              { label: 'Difficult', id: 'difficulty', format: () => 'Easy' },
              { label: 'Length', id: 'duration', format: formatTime },
            ]}
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

type FilterTypeValue = 'song' | 'upload' | undefined
function TypeFilter({
  value,
  onSelect,
}: {
  onSelect: (value: FilterTypeValue) => void
  value: FilterTypeValue
}) {
  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    const selectedValue = e.currentTarget.value
    if (selectedValue !== 'song' && selectedValue !== 'upload') {
      return
    }
    if (selectedValue === value) {
      return onSelect(undefined)
    }
    return onSelect(selectedValue)
  }

  return (
    <div>
      <span
        style={{
          marginBottom: '8px',
          display: 'block',
          fontSize: '21px',
          fontWeight: 'bold',
        }}
      >
        Type
      </span>
      <button
        type="button"
        className={clsx(classes.filterButton, {
          [classes.filterButtonActive]: value === 'upload',
        })}
        value="upload"
        onClick={handleSelect}
        style={{
          borderRadius: '8px 0px 0px 8px',
        }}
      >
        Uploads
      </button>
      <button
        type="button"
        className={clsx(classes.filterButton, {
          [classes.filterButtonActive]: value === 'song',
        })}
        value="song"
        style={{
          borderRadius: '0px 8px 8px 0px',
        }}
        onClick={handleSelect}
      >
        Library
      </button>
    </div>
  )
}

type FilterPaneProps = {
  show: boolean
}
function FilterPane({ show, children }: React.PropsWithChildren<FilterPaneProps>) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 0 }}>
      <div
        style={{
          position: 'absolute',
          padding: show ? '24px' : '0px 24px',
          height: show ? '' : '0px',
          overflow: show ? '' : 'hidden',
          border: show ? '1px solid' : 'none',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxSizing: 'border-box',
          zIndex: 10,
          transition: '400ms',
          top: '80px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ========================= UPLOAD SONG ========================== */
/* ================================================================ */

async function convertFileToSong(file: File): Promise<Song> {
  if (isFileMidi(file)) {
    const buffer = await fileToUint8(file)
    return parseMidi(buffer.buffer)
  } else if (isFileXML(file)) {
    const rawString = await fileToString(file)
    if (!rawString) {
      throw new Error('failed to convert file to string')
    }
    return parseMusicXML(rawString)
  }
  throw new Error('Unkown file type, valid types are audio/mid or .xml files.')
}

async function uploadSong(form: UploadSong): Promise<UploadedSong | null> {
  const { file, name, artist } = form
  if (isKeyAlreadyUsed(name, artist)) {
    throw new Error('Name and arist already used. Please choose another')
  }
  const parsedSong = await convertFileToSong(file)
  return saveSong(parsedSong, name, artist)
}

type UploadSong = {
  file: File
  name: string
  artist: string
}

function prevent(e: React.MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
}

type UploadFormState = {
  file?: File
  name?: string
  artist?: string
  error?: string
}

/** Warn the user if local storage is not availabe */
function defaultUploadState(): UploadFormState {
  if (!isBrowser()) {
    return {}
  }
  if (!isLocalStorageAvailable()) {
    return {
      error:
        'Warning: Due to your current browser, uploaded songs will be lost after leaving the site.',
    }
  }
  return {}
}

function UploadForm({ onSuccess }: { onSuccess: (newSong: UploadedSong) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [state, setState] = useState<UploadFormState>(defaultUploadState())
  const [dragOver, setDragOver] = useState<boolean>(false)

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target
    if (target.files) {
      return setState({ ...state, file: target.files[0] })
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name
    const value = e.target.value
    setState({ ...state, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (state.file && state.artist && state.name) {
      uploadSong(state as UploadSong)
        .then((song) => {
          if (song && onSuccess) {
            setState(defaultUploadState())
            onSuccess(song)
          }
        })
        .catch((error) => {
          console.error('Something went wrong', error)
          setState({ ...state, error: error.toString() })
        })
    }
  }

  const chooseFiles = () => {
    const input = inputRef.current
    if (input) {
      input.click()
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    prevent(e)
    setDragOver(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) {
      return
    }
    setState({ ...state, file: files[0] })
    e.dataTransfer.clearData()
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    prevent(e)
  }

  const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
    prevent(e)
    const items = e.dataTransfer.items
    if (!!items && items.length > 0) {
      setDragOver(true)
    }
  }

  const handleDragOut = (e: React.DragEvent<HTMLDivElement>) => {
    prevent(e)
    setDragOver(false)
  }

  const fileInputStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      boxShadow: 'none',
    }
    if (state.error) {
      style.border = '1px solid red'
    }
    if (dragOver) {
      style.boxShadow = '0px 0px 15px 0px #a2a2a2'
    }
    return style
  }

  return (
    <form onSubmit={handleSubmit} style={{ fontSize: '21px' }}>
      <label htmlFor="name" style={{ display: 'block' }}>
        Title
      </label>
      <Sizer height={5} />
      <input
        onChange={handleChange}
        id="name"
        name="name"
        type="text"
        className={classes.input}
        style={state.error ? { border: '1px solid red' } : {}}
      />
      <Sizer height={10} />
      <label htmlFor="artist" style={{ display: 'block' }}>
        Artist
      </label>
      <Sizer height={5} />
      <input
        onChange={handleChange}
        id="artist"
        name="artist"
        type="text"
        className={classes.input}
        style={state.error ? { border: '1px solid red' } : {}}
      />
      <Sizer height={10} />
      <label htmlFor="file" style={{ display: 'block' }}>
        File
      </label>
      <Sizer height={5} />
      <input
        ref={inputRef}
        onChange={handleAddFile}
        id="file"
        name="file"
        type="file"
        accept=".mid, .xml"
        style={{ display: 'none' }}
      />
      <div
        className={classes.fileUpload}
        onClick={chooseFiles}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        style={fileInputStyle()}
      >
        {state.file ? state.file.name : 'Drag and Drop'}
        <div style={{ padding: '20px 0px' }}>{state.file ? '' : 'or'}</div>
        <div style={{ color: palette.purple.primary }}>Click To Browse</div>
      </div>
      <Sizer height={15} />
      <div style={{ textAlign: 'center' }}>
        <button className={classes.submitButton} type="submit">
          Submit
        </button>
      </div>
      {state.error && (
        <>
          <Sizer height={24} />
          <div
            aria-label="Error message"
            style={{
              padding: 24,
              color: '#721c24',
              backgroundColor: '#f8d7da',
              borderColor: '#f5c6cb',
              margin: 'auto',
              boxSizing: 'border-box',
              maxWidth: '375px',
            }}
          >
            {state.error}
          </div>
        </>
      )}
    </form>
  )
}
