import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

import { Song, MidiStateEvent } from '@/types'
import { SongVisualizer, getHandSettings, getSongSettings } from '@/features/SongVisualization'
import { SongScrubBar } from '@/features/SongInputControls'
import Player from '@/features/player'
import { usePlayerState, useSingleton, useSongSettings } from '@/hooks'
import { getSong } from '@/features/api'
import { getSynthStub } from '@/features/synth'
import midiState from '@/features/midi'
import * as wakelock from '@/features/wakelock'
import { TopBar, SettingsSidebar } from './components'
import useDebugTraceUpdate from '@/hooks/useDebugTraceUpdate'
import clsx from 'clsx'

export function PlaySong() {
  const router = useRouter()
  const { source, id, recording }: { source: string; id: string; recording?: string } =
    router.query as any
  const [sidebar, setSidebar] = useState(false)
  const [playerState, playerActions] = usePlayerState()
  const [isSelectingRange, setIsSelectingRange] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const player = Player.player()
  const synth = useSingleton(() => getSynthStub('acoustic_grand_piano'))
  const [song, setSong] = useState<Song>()
  const [songConfig, setSongConfig] = useSongSettings(id)
  const [range, setRange] = useState<{ start: number; end: number } | undefined>(undefined)
  const isRecording = !!recording

  const hand =
    songConfig.left && songConfig.right
      ? 'both'
      : songConfig.left
      ? 'left'
      : songConfig.right
      ? 'right'
      : 'none'

  // Stops screen from dimming during a song.
  useEffect(() => {
    wakelock.lock()
    return () => wakelock.unlock()
  }, [])

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
  }, [player, waiting, left, right])

  // Register ummount fns
  useEffect(() => {
    return () => {
      player.stop()
    }
  }, [player])
  useDebugTraceUpdate({ source, id, player, setSongConfig, playerActions })

  useEffect(() => {
    if (!source || !id) return

    // TODO: handle invalid song. Pipe up not-found midi for 400s etc.
    getSong(source, id).then((song: Song) => {
      const config = getSongSettings(id, song)
      setSong(song)
      setSongConfig(config)
      player.setSong(song, config).then(() => playerActions.ready())
    })
  }, [source, id, player, setSongConfig, playerActions])

  useEffect(() => {
    const keyboardHandler = (evt: KeyboardEvent) => {
      if (evt.code === 'Space') {
        evt.preventDefault()
        playerActions.toggle()
      } else if (evt.code === 'Comma') {
        player.seek(player.currentSongTime - 16 / 1000)
      } else if (evt.code === 'Period') {
        player.seek(player.currentSongTime + 16 / 1000)
      }
    }
    window.addEventListener('keydown', keyboardHandler)
    return () => window.removeEventListener('keydown', keyboardHandler)
  }, [player, playerActions])

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
      setIsSelectingRange(false)
    },
    [setIsSelectingRange, setRange, player],
  )

  // If source or id is messed up, redirect to the homepage
  if (router.isReady && (!source || !id)) {
    router.replace('/')
  }

  const handleToggleSound = () => {
    if (!soundOff) {
      player.setVolume(0)
      return setSoundOff(true)
    }
    player.setVolume(1)
    setSoundOff(false)
  }

  const handleBeginRangeSelection = () => {
    if (isSelectingRange) {
      handleSetRange(undefined)
      setIsSelectingRange(false)
      return
    }
    setIsSelectingRange(true)
    playerActions.pause()
    player.pause()
  }

  return (
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
            isLoading={!playerState.canPlay}
            isPlaying={playerState.playing}
            isSoundOff={soundOff}
            onTogglePlaying={playerActions.toggle}
            onSelectRange={handleBeginRangeSelection}
            onClickRestart={playerActions.restart}
            onClickBack={() => {
              playerActions.reset()
              router.back()
            }}
            onClickSettings={(e) => {
              e.stopPropagation()
              setSidebar(!sidebar)
            }}
            onClickSound={handleToggleSound}
            isSelectingRange={isSelectingRange}
            sidebarOpen={sidebar}
          />
          <SongScrubBar rangeSelecting={isSelectingRange} setRange={handleSetRange} />
          <div className={clsx('relative w-full z-10', !sidebar && 'hidden')}>
            <div className="absolute right-0 overflow-auto max-h-[calc(100vh-101px)]">
              <SettingsSidebar
                open={sidebar}
                onClose={() => setSidebar(false)}
                onChange={setSongConfig}
                config={songConfig}
                song={song}
              />
            </div>
          </div>
        </>
      )}
      <div
        className="w-screen flex flex-col flex-grow"
        style={{
          backgroundColor: songConfig.visualization === 'sheet' ? 'white' : '#2e2e2e',
          contain: 'strict',
        }}
      >
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
  )
}
