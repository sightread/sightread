import * as React from 'react'
import { SongScrubBar } from '../SongInputControls'
import { useRouter } from 'next/router'
import { useEventListener, usePlayerState } from '@/hooks'
import { Modal, Sizer } from '@/components'
import PreviewIcon from './PreviewIcon'
import { SongMetadata } from '@/types'
import { SongPreview } from './SongPreview'

type ModalProps = {
  show: boolean
  onClose: () => void
  songMeta?: SongMetadata
}
export default function SongPreviewModal({
  show = true,
  onClose = () => {},
  songMeta = undefined,
}: ModalProps) {
  const { title, artist, id, source } = songMeta ?? {}
  const router = useRouter()
  const [playerState, playerActions] = usePlayerState()

  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (!show) return

    if (event.key === ' ') {
      event.preventDefault()
      playerActions.toggle()
    }
  })

  function handlePlayNow() {
    router.push(`/play?id=${id}&source=${source}`)
  }

  function handleClose() {
    playerActions.reset()
    return onClose()
  }

  if (!show || !id || !source) {
    return null
  }

  return (
    <Modal show={show && !!id} onClose={handleClose} className="min-w-[min(100%,600px)]">
      <div className="flex flex-col gap-3 p-8">
        <div className="flex flex-col w-full whitespace-nowrap">
          <span className="font-semibold text-2xl">{title}</span>
          <span className="overflow-hidden text-base text-gray-500">{artist}</span>
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
            onClick={playerActions.toggle}
          >
            <PreviewIcon
              isLoading={!playerState.canPlay}
              isPlaying={playerState.playing}
              onPlay={(e) => {
                e.stopPropagation()
                playerActions.play()
              }}
            />
            {id && source && <SongPreview songId={id} source={source} />}
          </div>
          <Sizer height={16} />
          <button
            className="w-full text-white h-10 border-none cursor-pointer rounded-md text-xl transition bg-purple-primary hover:bg-purple-hover"
            onClick={handlePlayNow}
          >
            Play Now
          </button>
        </div>
      </div>
    </Modal>
  )
}
