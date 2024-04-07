import * as React from 'react'
import { SongScrubBar } from '@/features/controls'
import { useEventListener, usePlayerState } from '@/hooks'
import { Modal, Sizer } from '@/components'
import { SongSource } from '@/types'
import { SongPreview } from '@/features/SongPreview/SongPreview'
import PreviewIcon from '@/features/SongPreview/PreviewIcon'
import { Share, Download } from '@/icons'
import { usePlayer } from '@/features/player'

// A function to copy a string to the clipboard
function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text)
}

function downloadBase64Midi(midiBase64: string) {
  const midiBytes = Buffer.from(midiBase64, 'base64')
  const midiBlob = new Blob([midiBytes], { type: 'audio/midi' })
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(midiBlob)
  downloadLink.download = 'recording.mid'
  downloadLink.click()
}

type ModalProps = {
  show: boolean
  onClose: () => void
  songMeta?: { source: SongSource; id: string }
}
export default function SongPreviewModal({
  show = true,
  onClose = () => {},
  songMeta = undefined,
}: ModalProps) {
  const { id, source } = songMeta ?? {}
  const player = usePlayer()
  const playerState = usePlayerState()

  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (!show) return

    if (event.key === ' ') {
      event.preventDefault()
    }
  })

  function handleClose() {
    player.stop()
    return onClose()
  }

  if (!show || !id || !source) {
    return null
  }

  return (
    <Modal show={show && !!id} onClose={handleClose} className="min-w-[min(100%,600px)]">
      <div className="flex flex-col gap-3 p-8">
        <div className="flex flex-col w-full whitespace-nowrap">
          <span className="font-semibold text-2xl">Preview your recording</span>
          {/* <span className="overflow-hidden text-base text-gray-500"></span> */}
        </div>
        <div className="flex rounded-md flex-col flex-grow overflow-hidden">
          <div className="relative">
            <div className="absolute w-full h-full z-20 pointer-events-none rounded-md" />
            <SongScrubBar height={30} />
          </div>
          <div
            style={{
              position: 'relative',
              backgroundColor: '#2e2e2e',
              height: 340, // TODO, do this less hacky
              minHeight: 340, // without height and min-height set, causes canvas re-paint on adjust instruments open
              width: '100%',
              overflow: 'hidden',
            }}
            onClick={() => player.toggle}
          >
            <PreviewIcon
              isLoading={!playerState.canPlay}
              isPlaying={playerState.playing}
              onPlay={(e) => {
                e.stopPropagation()
                player.play()
              }}
            />
            {id && source && <SongPreview songId={id} source={source} />}
          </div>
          <Sizer height={16} />
          <div className="flex w-full gap-4">
            <button
              className="w-full text-black h-10 cursor-pointer rounded-md text-xl transition border-purple-primary border bg-white hover:bg-purple-primary hover:text-white flex items-center gap-2 px-1 justify-center"
              onClick={() => {
                const origin = window.location.origin
                const url = `${origin}/play/?source=base64&id=${id}`
                copyToClipboard(url)
              }}
            >
              <Share />
              Copy Share URL
            </button>
            <button
              className="w-full text-white h-10 border-none cursor-pointer rounded-md text-xl transition bg-purple-primary hover:bg-purple-hover flex items-center gap-2 justify-center px-1"
              onClick={() => downloadBase64Midi(id)}
            >
              <Download />
              Download MIDI
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
