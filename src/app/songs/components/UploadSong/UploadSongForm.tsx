'use client'

import { Sizer } from '@/components'
import { TextInput } from '@/components/TextInput'
import { useRefreshStorageMetadata } from '@/features/data/library'
import { saveSong } from '@/features/persist'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { UploadFormState } from './types'
import { defaultUploadState, prevent } from './utils'

export default function UploadForm({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [state, setState] = useState<UploadFormState>(defaultUploadState())
  const [dragOver, setDragOver] = useState<boolean>(false)
  const refreshStorage = useRefreshStorageMetadata()

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
        await saveSong(state.file, state.title, state.artist)
        refreshStorage()
        setState(defaultUploadState())
        onClose()
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
    <form
      onSubmit={handleSubmit}
      className="relative flex w-[min(100vw,500px)] flex-col gap-5 p-8 text-base"
    >
      <h1 className="text-3xl font-bold">Upload</h1>
      <Sizer height={0} />
      <div className="flex flex-wrap items-baseline gap-2">
        <label htmlFor="title" className="w-12">
          Title
        </label>
        <FormInput
          type="text"
          name="title"
          placeholder="Enter a title"
          onChange={handleChange}
          error={!!state.error}
        />
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <label htmlFor="artist" className="w-12">
          Artist
        </label>
        <FormInput
          type="text"
          name="artist"
          placeholder="Enter an artist"
          onChange={handleChange}
          error={!!state.error}
        />
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <label htmlFor="file" className="w-12 self-center">
          File
        </label>
        <input
          ref={inputRef}
          onChange={handleAddFile}
          id="file"
          name="file"
          type="file"
          accept=".mid,audio/midi,audio/x-midi,.xml,application/xml,text/xml"
          className="hidden"
        />
        <div
          className={clsx(
            'grow cursor-pointer rounded-md p-5 text-center transition',
            'border-2 border-dashed border-gray-400 bg-gray-50 hover:shadow-lg',
          )}
          onClick={chooseFiles}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          style={fileInputStyle()}
        >
          {state.file ? state.file.name : 'Drag and Drop'}
          <div className="px-5">{state.file ? '' : 'or'}</div>
          <div className="text-purple-primary">Click To Browse</div>
        </div>
      </div>
      <Sizer height={16} />
      <button
        className="bg-purple-primary hover:bg-purple-hover w-full cursor-pointer rounded-md py-2 text-white transition"
        type="submit"
      >
        Upload
      </button>
      {state.error && (
        <>
          <Sizer height={24} />
          <div
            aria-label="Error message"
            className="m-auto max-w-sm border-[#f5c6cb] bg-[#f8d7da] p-6 text-red-900"
          >
            {state.error}
          </div>
        </>
      )}
    </form>
  )
}

type FormInputProps = {
  type: string
  onChange: any
  name: string
  className?: string
  error?: boolean
  placeholder?: string
}
function FormInput({ onChange, name, className, error, type, placeholder }: FormInputProps) {
  return (
    <TextInput
      onChange={onChange}
      className={clsx(className, 'max-w-full grow bg-gray-50 text-base')}
      error={error}
      name={name}
      type={type}
      placeholder={placeholder}
    />
  )
}
