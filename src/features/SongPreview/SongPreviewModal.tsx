import { Modal } from '@/components'
import { useEventListener, usePlayerState } from '@/hooks'
import { SongMetadata } from '@/types'
import { useAtomValue } from 'jotai'
import { Pause, Play } from 'lucide-react'
import { Button, Heading, Text } from 'react-aria-components'
import { createSearchParams, useNavigate } from 'react-router'
import { SongScrubBar, useSongScrubTimes } from '../controls'
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
  const navigate = useNavigate()
  const song = useAtomValue(player.song)
  const trackCount = song ? Object.keys(song.tracks).length : undefined
  const noteCount = song?.notes.length
  const playSongSearch = id && source ? createSearchParams({ id, source }).toString() : ''
  const { currentTime, duration } = useSongScrubTimes()

  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (!show) return

    if (event.key === ' ') {
      event.preventDefault()
      player.toggle()
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (playSongSearch) {
        navigate({ pathname: '/play', search: `?${playSongSearch}` })
      }
    }
  })

  function handleClose() {
    player.stop()
    return onClose()
  }

  if (!show || !id || !source) {
    return null
  }

  const trackCountLabel = trackCount === undefined ? '--' : String(trackCount).padStart(2, '0')
  const noteCountLabel = noteCount === undefined ? '--' : noteCount.toLocaleString()

  return (
    <Modal
      show={show && !!id}
      onClose={handleClose}
      className="overflow-hidden rounded-2xl bg-transparent p-0"
      modalClassName="max-w-[1100px] w-[min(96vw,1100px)]"
    >
      <div className="flex h-[min(90vh,700px)] w-full bg-white text-left">
        <div
          className="relative flex-1 overflow-hidden bg-[#21242b]"
          onClick={() => player.toggle()}
        >
          {!playerState.canPlay && (
            <PreviewIcon
              isLoading={!playerState.canPlay}
              isPlaying={playerState.playing}
              onPlay={(e) => {
                e.stopPropagation()
                player.play()
              }}
            />
          )}
          {id && source && <SongPreview songId={id} source={source} />}
        </div>
        <div className="flex w-[420px] flex-col border-l border-gray-200 bg-white">
          <div className="px-6 pt-6 pb-3">
            <Heading
              className="truncate text-xl leading-tight font-semibold text-gray-900"
              title={title}
            >
              {title}
            </Heading>
            <Text className="mt-2 text-sm font-medium text-gray-500">MIDI Preview</Text>
          </div>
          <div className="px-6 pb-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[8px_auto_auto] items-center gap-x-3">
                <div className="col-span-3 row-start-1" />
                <Button
                  className="col-start-1 row-start-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-200/60 hover:text-violet-600"
                  onPress={() => player.toggle()}
                  aria-label={playerState.playing ? 'Pause preview' : 'Play preview'}
                >
                  {playerState.playing ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <div className="col-span-2 col-start-2 row-start-2 flex h-8 items-center">
                  <SongScrubBar height={8} className="w-full" trackClassName="bg-gray-200" />
                </div>
                <div className="col-span-2 col-start-2 row-start-3 flex items-center justify-between font-mono text-[10px] text-gray-500">
                  <span>{currentTime}</span>
                  <span>{duration}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm">
                <Text className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Tracks
                </Text>
                <Text className="text-sm font-semibold text-gray-900">{trackCountLabel}</Text>
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm">
                <Text className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Total Notes
                </Text>
                <Text className="text-sm font-semibold text-gray-900">{noteCountLabel}</Text>
              </div>
            </div>
          </div>
          <div className="mt-auto border-t border-gray-100 px-6 py-6">
            <Button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-violet-500 active:bg-violet-700"
              onPress={() => navigate({ pathname: '/play', search: `?${playSongSearch}` })}
            >
              Play Now
            </Button>
            <div className="mt-3 text-center text-xs text-gray-400">
              Press{' '}
              <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">
                Enter
              </kbd>{' '}
              to start
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
