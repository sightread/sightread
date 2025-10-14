import { SongScrubBar } from '@/features/controls'
import { useSong } from '@/features/data'
import { useSongMetadata } from '@/features/data/library'
import midiState from '@/features/midi'
import { requiresPermissionAtom, scanFolders } from '@/features/persist/persistence'
import { usePlayer } from '@/features/player'
import { getHandSettings, getSongSettings, SongVisualizer } from '@/features/SongVisualization'
import { getSynthStub } from '@/features/synth'
import {
  useEventListener,
  useLazyStableRef,
  useOnUnmount,
  usePlayerState,
  useSongSettings,
  useWakeLock,
} from '@/hooks'
import { MidiStateEvent, SongSource } from '@/types'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { SettingsPanel, TopBar } from './components'
import { MidiModal } from './components/MidiModal'
import { StatsPopup } from './components/StatsPopup'

function RequiresPermissionPrompt({
  onGrantPermission,
  onGoBack,
}: {
  onGrantPermission: () => void
  onGoBack: () => void
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-orange-500" />
          <h2 className="text-lg font-medium text-gray-900">Permission Required</h2>
        </div>
        <p className="mb-6 text-sm text-gray-600">
          We need permission to access your music files. Please grant access to continue playing
          this song.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={onGrantPermission}
            className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Grant Permission
          </button>
        </div>
      </div>
    </div>
  )
}

function SongNotFound({ songTitle, onGoBack }: { songTitle?: string; onGoBack: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        <div className="mb-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        </div>
        <h2 className="mb-2 text-lg font-medium text-gray-900">Song Not Found</h2>
        {songTitle && (
          <p className="mb-4 text-sm text-gray-600">
            Could not load "{songTitle}". The file may have been moved or deleted.
          </p>
        )}
        <p className="mb-6 text-sm text-gray-500">
          Please check that the file still exists or try selecting a different song. It may also be
          that Sightread lost access to your local files. If that's the case, please re-scan
          directories in the "Manage Folders" menu.
        </p>
        <button
          onClick={onGoBack}
          className="mx-auto flex cursor-pointer items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back to Song List
        </button>
      </div>
    </div>
  )
}

export default function PlaySongPage() {
  const [searchParams, _setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  let { source, id, recording }: { source: SongSource; id: string; recording?: string } =
    Object.fromEntries(searchParams) as any

  // If source or id is messed up, redirect to the homepage
  if (!source || !id) {
    navigate('/', { replace: true })
    return null
  }
  id = decodeURIComponent(id)

  const player = usePlayer()
  const [settingsOpen, setSettingsPanel] = useState(false)
  const [isMidiModalOpen, setMidiModal] = useState(false)
  const [statsVisible, setStatsVisible] = useState(true)
  const playerState = usePlayerState()
  const synth = useLazyStableRef(() => getSynthStub('acoustic_grand_piano'))
  let { data: song, error, isLoading, mutate } = useSong(id, source)
  let songMeta = useSongMetadata(id, source)
  const range = useAtomValue(player.getRange())
  const selectedRange = useMemo(
    () => (range ? { start: range[0], end: range[1] } : undefined),
    [range],
  )
  const isLooping = !!range
  const requiresPermission = useAtomValue(requiresPermissionAtom)

  const [songConfig, setSongConfig] = useSongSettings(id)
  const isRecording = !!recording
  useWakeLock()

  const hand =
    songConfig.left && songConfig.right
      ? 'both'
      : songConfig.left
        ? 'left'
        : songConfig.right
          ? 'right'
          : 'none'

  // Hack for updating player when config changes.
  // Maybe move to the onChange? Or is this chill.
  const { waiting, left, right } = songConfig
  useEffect(() => {
    player.setWait(waiting)
    if (left && right) {
      player.setHand('both')
    } else {
      player.setHand(left ? 'left' : 'right')
    }
  }, [waiting, left, right, player])

  useOnUnmount(() => player.stop())

  useEffect(() => {
    if (!song) return
    // TODO: handle invalid song. Pipe up not-found midi for 400s etc.
    const config = getSongSettings(id, song)
    setSongConfig(config)
    player.setSong(song, config)
  }, [song, setSongConfig, id, player])

  useEventListener<KeyboardEvent>('keydown', (evt: KeyboardEvent) => {
    if (evt.code === 'Space') {
      evt.preventDefault()
      player.toggle()
    } else if (evt.shiftKey && evt.code === 'Comma') {
      player.jumpToPreviousMeasure();
    } else if (evt.code === 'Comma') {
      player.seek(player.currentSongTime - 16 / 1000)
    } else if (evt.code === 'Period') {
      player.seek(player.currentSongTime + 16 / 1000)
    }
  })

  useEffect(() => {
    const handleMidiEvent = ({ type, note, velocity }: MidiStateEvent) => {
      if (type === 'down') {
        synth.playNote(note, velocity)
      } else {
        synth.stopNote(note, velocity)
      }
    }

    midiState.subscribe(handleMidiEvent)
    return function cleanup() {
      midiState.unsubscribe(handleMidiEvent)
    }
  }, [synth, song, songConfig])

  const handleLoopingToggle = (enable: boolean) => {
    if (!enable) {
      player.setRange(undefined)
      return
    } else {
      const duration = player.getDuration()
      const tenth = duration / 10
      player.setRange({
        start: duration / 2 - tenth,
        end: duration / 2 + tenth,
      })
    }
  }

  // Handle permission required for local files
  if (source === 'local' && requiresPermission) {
    return (
      <RequiresPermissionPrompt
        onGrantPermission={async () => {
          await scanFolders()
          mutate()
        }}
        onGoBack={() => {
          player.stop()
          navigate('/songs')
        }}
      />
    )
  }

  // Handle song not found
  if (error || (source === 'local' && !song && !isLoading)) {
    return (
      <SongNotFound
        songTitle={songMeta?.title}
        onGoBack={() => {
          player.stop()
          navigate('/songs')
        }}
      />
    )
  }

  return (
    <>
      <title>Playing</title>
      <div
        className={clsx(
          // Enable fixed to remove all scrolling.
          'fixed',
          'flex h-screen max-h-screen max-w-screen flex-col outline-none',
        )}
        {...midiState.getListenerProps()}
        autoFocus
      >
        {!isRecording && (
          <>
            <TopBar
              title={songMeta?.title}
              isLoading={!playerState.canPlay}
              isPlaying={playerState.playing}
              onTogglePlaying={() => player.toggle()}
              onClickRestart={() => player.restart()}
              onClickBack={() => {
                player.stop()
                navigate('/')
              }}
              onClickMidi={(e) => {
                e.stopPropagation()
                setMidiModal(!isMidiModalOpen)
              }}
              onClickSettings={(e) => {
                e.stopPropagation()
                setSettingsPanel(!settingsOpen)
              }}
              onClickStats={(e) => {
                setStatsVisible(!statsVisible)
              }}
              settingsOpen={settingsOpen}
              statsVisible={statsVisible}
            />
            <MidiModal isOpen={isMidiModalOpen} onClose={() => setMidiModal(false)} />
            {settingsOpen && (
              <SettingsPanel
                onClose={() => setSettingsPanel(false)}
                onChange={setSongConfig}
                config={songConfig}
                song={song}
                onLoopToggled={handleLoopingToggle}
                isLooping={isLooping}
              />
            )}
            <div className="relative min-w-full">
              <SongScrubBar
                rangeSelection={selectedRange}
                setRange={(range: any) => player.setRange(range)}
                height={40}
              />
            </div>
            {statsVisible && <StatsPopup />}
          </>
        )}
        <div
          className={clsx(
            'fixed -z-10 h-[100vh] w-screen',
            'h-[100dvh]!',
            songConfig.visualization === 'sheet' ? 'bg-white' : 'bg-[#2e2e2e]',
          )}
        >
          <SongVisualizer
            song={song}
            config={songConfig}
            hand={hand}
            handSettings={getHandSettings(songConfig)}
            selectedRange={selectedRange}
            getTime={() => player.getTime()}
            enableTouchscroll={songConfig.visualization === 'falling-notes'}
          />
        </div>
      </div>
    </>
  )
}
