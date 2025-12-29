import { Modal, Sizer } from '@/components'
import { useEventListener, usePlayerState } from '@/hooks'
import { SongMetadata } from '@/types'
import * as React from 'react'
import { Heading } from 'react-aria-components'
import { createSearchParams, Link } from 'react-router'
import { SongScrubBar } from '../controls'
import { usePlayer } from '../player'
import PreviewIcon from './PreviewIcon'
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
  const { title, id, source } = songMeta ?? {}
  const player = usePlayer()
  const playerState = usePlayerState()

  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (!show) return

    if (event.key === ' ') {
      event.preventDefault()
      player.toggle()
    }
  })

  function handleClose() {
    player.stop()
    return onClose()
  }

  if (!show || !id || !source) {
    return null
  }

  const playSongSearch = createSearchParams({ id, source }).toString()

  return (
    <Modal show={show && !!id} onClose={handleClose} className="min-w-[min(100vw,600px)]">
      <div className="flex flex-col gap-3">
        <Heading className="truncate text-xl font-semibold whitespace-nowrap">{title}</Heading>
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
            onClick={() => player.toggle()}
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
          <Link
            to={{ pathname: '/play', search: `?${playSongSearch}` }}
            className="flex h-10 w-full items-center justify-center rounded-md border-none bg-violet-600 text-xl text-white transition hover:bg-violet-500 active:bg-violet-700"
          >
            Play Now
          </Link>
        </div>
      </div>
    </Modal>
  )
}
