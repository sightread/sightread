import { useState, useRef } from 'react'
import { defaultUploadState, prevent } from './utils'
import { UploadFormState } from './types'
import { Sizer } from '@/components'
import { palette } from '@/styles/common'
import { css } from '@sightread/flake'
import { LibrarySong } from '../../types'
import { saveSong } from '@/features/persist'

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
})

export default function UploadForm({ onSuccess }: { onSuccess: (newSong: LibrarySong) => void }) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (state.file && state.artist && state.title) {
      try {
        const song = await saveSong(state.file, state.title, state.artist)
        setState(defaultUploadState())
        onSuccess(song)
      } catch (error: any) {
        console.error('Something went wrong', error)
        setState({ ...state, error: error.toString() })
      }
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
      <label htmlFor="title" style={{ display: 'block' }}>
        Title
      </label>
      <Sizer height={5} />
      <input
        onChange={handleChange}
        id="title"
        name="title"
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
      <Sizer height={15} />
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
