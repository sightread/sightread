import { Modal, Sizer } from '@/components'
import { SongScrubBar } from '@/features/controls'
import { usePlayer } from '@/features/player'
import PreviewIcon from '@/features/SongPreview/PreviewIcon'
import { SongPreview } from '@/features/SongPreview/SongPreview'
import { useEventListener, usePlayerState } from '@/hooks'
import { Download, Share } from '@/icons'
import { SongSource } from '@/types'
import * as React from 'react'

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
        <div className="flex w-full flex-col whitespace-nowrap">
          <span className="text-2xl font-semibold">Preview your recording</span>
          {/* <span className="overflow-hidden text-base text-gray-500"></span> */}
        </div>
        <div className="flex grow flex-col overflow-hidden rounded-md">
          <div className="relative">
            <div className="pointer-events-none absolute z-20 h-full w-full rounded-md" />
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
              className="border-purple-primary hover:bg-purple-primary flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-white px-1 text-xl text-black transition hover:text-white"
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
              className="bg-purple-primary hover:bg-purple-hover flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border-none px-1 text-xl text-white transition"
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
