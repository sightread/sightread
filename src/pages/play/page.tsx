import Toast from '@/components/Toast'
import { useSong } from '@/features/data'
import { useSongMetadata } from '@/features/data/library'
import midiState from '@/features/midi'
import { requiresPermissionAtom, scanFolders } from '@/features/persist/persistence'
import { usePlayer } from '@/features/player'
import {
  getDefaultSongSettings,
  getHandSettings,
  getSongSettings,
  SongVisualizer,
} from '@/features/SongVisualization'
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
import { round } from '@/utils'
import * as RadixToast from '@radix-ui/react-toast'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { SettingsPanel, TopBar } from './components'
import { MidiModal } from './components/MidiModal'
import { StatsPopup } from './components/StatsPopup'
import TimelineStrip from './components/TimelineStrip'
import TransportBar from './components/TransportBar'
import { CountdownOverlayProps } from './CountdownOverlayProps'

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
  const [isMidiModalOpen, setMidiModal] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const playerState = usePlayerState()
  const countdownTotal = useAtomValue(player.countdownSeconds)
  const countdownRemaining = useAtomValue(player.countdownRemaining)
  const synth = useLazyStableRef(() => getSynthStub('acoustic_grand_piano'))
  let { data: song, error, isLoading, mutate } = useSong(id, source)
  let songMeta = useSongMetadata(id, source)
  const range = useAtomValue(player.getRange())
  const selectedRange = useMemo(
    () => (range ? { start: range[0], end: range[1] } : undefined),
    [range],
  )
  const requiresPermission = useAtomValue(requiresPermissionAtom)
  const [toastMsg, setToastMsg] = useState<string | null>('')
  const [toastKey, setToastKey] = useState<string>('')
  const toastKeyRef = useRef(toastKey)

  const [songConfig, setSongConfig] = useSongSettings(id)
  const isRecording = !!recording
  const isLooping = songConfig.loop?.enabled ?? false
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

  const metronome = songConfig.metronome ?? getDefaultSongSettings(song ?? undefined).metronome
  const loopConfig = songConfig.loop ?? getDefaultSongSettings(song ?? undefined).loop
  const countdownSeconds =
    songConfig.countdownSeconds ?? getDefaultSongSettings(song ?? undefined).countdownSeconds
  const countdownEnabled = countdownSeconds > 0
  useEffect(() => {
    if (!songConfig.metronome) {
      setSongConfig({ ...songConfig, metronome })
    }
  }, [metronome, setSongConfig, songConfig])
  useEffect(() => {
    if (!songConfig.loop) {
      setSongConfig({ ...songConfig, loop: loopConfig })
    }
  }, [loopConfig, setSongConfig, songConfig])
  useEffect(() => {
    if (songConfig.countdownSeconds == null) {
      setSongConfig({ ...songConfig, countdownSeconds })
    }
  }, [countdownSeconds, setSongConfig, songConfig])
  useEffect(() => {
    player.applyMetronomeConfig(metronome)
  }, [metronome, player])
  useEffect(() => {
    player.applyCountdownConfig(countdownSeconds)
  }, [countdownSeconds, player])
  useEffect(() => {
    if (loopConfig.enabled) {
      player.setRange(loopConfig.range)
    } else {
      player.setRange(undefined)
    }
  }, [loopConfig, player])

  useOnUnmount(() => player.stop())

  useEffect(() => {
    if (!song) return
    // TODO: handle invalid song. Pipe up not-found midi for 400s etc.
    const config = getSongSettings(id, song)
    setSongConfig(config)
    player.setSong(song, config)
  }, [song, setSongConfig, id, player])

  function showToast(msg: string) {
    const newKey = Date.now().toString()
    setToastMsg(msg)
    setToastKey(newKey)
    toastKeyRef.current = newKey
  }

  function hideToast(open: boolean) {
    if (open) return
    setToastMsg((msg) => {
      /*
       * This check prevents a race condition where an old toast's
       * timer clears a new toast's message.
       * This is done by comparing toastKey (from closure) with
       * toastKeyRef.current ie the latest key
       */
      if (toastKeyRef.current === toastKey) {
        return ''
      }
      return msg
    })
  }

  const handleMetronomeToggle = () => {
    const enabled = !metronome.enabled
    const nextVolume = metronome.volume ?? 0.6
    setSongConfig({
      ...songConfig,
      metronome: {
        ...metronome,
        enabled,
        volume: enabled ? nextVolume : metronome.volume,
      },
    })
  }

  useEventListener<KeyboardEvent>('keydown', (evt: KeyboardEvent) => {
    if (evt.code === 'Space') {
      evt.preventDefault()
      player.toggle()
    } else if (evt.shiftKey && evt.code === 'Comma') {
      player.seekToPreviousMeasure()
    } else if (evt.shiftKey && evt.code === 'Period') {
      player.seekToNextMeasure()
    } else if (evt.code === 'Comma') {
      player.seek(player.currentSongTime - 16 / 1000)
    } else if (evt.code === 'Period') {
      player.seek(player.currentSongTime + 16 / 1000)
    } else if (evt.code === 'Slash' && !evt.shiftKey) {
      setStatsVisible(!statsVisible)
    } else if (evt.code === 'Semicolon') {
      setSongConfig({ ...songConfig, waiting: !waiting })
    } else if (evt.code === 'KeyP') {
      if (isLooping) {
        handleLoopingToggle(false)
      } else {
        handleLoopingToggle(true)
      }
    } else if (evt.code === 'KeyO') {
      if (isLooping && range) {
        player.seek(range[0])
      }
    } else if (evt.ctrlKey && evt.code === 'ArrowLeft') {
      if (!range) return
      const newTime = player.getPreviousMeasureTime(range[1])
      if (newTime === undefined) return
      showToast(`Loop end at measure: ${player.getMeasureForTime(newTime).number}`)
      player.setRange({
        start: range[0],
        end: newTime,
      })
    } else if (evt.ctrlKey && evt.code === 'ArrowRight') {
      if (!range) return
      const newTime = player.getNextMeasureTime(range[1])
      if (newTime === undefined) return
      showToast(`Loop end at measure: ${player.getMeasureForTime(newTime).number}`)
      player.setRange({
        start: range[0],
        end: newTime,
      })
    } else if (evt.code === 'ArrowLeft') {
      if (!range) return
      const newTime = player.getPreviousMeasureTime(range[0])
      if (newTime === undefined) return
      showToast(`Loop start from measure: ${player.getMeasureForTime(newTime).number}`)
      player.setRange({
        start: newTime,
        end: range[1],
      })
    } else if (evt.code === 'ArrowRight') {
      if (!range) return
      const newTime = player.getNextMeasureTime(range[0])
      if (newTime === undefined) return
      showToast(`Loop start from measure: ${player.getMeasureForTime(newTime).number}`)
      player.setRange({
        start: newTime,
        end: range[1],
      })
    } else if (evt.code === 'Equal') {
      player.increaseBpm()
    } else if (evt.code === 'Minus') {
      player.decreaseBpm()
    } else if (evt.code === 'BracketLeft') {
      setSongConfig({ ...songConfig, left: !songConfig.left })
    } else if (evt.code === 'BracketRight') {
      setSongConfig({ ...songConfig, right: !songConfig.right })
    } else if (evt.shiftKey && evt.code === 'Quote') {
      if (songConfig.visualization === 'falling-notes') {
        setSongConfig({ ...songConfig, visualization: 'sheet' })
      } else {
        setSongConfig({ ...songConfig, visualization: 'falling-notes' })
      }
    } else if (evt.code === 'Digit0') {
      player.seek(0)
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
    const duration = player.getDuration()
    const fallbackRange = { start: 0, end: duration }
    const range = loopConfig.range ?? fallbackRange
    setSongConfig({
      ...songConfig,
      loop: {
        enabled: enable,
        range,
      },
    })
  }

  const handleWaitingToggle = () => {
    setSongConfig({ ...songConfig, waiting: !waiting })
  }

  const handleCountdownToggle = () => {
    if (countdownEnabled) {
      setSongConfig({ ...songConfig, countdownSeconds: 0 })
      return
    }
    setSongConfig({ ...songConfig, countdownSeconds: 3 })
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
        className={clsx('fixed grid h-screen w-screen grid-rows-[auto_1fr_auto] outline-none')}
        {...midiState.getListenerProps()}
        autoFocus
      >
        {!isRecording && (
          <TopBar
            title={songMeta?.title}
            onClickBack={() => {
              player.stop()
              navigate('/')
            }}
            onClickMidi={(e) => {
              e.stopPropagation()
              setMidiModal(!isMidiModalOpen)
            }}
            isSettingsOpen={isSettingsOpen}
            onToggleSettings={() => setSettingsOpen((prev) => !prev)}
            onClickStats={() => setStatsVisible(!statsVisible)}
            statsVisible={statsVisible}
          />
        )}
        <div
          className={clsx(
            'relative h-full min-h-0 min-w-0',
            songConfig.visualization === 'sheet' ? 'bg-white' : 'bg-[#0f1014]',
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
          {playerState.countingDown && countdownTotal > 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <CountdownOverlay total={countdownTotal} remaining={countdownRemaining} />
            </div>
          )}
          {!isRecording && isSettingsOpen ? (
            <div className="absolute top-0 right-0 h-full w-[360px] border-l border-[#2b2a33] bg-[#121016] shadow-2xl">
              <SettingsPanel
                onChange={setSongConfig}
                config={songConfig}
                song={song}
                onLoopToggled={handleLoopingToggle}
                isLooping={isLooping}
                onClose={() => setSettingsOpen(false)}
              />
            </div>
          ) : null}
        </div>
        {!isRecording && (
          <div className="bg-[#141419]">
            <TimelineStrip
              song={song}
              rangeSelection={selectedRange}
              setRange={(range) => {
                if (!range) {
                  setSongConfig({ ...songConfig, loop: { ...loopConfig, enabled: false } })
                  return
                }
                setSongConfig({
                  ...songConfig,
                  loop: { enabled: true, range },
                })
              }}
              isLooping={isLooping}
            />
            <TransportBar
              isPlaying={playerState.playing}
              isLoading={!playerState.canPlay}
              onTogglePlaying={() => player.toggle()}
              onClickRestart={() => player.restart()}
              isLooping={isLooping}
              onToggleLoop={() => handleLoopingToggle(!isLooping)}
              isWaiting={waiting}
              onToggleWaiting={handleWaitingToggle}
              isMetronomeOn={metronome.enabled}
              onToggleMetronome={handleMetronomeToggle}
              isCountdownOn={countdownEnabled}
              onToggleCountdown={handleCountdownToggle}
            />
          </div>
        )}
      </div>
      {!isRecording && (
        <>
          <MidiModal isOpen={isMidiModalOpen} onClose={() => setMidiModal(false)} />
          {statsVisible && <StatsPopup />}
          <Toast
            open={!!toastMsg}
            onOpenChange={hideToast}
            title={toastMsg ? toastMsg : ''}
            toastKey={toastKey}
          />
          <RadixToast.Viewport className="fixed right-4 bottom-4 z-50 flex w-80 max-w-[100vw] flex-col-reverse gap-3 p-4" />
        </>
      )}
    </>
  )
}

function CountdownOverlay({ total, remaining }: CountdownOverlayProps) {
  const safeTotal = Math.max(0, Math.round(total))
  const safeRemaining = Math.max(0, Math.min(safeTotal, Math.round(remaining)))
  if (safeTotal === 0 || safeRemaining === 0) {
    return null
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-black/50 px-6 py-4 text-white backdrop-blur">
      <div className="text-4xl font-semibold">{safeRemaining}</div>
      <div className="flex items-center gap-2">
        {Array.from({ length: safeTotal }).map((_, index) => {
          const isActive = index < safeRemaining
          return (
            <span
              key={index}
              className={clsx(
                'h-2.5 w-2.5 rounded-full transition',
                isActive ? 'bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.6)]' : 'bg-white/20',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
