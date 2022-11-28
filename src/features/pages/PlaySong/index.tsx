import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { MidiStateEvent, SongSource } from '@/types'
import { SongVisualizer, getHandSettings, getSongSettings } from '@/features/SongVisualization'
import { SongScrubBar } from '@/features/SongInputControls'
import Player from '@/features/player'
import {
  useEventListener,
  useOnUnmount,
  usePlayerState,
  useSingleton,
  useSongSettings,
  useWakeLock,
} from '@/hooks'
import { useSong, useSongMetadata } from '@/features/data'
import { getSynthStub } from '@/features/synth'
import midiState from '@/features/midi'
import { TopBar, SettingsPanel } from './components'
import clsx from 'clsx'
import Head from 'next/head'
import { MidiModal } from './components/MidiModal'
import { scaleResolution } from '@/features/theory'

export function PlaySong() {
  const router = useRouter()
  const { source, id, recording }: { source: SongSource; id: string; recording?: string } =
    router.query as any
  const [settingsOpen, setSettingsPanel] = useState(false)
  const [isMidiModalOpen, setMidiModal] = useState(false)
  const [playerState, playerActions] = usePlayerState()
  const [isLooping, setIsLooping] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const synth = useSingleton(() => getSynthStub('acoustic_grand_piano'))
  let { data: song, error } = useSong(id, source)
  const [songConfig, setSongConfig] = useSongSettings(id)
  const [range, setRange] = useState<{ start: number; end: number } | undefined>(undefined)
  const isRecording = !!recording
  const songMeta = useSongMetadata(id, source)
  useWakeLock()

  const scaledSong = useMemo(
    () => scaleResolution(song, songConfig.difficultyResolution),
    [song, songConfig.difficultyResolution],
  )

  const player = Player.player()

  const hand =
    songConfig.left && songConfig.right
      ? 'both'
      : songConfig.left
      ? 'left'
      : songConfig.right
      ? 'right'
      : 'none'

  // Stops screen from dimming during a song.
  useWakeLock()

  // Hack for updating player when config changes.
  // Maybe move to the onChange? Or is this chill.
  const { waiting, left, right, difficultyResolution } = songConfig
  useEffect(() => {
    player.setWait(waiting)
    if (left && right) {
      player.setHand('both')
    } else {
      player.setHand(left ? 'left' : 'right')
    }
  }, [player, waiting, left, right])
  useEffect(() => {
    player.setScaled(scaledSong)
  }, [scaledSong, player])

  useOnUnmount(() => player.stop())

  useEffect(() => {
    if (!song) return
    // TODO: handle invalid song. Pipe up not-found midi for 400s etc.
    const config = getSongSettings(id, song)
    setSongConfig(config)
    player.setSong(song, config)
  }, [song, player, setSongConfig, playerActions, id])

  useEventListener<KeyboardEvent>('keydown', (evt: KeyboardEvent) => {
    if (evt.code === 'Space') {
      evt.preventDefault()
      playerActions.toggle()
    } else if (evt.code === 'Comma') {
      player.seek(player.currentSongTime - 16 / 1000)
    } else if (evt.code === 'Period') {
      player.seek(player.currentSongTime + 16 / 1000)
    }
  })

  useEffect(() => {
    const handleMidiEvent = ({ type, note }: MidiStateEvent) => {
      if (type === 'down' && !soundOff) {
        synth.playNote(note)
      } else {
        synth.stopNote(note)
      }
    }

    midiState.subscribe(handleMidiEvent)
    return function cleanup() {
      midiState.unsubscribe(handleMidiEvent)
    }
  }, [player, synth, song, songConfig, soundOff])

  const handleSetRange = useCallback(
    (range?: { start: number; end: number }) => {
      player.setRange(range)
      setRange(range)
    },
    [setRange, player],
  )

  // If source or id is messed up, redirect to the homepage
  if (router.isReady && (!source || !id)) {
    router.replace('/')
  }

  const handleToggleSound = () => {
    if (!soundOff) {
      player.setVolume(0)
      setSoundOff(true)
    } else {
      player.setVolume(1)
      setSoundOff(false)
    }
  }

  const handleLoopingToggle = (b: boolean) => {
    if (!b) {
      handleSetRange(undefined)
      setIsLooping(false)
      player.setRange()
      return
    } else {
      const duration = Player.player().getDuration()
      const tenth = duration / 10
      setIsLooping(true)
      handleSetRange({
        start: duration / 2 - tenth,
        end: duration / 2 + tenth,
      })
    }
  }

  return (
    <>
      <Head>
        <title>Sightread: Playing</title>
      </Head>
      <div
        className={clsx(
          // Enable fixed to remove all scrolling.
          'fixed',
          'flex flex-col h-screen max-h-screen max-w-screen',
        )}
      >
        {!isRecording && (
          <>
            <TopBar
              title={songMeta?.title}
              isLoading={!playerState.canPlay}
              isPlaying={playerState.playing}
              isSoundOff={soundOff}
              onTogglePlaying={playerActions.toggle}
              onClickRestart={playerActions.stop}
              onClickBack={() => {
                playerActions.stop()
                router.push('/')
              }}
              onClickMidi={(e) => {
                e.stopPropagation()
                setMidiModal(!isMidiModalOpen)
              }}
              onClickSettings={(e) => {
                e.stopPropagation()
                setSettingsPanel(!settingsOpen)
              }}
              onClickSound={handleToggleSound}
              settingsOpen={settingsOpen}
            />
            <MidiModal isOpen={isMidiModalOpen} onClose={() => setMidiModal(false)} />
            <div className={clsx('w-full z-10', !settingsOpen && 'hidden')}>
              <SettingsPanel
                onClose={() => setSettingsPanel(false)}
                onChange={setSongConfig}
                config={songConfig}
                song={song}
                onLoopToggled={handleLoopingToggle}
                isLooping={isLooping}
              />
            </div>
            <div className="relative min-w-full">
              <SongScrubBar rangeSelection={range} setRange={handleSetRange} height={40} />
            </div>
          </>
        )}
        <div
          className={clsx(
            'fixed w-screen h-[100vh] -z-10',
            '!h-[100dvh]',
            songConfig.visualization === 'sheet' ? 'bg-white' : 'bg-[#2e2e2e]',
          )}
        >
          {song && (
            <SongVisualizer
              song={scaledSong}
              config={songConfig}
              hand={hand}
              handSettings={getHandSettings(songConfig)}
              selectedRange={range}
              getTime={() => Player.player().getTime()}
              enableTouchscroll={songConfig.visualization === 'falling-notes'}
            />
          )}
        </div>
      </div>
    </>
  )
}
