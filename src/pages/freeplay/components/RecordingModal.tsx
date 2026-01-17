import { Modal } from '@/components'
import { renderMidiToMp3 } from '@/features/audio/render-midi'
import { SongScrubBar, useSongScrubTimes } from '@/features/controls'
import { usePlayer } from '@/features/player'
import { SongPreview } from '@/features/SongPreview/SongPreview'
import { loadInstrument, soundfonts } from '@/features/synth/loadInstrument'
import { InstrumentName } from '@/features/synth/types'
import { useEventListener, usePlayerState } from '@/hooks'
import { Download, Loader, Share } from '@/icons'
import { SongSource } from '@/types'
import { base64ToBytes, formatInstrumentName } from '@/utils'
import { useAtomValue } from 'jotai'
import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from 'react-aria-components'

// A function to copy a string to the clipboard
function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text)
}

function downloadBase64Midi(midiBase64: string) {
  const midiBytes: Uint8Array = base64ToBytes(midiBase64)
  const midiBlob = new Blob([midiBytes as BlobPart], { type: 'audio/midi' })
  downloadBlob(midiBlob, 'recording.mid')
}

function downloadBlob(blob: Blob, filename: string) {
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = filename
  downloadLink.click()
  URL.revokeObjectURL(downloadLink.href)
}

type ModalProps = {
  show: boolean
  onClose: () => void
  songMeta?: { source: SongSource; id: string }
  instrument?: InstrumentName
}
export default function SongPreviewModal({
  show = true,
  onClose = () => {},
  songMeta = undefined,
  instrument,
}: ModalProps) {
  const { id, source } = songMeta ?? {}
  const player = usePlayer()
  const playerState = usePlayerState()
  const { currentTime, duration } = useSongScrubTimes()
  const song = useAtomValue(player.song)
  const [isMp3Rendering, setIsMp3Rendering] = useState(false)
  const [isSoundfontLoading, setIsSoundfontLoading] = useState(false)
  const [isSoundfontReady, setIsSoundfontReady] = useState(false)
  const noteCount = song?.notes.length
  const previewInstrument = player.synths?.[0]?.getInstrument?.()
  const instrumentLabel = previewInstrument ? formatInstrumentName(previewInstrument) : '--'
  const noteCountLabel = noteCount === undefined ? '--' : noteCount.toLocaleString()

  useEffect(() => {
    if (!show || !instrument) {
      setIsSoundfontReady(false)
      setIsSoundfontLoading(false)
      return
    }

    let active = true
    const hasSoundfont = !!soundfonts[instrument]
    setIsSoundfontReady(hasSoundfont)
    if (!hasSoundfont) {
      setIsSoundfontLoading(true)
      loadInstrument(instrument)
        .then(() => {
          if (!active) return
          setIsSoundfontReady(!!soundfonts[instrument])
        })
        .finally(() => {
          if (!active) return
          setIsSoundfontLoading(false)
        })
    }

    return () => {
      active = false
    }
  }, [instrument, show])

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
            <div className="absolute inset-0 z-10 grid place-items-center bg-black/40">
              <Loader width={48} height={48} className="animate-spin text-white" />
            </div>
          )}
          {id && source && <SongPreview songId={id} source={source} />}
        </div>
        <div className="flex w-[420px] flex-col border-l border-gray-200 bg-white">
          <div className="px-6 pt-6 pb-3">
            <span className="text-xl font-semibold text-gray-900">Preview your recording</span>
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
          <div className="flex-1 px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm">
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Total Notes
                </span>
                <span className="text-sm font-semibold text-gray-900">{noteCountLabel}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm">
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Instrument
                </span>
                <span className="text-sm font-semibold text-gray-900">{instrumentLabel}</span>
              </div>
            </div>
          </div>
          <div className="mt-auto border-t border-gray-100 px-6 py-6">
            <div className="flex w-full gap-3">
              <Button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-violet-300 bg-white text-sm font-semibold text-violet-700 transition hover:bg-violet-50 active:bg-violet-100"
                onPress={() => {
                  const origin = window.location.origin
                  const url = `${origin}/play/?source=base64&id=${encodeURIComponent(id)}`
                  copyToClipboard(url)
                }}
              >
                <Share />
                Copy Share URL
              </Button>
              <Button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-md transition hover:bg-violet-500 active:bg-violet-700"
                onPress={() => downloadBase64Midi(id)}
              >
                <Download />
                Download MIDI
              </Button>
            </div>
            <div className="mt-3 flex w-full">
              <Button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                isDisabled={
                  !instrument || isMp3Rendering || isSoundfontLoading || !isSoundfontReady
                }
                onPress={async () => {
                  if (!instrument) return
                  setIsMp3Rendering(true)
                  try {
                    const midiBytes = base64ToBytes(id)
                    const mp3Blob = await renderMidiToMp3(midiBytes, instrument)
                    downloadBlob(mp3Blob, 'recording.mp3')
                  } catch (error) {
                    console.error('Failed to render MP3', error)
                  } finally {
                    setIsMp3Rendering(false)
                  }
                }}
              >
                {isMp3Rendering || isSoundfontLoading ? (
                  <Loader width={16} height={16} className="animate-spin" />
                ) : (
                  <Download />
                )}
                {isSoundfontLoading
                  ? 'Loading Soundfont'
                  : isMp3Rendering
                    ? 'Rendering MP3'
                    : 'Download MP3'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
