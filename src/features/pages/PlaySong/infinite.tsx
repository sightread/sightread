import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

import { MidiStateEvent, Song, SongConfig } from '@/types'
import { SongVisualizer, getHandSettings } from '@/features/SongVisualization'
import { SongScrubBar } from '@/features/SongInputControls'
import Player from '@/features/player'
import { useEventListener, useOnUnmount, usePlayerState, useSingleton, useWakeLock } from '@/hooks'
import { useSong } from '@/features/data'
import { getSynthStub } from '@/features/synth'
import midiState from '@/features/midi'
import { TopBar, InfiniteSettingsPanel } from './components'
import clsx from 'clsx'
import Head from 'next/head'
import { getDefaultSongSettings } from '@/features/SongVisualization/utils'
import { config } from 'process'

type Generator = 'eMinor' | 'dMajor' | 'random'
export type GeneratedSongSettings = SongConfig & { generator: Generator }

function getDefaultSettings(song?: Song): GeneratedSongSettings {
  return { ...getDefaultSongSettings(song), generator: 'eMinor', visualization: 'sheet' }
}

export function Infinite() {
  const router = useRouter()
  const [settingsOpen, setSettingsPanel] = useState(false)
  const [playerState, playerActions] = usePlayerState()
  const [soundOff, setSoundOff] = useState(false)
  const player = Player.player()
  const synth = useSingleton(() => getSynthStub('acoustic_grand_piano'))
  const [songConfig, setSongConfig] = useState(getDefaultSettings())
  let { song, error } = useSong(songConfig.generator, 'generated')
  const [range, setRange] = useState<{ start: number; end: number } | undefined>(undefined)

  useWakeLock()
  useOnUnmount(() => player.stop())

  const hand =
    songConfig.left && songConfig.right
      ? 'both'
      : songConfig.left
      ? 'left'
      : songConfig.right
      ? 'right'
      : 'none'

  useEffect(() => {
    if (!song) return
    // TODO: handle invalid song. Pipe up not-found midi for 400s etc.
    const config = { ...songConfig, tracks: getDefaultSettings(song).tracks }
    setSongConfig(config)
    player.setSong(song, config)
  }, [song, player])

  useEventListener<KeyboardEvent>('keydown', (evt: KeyboardEvent) => {
    if (evt.code === 'Space') {
      evt.preventDefault()
      playerActions.toggle()
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

  const handleToggleSound = () => {
    if (!soundOff) {
      player.setVolume(0)
      return setSoundOff(true)
    }
    player.setVolume(1)
    setSoundOff(false)
  }

  return (
    <>
      <Head>
        <title>Sightread: Infinite</title>
      </Head>
      <div
        className={clsx(
          // // Enable fixed to remove all scrolling.
          'fixed',
          'flex flex-col h-screen max-h-screen max-w-screen',
        )}
      >
        <TopBar
          title={songConfig.generator}
          isLoading={!playerState.canPlay}
          isPlaying={playerState.playing}
          isSoundOff={soundOff}
          onTogglePlaying={playerActions.toggle}
          onClickRestart={playerActions.restart}
          onClickBack={() => {
            playerActions.reset()
            router.back()
          }}
          onClickSettings={(e) => {
            e.stopPropagation()
            setSettingsPanel(!settingsOpen)
          }}
          onClickSound={handleToggleSound}
          settingsOpen={settingsOpen}
        />
        <div className={clsx('w-full z-10', !settingsOpen && 'hidden')}>
          <InfiniteSettingsPanel
            open={settingsOpen}
            onClose={() => setSettingsPanel(false)}
            onChange={setSongConfig}
            config={songConfig}
            song={song}
          />
        </div>
        <div className="relative min-w-full">
          <SongScrubBar rangeSelection={range} setRange={handleSetRange} height={40} />
        </div>
        <div className={clsx('fixed w-screen h-[100vh] -z-10', '!h-[100dvh]', 'bg-white')}>
          <SongVisualizer
            song={song}
            config={songConfig}
            hand={hand}
            handSettings={getHandSettings(songConfig)}
            selectedRange={range}
            getTime={() => Player.player().getTime()}
          />
        </div>
      </div>
    </>
  )
}
