import React, { useState, useEffect } from 'react'
import ErrorPage from 'next/error'
import { useRouter } from 'next/router'

import { Song, MidiStateEvent, VisualizationMode } from '@/types'
import { SongVisualizer, getHandSettings, getSongSettings } from '@/features/SongVisualization'
import { SongScrubBar } from '@/features/SongInputControls'
import Player from '@/features/player'
import { useSingleton, useSongSettings } from '@/hooks'
import { getSong } from '@/features/api'
import { css } from '@sightread/flake'
import { getSynthStub } from '@/features/synth'
import midiState from '@/features/midi'
import * as wakelock from '@/features/wakelock'
import { TopBar, SettingsSidebar } from './components'

export type PlaySongProps = {
  type: 'lesson' | 'song'
  songLocation: string
  viz: VisualizationMode
}

const classes = css({
  topbarIcon: {
    cursor: 'pointer',
    fill: 'white',
    '&:hover': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '& .active ': {
      fill: 'rgba(58, 104, 231, 1)',
    },
  },
  figmaIcon: {
    '&:hover path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '&:hover path.outline': {
      fill: 'black',
    },
    '& path': {
      cursor: 'pointer',
    },
    cursor: 'pointer',
  },
  fillWhite: {
    '& path': {
      fill: 'white',
    },
    fill: 'white',
  },
  active: {
    '& path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '& path.outline': {
      fill: 'black',
    },
  },
  topbar: {
    '& i': {
      color: 'white',
      cursor: 'pointer',
      transition: 'color 0.1s',
      fontSize: 24,
      width: 22,
    },
    '& i:hover': {
      color: 'rgba(58, 104, 231, 1)',
    },
    '& i.active': {
      color: 'rgba(58, 104, 231, 1)',
    },
  },
})

export function PlaySong({ type, songLocation }: PlaySongProps) {
  const [sidebar, setSidebar] = useState(false)
  const [isPlaying, setPlaying] = useState(false)
  const [rangeSelecting, setRangeSelecting] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const player = Player.player()
  const synth = useSingleton(() => getSynthStub('acoustic_grand_piano'))
  const [song, setSong] = useState<Song>()
  const [songConfig, setSongConfig] = useSongSettings(songLocation)
  const router = useRouter()
  let isRecording = router.query.recording != undefined

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

  useEffect(() => {
    if (!songLocation || !type) return

    setIsLoading(true)
    getSong(songLocation).then((song: Song) => {
      const config = getSongSettings(songLocation, song)
      setSong(song)
      setSongConfig(config)
      player.setSong(song, config).then(() => setIsLoading(false))
    })
  }, [songLocation, player, type, setSongConfig])

  useEffect(() => {
    const keyboardHandler = (evt: KeyboardEvent) => {
      if (evt.code === 'Space') {
        evt.preventDefault()
        if (isPlaying) {
          player.pause()
          setPlaying(false)
        } else {
          if (!isLoading) {
            player.play()
            setPlaying(true)
          }
        }
      } else if (evt.code === 'Comma') {
        player.seek(player.currentSongTime - 16 / 1000)
      } else if (evt.code === 'Period') {
        player.seek(player.currentSongTime + 16 / 1000)
      }
    }
    window.addEventListener('keydown', keyboardHandler)
    return () => window.removeEventListener('keydown', keyboardHandler)
  }, [isPlaying, player, isLoading])

  useEffect(() => {
    const handleMidiEvent = ({ type, note }: MidiStateEvent) => {
      if (type === 'down' && !soundOff) {
        synth.playNote(note)
      } else {
        synth.stopNote(note)
      }
    }

    midiState.subscribe(handleMidiEvent)
    // Player.player().subscribe(handleEvent)
    return function cleanup() {
      // Player.player().unsubscribe(handleEvent)
      midiState.unsubscribe(handleMidiEvent)
    }
  }, [player, synth, song, songConfig, soundOff])

  if (!type || !songLocation) {
    return <ErrorPage statusCode={404} title="Song Not Found :(" />
  }

  const handleToggleSound = () => {
    if (!soundOff) {
      player.setVolume(0)
      return setSoundOff(true)
    }
    player.setVolume(1)
    setSoundOff(false)
  }

  const handleTogglePlaying = () => {
    if (isPlaying) {
      player.pause()
      return setPlaying(false)
    }
    if (!isLoading) {
      player.play()
      return setPlaying(true)
    }
  }
  const handleSelectRange = () => {
    setRangeSelecting(!rangeSelecting)
    setPlaying(false)
    player.pause()
  }
  return (
    <div>
      {!isRecording && (
        <>
          <TopBar
            isLoading={isLoading}
            isPlaying={isPlaying}
            isSoundOff={soundOff}
            onTogglePlaying={handleTogglePlaying}
            onSelectRange={handleSelectRange}
            onClickRestart={() => {
              player.stop()
              setPlaying(false)
            }}
            onClickBack={() => {
              player.pause()
              router.back()
            }}
            onClickSettings={() => setSidebar(!sidebar)}
            onClickSound={handleToggleSound}
            classNames={{
              settingsCog: sidebar && classes.active,
              rangeIcon: rangeSelecting && classes.active,
            }}
          />
          <div style={{ position: 'absolute', top: 55, height: 40, width: '100%' }}>
            <SongScrubBar
              song={song ?? null}
              rangeSelecting={rangeSelecting}
              setRangeSelecting={setRangeSelecting}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 95,
              width: 300,
              height: 'calc(100% - 95px)',
              right: 0,
              visibility: sidebar ? 'visible' : 'hidden',
              zIndex: 2,
            }}
          >
            <SettingsSidebar
              open={sidebar}
              onClose={() => setSidebar(false)}
              onChange={setSongConfig}
              config={songConfig}
              song={song}
            />
          </div>
        </>
      )}
      <div
        style={{
          backgroundColor: songConfig.visualization === 'sheet' ? 'white' : '#2e2e2e',
          width: '100vw',
          height: `calc(100vh - ${isRecording ? 0 : 95}px)`,
          position: 'fixed',
          top: isRecording ? 0 : 95,
          contain: 'strict',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <SongVisualizer
            song={song}
            config={songConfig}
            hand={hand}
            handSettings={getHandSettings(songConfig)}
            getTime={() => Player.player().getTime()}
          />
        </div>
      </div>
    </div>
  )
}
